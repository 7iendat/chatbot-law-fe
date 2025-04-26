// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/inter/index.css";

export const metadata: Metadata = {
    title: "Chatbot Luật Việt Nam",
    description: "Hỏi đáp pháp luật với AI",
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
