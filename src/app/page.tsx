"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import ChatBox from "@/app/components/Chatbot";
import {
    Menu,
    ArrowRightFromLine,
    ArrowLeftFromLine,
    LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { useRouteGuard } from "./hooks/useRouteGuard";
import { AuthLoadingSpinner } from "./components/AuthLoadingSpinner";

const HomePage = () => {
    const { user, logout } = useAuth();
    const [showSidebar, setShowSidebar] = useState(false);
    const [collapseSidebar, setCollapseSidebar] = useState(false);
    const { isAuthorized, isLoading, isAuthenticated } = useRouteGuard({
        // Lấy thêm isAuthenticated
        requireAuth: true,
        redirectTo: "/welcome",
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
        <div className="flex h-screen flex-col overflow-hidden md:flex-row bg-white text-black">
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
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
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

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 h-full">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="md:hidden p-2 border rounded hover:bg-gray-100 transition-colors"
                        >
                            <Menu />
                        </button>
                        <h1 className="text-xl font-bold">Chatbot Luật</h1>
                    </div>

                    {/* User info and logout */}
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 hidden sm:block">
                            Xin chào, {user?.username || user?.email}!
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Đăng xuất"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <ChatBox />
            </div>

            <Toaster />
        </div>
    );
};

// Export protected component
export default HomePage;
