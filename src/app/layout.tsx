// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/inter/index.css";

export const metadata: Metadata = {
    title: "JuriBot - Hỏi đáp pháp luật với AI",
    description: "Hỏi đáp pháp luật với AI",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className="min-h-screen bg-white">{children}</body>
        </html>
    );
}
