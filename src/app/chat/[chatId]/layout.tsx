// File: app/chat/[chatId]/layout.tsx

import { Metadata } from "next";
import { ReactNode } from "react";

// 1. Định nghĩa type RIÊNG cho generateMetadata
type MetadataProps = {
    params: { chatId: string };
};

// 2. Định nghĩa type RIÊNG cho Layout
type LayoutProps = {
    params: { chatId: string };
    children: ReactNode; // 'children' là bắt buộc, không có dấu '?'
};

// 3. Sử dụng MetadataProps
export async function generateMetadata({
    params,
}: MetadataProps): Promise<Metadata> {
    const { chatId } = params;

    console.log("[Layout] generateMetadata - params:", params);
    console.log("[Layout] generateMetadata - Extracted chatId:", chatId);

    let truncatedChatId = "ID không xác định";
    if (chatId && typeof chatId === "string" && chatId.length > 0) {
        truncatedChatId = chatId.slice(0, 8);
    } else {
        console.warn(
            `[Layout] generateMetadata: chatId is invalid or empty: ${chatId}`
        );
    }

    return {
        title: `Chat ${truncatedChatId} | JuriBot`,
        description:
            "Cuộc hội thoại với JuriBot - Trợ lý AI về luật pháp Việt Nam",
    };
}

// 4. Sử dụng LayoutProps
export default function ChatLayout({ children, params }: LayoutProps) {
    return <div className="chat-layout h-screen w-screen">{children}</div>;
}
