import { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "1",
    title: "問題1: Hello Worldを出力しよう",
    description: `print関数を使って、「Hello World」と出力するプログラムを書いてください。

ヒント:
- print()関数を使います
- 文字列は引用符（'または"）で囲みます`,
    initialCode: "# ここにコードを書いてください\n",
    testCases: [
      {
        expectedOutput: "Hello World",
      },
    ],
  },
  {
    id: "2",
    title: "問題2: 自己紹介プログラム",
    description: `あなたの名前を出力するプログラムを書いてください。

例: 「私の名前は太郎です」

ヒント:
- print()関数を使います
- 自分の名前に置き換えてください`,
    initialCode: "# あなたの名前を出力してください\n",
  },
  {
    id: "3",
    title: "問題3: 計算結果を出力しよう",
    description: `10 + 20の計算結果を出力するプログラムを書いてください。

ヒント:
- Pythonでは数値の計算ができます
- 計算結果をprint()で出力します`,
    initialCode: "# 10 + 20の結果を出力してください\n",
    testCases: [
      {
        expectedOutput: "30",
      },
    ],
  },
];
