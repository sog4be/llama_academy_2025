"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import type { Problem } from "@/types/problem";

interface Message {
  role: "user" | "assistant";
  content: string;
  type: "auto-hint" | "user-question";
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProblem: Problem;
  currentCode: string;
  terminalOutput: string;
  autoHint: {
    status: "idle" | "loading" | "success" | "error";
    content: string;
  };
}

export function AIChatDialog({
  open,
  onOpenChange,
  currentProblem,
  currentCode,
  terminalOutput,
  autoHint,
}: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ダイアログが開かれた時、自動ヒントをチャットに追加
  useEffect(() => {
    if (open) {
      // 自動ヒントの状態に応じてメッセージを設定
      if (autoHint.status === "success" && autoHint.content) {
        setMessages([
          {
            role: "assistant",
            content: autoHint.content,
            type: "auto-hint",
          },
        ]);
      } else if (autoHint.status === "loading") {
        setMessages([
          {
            role: "assistant",
            content: "ヒントを生成中...",
            type: "auto-hint",
          },
        ]);
      } else if (autoHint.status === "error") {
        setMessages([
          {
            role: "assistant",
            content: autoHint.content || "ヒントの生成に失敗しました。",
            type: "auto-hint",
          },
        ]);
      } else {
        setMessages([]);
      }
    }
  }, [open, autoHint]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, type: "user-question" },
    ]);
    setIsLoading(true);

    try {
      // 会話履歴を構築（auto-hintは除外）
      const conversationHistory = messages
        .filter((msg) => msg.type === "user-question")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // ユーザー質問APIを呼び出し
      const response = await fetch("/api/llm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuestion: userMessage,
          problemTitle: currentProblem.title,
          problemDescription: currentProblem.description,
          code: currentCode,
          terminalOutput,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, type: "user-question" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "回答を生成できませんでした。もう一度お試しください。",
            type: "user-question",
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "エラーが発生しました。もう一度お試しください。",
          type: "user-question",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>AIに相談</DialogTitle>
          <DialogDescription>
            自動生成されたヒントを確認したり、追加で質問できます。
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                コードを実行すると、AIが自動でヒントを生成します
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-100 ml-8"
                      : message.type === "auto-hint"
                      ? "bg-blue-50 border-2 border-blue-300 mr-8"
                      : "bg-gray-100 mr-8"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1 flex items-center gap-1">
                    {message.role === "user" ? (
                      "あなた"
                    ) : message.type === "auto-hint" ? (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        AI（自動ヒント）
                      </>
                    ) : (
                      "AI"
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="bg-gray-100 p-3 rounded-lg mr-8">
                <div className="font-semibold text-sm mb-1">AI</div>
                <div className="text-sm text-gray-500">考え中...</div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="追加で質問を入力..."
            className="flex-1 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            送信
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
