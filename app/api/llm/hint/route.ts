import { NextRequest, NextResponse } from "next/server";
import { callLLMWithFallback } from "@/lib/llm-client";

const SYSTEM_PROMPT = `あなたはPythonプログラミング学習をサポートするAIアシスタントです。

重要なルール：
1. 答えやコードを直接教えてはいけません
2. ヒントや考え方のきっかけを提供してください
3. 段階的に理解を深められるようサポートしてください
4. エラーがある場合は、エラーメッセージの読み方を教えてください
5. 「print関数を使ってみましょう」のような具体的なヒントは良いですが、「print('Hello World')」のような答えは出さないでください

学生が自分で考えて答えにたどり着けるよう、優しくサポートしてください。`;

export async function POST(request: NextRequest) {
  try {
    const { problemTitle, problemDescription, code, terminalOutput } = await request.json();

    // コンテキストの組み立て
    const userContent = `
【問題】
${problemTitle}
${problemDescription}

【学生のコード】
\`\`\`python
${code}
\`\`\`

【実行結果】
${terminalOutput || "(まだ実行されていません)"}

この学生に対して、答えを教えずにヒントを提供してください。
`;

    // LLM API呼び出し（SambaNova → Groq フォールバック）
    const data = await callLLMWithFallback({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    });

    const hint = data.choices[0]?.message?.content || "ヒントを生成できませんでした。";

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Error generating hint:", error);

    // 両方のAPIでレート制限に達した場合
    if (error instanceof Error && error.message === "RATE_LIMIT_BOTH") {
      return NextResponse.json({
        hint: "APIの利用制限に達しました。しばらく待ってから再試行してください。",
      });
    }

    return NextResponse.json({
      hint: "ヒントの生成中にエラーが発生しました。時間をおいて再試行してください。",
    });
  }
}
