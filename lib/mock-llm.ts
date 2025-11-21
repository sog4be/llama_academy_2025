// モックLLMレスポンス
// 実際のSambaNova APIに差し替え可能な構造

export async function getMockLLMResponse(
  userQuestion: string,
  currentCode: string,
  terminalOutput: string
): Promise<string> {
  // 実際のAPI呼び出しをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // コンテキストに基づいたモックレスポンス
  const lowerQuestion = userQuestion.toLowerCase();

  if (lowerQuestion.includes("エラー") || lowerQuestion.includes("error")) {
    return `エラーについてですね。以下のヒントを参考にしてください：

1. エラーメッセージをよく読んでみましょう
2. 行番号を確認して、該当する部分のコードを見直してみましょう
3. Python の構文が正しいか確認してみましょう

具体的にどの部分で困っていますか？`;
  }

  if (lowerQuestion.includes("print") || lowerQuestion.includes("出力")) {
    return `print関数についてのヒントです：

1. print()関数は、括弧の中に出力したい内容を書きます
2. 文字列を出力する場合は、引用符（'または"）で囲みます
3. 例: print('Hello World')

実際に書いてみて、実行ボタンを押してみましょう！`;
  }

  if (lowerQuestion.includes("どう") || lowerQuestion.includes("方法")) {
    return `問題を解くためのステップを考えてみましょう：

1. まず、何を出力すれば良いか確認しましょう
2. print関数を使って、必要な文字列を出力します
3. コードを書いたら、実行ボタンで動作を確認しましょう

一つずつ試してみてください！`;
  }

  if (lowerQuestion.includes("答え") || lowerQuestion.includes("正解")) {
    return `直接答えを教えることはできませんが、一緒に考えていきましょう！

問題文をもう一度読んで、何をすれば良いか確認してみてください。
必要な情報は全て問題文に書かれていますよ。

どの部分で詰まっていますか？具体的に教えていただければ、ヒントを出せます。`;
  }

  // デフォルトレスポンス
  return `質問ありがとうございます！

現在のコード:
\`\`\`python
${currentCode.substring(0, 100)}${currentCode.length > 100 ? "..." : ""}
\`\`\`

以下のことを試してみてください：
1. 問題文をもう一度確認してみましょう
2. コードを少しずつ書いて、実行して確認してみましょう
3. エラーが出た場合は、エラーメッセージを読んでみましょう

もっと具体的な質問があれば、お答えします！`;
}
