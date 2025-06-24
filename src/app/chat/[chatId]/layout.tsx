// File: app/chat/[chatId]/layout.tsx (Phiên bản cải tiến)

import type { ReactNode } from "react";

// Layout này chỉ cần nhận children, vì nó là một wrapper chung.
// Nó không cần biết gì về chatId.
export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <div className="chat-layout h-screen w-screen">
            {/*
        Ở đây có thể chứa các component chung cho TẤT CẢ các trang con của /chat/[chatId],
        ví dụ như một header chung, sidebar chung...
      */}
            {children}
        </div>
    );
}
