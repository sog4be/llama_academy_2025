"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProblemDisplay } from "@/components/problem-display";
import { SplitLayout } from "@/components/split-layout";
import { CodeEditor } from "@/components/code-editor";
import { Terminal, TerminalLine } from "@/components/terminal";
import { AIChatDialog } from "@/components/ai-chat-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Play, Loader2 } from "lucide-react";
import { runPythonCode } from "@/lib/pyodide-runner";
import { problems } from "@/data/problems";

export default function Home() {
  const [currentProblemId, setCurrentProblemId] = useState(problems[0].id);
  const currentProblem = problems.find((p) => p.id === currentProblemId) || problems[0];

  const [code, setCode] = useState(currentProblem.initialCode);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // 問題が変わったらコードをリセット
  useEffect(() => {
    setCode(currentProblem.initialCode);
    setTerminalLines([]);
  }, [currentProblemId, currentProblem.initialCode]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setTerminalLines([
      { type: "output", content: ">>> Pythonを初期化中..." },
    ]);

    try {
      const result = await runPythonCode(code);

      const newLines: TerminalLine[] = [
        { type: "output", content: ">>> コードを実行中..." },
      ];

      // 出力を追加
      result.output.forEach((line) => {
        newLines.push({ type: "output", content: line });
      });

      // エラーがあれば追加
      if (result.error) {
        newLines.push({ type: "error", content: `エラー: ${result.error}` });
      } else {
        newLines.push({ type: "output", content: ">>> 実行完了" });
      }

      setTerminalLines(newLines);
    } catch (err) {
      setTerminalLines([
        { type: "error", content: `実行エラー: ${err instanceof Error ? err.message : String(err)}` },
      ]);
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <div className="h-screen flex flex-col">
      {/* 上部: 問題選択タブ */}
      <div className="p-4 border-b">
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
      <div className="px-4 pt-4 pb-2 border-b">
        <ProblemDisplay
          title={currentProblem.title}
          description={currentProblem.description}
        />
      </div>

      {/* メインエリア: 左右分割 */}
      <div className="flex-1 p-4 relative overflow-hidden">
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

        {/* 右下: AI相談ボタン */}
        <div className="absolute bottom-8 right-8">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setIsAIChatOpen(true)}
          >
            <MessageCircle className="w-5 h-5" />
            AIに相談
          </Button>
        </div>
      </div>

      {/* AI相談ダイアログ */}
      <AIChatDialog
        open={isAIChatOpen}
        onOpenChange={setIsAIChatOpen}
        currentCode={code}
        terminalOutput={terminalLines.map((line) => line.content).join("\n")}
      />
    </div>
  );
}
