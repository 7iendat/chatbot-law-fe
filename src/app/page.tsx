// app/page.tsx
"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import Sidebar from "@/app/components/Sidebar";
import {
    Menu,
    ArrowRightFromLine,
    ArrowLeftFromLine,
    LogOut,
    Send,
    Bot,
    Sparkles,
    LayoutDashboard,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { useAuthGuard, useRouteGuard } from "./hooks/useRouteGuard";
import { AuthLoadingSpinner } from "./components/AuthLoadingSpinner";
import { useRouter } from "next/navigation";
import { chatApis } from "./services/chatApis";
import { useTheme } from "./contexts/ThemeContext";

const LogoutSpinner = () => (
    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const HomePage = () => {
    const { user, logout, isLoggingOut } = useAuth();
    const router = useRouter();
    const [showSidebar, setShowSidebar] = useState(false);
    const [collapseSidebar, setCollapseSidebar] = useState(false);
    const [initialInput, setInitialInput] = useState("");
    const { effectiveTheme } = useTheme();

    const { isLoading, isAuthorized } = useAuthGuard();

    const handleStartChat = async () => {
        if (!initialInput.trim()) return;

        // Lưu câu hỏi ban đầu vào sessionStorage
        try {
            const res = await chatApis.createChat();
            const newChatId = res.chat_id;
            // Đảm bảo chỉ lưu nếu có nội dung
            if (initialInput.trim()) {
                sessionStorage.setItem(
                    `initialQuery_${newChatId}`,
                    initialInput.trim()
                );
                console.log(
                    `HomePage: Stored initial query for ${newChatId} in sessionStorage.`
                );
            }
            // Điều hướng đến URL sạch
            router.push(`/chat/${newChatId}`);
        } catch (error) {
            console.error(
                "HomePage: Failed to set initial query in sessionStorage:",
                error
            );
            // Cân nhắc xử lý lỗi, ví dụ hiển thị thông báo cho người dùng
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleStartChat();
        }
    };

    if (isLoading) {
        return <AuthLoadingSpinner />;
    }

    if (!isAuthorized) {
        console.log("HomePage: Not authorized. Returning null for redirect.");
        return null;
    }

    return (
        <div
            className={`flex h-screen flex-col overflow-hidden md:flex-row ${
                effectiveTheme === "light"
                    ? "text-black bg-white"
                    : "bg-black text-white"
            } `}
        >
            {/* Sidebar - mobile (overlay) */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black bg-opacity-40 md:hidden"
                        onClick={() => setShowSidebar(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-64 bg-white h-full p-4"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "tween", duration: 0.3 }}
                        >
                            <Sidebar collapsed={collapseSidebar} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar - laptop/tablet */}
            <div
                className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${
                    collapseSidebar ? "w-16" : "w-64"
                } border-r border-gray-400 bg-gray-300/20`}
            >
                <div className="flex justify-end p-2">
                    <button
                        onClick={() => setCollapseSidebar(!collapseSidebar)}
                        className={`p-1 ${
                            effectiveTheme === "light"
                                ? "hover:bg-gray-200"
                                : "hover:bg-gray-700"
                        } rounded cursor-pointer`}
                    >
                        {collapseSidebar ? (
                            <ArrowRightFromLine size={24} />
                        ) : (
                            <ArrowLeftFromLine size={24} />
                        )}
                    </button>
                </div>
                <Sidebar collapsed={collapseSidebar} />
            </div>

            {/* Main content - Welcome and Initial Input */}
            <div
                className={`flex-1 flex flex-col items-center justify-center p-4 md:p-6 h-full`}
            >
                <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center space-x-3 z-10">
                    {user?.role?.includes("admin") && (
                        <button
                            onClick={() => router.push("/admin/dashboard")}
                            className={`flex cursor-pointer  p-2 rounded-md transition-colors ${
                                effectiveTheme === "light"
                                    ? "hover:bg-gray-200"
                                    : "hover:bg-gray-700"
                            } `}
                            title="Dashboard"
                        >
                            <LayoutDashboard size={20} className="mr-2" />{" "}
                            Dashboard
                        </button>
                    )}
                    <span
                        className={`text-sm hidden sm:block ${
                            effectiveTheme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                        }`}
                    >
                        Xin chào, {user?.username || user?.email}!
                    </span>
                    <button
                        onClick={logout}
                        disabled={isLoggingOut} // Vô hiệu hóa nút khi đang xử lý
                        className={`p-2 rounded transition-colors cursor-pointer flex items-center justify-center
                                ${
                                    isLoggingOut
                                        ? "text-gray-400 cursor-wait"
                                        : `text-red-600 ${
                                              effectiveTheme === "light"
                                                  ? "hover:bg-red-50"
                                                  : "hover:bg-red-50/15"
                                          }`
                                }`}
                        title="Đăng xuất"
                    >
                        {isLoggingOut ? (
                            <LogoutSpinner />
                        ) : (
                            <LogOut size={20} />
                        )}
                    </button>
                </div>

                <div className="w-full max-w-2xl text-center space-y-8">
                    <div className="space-y-4 animate-fade-in">
                        <div className="relative inline-block">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Chào mừng bạn đến với JuriBot!
                            </h1>
                            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                                <Sparkles size={28} />
                            </div>
                        </div>
                        <p className="text-xl text-gray-600 font-medium">
                            Hãy hỏi tôi bất cứ điều gì về luật pháp Việt Nam.
                        </p>
                        <div className="flex justify-center mt-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                <Bot size={40} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <div
                        className={`mt-12 w-full ${
                            effectiveTheme === "light"
                                ? "bg-white/80"
                                : "bg-gray-800"
                        } backdrop-blur-sm border border-white/50 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl`}
                    >
                        <textarea
                            value={initialInput}
                            onChange={(e) => setInitialInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập câu hỏi đầu tiên của bạn ở đây..."
                            rows={2}
                            className={`w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none text-base transition-all duration-300 ${
                                effectiveTheme === "light"
                                    ? "bg-white/90"
                                    : "bg-gray-600"
                            } backdrop-blur-sm scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
                            style={{ minHeight: "60px", maxHeight: "150px" }}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleStartChat}
                                disabled={!initialInput.trim()}
                                className="group relative px-6 py-3 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                <Send
                                    size={18}
                                    className="mr-2 transform group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                                Bắt đầu trò chuyện
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Toaster />
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
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
