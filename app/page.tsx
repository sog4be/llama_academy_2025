"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProblemDisplay } from "@/components/problem-display";
import { SplitLayout } from "@/components/split-layout";
import { CodeEditor } from "@/components/code-editor";
import { Terminal, TerminalLine } from "@/components/terminal";
import { AIChatDialog } from "@/components/ai-chat-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Loader2 } from "lucide-react";
import { runPythonCode } from "@/lib/pyodide-runner";
import { problems } from "@/data/problems";

export default function Home() {
  const [currentProblemId, setCurrentProblemId] = useState(problems[0].id);
  const currentProblem = problems.find((p) => p.id === currentProblemId) || problems[0];

  const [code, setCode] = useState(currentProblem.initialCode);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // 自動ヒント状態
  const [autoHint, setAutoHint] = useState<{
    status: "idle" | "loading" | "success" | "error";
    content: string;
  }>({ status: "idle", content: "" });

  // 問題が変わったらコードとヒントをリセット
  useEffect(() => {
    setCode(currentProblem.initialCode);
    setTerminalLines([]);
    setAutoHint({ status: "idle", content: "" });
  }, [currentProblemId, currentProblem.initialCode]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setTerminalLines([
      { type: "output", content: ">>> Pythonを初期化中..." },
    ]);
    setAutoHint({ status: "loading", content: "" });

    try {
      // Python実行とヒント生成を並行実行
      const [pythonResult, _] = await Promise.all([
        runPythonCode(code),
        // ヒント生成（バックグラウンドで実行）
        fetch("/api/llm/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemTitle: currentProblem.title,
            problemDescription: currentProblem.description,
            code,
            terminalOutput: "", // 実行前なので空
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.hint) {
              setAutoHint({ status: "success", content: data.hint });
            } else {
              setAutoHint({
                status: "error",
                content: "ヒントの生成に失敗しました。",
              });
            }
          })
          .catch((err) => {
            console.error("Hint generation error:", err);
            setAutoHint({
              status: "error",
              content: "ヒントの生成中にエラーが発生しました。",
            });
          }),
      ]);

      const newLines: TerminalLine[] = [
        { type: "output", content: ">>> コードを実行中..." },
      ];

      // 出力を追加
      pythonResult.output.forEach((line) => {
        newLines.push({ type: "output", content: line });
      });

      // エラーがあれば追加
      if (pythonResult.error) {
        newLines.push({ type: "error", content: `エラー: ${pythonResult.error}` });
      } else {
        newLines.push({ type: "output", content: ">>> 実行完了" });
      }

      setTerminalLines(newLines);

      // 実行結果を含めてヒントを再生成（オプション：より正確なヒントのため）
      const terminalOutput = newLines.map((line) => line.content).join("\n");
      fetch("/api/llm/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: currentProblem.title,
          problemDescription: currentProblem.description,
          code,
          terminalOutput,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.hint) {
            setAutoHint({ status: "success", content: data.hint });
          }
        })
        .catch((err) => {
          console.error("Hint re-generation error:", err);
        });
    } catch (err) {
      setTerminalLines([
        {
          type: "error",
          content: `実行エラー: ${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
      setAutoHint({
        status: "error",
        content: "ヒントの生成中にエラーが発生しました。",
      });
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      {/* 上部: 問題選択タブ */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <Tabs value={currentProblemId} onValueChange={setCurrentProblemId}>
          <TabsList>
            {problems.map((problem) => (
              <TabsTrigger key={problem.id} value={problem.id}>
                問題{problem.id}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 問題説明エリア */}
      <div className="px-4 pt-4 pb-2 border-b max-h-[300px] overflow-y-auto">
        <ProblemDisplay
          title={currentProblem.title}
          description={currentProblem.description}
        />
      </div>

      {/* メインエリア: 左右分割 */}
      <div className="flex-1 p-4 relative" style={{ minHeight: '600px' }}>
        <SplitLayout
          leftPanel={
            <div className="h-full flex flex-col">
              <h3 className="font-semibold mb-2">コードエディタ</h3>
              <div className="flex-1">
                <CodeEditor value={code} onChange={setCode} />
              </div>
            </div>
          }
          rightPanel={
            <div className="h-full flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">ターミナル</h3>
                <Button onClick={handleRunCode} disabled={isRunning} className="gap-2">
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      実行中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      実行
                    </>
                  )}
                </Button>
              </div>
              <div className="flex-1">
                <Terminal lines={terminalLines} />
              </div>
            </div>
          }
        />

      </div>

      {/* 右下: AI相談ボタン（固定位置） */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="w-20 h-20 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
          aria-label="AIに相談"
        >
          <Image
            src="/llama_icon.png"
            alt="AI相談"
            width={80}
            height={80}
            className="rounded-full scale-x-[-1]"
          />
        </button>
      </div>

      {/* AI相談ダイアログ */}
      <AIChatDialog
        open={isAIChatOpen}
        onOpenChange={setIsAIChatOpen}
        currentProblem={currentProblem}
        currentCode={code}
        terminalOutput={terminalLines.map((line) => line.content).join("\n")}
        autoHint={autoHint}
      />
    </div>
  );
}
