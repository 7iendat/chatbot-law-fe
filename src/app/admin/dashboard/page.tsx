"use client";

import React, { useState, useEffect, useRef, use } from "react";
import {
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Bell,
    Search,
    Send,
    Bot,
    User,
    Menu,
    X,
    FileText,
    Shield,
    Clock,
    TrendingUp,
    ChevronDown,
    Filter,
} from "lucide-react";
import { useRouteGuard } from "@/app/hooks/useRouteGuard";
import { AuthLoadingSpinner } from "@/app/components/AuthLoadingSpinner";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
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

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={stat.title}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stat.value}
                                </p>
                                <p
                                    className={`text-sm font-medium mt-1 ${
                                        stat.change.startsWith("+")
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {stat.change} from last month
                                </p>
                            </div>
                            <div
                                className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}
                            >
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Queries Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Legal Queries
                        </h3>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <Filter size={16} />
                                <span className="text-sm">Filter</span>
                            </button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                View All
                            </button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Query
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentQueries.map((query, index) => (
                                <tr
                                    key={query.id}
                                    className="hover:bg-gray-50 transition-colors"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {query.query}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {query.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                query.status === "Resolved"
                                                    ? "bg-green-100 text-green-800"
                                                    : query.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {query.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {query.time}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderChatbot = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Bot className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Legal AI Assistant
                        </h3>
                        <p className="text-sm text-gray-500">
                            Get instant answers to legal questions
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${
                            msg.type === "user"
                                ? "justify-end"
                                : "justify-start"
                        } animate-fade-in`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                                msg.type === "user" ? "order-2" : "order-1"
                            }`}
                        >
                            <div
                                className={`flex items-end space-x-2 ${
                                    msg.type === "user"
                                        ? "flex-row-reverse space-x-reverse"
                                        : ""
                                }`}
                            >
                                <div
                                    className={`p-2 rounded-full ${
                                        msg.type === "user"
                                            ? "bg-blue-600"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    {msg.type === "user" ? (
                                        <User
                                            size={16}
                                            className="text-white"
                                        />
                                    ) : (
                                        <Bot
                                            size={16}
                                            className="text-gray-600"
                                        />
                                    )}
                                </div>
                                <div
                                    className={`px-4 py-3 rounded-2xl ${
                                        msg.type === "user"
                                            ? "bg-blue-600 text-white rounded-br-md"
                                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                                    }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                    <p
                                        className={`text-xs mt-1 ${
                                            msg.type === "user"
                                                ? "text-blue-100"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                            <div className="flex items-end space-x-2">
                                <div className="p-2 rounded-full bg-gray-200">
                                    <Bot size={16} className="text-gray-600" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-gray-100 rounded-bl-md">
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
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask a legal question..."
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                            rows={1}
                            style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );

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

    console.log(
        "AdminDashboard: Authorized and not loading. Rendering content."
    );

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
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                LegalAdmin
                            </h1>
                            <p className="text-sm text-gray-500">Dashboard</p>
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
                            {
                                id: "dashboard",
                                label: "Dashboard",
                                icon: BarChart3,
                            },
                            { id: "chatbot", label: "AI Assistant", icon: Bot },
                            { id: "clients", label: "Clients", icon: Users },
                            { id: "cases", label: "Cases", icon: FileText },
                            {
                                id: "settings",
                                label: "Settings",
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
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                                    {activeTab === "chatbot"
                                        ? "AI Assistant"
                                        : activeTab}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeTab === "dashboard" &&
                                        "Overview of your legal practice"}
                                    {activeTab === "chatbot" &&
                                        "Get instant legal assistance"}
                                    {activeTab === "clients" &&
                                        "Manage your client base"}
                                    {activeTab === "cases" &&
                                        "Track ongoing legal cases"}
                                    {activeTab === "settings" &&
                                        "Configure your preferences"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                <Bell size={20} className="text-gray-600" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Admin User
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Administrator
                                    </p>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className="text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {activeTab === "dashboard" && renderDashboard()}
                    {activeTab === "chatbot" && renderChatbot()}
                    {activeTab === "clients" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Client Management
                            </h3>
                            <p className="text-gray-600">
                                Client management features coming soon...
                            </p>
                        </div>
                    )}
                    {activeTab === "cases" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Case Management
                            </h3>
                            <p className="text-gray-600">
                                Case tracking features coming soon...
                            </p>
                        </div>
                    )}
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
