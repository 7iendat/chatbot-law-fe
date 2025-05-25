import {
    MessageCircle,
    Plus,
    Settings,
    LogOut,
    User,
    Sparkles,
    Clock,
    Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import MenuDropProfile from "./MenuDropProfile";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
    collapsed?: boolean;
}

interface ChatHistory {
    id: number;
    title: string;
    timestamp: Date;
    preview: string;
}

export default function Sidebar({ collapsed }: SidebarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const [hoveredChat, setHoveredChat] = useState<number | null>(null);
    const [isHoveringLogo, setIsHoveringLogo] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { user } = useAuth();

    // Mock chat history data
    const [chatHistory] = useState<ChatHistory[]>([
        {
            id: 1,
            title: "Luật lao động mới",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            preview: "Hỏi về quy định mới...",
        },
        {
            id: 2,
            title: "Hợp đồng thuê nhà",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            preview: "Điều khoản hợp đồng...",
        },
        {
            id: 3,
            title: "Quyền lợi người tiêu dùng",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            preview: "Bảo vệ quyền lợi...",
        },
        {
            id: 4,
            title: "Luật doanh nghiệp",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
            preview: "Thành lập công ty...",
        },
        {
            id: 5,
            title: "Quy định giao thông",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
            preview: "Xử phạt vi phạm...",
        },
    ]);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Handle transition state
    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 300);
        return () => clearTimeout(timer);
    }, [collapsed]);

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

    // const MenuDropProfile = () => (
    //     <div
    //         className={`absolute ${
    //             collapsed ? "left-full ml-2" : "bottom-full mb-2"
    //         } bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl p-2 z-50 min-w-48 animate-scale-in`}
    //     >
    //         <div className="space-y-1">
    //             <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-all duration-200 group">
    //                 <User
    //                     size={16}
    //                     className="text-gray-600 group-hover:text-blue-600 transition-colors"
    //                 />
    //                 <span className="group-hover:text-blue-600">Profile</span>
    //             </button>
    //             <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-all duration-200 group">
    //                 <Settings
    //                     size={16}
    //                     className="text-gray-600 group-hover:text-blue-600 transition-colors"
    //                 />
    //                 <span className="group-hover:text-blue-600">Settings</span>
    //             </button>
    //             <hr className="my-2 border-gray-200" />
    //             <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-red-50 rounded-lg transition-all duration-200 group text-red-600">
    //                 <LogOut
    //                     size={16}
    //                     className="group-hover:scale-110 transition-transform"
    //                 />
    //                 <span>Logout</span>
    //             </button>
    //         </div>
    //     </div>
    // );

    return (
        <div
            className={`flex flex-col justify-between h-full py-4 relative transition-all duration-300 ${
                collapsed ? "px-2" : "mx-3"
            }`}
        >
            {/* TOP: Logo + New Chat Button */}
            <div className="flex flex-col gap-6">
                {/* Logo Section */}
                <div
                    className={`transition-all duration-500 ${
                        collapsed ? "text-center" : ""
                    }`}
                >
                    <div
                        className={`group relative flex items-center gap-3 mb-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl p-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                            collapsed ? "justify-center" : "justify-start"
                        }`}
                        onMouseEnter={() => setIsHoveringLogo(true)}
                        onMouseLeave={() => setIsHoveringLogo(false)}
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
                                AI Legal Assistant
                            </p>
                        </div>

                        {/* Enhanced Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                                <div className="font-medium">JuriBot</div>
                                <div className="text-xs text-gray-300">
                                    AI Legal Assistant
                                </div>
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </div>

                    {/* New Chat Button */}
                    <button
                        className={`w-full flex items-center  gap-3 px-3 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group relative ${
                            collapsed ? "justify-center" : ""
                        }`}
                    >
                        <Plus
                            size={collapsed ? 18 : 20}
                            className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0"
                        />
                        <span
                            className={`font-medium transition-all duration-500 overflow-hidden whitespace-nowrap ${
                                collapsed
                                    ? "w-0 opacity-0 hidden"
                                    : "w-auto opacity-100"
                            }`}
                        >
                            New Chat
                        </span>

                        {/* Tooltip for collapsed new chat button */}
                        {collapsed && (
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                                New Chat
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Chat History Section */}
                <div className="flex-1 min-h-0">
                    {/* Section Header */}
                    <div
                        className={`transition-all duration-500 overflow-hidden ${
                            collapsed
                                ? "h-0 opacity-0 mb-0 hidden"
                                : "h-auto opacity-100 mb-3"
                        }`}
                    >
                        <h2 className="text-sm font-semibold px-3 text-gray-600 flex items-center gap-2">
                            <Clock size={16} />
                            Recent Chats
                        </h2>
                    </div>

                    <div
                        className={`flex flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-300 ${
                            collapsed ? "max-h-96" : "max-h-80 "
                        }`}
                    >
                        {chatHistory.map((chat, i) => (
                            <div
                                key={chat.id}
                                className="relative"
                                onMouseEnter={() => setHoveredChat(i)}
                                onMouseLeave={() => setHoveredChat(null)}
                            >
                                <button
                                    onClick={() => setSelectedChat(i)}
                                    className={`w-full text-left rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                                        collapsed
                                            ? "p-2 justify-center flex items-center"
                                            : "px-3 py-3"
                                    } ${
                                        selectedChat === i
                                            ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md"
                                            : "hover:bg-gray-50 hover:shadow-sm"
                                    }`}
                                >
                                    {collapsed ? (
                                        <MessageCircle
                                            size={24}
                                            className={`transition-colors duration-300 ${
                                                selectedChat === i
                                                    ? "text-blue-600"
                                                    : "text-gray-600"
                                            }`}
                                        />
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`text-sm font-medium truncate transition-colors duration-300 flex-1 ${
                                                        selectedChat === i
                                                            ? "text-blue-700"
                                                            : "text-gray-800"
                                                    }`}
                                                >
                                                    {chat.title}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                    {formatTimeAgo(
                                                        chat.timestamp
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                {chat.preview}
                                            </p>
                                        </div>
                                    )}

                                    {/* Selection indicator for collapsed state */}
                                    {collapsed && selectedChat === i && (
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"></div>
                                    )}
                                </button>

                                {/* Delete button on hover (only when expanded) */}
                                {!collapsed && hoveredChat === i && (
                                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10">
                                        <Trash2 size={14} />
                                    </button>
                                )}

                                {/* Enhanced tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl transition-all duration-300 z-50 max-w-xs pointer-events-none">
                                        <div className="font-medium">
                                            {chat.title}
                                        </div>
                                        <div className="text-xs text-gray-300 mt-1">
                                            {chat.preview}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {formatTimeAgo(chat.timestamp)}
                                        </div>
                                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM: Profile */}
            <div className="relative profile-menu-container">
                <div
                    className={`mt-4 mb-3 border border-gray-200 hover:border-blue-300 flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group ${
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
                            unoptimized={user?.avatar_url ? true : false} // Disable optimization for external URLs
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/profile.png"; // Fallback to local image on error
                            }}
                        />
                        <div
                            className={`absolute -bottom-1 -right-1 bg-green-400 rounded-full border-2 border-white transition-all duration-300 ${
                                collapsed ? "w-2 h-2" : "w-3 h-3"
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
                        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-300 block truncate">
                            {user?.username}
                        </span>
                        <span className="text-xs text-gray-500">
                            {user?.role}
                        </span>
                    </div>

                    <div
                        className={`transform transition-all duration-300 ${
                            isMenuOpen ? "rotate-180" : ""
                        } ${collapsed ? "hidden" : "block"}`}
                    >
                        <Settings
                            size={16}
                            className="text-gray-400 group-hover:text-blue-600"
                        />
                    </div>

                    {/* Profile tooltip for collapsed state */}
                    {collapsed && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                            <div className="font-medium">Nguyễn Văn A</div>
                            <div className="text-xs text-gray-300">
                                Premium User
                            </div>
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                    )}
                </div>

                {/* Menu dropdown - positioned differently based on collapsed state */}
                {isMenuOpen && <MenuDropProfile collapsed={collapsed} />}

                {/* Footer - only show when expanded */}
                <div
                    className={`text-center space-y-2 transition-all duration-500 overflow-hidden ${
                        collapsed
                            ? "h-0 opacity-0 hidden"
                            : "h-auto opacity-100"
                    }`}
                >
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                        <Sparkles size={12} />
                        <span>Powered by AI</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        © 2024 Angel AI. All rights reserved.
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

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e0 transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e0;
                    border-radius: 2px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #a0aec0;
                }
            `}</style>
        </div>
    );
}
