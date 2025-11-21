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
    const {
      userQuestion,
      problemTitle,
      problemDescription,
      code,
      terminalOutput,
      conversationHistory = []
    } = await request.json();

    // ステップ1: ユーザークエリの適切性をチェック
    const checkResponse = await fetch(`${request.nextUrl.origin}/api/llm/check-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userQuestion }),
    });

    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();

      // 不適切な質問と判定された場合
      if (checkResult.isValid === false) {
        console.log(`Query blocked: ${userQuestion} | Reason: ${checkResult.reason}`);
        return NextResponse.json({
          answer: "その質問には答えられません。質問の内容を見直して再送信してください。",
        });
      }
    } else {
      // チェックAPIがエラーの場合はログに記録して続行
      console.warn("Query check API failed, proceeding with the question");
    }

    // ステップ2: 通常のLLM処理
    // コンテキストの組み立て
    const contextMessage = `
【問題】
${problemTitle}
${problemDescription}

【学生のコード】
\`\`\`python
${code}
\`\`\`

【実行結果】
${terminalOutput || "(まだ実行されていません)"}
`;

    // メッセージ履歴を構築
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: contextMessage },
    ];

    // 会話履歴を追加（もしあれば）
    conversationHistory.forEach((msg: { role: string; content: string }) => {
      messages.push({ role: msg.role, content: msg.content });
    });

    // ユーザーの質問を追加
    messages.push({ role: "user", content: userQuestion });

    // LLM API呼び出し（SambaNova → Groq フォールバック）
    const data = await callLLMWithFallback({
      messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    });

    const answer = data.choices[0]?.message?.content || "回答を生成できませんでした。";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error generating answer:", error);

    // 両方のAPIでレート制限に達した場合
    if (error instanceof Error && error.message === "RATE_LIMIT_BOTH") {
      return NextResponse.json({
        answer: "APIの利用制限に達しました。しばらく待ってから再試行してください。",
      });
    }

    return NextResponse.json({
      answer: "回答の生成中にエラーが発生しました。時間をおいて再試行してください。",
    });
  }
}
