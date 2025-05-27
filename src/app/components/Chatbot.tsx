"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Upload, User, Bot, Sparkles, Loader2 } from "lucide-react";
import { chatApis, ApiChatHistoryMessage } from "../services/chatApis";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type UIMessage = ApiChatHistoryMessage & {
    id?: string;
    isError?: boolean;
};

interface ChatBoxProps {
    chatId: string;
    initialMessages?: ApiChatHistoryMessage[];
    initialQueryFromHome?: string;
}

export default function ChatBox({
    chatId,
    initialMessages,
    initialQueryFromHome,
}: ChatBoxProps) {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null); // Thêm ref này cho vùng chứa tin nhắn

    const scrollToBottom = useCallback(
        (behavior: "smooth" | "auto" = "smooth") => {
            const container = messagesContainerRef.current;
            if (container) {
                // Chỉ cuộn mượt nếu người dùng đang ở gần cuối hoặc là tin nhắn mới của user
                const { scrollTop, scrollHeight, clientHeight } = container;
                const isUserAtBottom =
                    scrollHeight - scrollTop - clientHeight < 100; // Ngưỡng 100px

                if (behavior === "auto" || isUserAtBottom) {
                    messagesEndRef.current?.scrollIntoView({ behavior });
                }
            }
        },
        []
    );

    const sendMessageAndGetResponse = useCallback(
        async (messageContent: string, currentChatId: string) => {
            if (!currentChatId) {
                console.error(
                    "ChatBox: chatId is undefined in sendMessageAndGetResponse"
                );
                toast.error("Lỗi: Không xác định được phiên chat.");
                return;
            }
            if (!messageContent.trim()) return;

            const userMessage: UIMessage = {
                id: `user-${Date.now()}-${Math.random()}`, // Thêm Math.random() để tăng tính duy nhất
                role: "user",
                content: messageContent,
                timestamp: new Date().toISOString(),
            };

            // Cập nhật messages ngay lập tức với tin nhắn người dùng
            setMessages((prev) => [...prev, userMessage]);

            // Không clear input ở đây nữa
            // if (input === messageContent) {
            //     setInput("");
            // }

            setIsBotTyping(true);
            setIsSending(true); // Đặt isSending true sau khi setMessages cho user

            try {
                const apiResponse = await chatApis.sendChatMessage(
                    currentChatId,
                    messageContent
                );
                const botReply: UIMessage = {
                    id: `bot-${Date.now()}-${Math.random()}`, // Thêm Math.random()
                    role: "assistant",
                    content: apiResponse.answer, // Đảm bảo apiResponse.answer có giá trị
                    timestamp: new Date().toISOString(),
                };
                setIsBotTyping(false); // Đặt isBotTyping false sau khi nhận được phản hồi
                setMessages((prev) => [...prev, botReply]);
            } catch (error: any) {
                console.error(
                    "ChatBox: Error sending message or getting bot response:",
                    error
                );
                const errorMessage =
                    error?.message ||
                    "Xin lỗi, đã có lỗi xảy ra khi gửi tin nhắn.";
                toast.error(errorMessage);
                const errorReply: UIMessage = {
                    id: `bot-error-${Date.now()}-${Math.random()}`, // Thêm Math.random()
                    role: "assistant",
                    content: `Đã xảy ra lỗi: ${errorMessage}. Vui lòng thử lại.`,
                    timestamp: new Date().toISOString(),
                    isError: true,
                };
                setIsBotTyping(false); // Đặt isBotTyping false khi có lỗi
                setMessages((prev) => [...prev, errorReply]);
            } finally {
                setIsBotTyping(false);
                setIsSending(false);
            }
        },
        [] // Dependencies: các state setters (setMessages, setIsBotTyping, setIsSending) là stable.
        // chatApis cũng là stable import.
    );

    useEffect(() => {
        if (
            initialMessages &&
            initialMessages.length > 0 &&
            messages.length === 0
        ) {
            // Thêm messages.length === 0 để tránh ghi đè
            console.log(
                "[ChatBox] Setting initial messages from props:",
                initialMessages
            );
            const uiInitialMessages: UIMessage[] = initialMessages.map(
                (msg, index) => ({
                    ...msg,
                    id: `initial-${msg.timestamp}-${index}-${Math.random()}`,
                })
            );
            setMessages(uiInitialMessages);
            // Không set initialQueryProcessed ở đây nếu initialMessages được dùng
            // setInitialQueryProcessed(true); // Có thể bạn muốn logic khác ở đây
        } else if (initialQueryFromHome && !initialQueryProcessed && chatId) {
            console.log(
                `[ChatBox] Processing initialQueryFromHome for chatId ${chatId}: "${initialQueryFromHome}"`
            );
            // Đảm bảo không gọi setInput("") cho initialQueryFromHome trong sendMessageAndGetResponse
            sendMessageAndGetResponse(initialQueryFromHome, chatId);
            setInitialQueryProcessed(true);
        }
    }, [
        initialMessages,
        initialQueryFromHome,
        initialQueryProcessed,
        chatId,
        sendMessageAndGetResponse,
        messages.length, // Thêm để check điều kiện messages.length === 0
    ]);

    const handleSendMessageFromInput = useCallback(async () => {
        if (!input.trim() || isSending) return;
        const messageToSend = input; // Lưu lại giá trị input hiện tại
        setInput(""); // Clear input ngay lập tức
        await sendMessageAndGetResponse(messageToSend, chatId);
    }, [input, isSending, chatId, sendMessageAndGetResponse]); // Dependencies vẫn giữ nguyên

    // ... các useEffect và hàm khác không thay đổi ...
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
            // Cuộn "auto" (ngay lập tức) nếu là tin nhắn của user
            // Cuộn "smooth" nếu là tin nhắn của bot và user đang ở cuối
            scrollToBottom(lastMessage.role === "user" ? "auto" : "smooth");
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageFromInput();
        }
    };

    const formatTime = (isoTimestamp: string) => {
        try {
            return new Date(isoTimestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            console.warn("Invalid timestamp for formatTime:", isoTimestamp);
            return "Invalid date";
        }
    };

    const TypingIndicator = () => (
        // ... (như cũ)
        <div className="flex items-end gap-2 justify-start mb-5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Bot size={16} />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-sm border">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                    ></div>
                </div>
            </div>
        </div>
    );

    // Kiểm tra showWelcomeScreen cẩn thận hơn
    const showWelcomeScreen =
        messages.length === 0 &&
        !isSending && // Nếu isSending thì không phải welcome
        !isBotTyping && // Nếu bot đang gõ cũng không phải welcome
        (!initialQueryFromHome || initialQueryProcessed); // Nếu có initialQuery mà chưa processed thì cũng không phải welcome

    if (!chatId) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-gray-100 rounded-xl">
                <p className="text-gray-600">
                    Đang chờ thông tin phiên chat...
                </p>
            </div>
        );
    }

    return (
        // ... JSX không thay đổi nhiều, đảm bảo key của message là duy nhất
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden">
            {/* Phần Header */}
            <div
                className={`text-center transition-all duration-700 max-w-4xl mx-auto px-2 py-2  md:py-1 ${
                    !showWelcomeScreen
                        ? "justify-start" // Removed flex and flex-col when not showing welcome
                        : "justify-center flex-col flex flex-1"
                }`}
            >
                {showWelcomeScreen ? (
                    <div className="flex flex-col flex-1 items-center justify-center space-y-3 animate-fade-in">
                        {" "}
                        {/* Added flex structure for welcome */}
                        <div className="relative">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Bắt đầu cuộc trò chuyện!
                            </h1>
                            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                                <Sparkles size={24} />
                            </div>
                        </div>
                        <p className="text-lg md:text-xl text-gray-700 font-medium">
                            Đặt câu hỏi cho JuriBot.
                        </p>
                        <div className="flex justify-center mt-6 md:mt-8">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                <Bot size={40} className="text-white" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold text-gray-800 pt-2 pb-1 md:pt-4 md:pb-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        JuriBot Chat
                    </div>
                )}
            </div>

            {/* Vùng hiển thị tin nhắn */}
            {!showWelcomeScreen && ( // Chỉ hiển thị khi không phải welcome screen
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm p-3 md:p-6 rounded-2xl border border-gray-200 shadow-lg mb-3 md:mb-6 max-w-5xl w-full mx-auto "
                >
                    {messages.length === 0 && !isBotTyping ? ( // Thêm !isBotTyping để không hiện "Không có tin nhắn" khi bot đang chuẩn bị trả lời
                        <div className="text-center text-gray-500 h-full flex items-center justify-center">
                            Gửi một tin nhắn để bắt đầu.
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={
                                    msg.id ||
                                    `msg-${msg.timestamp}-${i}-${Math.random()}`
                                } // Đảm bảo key luôn có và duy nhất
                                className={`mb-4 md:mb-6 opacity-0 animate-slide-up ${
                                    msg.role === "user"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                                style={{
                                    animationDelay: `${
                                        Math.min(i, 10) * 0.05
                                    }s`, // Giới hạn delay để không quá lâu
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
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div
                                        className={`inline-block px-4 py-2 md:px-5 md:py-3 rounded-2xl max-w-[75%] break-words shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 md:hover:-translate-y-1 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                                                : msg.isError
                                                ? "bg-red-100 text-red-800 border border-red-300"
                                                : "bg-gray-50 text-gray-900 border border-gray-200"
                                        }`}
                                    >
                                        <div className="markdown-content">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {msg.content ||
                                                    "Nội dung không khả dụng"}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`text-xs mt-1 md:mt-2 text-gray-600 ${
                                        msg.role === "user"
                                            ? "text-right pr-10 md:pr-11"
                                            : "text-left pl-10 md:pl-11"
                                    }`}
                                >
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        ))
                    )}
                    {isBotTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Vùng Input */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-3 md:p-4 max-w-5xl mx-auto w-full transition-all duration-300 hover:shadow-2xl mb-1">
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
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 md:px-5 md:py-4 mb-3 md:mb-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none text-sm md:text-base transition-all duration-300 bg-white/90 backdrop-blur-sm scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 custom-scrollbar text-gray-900"
                    style={{
                        minHeight: "48px",
                        maxHeight: "150px",
                        overflowY: "auto",
                    }}
                    disabled={isSending}
                />
                <div className="flex items-center justify-between">
                    <button
                        className="group w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 border border-gray-300 hover:border-blue-300 flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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
                            className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                        />
                    </button>
                    <button
                        onClick={handleSendMessageFromInput}
                        disabled={!input.trim() || isSending}
                        className="group relative w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {isSending && !isBotTyping ? ( // Chỉ hiển thị loader khi đang gửi mà bot chưa typing
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

            {/* Style JSX */}
            <style jsx>{`
                /* ... (CSS styles như cũ) ... */
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
                    background-color: #9ca3af;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .markdown-content {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    white-space: normal; /* Đảm bảo text wrap bình thường */
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
                    /* Thêm các element của table nếu có */
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    white-space: normal; /* Đảm bảo text wrap bình thường */
                }
                .markdown-content pre {
                    white-space: pre-wrap; /* Cho phép wrap trong pre */
                    overflow-x: auto; /* Nhưng vẫn cho scroll ngang nếu cần */
                    background: #f1f5f9;
                    padding: 8px;
                    border-radius: 4px;
                }
                .markdown-content code:not(pre code) {
                    /* Chỉ áp dụng cho inline code */
                    white-space: normal; /* Cho phép wrap cho inline code */
                    background: #f1f5f9;
                    padding: 2px 4px;
                    border-radius: 4px;
                }
                .markdown-content pre code {
                    /* Code bên trong pre giữ pre-wrap từ pre */
                    white-space: inherit; /* Kế thừa từ pre */
                }
            `}</style>
        </div>
    );
}
