// app/components/Sidebar.tsx
"use client";

import {
    MessageCircle,
    Plus,
    Settings,
    LogOut,
    User,
    Sparkles,
    Clock,
    Trash2,
    Home,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import MenuDropProfile from "./MenuDropProfile";
import { useAuth } from "../contexts/AuthContext";
import {
    chatApis,
    ApiConversationItem,
    ApiMessageItem,
} from "../services/chatApis"; // Import thêm ApiMessageItem nếu cần
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "../contexts/ThemeContext";

interface SidebarProps {
    collapsed?: boolean;
    currentChatId?: string;
}

interface ChatHistoryDisplayItem {
    id: string;
    title: string;
    timestamp: Date;
    preview: string;
}

export default function Sidebar({ collapsed, currentChatId }: SidebarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredChat, setHoveredChat] = useState<string | null>(null);
    const [isHoveringLogo, setIsHoveringLogo] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { effectiveTheme } = useTheme();

    const [chatHistory, setChatHistory] = useState<ChatHistoryDisplayItem[]>(
        []
    );
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [errorHistory, setErrorHistory] = useState<string | null>(null);

    const fetchChatHistory = useCallback(async () => {
        if (!user) {
            setChatHistory([]);
            setIsLoadingHistory(false);
            return;
        }
        console.log("[Sidebar] Fetching chat history for user:", user.email);
        setIsLoadingHistory(true);
        setErrorHistory(null);
        try {
            const apiConversations = await chatApis.getConversations();
            console.log(
                "[Sidebar] Received conversations from API:",
                apiConversations
            );

            const sortedConversations = apiConversations.sort(
                (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime()
            );

            const formattedHistory: ChatHistoryDisplayItem[] =
                sortedConversations.map((conv: ApiConversationItem) => {
                    // Lấy nội dung tin nhắn cuối cùng từ mảng messages
                    let lastMessageContent = "";
                    if (conv.messages && conv.messages.length > 0) {
                        // Giả sử tin nhắn cuối cùng là phần tử cuối cùng trong mảng
                        lastMessageContent =
                            conv.messages[conv.messages.length - 1].content;
                    }

                    let title = "";
                    if (lastMessageContent) {
                        title = lastMessageContent
                            .split(" ")
                            .slice(0, 7)
                            .join(" ");
                        if (lastMessageContent.split(" ").length > 7) {
                            title += "...";
                        }
                    }

                    // Nếu không có title từ tin nhắn, tạo title mặc định
                    if (!title) {
                        title = `Cuộc trò chuyện (${conv.conversation_id.slice(
                            0,
                            5
                        )}...)`;
                    }

                    return {
                        id: conv.conversation_id,
                        title: title,
                        timestamp: new Date(conv.updated_at), // updated_at của cuộc hội thoại
                        preview: lastMessageContent || "Chưa có tin nhắn",
                    };
                });
            setChatHistory(formattedHistory);
        } catch (err) {
            console.error("[Sidebar] Error fetching chat history:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Lỗi không xác định khi tải lịch sử.";
            setErrorHistory(errorMessage);
            toast.error(`Lỗi: ${errorMessage.substring(0, 100)}`);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [user]);

    useEffect(() => {
        fetchChatHistory();
    }, [fetchChatHistory]);

    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000
        );

        if (diffInSeconds < 5) return "vừa xong";
        if (diffInSeconds < 60) return `${diffInSeconds} giây`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày`;
        return date.toLocaleDateString("vi-VN");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest(".profile-menu-container")) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSelectChat = (chatId: string) => router.push(`/chat/${chatId}`);
    const handleNewChat = () => router.push("/");
    const isChatPage = pathname.startsWith("/chat/");

    const handleDeleteChat = async (chatIdToDelete: string) => {
        toast(
            (t) => (
                <div className="flex flex-col items-center">
                    <span className="text-center mb-2">
                        Xóa cuộc trò chuyện <br />
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    const res =
                                        await chatApis.deleteConversationbyChatId(
                                            chatIdToDelete
                                        ); // Bỏ comment khi có API

                                    setChatHistory((prev) =>
                                        prev.filter(
                                            (chat) => chat.id !== chatIdToDelete
                                        )
                                    );
                                    if (currentChatId === chatIdToDelete) {
                                        router.push("/");
                                    }
                                    toast.success(res.message, {
                                        duration: 1000,
                                    });
                                } catch (error) {
                                    const message =
                                        error instanceof Error
                                            ? error.message
                                            : "Lỗi không xác định";
                                    toast.error(`Lỗi xóa: ${message}`, {
                                        duration: 1000,
                                    });
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ),
            { duration: 10000 }
        );
    };

    // PHẦN JSX CÒN LẠI GIỮ NGUYÊN
    // ... (toàn bộ phần return (...) của bạn) ...
    return (
        <div
            className={`flex flex-col justify-between h-full py-4 relative transition-all duration-300 ${
                collapsed ? "px-2" : "mx-3"
            }`}
        >
            <div className="flex flex-col gap-y-3">
                {" "}
                {/* Top Section */}
                <div
                    className={`transition-all duration-500 ${
                        collapsed ? "text-center" : ""
                    }`}
                >
                    {" "}
                    {/* Logo & Buttons Container */}
                    <div
                        className={`group relative flex items-center gap-3 mb-3  rounded-xl p-3 transition-all duration-300 transform hover:scale-[1.02] ${
                            collapsed ? "justify-center" : "justify-start"
                        }`}
                        onMouseEnter={() => setIsHoveringLogo(true)}
                        onMouseLeave={() => setIsHoveringLogo(false)}
                        title="Trang chủ JuriBot"
                    >
                        <div className="relative flex-shrink-0">
                            <Image
                                width={collapsed ? 32 : 40}
                                height={collapsed ? 32 : 40}
                                src="/logo_bot.png"
                                alt="Logo"
                                className={`rounded-full border-2 border-blue-200 shadow-lg transition-all duration-300 ${
                                    isHoveringLogo
                                        ? "border-blue-400 shadow-blue-200"
                                        : ""
                                }`}
                            />
                            <div
                                className={`absolute -top-1 -right-1 bg-green-400 rounded-full border-2 border-white animate-pulse transition-all duration-300 ${
                                    collapsed ? "w-2 h-2" : "w-3 h-3"
                                }`}
                            ></div>
                        </div>
                        <div
                            className={`transition-all duration-500 overflow-hidden ${
                                collapsed
                                    ? "w-0 opacity-0 hidden"
                                    : "w-auto opacity-100"
                            }`}
                        >
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                                JuriBot
                            </h1>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                                Trợ lí pháp lí AI
                            </p>
                        </div>
                        {collapsed && (
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                                <div className="font-medium">JuriBot</div>
                                <div className="text-xs text-gray-300">
                                    Trợ lí pháp lí AI
                                </div>
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </div>
                    {isChatPage && !collapsed && (
                        <button
                            onClick={() => router.push("/")}
                            title="Về trang chủ tạo cuộc trò chuyện mới"
                            className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 hover:bg-gray-100 text-gray-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] group relative"
                        >
                            <Home
                                size={18}
                                className={`flex-shrink-0 ${
                                    effectiveTheme === "light"
                                        ? "text-gray-500"
                                        : "text-gray-100"
                                } group-hover:text-blue-500`}
                            />
                            <span className="font-medium text-lg">
                                Trang chủ
                            </span>
                        </button>
                    )}
                    <button
                        onClick={handleNewChat}
                        title="Tạo cuộc trò chuyện mới"
                        className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group relative ${
                            collapsed ? "justify-center" : ""
                        }`}
                    >
                        <Plus
                            size={collapsed ? 18 : 20}
                            className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0"
                        />
                        <span
                            className={`font-medium text-base transition-all duration-500 overflow-hidden whitespace-nowrap ${
                                collapsed
                                    ? "w-0 opacity-0 hidden"
                                    : "w-auto opacity-100"
                            }`}
                        >
                            Cuộc trò chuyện mới
                        </span>
                        {collapsed && (
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                                Cuộc trò chuyện mới
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </button>
                </div>
                <div className="flex-1 min-h-0 mt-2">
                    {" "}
                    {/* Chat History Section */}
                    <div
                        className={`transition-all duration-500 overflow-hidden ${
                            collapsed
                                ? "h-0 opacity-0 mb-0 hidden"
                                : "h-auto opacity-100 mb-2"
                        }`}
                    >
                        <h2
                            className={`text-sm font-semibold px-3 ${
                                effectiveTheme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-300"
                            } uppercase flex items-center gap-2 tracking-wider`}
                        >
                            <Clock size={14} />
                            Lịch sử
                        </h2>
                    </div>
                    {isLoadingHistory && (
                        <div
                            className={`flex flex-col items-center justify-center p-4 ${
                                effectiveTheme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-300"
                            } ${collapsed ? "py-10" : ""}`}
                        >
                            <Loader2
                                size={collapsed ? 20 : 24}
                                className="animate-spin mb-1"
                            />
                            {!collapsed && (
                                <span className="text-xs">Đang tải...</span>
                            )}
                        </div>
                    )}
                    {!isLoadingHistory && errorHistory && (
                        <div
                            className={`p-3 text-red-600 bg-red-50 rounded-lg ${
                                collapsed ? "text-center" : ""
                            } text-xs group relative`} // Added group relative for tooltip
                        >
                            {collapsed ? (
                                <AlertTriangle size={20} />
                            ) : (
                                <>
                                    {errorHistory.substring(0, 100)}
                                    {errorHistory.length > 100 && "..."}
                                    <button
                                        onClick={fetchChatHistory}
                                        className="ml-1 text-xs underline text-blue-600 hover:text-blue-800"
                                    >
                                        Thử lại
                                    </button>
                                </>
                            )}
                            {collapsed && ( // Tooltip for collapsed error
                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-red-700 text-white text-xs px-2 py-1 rounded-md shadow-xl transition-all duration-300 z-50 max-w-[200px] pointer-events-none">
                                    {errorHistory}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchChatHistory();
                                        }}
                                        className="ml-1 underline hover:text-red-200"
                                    >
                                        Thử lại
                                    </button>
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-red-700"></div>
                                </div>
                            )}
                        </div>
                    )}
                    {!isLoadingHistory &&
                        !errorHistory &&
                        chatHistory.length === 0 && (
                            <div
                                className={`p-3 text-center ${
                                    effectiveTheme === "light"
                                        ? "text-gray-400"
                                        : "text-gray-200"
                                } ${
                                    collapsed ? "py-3 group relative" : "py-5" // Added group relative for tooltip
                                } text-xs`}
                            >
                                {collapsed ? (
                                    <MessageCircle size={20} />
                                ) : (
                                    "Chưa có cuộc trò chuyện nào."
                                )}
                                {collapsed && ( // Tooltip for collapsed no history
                                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-sm px-2 py-1 rounded-md shadow-xl transition-all duration-300 z-50 pointer-events-none">
                                        Chưa có trò chuyện
                                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-700"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    {!isLoadingHistory &&
                        !errorHistory &&
                        chatHistory.length > 0 && (
                            <div
                                className={`flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-300 ${
                                    collapsed
                                        ? "max-h-[calc(100vh-250px)]"
                                        : "max-h-[calc(100vh-330px)]"
                                }`}
                            >
                                {chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className="relative group/container "
                                        onMouseEnter={() =>
                                            !collapsed &&
                                            setHoveredChat(chat.id)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredChat(null)
                                        }
                                    >
                                        <button
                                            onClick={() =>
                                                handleSelectChat(chat.id)
                                            }
                                            title={chat.title}
                                            className={`w-full text-left rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.01] relative overflow-hidden group/item ${
                                                collapsed
                                                    ? "p-2.5 justify-center flex items-center"
                                                    : "px-3 py-2"
                                            } ${
                                                currentChatId === chat.id
                                                    ? effectiveTheme === "light"
                                                        ? "border-l-4 bg-gray-200 border-blue-500 shadow-sm"
                                                        : "border-l-4 bg-gray-700 border-blue-500 shadow-sm"
                                                    : effectiveTheme === "light"
                                                    ? "hover:bg-gray-200 "
                                                    : "hover:bg-gray-600 "
                                            }`}
                                        >
                                            {collapsed ? (
                                                <MessageCircle
                                                    size={20}
                                                    className={`transition-colors duration-300 flex-shrink-0 ${
                                                        currentChatId ===
                                                        chat.id
                                                            ? "text-blue-600"
                                                            : "text-gray-500 group-hover/item:text-gray-700"
                                                    }`}
                                                />
                                            ) : (
                                                <div className="space-y-0.5 w-full overflow-hidden">
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={`text-sm font-semibold truncate transition-colors duration-300 flex-1 pr-1 ${
                                                                currentChatId ===
                                                                chat.id
                                                                    ? "text-blue-700"
                                                                    : effectiveTheme ===
                                                                      "light"
                                                                    ? "text-gray-700 group-hover/item:text-gray-900"
                                                                    : "text-gray-300 group-hover/item:text-gray-300"
                                                            }`}
                                                        >
                                                            {chat.title}
                                                        </span>
                                                        <span
                                                            className={`text-[11px]  ml-2 flex-shrink-0 ${
                                                                effectiveTheme ===
                                                                "light"
                                                                    ? "text-gray-400 group-hover/item:text-gray-500"
                                                                    : "text-gray-400 group-hover/item:text-gray-300"
                                                            }`}
                                                        >
                                                            {formatTimeAgo(
                                                                chat.timestamp
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`text-[11px] truncate ${
                                                            effectiveTheme ===
                                                            "light"
                                                                ? " text-gray-500 group-hover/item:text-gray-600"
                                                                : " text-gray-400 group-hover/item:text-gray-400"
                                                        }`}
                                                    >
                                                        {chat.preview}
                                                    </p>
                                                </div>
                                            )}
                                        </button>

                                        {!collapsed &&
                                            hoveredChat === chat.id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteChat(
                                                            chat.id
                                                        );
                                                    }}
                                                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-1 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-md opacity-0 group-hover/container:opacity-100 transition-all duration-150 hover:scale-110 z-10 cursor-pointer"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        {collapsed && (
                                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 opacity-0 group-hover/container:opacity-100 bg-gray-800 text-white text-xs px-2 py-1.5 rounded-md shadow-xl transition-all duration-200 z-50 max-w-[220px] pointer-events-none">
                                                <div className="font-semibold truncate">
                                                    {chat.title}
                                                </div>
                                                <div className="text-gray-300 truncate mt-0.5 text-[11px]">
                                                    {chat.preview}
                                                </div>
                                                <div className="text-gray-400 text-[10px] mt-1">
                                                    {formatTimeAgo(
                                                        chat.timestamp
                                                    )}
                                                </div>
                                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>

            <div className="relative profile-menu-container mt-auto">
                {" "}
                {/* Profile Section */}
                <div
                    className={`mb-2 border ${
                        effectiveTheme === "dark"
                            ? "border-gray-200"
                            : "border-gray-600"
                    } hover:border-blue-300 flex items-center gap-3 hover:bg-gradient-to-r  p-2.5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md group ${
                        collapsed ? "justify-center" : ""
                    }`}
                    onClick={handleMenuToggle}
                >
                    <div className="relative flex-shrink-0">
                        <Image
                            width={collapsed ? 28 : 32}
                            height={collapsed ? 28 : 32}
                            src={user?.avatar_url || "/profile.png"}
                            alt="User Avatar"
                            className="rounded-full border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300"
                            unoptimized={!!user?.avatar_url} // Keep unoptimized if avatar_url can be external
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "/profile.png";
                            }}
                        />
                        <div
                            className={`absolute -bottom-0.5 -right-0.5 bg-green-400 rounded-full border-2 border-white transition-all duration-300 ${
                                collapsed ? "w-2 h-2" : "w-2.5 h-2.5"
                            }`}
                        ></div>
                    </div>
                    <div
                        className={`flex-1 min-w-0 transition-all duration-500 overflow-hidden ${
                            collapsed
                                ? "w-0 opacity-0 hidden"
                                : "w-auto opacity-100"
                        }`}
                    >
                        <span
                            className={`text-xs font-semibold ${
                                effectiveTheme === "light"
                                    ? "text-gray-800"
                                    : "text-gray-300"
                            } group-hover:text-blue-700 transition-colors duration-300 block truncate`}
                            title={user?.username || user?.email || "User"}
                        >
                            {user?.username || user?.email || "User"}
                        </span>
                        <span
                            className={`text-[11px]  capitalize ${
                                effectiveTheme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                            }`}
                        >
                            {user?.role?.toUpperCase() === "USER"
                                ? "Thành viên"
                                : "Quản trị viên"}
                        </span>
                    </div>
                    <div
                        className={`transform transition-all duration-300 ${
                            isMenuOpen ? "rotate-180" : ""
                        } ${collapsed ? "hidden" : "block"}`}
                    >
                        <Settings
                            size={14}
                            className="text-gray-400 group-hover:text-blue-600"
                        />
                    </div>
                    {collapsed && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1.5 rounded-md shadow-xl transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                            <div className="font-semibold">
                                {user?.username || user?.email}
                            </div>{" "}
                            <div className="text-gray-300 text-[11px] capitalize">
                                {user?.role}
                            </div>
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                        </div>
                    )}
                </div>
                {isMenuOpen && <MenuDropProfile collapsed={collapsed} />}
                <div
                    className={`text-center space-y-1 transition-all duration-500 overflow-hidden ${
                        collapsed
                            ? "h-0 opacity-0 hidden"
                            : "h-auto opacity-100"
                    }`}
                >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                        <Sparkles size={10} /> <span>Powered by AI</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                        © {new Date().getFullYear()} JuriBot AI.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e0 #f7fafc; /* thumb track */
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f7fafc;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e0;
                    border-radius: 10px;
                    border: 1px solid #f7fafc;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #a0aec0;
                }
            `}</style>
        </div>
    );
}
