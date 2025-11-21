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
    const {
      userQuestion,
      problemTitle,
      problemDescription,
      code,
      terminalOutput,
      conversationHistory = []
    } = await request.json();

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

    // SambaNova API呼び出し
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SAMBANOVA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Llama-4-Maverick-17B-128E-Instruct",
        messages,
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
    const answer = data.choices[0]?.message?.content || "回答を生成できませんでした。";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error generating answer:", error);
    return NextResponse.json(
      { error: "回答の生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
