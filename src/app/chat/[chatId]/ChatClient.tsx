"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import ChatBox from "@/app/components/Chatbot";
import {
    Menu,
    ArrowRightFromLine,
    ArrowLeftFromLine,
    LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouteGuard } from "@/app/hooks/useRouteGuard";
import { chatApis, ApiChatHistoryMessage } from "@/app/services/chatApis";
import { useTheme } from "@/app/contexts/ThemeContext";
import ChatLoading from "./loading";

const ChatClient = () => {
    const { user, logout } = useAuth();
    const params = useParams();
    const router = useRouter();
    const chatIdFromParams = params.chatId as string;
    const { effectiveTheme } = useTheme();

    const [initialMessages, setInitialMessages] = useState<
        ApiChatHistoryMessage[] | undefined
    >(undefined);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [retrievedInitialQuery, setRetrievedInitialQuery] = useState<
        string | undefined
    >(undefined);
    const [hasAttemptedRetrieveQuery, setHasAttemptedRetrieveQuery] =
        useState(false);

    const [showSidebar, setShowSidebar] = useState(false);
    const [collapseSidebar, setCollapseSidebar] = useState(false);

    const { isAuthorized, isLoading: authIsLoading } = useRouteGuard({
        requireAuth: true,
        redirectTo: "/welcome",
    });

    useEffect(() => {
        if (chatIdFromParams && !hasAttemptedRetrieveQuery) {
            try {
                const storageKey = `initialQuery_${chatIdFromParams}`;
                const query = sessionStorage.getItem(storageKey);
                if (query) {
                    setRetrievedInitialQuery(query);
                    sessionStorage.removeItem(storageKey);
                }
            } catch (error) {
                console.error(
                    "ChatClient: Error accessing sessionStorage for initial query:",
                    error
                );
            }
            setHasAttemptedRetrieveQuery(true);
        }
    }, [chatIdFromParams, hasAttemptedRetrieveQuery]);

    useEffect(() => {
        if (chatIdFromParams && user && isAuthorized) {
            setIsLoadingHistory(true);
            setInitialMessages(undefined);
            console.log(
                `[ChatClient] Attempting to load chat history for: ${chatIdFromParams}`
            );

            chatApis
                .getConversationHistory(chatIdFromParams)
                .then((response) => {
                    console.log(
                        "[ChatClient] Loaded conversation history:",
                        response
                    );
                    setInitialMessages(response.history);
                })
                .catch((err) => {
                    console.error(
                        `[ChatClient] Error loading chat history for ${chatIdFromParams}:`,
                        err
                    );
                    toast.error(
                        err.message || "Không thể tải lịch sử cuộc hội thoại."
                    );
                })
                .finally(() => {
                    setIsLoadingHistory(false);
                });
        } else if (!chatIdFromParams) {
            setIsLoadingHistory(false);
        }
    }, [chatIdFromParams, user, isAuthorized, router]);

    if (authIsLoading || !isAuthorized) {
        return <ChatLoading />;
    }
    if (!isAuthorized) {
        return null;
    }
    if (!chatIdFromParams) {
        return (
            <div className="flex items-center justify-center h-screen">
                ID cuộc hội thoại không hợp lệ.
            </div>
        );
    }

    return (
        <div
            className={`flex h-screen overflow-hidden ${
                effectiveTheme === "light"
                    ? "bg-white text-black"
                    : "bg-black text-white  "
            }`}
        >
            {/* Sidebar Mobile */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-y-0 left-0 z-50 md:hidden"
                    >
                        <Sidebar
                            collapsed={collapseSidebar}
                            currentChatId={chatIdFromParams}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Desktop */}
            <div
                className={`hidden md:block transition-all duration-300 ${
                    collapseSidebar ? "w-16" : "w-64"
                } flex-shrink-0`} // Giới hạn chiều rộng
            >
                <Sidebar
                    collapsed={collapseSidebar}
                    currentChatId={chatIdFromParams}
                />
            </div>

            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col overflow-hidden p-4 md:p-2 ${
                    effectiveTheme === "light"
                        ? "bg-gradient-to-br from-blue-100 to-purple-100"
                        : "bg-gradient-to-br from-gray-900 to-gray-700"
                }`}
            >
                {/* Header */}
                <div className=" flex items-center justify-between">
                    {/* <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="md:hidden p-2 rounded-full hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button> */}

                    <button
                        onClick={() => setCollapseSidebar(!collapseSidebar)}
                        className={`hidden md:block p-2 rounded-full cursor-pointer ${
                            effectiveTheme === "light"
                                ? "hover:bg-gray-300"
                                : "hover:bg-gray-600"
                        }`}
                    >
                        {collapseSidebar ? (
                            <ArrowRightFromLine size={24} />
                        ) : (
                            <ArrowLeftFromLine size={24} />
                        )}
                    </button>
                </div>

                {/* ChatBox */}
                {isLoadingHistory ? (
                    <div className="flex-1 flex items-center justify-center">
                        <ChatLoading />
                    </div>
                ) : (
                    <ChatBox
                        chatId={chatIdFromParams}
                        initialMessages={initialMessages}
                        initialQueryFromHome={retrievedInitialQuery}
                    />
                )}
            </div>
            <Toaster />
        </div>
    );
};

export default ChatClient;
