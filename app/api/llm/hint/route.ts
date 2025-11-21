import { NextRequest, NextResponse } from "next/server";

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

    // SambaNova API呼び出し
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SAMBANOVA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Llama-4-Maverick-17B-128E-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SambaNova API error:", errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const hint = data.choices[0]?.message?.content || "ヒントを生成できませんでした。";

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Error generating hint:", error);
    return NextResponse.json(
      { error: "ヒントの生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
