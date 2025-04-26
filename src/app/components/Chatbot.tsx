"use client";

import { useEffect, useRef, useState } from "react";
// import axios from "axios";
import { motion } from "framer-motion";
import { ArrowBigUp, Upload, User, Bot } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Message = {
    role: string;
    content: string;
};

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // const [history, setHistory] = useState<Message[]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            // const res = await axios.post("http://localhost:8000/chat", {
            //   question: input,
            //   history: messages,
            // });
            // const botReply: Message = { role: "bot", content: res.data.answer };
            const botReply: Message = {
                role: "bot",
                content: "Xin chào! Tôi có thể giúp gì cho bạn?",
            };
            setMessages((prev) => [...prev, botReply]);
        } catch (error) {
            console.error("Gửi tin nhắn lỗi:", error);
        }
    };

    return (
        <div
            className={`flex flex-col h-screen  lg:px-30  px-4 ${
                messages.length > 0 ? "" : "justify-center"
            }`}
        >
            {/* Chat Header */}
            <div className="text-xl font-bold mb-4 text-center ">
                {messages.length > 0 ? (
                    "Angel Law Chat"
                ) : (
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-bold">
                            Welcome to Angel Law Chat
                        </h1>
                        <h2 className="text-lg">
                            Hãy hỏi tôi bất cứ điều gì về luật
                        </h2>
                        <div className="flex justify-center mt-4 w-20 h-20">
                            <DotLottieReact
                                src="./animation_1.lottie"
                                loop
                                autoplay
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Messages */}
            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-xl border border-gray-300 shadow-sm">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`mb-5 ${
                                msg.role === "user" ? "text-right" : "text-left"
                            }`}
                        >
                            <div className="flex items-end gap-2 justify-start">
                                {msg.role === "bot" && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                        <Bot size={16} />
                                    </div>
                                )}

                                <div
                                    className={`inline-block px-4 py-2 rounded-2xl max-w-[70%] break-words text-sm ${
                                        msg.role === "user"
                                            ? "bg-blue-600 text-white ml-auto text-left"
                                            : "bg-gray-200 text-gray-800 text-left"
                                    }`}
                                >
                                    {msg.content}
                                </div>

                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 ml-2">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                            <div
                                className={`text-xs mt-1 text-gray-400 ${
                                    msg.role === "user"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                            >
                                {new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Chat Input */}
            <div className="border border-gray-200 mt-4 pt-4 bg-white rounded-xl shadow-lg p-4">
                <TextareaAutosize
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập câu hỏi về luật..."
                    minRows={1}
                    maxRows={6}
                    className="w-full text-base border border-gray-300 rounded-md px-4 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-200 resize-none"
                />
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-white p-2 flex items-center justify-center border border-gray-300 hover:bg-gray-200 transition duration-200 cursor-pointer">
                        <Upload size={20} />
                    </div>
                    <button
                        onClick={sendMessage}
                        className="bg-blue-600 text-white w-10 h-10 rounded-md flex items-center justify-center hover:bg-blue-700 transition duration-200"
                    >
                        <ArrowBigUp />
                    </button>
                </div>
            </div>
        </div>
    );
}
