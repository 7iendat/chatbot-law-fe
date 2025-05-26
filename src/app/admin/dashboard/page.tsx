"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Users,
    MessageSquare,
    Settings,
    Bot,
    Menu,
    X,
    FileText,
    Clock,
    TrendingUp,
    LogOut,
} from "lucide-react";
import { useRouteGuard } from "@/app/hooks/useRouteGuard";
import { AuthLoadingSpinner } from "@/app/components/AuthLoadingSpinner";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import UserManagementSystem from "@/app/components/UserManagementSystem";
import ChatBox from "@/app/components/Chatbot";
import ChatbotDataUpload from "@/app/components/DataUploadAdmin";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("clients");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: "bot",
            message:
                "Hello! I'm your legal AI assistant. How can I help you with legal queries today?",
            timestamp: new Date(Date.now() - 300000),
        },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = {
            id: chatMessages.length + 1,
            type: "user",
            message: newMessage,
            timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setNewMessage("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "Based on legal precedent, this type of case typically falls under contract law. I recommend reviewing sections 2-205 through 2-207 of the Uniform Commercial Code.",
                "This appears to be a tort liability issue. The statute of limitations for personal injury claims in most jurisdictions is 2-3 years from the date of discovery.",
                "For corporate governance matters, please refer to the Delaware General Corporation Law Section 141. Board approval may be required for this transaction.",
                "This falls under employment law. The Equal Employment Opportunity Commission guidelines should be consulted for discrimination cases.",
                "Intellectual property protection requires immediate action. Consider filing a provisional patent application within 12 months of disclosure.",
            ];

            const botMessage = {
                id: chatMessages.length + 2,
                type: "bot",
                message:
                    responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date(),
            };

            setChatMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 2000);
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const stats = [
        {
            title: "Active Cases",
            value: "248",
            change: "+12%",
            icon: FileText,
            color: "text-blue-600",
        },
        {
            title: "Client Queries",
            value: "1,429",
            change: "+18%",
            icon: MessageSquare,
            color: "text-green-600",
        },
        {
            title: "Success Rate",
            value: "94.2%",
            change: "+2.1%",
            icon: TrendingUp,
            color: "text-purple-600",
        },
        {
            title: "Response Time",
            value: "2.3h",
            change: "-0.5h",
            icon: Clock,
            color: "text-orange-600",
        },
    ];

    const recentQueries = [
        {
            id: 1,
            query: "Contract breach liability limits",
            category: "Contract Law",
            status: "Resolved",
            time: "2 hours ago",
        },
        {
            id: 2,
            query: "Employment termination procedures",
            category: "Labor Law",
            status: "Pending",
            time: "4 hours ago",
        },
        {
            id: 3,
            query: "Intellectual property infringement",
            category: "IP Law",
            status: "In Review",
            time: "6 hours ago",
        },
        {
            id: 4,
            query: "Corporate merger compliance",
            category: "Corporate Law",
            status: "Resolved",
            time: "8 hours ago",
        },
        {
            id: 5,
            query: "Real estate transfer regulations",
            category: "Property Law",
            status: "Pending",
            time: "12 hours ago",
        },
    ];

    const renderChatbot = () => {
        <ChatBox />;
    };

    const { isAuthorized, isLoading, isAuthenticated } = useRouteGuard({
        requireAuth: true,
        adminOnly: true,
        redirectTo: "/welcome", // Chỉ định rõ trang redirect nếu không được phép
    });
    useEffect(() => {
        console.log("HomePage useRouteGuard state:", {
            isLoading,
            isAuthorized,
            isAuthenticated_from_hook: isAuthenticated,
        });
    }, [isLoading, isAuthorized, isAuthenticated]);

    if (isLoading || (!isAuthorized && !isAuthenticated)) {
        console.log("HomePage: Showing AuthLoadingSpinner.", {
            isLoading,
            isAuthorized,
            isAuthenticated,
        });
        return <AuthLoadingSpinner />;
    }

    if (!isAuthorized) {
        console.log(
            "HomePage: Not authorized (after loading, user might be authenticated but wrong role). Returning null for redirect."
        );
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <Image
                            width={40}
                            height={40}
                            src="/logo_bot.png"
                            alt="Logo"
                            className={`rounded-full border-2 border-blue-200 shadow-lg transition-all duration-300 ${"border-blue-400 shadow-blue-200"}`}
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Juri AI
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="mt-6 px-4">
                    <div className="space-y-2">
                        {[
                            { id: "clients", label: "Người dùng", icon: Users },
                            { id: "chatbot", label: "JuriBot", icon: Bot },
                            { id: "docs", label: "Tài liệu", icon: FileText },
                            {
                                id: "settings",
                                label: "Cài đặt",
                                icon: Settings,
                            },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    activeTab === item.id
                                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${
                    sidebarOpen ? "lg:ml-64" : "ml-0"
                }`}
            >
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-gray-200 rounded-lg"
                            >
                                <Menu
                                    size={20}
                                    className="text-gray-600 cursor-pointer"
                                />
                            </button>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                                    {activeTab === "chatbot"
                                        ? "Chatbot"
                                        : activeTab}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeTab === "clients" &&
                                        "Quản lý người dùng"}

                                    {activeTab === "chatbot" &&
                                        "Trò chuyện với JuriBot"}
                                    {activeTab === "docs" &&
                                        "Tải lên và quản lý tài liệu"}
                                    {activeTab === "settings" &&
                                        "Cài đặt hệ thống"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div> */}
                            {/* <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                <Bell size={20} className="text-gray-600" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button> */}
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Image
                                        width={32}
                                        height={32}
                                        src={user?.avatar_url || "/profile.png"}
                                        alt="User Avatar"
                                        className="rounded-full border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300"
                                        unoptimized={
                                            user?.avatar_url ? true : false
                                        } // Disable optimization for external URLs
                                        onError={(e) => {
                                            const target =
                                                e.target as HTMLImageElement;
                                            target.src = "/profile.png"; // Fallback to local image on error
                                        }}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.username || user?.email}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.role || "Admin"}
                                    </p>
                                </div>
                                <LogOut
                                    size={20}
                                    className="text-gray-400 cursor-pointer hover:text-red-700 transition-all"
                                    onClick={logout}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {activeTab === "clients" && <UserManagementSystem />}
                    {activeTab === "chatbot" && renderChatbot()}
                    {activeTab === "docs" && <ChatbotDataUpload />}
                    {activeTab === "settings" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Settings
                            </h3>
                            <p className="text-gray-600">
                                Configuration options coming soon...
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <style jsx>{`
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
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
