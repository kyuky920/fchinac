import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "안디옥성경사이버선교회",
    template: "%s | 안디옥성경사이버선교회",
  },
  description: "안디옥성경사이버선교회 공식 홈페이지",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

