"use client";

import { Card } from "@/components/ui/card";

export interface TerminalLine {
  type: "output" | "error";
  content: string;
}

interface TerminalProps {
  lines: TerminalLine[];
}

export function Terminal({ lines }: TerminalProps) {
  return (
    <Card className="h-full flex flex-col bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-hidden">
      <div className="flex-1 overflow-auto">
        {lines.length === 0 ? (
          <div className="text-gray-500">実行結果がここに表示されます...</div>
        ) : (
          lines.map((line, index) => (
            <div
              key={index}
              className={line.type === "error" ? "text-red-400" : "text-green-400"}
            >
              {line.content}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
