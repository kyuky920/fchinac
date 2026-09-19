"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    window.location.replace("/ko");
  }, []);

  return (
    <main
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <p>
        <Link href="/ko">한국어 홈페이지로 이동합니다.</Link>
      </p>
    </main>
  );
}
