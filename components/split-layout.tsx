"use client";

import { ReactNode } from "react";

interface SplitLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function SplitLayout({ leftPanel, rightPanel }: SplitLayoutProps) {
  return (
    <div className="grid grid-cols-2 gap-4" style={{ height: '600px' }}>
      <div className="border-r border-gray-200 pr-4">
        {leftPanel}
      </div>
      <div className="pl-4">
        {rightPanel}
      </div>
    </div>
  );
}
