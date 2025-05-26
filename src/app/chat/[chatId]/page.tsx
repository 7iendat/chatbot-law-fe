// app/chat/[chatId]/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react"; // Thêm useMemo
import { useParams } from "next/navigation"; // Bỏ useSearchParams
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
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouteGuard } from "@/app/hooks/useRouteGuard";
import { AuthLoadingSpinner } from "@/app/components/AuthLoadingSpinner";

const ChatPage = () => {
    // --- TẤT CẢ HOOKS PHẢI ĐƯỢC GỌI Ở ĐÂY, TRƯỚC BẤT KỲ RETURN NÀO ---
    const { user, logout } = useAuth();
    const params = useParams();
    const chatIdFromParams = params.chatId as string;

    const [retrievedInitialQuery, setRetrievedInitialQuery] = useState<
        string | undefined
    >(undefined);
    const [hasAttemptedRetrieve, setHasAttemptedRetrieve] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [collapseSidebar, setCollapseSidebar] = useState(false);

    const { isAuthorized, isLoading, isAuthenticated } = useRouteGuard({
        requireAuth: true,
        redirectTo: "/welcome",
    });

    // useEffect để lấy initial query từ sessionStorage
    useEffect(() => {
        // Chỉ chạy nếu chatIdFromParams có giá trị và chưa thử lấy
        if (chatIdFromParams && !hasAttemptedRetrieve) {
            try {
                const storageKey = `initialQuery_${chatIdFromParams}`;
                const query = sessionStorage.getItem(storageKey);
                if (query) {
                    setRetrievedInitialQuery(query);
                    sessionStorage.removeItem(storageKey);
                    console.log(
                        `ChatPage: Retrieved and removed initial query for ${chatIdFromParams} from sessionStorage: "${query}"`
                    );
                } else {
                    console.log(
                        `ChatPage: No initial query found in sessionStorage for key: ${storageKey}`
                    );
                }
            } catch (error) {
                console.error(
                    "ChatPage: Error accessing sessionStorage:",
                    error
                );
            }
            setHasAttemptedRetrieve(true);
        }
    }, [chatIdFromParams, hasAttemptedRetrieve]);

    useEffect(() => {
        console.log("ChatPage useRouteGuard state:", {
            isLoading,
            isAuthorized,
            isAuthenticated_from_hook: isAuthenticated,
            chatId: chatIdFromParams,
            retrievedInitialQuery,
        });
    }, [
        isLoading,
        isAuthorized,
        isAuthenticated,
        chatIdFromParams,
        retrievedInitialQuery,
    ]);

    // --- CÁC RETURN CÓ ĐIỀU KIỆN NẰM SAU TẤT CẢ CÁC HOOK CALLS ---
    if (isLoading || (!isAuthorized && !isAuthenticated)) {
        console.log("ChatPage: Showing AuthLoadingSpinner.");
        return <AuthLoadingSpinner />;
    }

    if (!isAuthorized) {
        console.log("ChatPage: Not authorized. Returning null for redirect.");
        return null;
    }

    // Nếu chatIdFromParams không có giá trị (ví dụ, route không match đúng),
    // hoặc chưa thử lấy initial query (chưa muốn ChatBox hoạt động đầy đủ)
    // thì có thể hiển thị một trạng thái loading/chờ khác ở đây
    // thay vì render ChatBox ngay.
    // Tuy nhiên, để giải quyết lỗi Hook, chúng ta sẽ render ChatBox
    // và truyền `undefined` cho chatId nếu nó chưa sẵn sàng.
    // ChatBox sẽ cần phải xử lý trường hợp này.

    // **KHÔNG SỬ DỤNG useMemo để render có điều kiện ChatBox ở đây nữa**
    // const chatBoxElement = useMemo(...); // Bỏ dòng này

    // Nếu chatIdFromParams chưa có, không nên render phần còn lại của trang
    if (!chatIdFromParams) {
        console.log(
            "ChatPage: Invalid Chat ID (from params). Waiting for valid chatId."
        );
        // Có thể hiển thị một spinner toàn trang hoặc thông báo lỗi
        return <AuthLoadingSpinner />;
        // Hoặc return <p>Chat không tồn tại hoặc ID không hợp lệ.</p>;
    }

    // Nếu đã có chatIdFromParams, nhưng chưa attempt retrieve initialQuery
    // thì vẫn render ChatBox, nhưng initialQuery sẽ là undefined.
    // ChatBox sẽ đợi initialQuery (nếu cần) hoặc bắt đầu với trạng thái rỗng.

    return (
        <div className="flex h-screen flex-col overflow-hidden md:flex-row bg-white text-black">
            {/* ... Sidebar JSX ... */}
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
                            <Sidebar
                                collapsed={collapseSidebar}
                                currentChatId={chatIdFromParams}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                <Sidebar
                    collapsed={collapseSidebar}
                    currentChatId={chatIdFromParams}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 h-full">
                {/* ... Header JSX ... */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="md:hidden p-2 border rounded hover:bg-gray-100 transition-colors"
                        >
                            <Menu />
                        </button>
                        <h1 className="text-xl font-bold">
                            Chatbot Luật - Chat ID:{" "}
                            {chatIdFromParams
                                ? chatIdFromParams.substring(0, 8)
                                : "Loading"}
                            ...
                        </h1>
                    </div>

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

                {/* Luôn render ChatBox nếu chatIdFromParams đã có */}
                {/* ChatBox sẽ cần xử lý nếu retrievedInitialQuery là undefined ban đầu */}
                {/* Hoặc nếu bạn muốn đợi hasAttemptedRetrieve là true: */}
                {hasAttemptedRetrieve ? (
                    <ChatBox
                        chatId={chatIdFromParams}
                        initialQuery={retrievedInitialQuery}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <AuthLoadingSpinner />
                    </div>
                )}
            </div>

            <Toaster />
        </div>
    );
};

export default ChatPage;
