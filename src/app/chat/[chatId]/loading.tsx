// src/app/chat/loading.tsx

import React from "react";
import { MessageSquareDashed } from "lucide-react";

// Đây là một component server, nó không cần "use client"
export default function ChatLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-500">
            <div className="flex items-center space-x-4 animate-pulse">
                <MessageSquareDashed className="w-10 h-10 text-blue-400" />
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Đang tải cuộc trò chuyện...
                    </h2>
                    <p className="text-sm">Vui lòng chờ trong giây lát.</p>
                </div>
            </div>
        </div>
    );
}
