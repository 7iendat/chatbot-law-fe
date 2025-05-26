// app/components/Chatbot.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Upload, User, Bot, Sparkles } from "lucide-react";

type Message = {
    id?: string;
    role: string;
    content: string;
    timestamp: Date;
};

interface ChatBoxProps {
    chatId: string;
    initialQuery?: string;
}

export default function ChatBox({ chatId, initialQuery }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // State để theo dõi việc xử lý initialQuery
    const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getBotResponse = useCallback(
        async (userMessageContent: string): Promise<Message> => {
            if (!chatId) {
                console.error("ChatBox: chatId is undefined in getBotResponse");
                return {
                    id: `bot-error-${Date.now()}`,
                    role: "bot",
                    content: "Lỗi: Không xác định được phiên chat.",
                    timestamp: new Date(),
                };
            }
            console.log(
                `ChatBox: Sending to bot (chatId: ${chatId}): "${userMessageContent}"`
            );
            await new Promise((resolve) => setTimeout(resolve, 1500));

            let botContent = `Tôi nhận được tin nhắn của bạn: "${userMessageContent}" cho chat ID: ${chatId.substring(
                0,
                5
            )}...`;
            if (
                userMessageContent.toLowerCase().includes("xin chào") ||
                userMessageContent.toLowerCase().includes("hello")
            ) {
                botContent =
                    "Xin chào! Tôi là JuriBot, trợ lý pháp lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?";
            } else if (
                userMessageContent.toLowerCase().includes("luật lao động")
            ) {
                botContent =
                    "Bạn muốn hỏi cụ thể về điều gì trong Luật Lao động? Ví dụ: hợp đồng lao động, thời giờ làm việc, kỷ luật lao động,...";
            }

            return {
                id: `bot-${Date.now()}`,
                role: "bot",
                content: botContent,
                timestamp: new Date(),
            };
        },
        [chatId]
    );

    const processUserMessage = useCallback(
        async (messageContent: string) => {
            if (!chatId) {
                console.error(
                    "ChatBox: chatId is undefined in processUserMessage"
                );
                return;
            }
            if (!messageContent.trim()) return; // Bỏ qua nếu tin nhắn rỗng

            // Thêm kiểm tra isLoading để tránh gửi nhiều lần nếu người dùng click nhanh
            if (isLoading) {
                console.warn(
                    "ChatBox: processUserMessage called while already loading. Ignoring."
                );
                return;
            }

            const userMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: messageContent,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true); // Đặt isLoading ở đây, trước khi gọi API
            setIsTyping(true); // Có thể đặt isTyping ở đây hoặc sau khi API bắt đầu

            try {
                const botReply = await getBotResponse(messageContent);
                setMessages((prev) => [...prev, botReply]);
            } catch (error) {
                console.error("ChatBox: Error getting bot response:", error);
                const errorReply: Message = {
                    id: `bot-error-${Date.now()}`,
                    role: "bot",
                    content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorReply]);
            } finally {
                setIsTyping(false);
                setIsLoading(false); // Đặt isLoading false ở đây
            }
        },
        [chatId, getBotResponse, isLoading]
    ); // Giữ isLoading ở đây để tránh race condition

    // Xử lý initialQuery khi nó được cung cấp và CHƯA được xử lý
    useEffect(() => {
        if (
            chatId &&
            initialQuery &&
            !initialQueryProcessed &&
            messages.length === 0
        ) {
            console.log(
                `ChatBox: Processing initialQuery for chatId ${chatId}: "${initialQuery}" (First time)`
            );
            processUserMessage(initialQuery);
            setInitialQueryProcessed(true); // Đánh dấu đã xử lý
        }
        // Phụ thuộc vào chatId, initialQuery, và initialQueryProcessed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId, initialQuery, initialQueryProcessed, processUserMessage]);
    // Bỏ messages.length ra khỏi dependency array, điều kiện messages.length === 0 chỉ là để đảm bảo nó chỉ chạy khi chat mới bắt đầu.
    // `processUserMessage` được thêm vào vì nó là một dependency.

    const handleSendMessageFromInput = useCallback(async () => {
        if (!input.trim() || isLoading) return; // Kiểm tra isLoading ở đây nữa
        const currentInput = input;
        setInput("");
        await processUserMessage(currentInput);
    }, [input, isLoading, processUserMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    // ... (Phần còn lại của component: TypingIndicator, formatTime, JSX)
    const TypingIndicator = () => (
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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const showWelcomeScreen =
        messages.length === 0 &&
        !isLoading &&
        !isTyping &&
        !initialQuery &&
        !initialQueryProcessed;

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
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl overflow-hidden">
            <div
                className={`flex flex-col h-full max-w-4xl mx-auto px-2 py-2 md:px-4 md:py-4 transition-all duration-700 w-full ${
                    !showWelcomeScreen ? "" : "justify-center"
                }`}
            >
                <div
                    className={`text-center transition-all duration-700 ${
                        !showWelcomeScreen
                            ? "transform -translate-y-1 scale-95 pt-2 pb-1 md:pt-4 md:pb-2"
                            : ""
                    }`}
                >
                    {!showWelcomeScreen ? (
                        <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold text-gray-800 ">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            JuriBot Chat
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="relative">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Bắt đầu cuộc trò chuyện!
                                </h1>
                                <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                                    <Sparkles size={24} />
                                </div>
                            </div>
                            <p className="text-lg md:text-xl text-gray-600 font-medium">
                                Đặt câu hỏi cho JuriBot.
                            </p>
                            <div className="flex justify-center mt-6 md:mt-8">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                    <Bot size={40} className="text-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!showWelcomeScreen && (
                    <div className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-sm p-3 md:p-6 rounded-2xl border border-white/50 shadow-lg mb-3 md:mb-6 transition-all duration-500">
                        {messages.map((msg, i) => (
                            <div
                                key={msg.id || i}
                                className={`mb-4 md:mb-6 opacity-0 animate-slide-up ${
                                    msg.role === "user"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                                style={{
                                    animationDelay: `${i * 0.1}s`,
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
                                    {msg.role === "bot" && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div
                                        className={`inline-block px-4 py-2 md:px-5 md:py-3 rounded-2xl max-w-[75%] break-words shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 md:hover:-translate-y-1 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                : "bg-white text-gray-800 border border-gray-100"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`text-xs mt-1 md:mt-2 text-gray-500 ${
                                        msg.role === "user"
                                            ? "text-right pr-10 md:pr-11"
                                            : "text-left pl-10 md:pl-11"
                                    }`}
                                >
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
                <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl p-3 md:p-4 transition-all duration-300 hover:shadow-2xl">
                    <div className="relative">
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
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 md:px-5 md:py-4 mb-3 md:mb-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none text-sm md:text-base transition-all duration-300 bg-white/90 backdrop-blur-sm scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 custom-scrollbar"
                            style={{
                                minHeight: "48px",
                                maxHeight: "150px",
                                overflowY: "auto",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#9CA3AF transparent",
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="group w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 border border-gray-300 hover:border-blue-300 flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                            <Upload
                                size={18}
                                className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                            />
                        </button>
                        <button
                            onClick={handleSendMessageFromInput}
                            disabled={!input.trim() || isLoading}
                            className="group relative w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            {isLoading && !isTyping ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Send
                                    size={18}
                                    className="transform group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
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
                    animation: slide-up 0.6s ease-out;
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
            `}</style>
        </div>
    );
}
