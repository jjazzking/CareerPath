import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerPath",
  description: "주제별로 커리어 고민을 AI와 함께 발전시키는 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <a href="/" className="brand">CareerPath</a>
          <span className="tagline">주제별 커리어 탐색</span>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
