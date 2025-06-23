import { Metadata } from "next";
import { ReactNode } from "react";

// Định nghĩa type cho props của layout và generateMetadata
type Props = {
    params: { chatId: string };
    children?: ReactNode; // Thêm children để khớp với LayoutProps
};

// Hàm generateMetadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { chatId } = params; // Truy cập trực tiếp, không cần await

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

// Component Layout
export default function ChatLayout({ children, params }: Props) {
    return <div className="chat-layout h-screen w-screen">{children}</div>;
}
