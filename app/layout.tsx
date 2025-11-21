import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Python Coding Learning Tool",
  description: "大学生向けプログラミング教育支援ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
