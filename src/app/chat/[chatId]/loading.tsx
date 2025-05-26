// app/chat/[chatId]/loading.tsx
import { Bot } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto animate-pulse">
                        <Bot size={32} className="text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Đang tải cuộc hội thoại
                </h2>
                <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
        </div>
    );
}
