// ChatBox.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    Send,
    Upload,
    User,
    Bot,
    Sparkles,
    Loader2, // Giữ lại Loader2 cho trạng thái isSending
    ExternalLink,
} from "lucide-react";
import {
    chatApis,
    ApiChatHistoryMessage, // Tin nhắn từ API get history
    SourceDocumentUI, // Kiểu cho source document hiển thị trên UI
    AnswerResponse, // Kiểu cho API non-streaming response
} from "../services/chatApis"; // Đảm bảo đường dẫn đúng và các types được export
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../contexts/ThemeContext"; // Đảm bảo đường dẫn đúng

// Không còn USE_STREAMING, component này chỉ hoạt động ở chế độ non-streaming

type UIMessage = ApiChatHistoryMessage & {
    id: string; // ID duy nhất cho mỗi tin nhắn
    isError?: boolean;
    sources?: SourceDocumentUI[]; // Nguồn tham khảo cho tin nhắn của bot
};

interface ChatBoxProps {
    chatId: string; // ID của phiên chat hiện tại
    initialMessages?: ApiChatHistoryMessage[]; // Tin nhắn ban đầu tải từ server
    initialQueryFromHome?: string; // Câu hỏi ban đầu từ trang chủ (nếu có)
}

export default function ChatBox({
    chatId,
    initialMessages,
    initialQueryFromHome,
}: ChatBoxProps) {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false); // Trạng thái đang gửi/chờ phản hồi

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);
    const { effectiveTheme } = useTheme();

    const generateId = () =>
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const scrollToBottom = useCallback(
        (behavior: "smooth" | "auto" = "smooth") => {
            const container = messagesContainerRef.current;
            if (container) {
                // Luôn cuộn xuống khi có tin nhắn mới hoặc khi người dùng ở gần cuối
                messagesEndRef.current?.scrollIntoView({
                    behavior,
                    block: "end",
                });
            }
        },
        [] // Không còn phụ thuộc vào `messages` để tránh re-render không cần thiết của callback
    );

    const handleSendMessage = useCallback(
        async (messageContent: string, currentChatId: string) => {
            if (!currentChatId) {
                toast.error("Lỗi: Không xác định được phiên chat.");
                return;
            }
            if (!messageContent.trim()) return;

            const userMessage: UIMessage = {
                id: `user-${generateId()}`,
                role: "user",
                content: messageContent,
                timestamp: new Date().toISOString(),
            };

            const botMessageId = `bot-${generateId()}`;
            // Placeholder message cho bot, không còn isStreaming
            const placeholderBotMessage: UIMessage = {
                id: botMessageId,
                role: "assistant",
                content: "", // Sẽ được thay thế bằng icon loading hoặc text "Bot đang soạn..."
                timestamp: new Date().toISOString(),
                sources: [],
            };

            setMessages((prev) => [
                ...prev,
                userMessage,
                placeholderBotMessage,
            ]);
            if (input === messageContent) setInput("");
            setIsSending(true);

            // Luôn sử dụng non-streaming
            try {
                const response: AnswerResponse = await chatApis.sendChatMessage(
                    // Gọi hàm API non-streaming của bạn
                    currentChatId,
                    messageContent
                );

                setMessages((prev: any) =>
                    prev.map((msg: any) =>
                        msg.id === botMessageId
                            ? {
                                  ...msg,
                                  content: response.answer,
                                  sources: response.sources || [],
                                  isError: false,
                                  timestamp: new Date().toISOString(),
                              }
                            : msg
                    )
                );
            } catch (error: any) {
                console.error("[ChatBox] Non-stream error:", error);
                const errorMessage = error.message || "Lỗi khi gửi tin nhắn.";
                toast.error(errorMessage);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMessageId
                            ? {
                                  ...msg,
                                  content: `⚠️ Lỗi: ${errorMessage}`,
                                  isError: true,
                                  timestamp: new Date().toISOString(),
                              }
                            : msg
                    )
                );
            } finally {
                setIsSending(false);
            }
        },
        [input] // Dependencies
    );

    useEffect(() => {
        if (
            initialMessages &&
            initialMessages.length > 0 &&
            messages.length === 0
        ) {
            const uiInitialMessages: UIMessage[] = initialMessages.map(
                (msg) => ({
                    ...msg,
                    id: `initial-${generateId()}`,
                    sources: msg.sources || [],
                })
            );
            setMessages(uiInitialMessages);
        } else if (initialQueryFromHome && !initialQueryProcessed && chatId) {
            if (
                messages.length === 0 ||
                messages[messages.length - 1]?.content !== initialQueryFromHome
            ) {
                handleSendMessage(initialQueryFromHome, chatId);
            }
            setInitialQueryProcessed(true);
        }
    }, [
        initialMessages,
        initialQueryFromHome,
        initialQueryProcessed,
        chatId,
        handleSendMessage,
        messages.length,
        messages,
    ]);

    const handleSubmit = useCallback(async () => {
        if (!input.trim() || isSending) return;
        await handleSendMessage(input, chatId);
    }, [input, isSending, chatId, handleSendMessage]);

    useEffect(() => {
        // Cuộn xuống mỗi khi messages thay đổi
        scrollToBottom("auto");
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                150 // Max height cho textarea
            )}px`;
        }
    }, [input]);

    // Không còn EventSource, không cần cleanup cho nó
    // useEffect(() => {
    //     return () => { /* Cleanup nếu có */ };
    // }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !isSending) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const formatTime = (isoTimestamp: string) => {
        try {
            return new Date(isoTimestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return ""; // Trả về chuỗi rỗng nếu timestamp không hợp lệ
        }
    };

    // TypingIndicator không còn cần thiết cho non-streaming
    // Bạn có thể hiển thị một spinner hoặc text trong message của bot khi isSending và content rỗng
    const BotLoadingMessage = () => (
        <div
            className="flex items-end gap-2 justify-start mb-5 animate-slide-up"
            style={{ animationFillMode: "forwards" }}
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Bot size={16} />
            </div>
            <div
                className={`px-4 py-3 rounded-2xl shadow-sm border ${
                    effectiveTheme === "light"
                        ? "bg-gray-100 border-gray-200"
                        : "bg-gray-600 border-gray-500"
                }`}
            >
                <Loader2 size={16} className="animate-spin text-gray-500" />
            </div>
        </div>
    );

    const showWelcomeScreen =
        messages.length === 0 &&
        !isSending &&
        (!initialQueryFromHome || initialQueryProcessed);

    if (!chatId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
                Đang tải hoặc không tìm thấy phiên chat...
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col h-full ${
                effectiveTheme === "light"
                    ? "bg-gradient-to-br from-blue-100 to-purple-100"
                    : "bg-gradient-to-br from-gray-900 to-gray-700"
            } rounded-xl overflow-hidden`}
        >
            {/* Header */}
            <div
                className={`text-center transition-all duration-700 max-w-4xl mx-auto px-2 py-2 md:px-4 md:py-1 ${
                    !showWelcomeScreen
                        ? "justify-start"
                        : "justify-center flex-col flex flex-1"
                }`}
            >
                {showWelcomeScreen ? (
                    <div className="flex flex-col flex-1 items-center justify-center space-y-4 animate-fade-in">
                        <div className="relative">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Bắt đầu cuộc trò chuyện!
                            </h1>
                            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                                <Sparkles size={24} />
                            </div>
                        </div>
                        <p
                            className={`text-lg md:text-xl font-medium ${
                                effectiveTheme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                            }`}
                        >
                            Đặt câu hỏi cho JuriBot.
                        </p>
                        <div className="flex justify-center mt-6 md:mt-8">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                <Bot size={40} className="text-white" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold pt-2 pb-1 md:pt-4 md:pb-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <span
                            className={`text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                                effectiveTheme === "dark"
                                    ? "text-shadow-sm"
                                    : ""
                            }`}
                        >
                            JuriBot Chat
                        </span>
                    </div>
                )}
            </div>

            {/* Vùng hiển thị tin nhắn */}
            {!showWelcomeScreen && (
                <div
                    ref={messagesContainerRef}
                    className={`flex-1 overflow-y-auto ${
                        effectiveTheme === "light"
                            ? "bg-white/80 border-gray-200"
                            : "bg-gray-800/70 border-gray-700"
                    } backdrop-blur-sm p-3 md:p-6 rounded-2xl border shadow-lg mb-3 md:mb-6 max-w-5xl w-full mx-auto`}
                >
                    {messages.length === 0 && !isSending ? (
                        <div
                            className={`text-center h-full flex items-center justify-center ${
                                effectiveTheme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                            }`}
                        >
                            Gửi một tin nhắn để bắt đầu.
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            // Nếu là tin nhắn của bot và đang isSending và content rỗng, hiển thị BotLoadingMessage
                            if (
                                msg.role === "assistant" &&
                                msg.id.startsWith("bot-") &&
                                isSending &&
                                msg.content === ""
                            ) {
                                return <BotLoadingMessage key={msg.id} />;
                            }
                            return (
                                <div
                                    key={msg.id}
                                    className={`mb-4 md:mb-6 opacity-0 animate-slide-up ${
                                        msg.role === "user"
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                    style={{
                                        animationDelay: `${
                                            Math.min(i, 10) * 0.05
                                        }s`,
                                        animationFillMode: "forwards",
                                    }}
                                >
                                    <div
                                        className={`flex items-end gap-2 md:gap-3 ${
                                            msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                                                <Bot size={16} />
                                            </div>
                                        )}
                                        <div
                                            className={`inline-block px-4 py-2 md:px-5 md:py-3 rounded-2xl max-w-[75%] break-words shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 md:hover:-translate-y-1 ${
                                                msg.role === "user"
                                                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                                                    : msg.isError
                                                    ? "bg-red-100 text-red-800 border border-red-300"
                                                    : effectiveTheme === "light"
                                                    ? "bg-gray-50 text-gray-900 border border-gray-200"
                                                    : "bg-gray-600 text-gray-100 border border-gray-500"
                                            }`}
                                        >
                                            <div className="markdown-content">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            {msg.role === "assistant" &&
                                                msg.sources &&
                                                msg.sources.length > 0 && (
                                                    <div
                                                        className={`mt-2 pt-2 border-t text-xs ${
                                                            effectiveTheme ===
                                                            "light"
                                                                ? "border-gray-200"
                                                                : "border-gray-500"
                                                        }`}
                                                    >
                                                        <p
                                                            className={`font-semibold mb-1 ${
                                                                effectiveTheme ===
                                                                "light"
                                                                    ? "text-gray-600"
                                                                    : "text-gray-300"
                                                            }`}
                                                        >
                                                            Nguồn tham khảo:
                                                        </p>
                                                        <ul className="list-disc list-inside pl-2 space-y-1">
                                                            {msg.sources.map(
                                                                (
                                                                    source,
                                                                    idx
                                                                ) => (
                                                                    <li
                                                                        key={`${msg.id}-source-${idx}`}
                                                                        className={`${
                                                                            effectiveTheme ===
                                                                            "light"
                                                                                ? "text-gray-700 hover:text-blue-600"
                                                                                : "text-gray-300 hover:text-blue-400"
                                                                        }`}
                                                                    >
                                                                        {source.source.startsWith(
                                                                            "http"
                                                                        ) ? (
                                                                            <a
                                                                                href={
                                                                                    source.source
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                title={
                                                                                    source.page_content_preview
                                                                                }
                                                                                className="inline-flex items-center"
                                                                            >
                                                                                {
                                                                                    new URL(
                                                                                        source.source
                                                                                    )
                                                                                        .hostname
                                                                                }{" "}
                                                                                <ExternalLink
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                    className="ml-1"
                                                                                />
                                                                            </a>
                                                                        ) : (
                                                                            <span
                                                                                title={
                                                                                    source.page_content_preview
                                                                                }
                                                                            >
                                                                                {
                                                                                    source.source
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`text-xs mt-1 md:mt-2 ${
                                            effectiveTheme === "light"
                                                ? "text-gray-600"
                                                : "text-gray-400"
                                        } ${
                                            msg.role === "user"
                                                ? "text-right pr-10 md:pr-11"
                                                : "text-left pl-10 md:pl-11"
                                        }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                        {/* Không còn isStreaming */}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {/* Hiển thị BotLoadingMessage khi isSending và tin nhắn placeholder của bot chưa có content */}
                    {/* Điều kiện này đã được xử lý trong vòng lặp map ở trên */}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Vùng Input */}
            <div
                className={`${
                    effectiveTheme === "light"
                        ? "bg-white/90 border-gray-200"
                        : "bg-black/30 border-gray-700"
                } backdrop-blur-sm border rounded-2xl shadow-xl p-3 md:p-4 max-w-5xl mx-auto w-full transition-all duration-300 hover:shadow-2xl mb-1`}
            >
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                        showWelcomeScreen
                            ? "Đặt câu hỏi để bắt đầu..."
                            : "Nhập câu hỏi về luật pháp..."
                    }
                    rows={1}
                    className={`w-full border-2 rounded-xl px-4 py-3 md:px-5 md:py-4 mb-3 md:mb-4 focus:outline-none resize-none text-sm md:text-base transition-all duration-300 scrollbar scrollbar-thin custom-scrollbar ${
                        effectiveTheme === "light"
                            ? "bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-gray-900 scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                            : "bg-gray-700/80 border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-900/50 text-gray-100 scrollbar-thumb-gray-500 scrollbar-track-gray-700"
                    }`}
                    style={{
                        minHeight: "48px",
                        maxHeight: "150px",
                        overflowY: "auto",
                    }}
                    disabled={isSending}
                />
                <div className="flex items-center justify-between">
                    {/* <button
                        className={`group w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl border flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                            effectiveTheme === "light"
                                ? "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 border-gray-300 hover:border-blue-300"
                                : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-blue-700 hover:to-purple-700 border-gray-500 hover:border-blue-500"
                        }`}
                        disabled={isSending}
                        title="Tải lên tệp (chức năng chưa triển khai)"
                        onClick={() =>
                            toast.error(
                                "Chức năng tải tệp lên chưa được triển khai."
                            )
                        }
                    >
                        <Upload
                            size={18}
                            className={`${
                                effectiveTheme === "light"
                                    ? "text-gray-600 group-hover:text-blue-600"
                                    : "text-gray-300 group-hover:text-blue-400"
                            } transition-colors duration-300`}
                        />
                    </button> */}
                    <div></div>
                    <button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isSending}
                        className="group relative w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send
                                size={18}
                                className="transform group-hover:translate-x-0.5 transition-transform duration-200"
                            />
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #9ca3af; /* Màu của thumb cho dark theme */
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .markdown-content {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    white-space: normal;
                }
                .markdown-content p,
                .markdown-content pre,
                .markdown-content code,
                .markdown-content ul,
                .markdown-content ol,
                .markdown-content blockquote,
                .markdown-content table,
                .markdown-content tr,
                .markdown-content td,
                .markdown-content th {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    white-space: normal;
                }
                .markdown-content pre {
                    white-space: pre-wrap;
                    overflow-x: auto;
                    padding: 8px;
                    border-radius: 4px;
                    background: ${effectiveTheme === "light"
                        ? "#f3f4f6"
                        : "#374151"};
                    color: ${effectiveTheme === "light"
                        ? "#1f2937"
                        : "#d1d5db"};
                }
                .markdown-content code:not(pre code) {
                    white-space: normal;
                    padding: 2px 4px;
                    border-radius: 4px;
                    background: ${effectiveTheme === "light"
                        ? "#e5e7eb"
                        : "#4b5563"};
                    color: ${effectiveTheme === "light"
                        ? "#374151"
                        : "#f3f4f6"};
                }
                .markdown-content pre code {
                    white-space: inherit;
                    background: transparent;
                    color: inherit;
                    padding: 0;
                }
                .text-shadow-sm {
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                /* Light theme scrollbar for custom-scrollbar */
                ${effectiveTheme === "light"
                    ? `
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1; /* Màu thumb cho light theme */
                }
                `
                    : ""}
            `}</style>
        </div>
    );
}
