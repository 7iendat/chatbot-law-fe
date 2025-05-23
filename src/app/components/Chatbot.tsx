"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Upload, User, Bot, Sparkles } from "lucide-react";

type Message = {
    role: string;
    content: string;
    timestamp: Date;
};

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const newMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        setIsLoading(true);
        setIsTyping(true);

        try {
            // Simulate API delay with typing indicator
            // Replace with your actual API call:
            // const response = await fetch('/api/chat', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ message: input, history: messages })
            // });
            // const data = await response.json();

            setTimeout(() => {
                const botReply: Message = {
                    role: "bot",
                    content:
                        "Xin chào! Tôi có thể giúp gì cho bạn? Tôi là JuriBot và tôi có thể trả lời các câu hỏi về luật pháp Việt Nam.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botReply]);
                setIsTyping(false);
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
            setIsLoading(false);
        }
    }, [input, isLoading, messages]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div
                className={`flex flex-col h-screen max-w-4xl mx-auto px-4 py-4 transition-all duration-700 ${
                    messages.length > 0 ? "" : "justify-center"
                }`}
            >
                {/* Header */}
                <div
                    className={`text-center  transition-all duration-700 ${
                        messages.length > 0
                            ? "transform -translate-y-2 scale-95"
                            : ""
                    }`}
                >
                    {messages.length > 0 ? (
                        <div className="flex items-center justify-center gap-2 text-xl font-bold text-gray-800 mt-9 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            JuriBot Chat
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="relative">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Chào mừng bạn đến với JuriBot!
                                </h1>
                                <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                                    <Sparkles size={24} />
                                </div>
                            </div>
                            <p className="text-xl text-gray-600 font-medium">
                                Hãy hỏi tôi bất cứ điều gì về luật pháp
                            </p>
                            <div className="flex justify-center mt-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                    <Bot size={40} className="text-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Messages Container */}
                {messages.length > 0 && (
                    <div className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-2xl mb-6 transition-all duration-500">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`mb-6 opacity-0 animate-slide-up ${
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
                                    className={`flex items-end gap-3 ${
                                        msg.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    {msg.role === "bot" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200">
                                            <Bot size={16} />
                                        </div>
                                    )}

                                    <div
                                        className={`inline-block px-5 py-3 rounded-2xl max-w-[75%] break-words shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                : "bg-white text-gray-800 border border-gray-100"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-200">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`text-xs mt-2 text-gray-500 ${
                                        msg.role === "user"
                                            ? "text-right pr-11"
                                            : "text-left pl-11"
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

                {/* Input Section */}
                <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập câu hỏi về luật pháp..."
                            rows={1}
                            className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 mb-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none text-base transition-all duration-300 bg-white/90 backdrop-blur-sm scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 custom-scrollbar"
                            style={{
                                minHeight: "52px",
                                maxHeight: "150px",
                                overflowY: "auto",
                                scrollbarWidth: "thin", // For Firefox
                                scrollbarColor: "#9CA3AF transparent", // For Firefox: thumb and track color
                            }}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button className="group w-10 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 border border-gray-300 hover:border-blue-300 flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                            <Upload
                                size={18}
                                className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                            />
                        </button>

                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="group relative w-10 cursor-pointer  h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
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
            `}</style>
        </div>
    );
}
