import { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "1",
    title: "問題1: 🦙階段を描こう（再帰）",
    description: `再帰を使って4段のllama🦙階段を描くプログラムを完成させてください。

目標の出力:
🦙
🦙🦙
🦙🦙🦙
🦙🦙🦙🦙

再帰の重要ポイント:
- まず「n-1段の階段」を描く（再帰呼び出し）
- 最後に「n段目」を描く
- ベースケース（n <= 0）で再帰を止める

ヒント:
- print_llama_stairs(n - 1) で小さい階段を先に描く
- print("🦙" * n) で n 個の llama を描く`,
    initialCode: `def print_llama_stairs(n: int) -> None:
    """
    n 段の llama 階段を再帰で描く関数。

    例: n = 4 →
    🦙
    🦙🦙
    🦙🦙🦙
    🦙🦙🦙🦙
    """
    if n <= 0:
        return

    # ここに再帰のコードを書いてください
    # ヒント1: print_llama_stairs(???) で小さい階段を描く
    # ヒント2: print("🦙" * n) で n 段目を描く


# 実行
print_llama_stairs(4)
`,
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
