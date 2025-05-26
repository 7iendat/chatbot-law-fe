// app/chat/[chatId]/layout.tsx
import { Metadata, ResolvingMetadata } from "next";

type Props = {
    params: { chatId: string };
};

export async function generateMetadata(
    props: Props, // Nhận toàn bộ props
    parent?: ResolvingMetadata
): Promise<Metadata> {
    // Thử await trực tiếp props.params
    // Điều này có thể không đúng về mặt type, nhưng hãy xem Turbopack xử lý thế nào
    // Bạn có thể cần ép kiểu (props.params as any) nếu TypeScript báo lỗi
    const resolvedParams = await (props.params as any); // Thử nghiệm

    const chatId = resolvedParams.chatId;

    console.log("[Layout] generateMetadata - resolvedParams:", resolvedParams);
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

// Component Layout của bạn
export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="chat-layout h-screen w-screen">{children}</div>;
}
