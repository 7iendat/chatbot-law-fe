"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import ChatBox from "@/app/components/Chatbot";
import { Menu, ChevronsLeft, ChevronsRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
    const [showSidebar, setShowSidebar] = useState(false); // mobile
    const [collapseSidebar, setCollapseSidebar] = useState(false); // laptop

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
                            <Sidebar />
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
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        {collapseSidebar ? (
                            <ChevronsRight size={20} />
                        ) : (
                            <ChevronsLeft size={20} />
                        )}
                    </button>
                </div>
                <Sidebar collapsed={collapseSidebar} />
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 h-full">
                {/* Nút mở sidebar trên mobile */}
                <div className="md:hidden mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Chatbot Luật</h1>
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="p-2 border rounded"
                    >
                        <Menu />
                    </button>
                </div>

                <ChatBox />
            </div>
        </div>
    );
}
