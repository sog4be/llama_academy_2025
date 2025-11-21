"use client";

import { useState } from "react";
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
import { Send } from "lucide-react";
import { getMockLLMResponse } from "@/lib/mock-llm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCode: string;
  terminalOutput: string;
}

export function AIChatDialog({
  open,
  onOpenChange,
  currentCode,
  terminalOutput,
}: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // モックLLMレスポンスを取得（コードとターミナル出力をコンテキストとして渡す）
      const response = await getMockLLMResponse(
        userMessage,
        currentCode,
        terminalOutput
      );

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "エラーが発生しました。もう一度お試しください。",
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
            コードについて質問してください。ヒントを提供します。
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                質問を入力してください
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-100 ml-8"
                      : "bg-gray-100 mr-8"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {message.role === "user" ? "あなた" : "AI"}
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
            placeholder="質問を入力..."
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
