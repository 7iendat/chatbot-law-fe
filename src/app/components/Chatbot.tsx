"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    Send,
    Upload,
    User,
    Bot,
    Sparkles,
    Loader2,
    ExternalLink,
} from "lucide-react";
import {
    chatApis,
    ApiChatHistoryMessage,
    StreamDataPayload,
    SourcesPayload,
    StreamErrorPayload,
    SourceDocumentUI,
} from "../services/chatApis"; // Đảm bảo đường dẫn đúng
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../contexts/ThemeContext"; // Đảm bảo đường dẫn đúng

type UIMessage = ApiChatHistoryMessage & {
    id: string;
    isError?: boolean;
    isStreaming?: boolean; // Sẽ dùng để biết tin nhắn cụ thể có đang stream không
    sources?: SourceDocumentUI[];
};

interface ChatBoxProps {
    chatId: string;
    initialMessages?: ApiChatHistoryMessage[];
    initialQueryFromHome?: string;
}

// const STREAM_UPDATE_INTERVAL = 50; // Không cần nữa nếu cập nhật trực tiếp

export default function ChatBox({
    chatId,
    initialMessages,
    initialQueryFromHome,
}: ChatBoxProps) {
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false); // Dùng để disable input/button send
    // isBotStreaming không cần ở state nữa, sẽ dựa vào message cuối cùng
    // const [isBotStreaming, setIsBotStreaming] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);
    const currentEventSourceRef = useRef<EventSource | null>(null);
    const { effectiveTheme } = useTheme();

    // Không cần các ref gom token và timer phức tạp nữa
    // const accumulatedTokensRef = useRef<string>("");
    // const lastTokenUpdateTimeRef = useRef<number>(0);
    // const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(
        (behavior: "smooth" | "auto" = "smooth") => {
            const container = messagesContainerRef.current;
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                const isUserAtBottom =
                    scrollHeight - scrollTop - clientHeight < 200; // Ngưỡng có thể điều chỉnh
                const lastMessage = messages[messages.length - 1];

                // Luôn scroll nếu tin nhắn cuối là của bot và đang stream, hoặc nếu user ở gần cuối
                const shouldScroll =
                    behavior === "auto" ||
                    isUserAtBottom ||
                    (lastMessage?.role === "assistant" &&
                        lastMessage?.isStreaming);

                if (shouldScroll) {
                    messagesEndRef.current?.scrollIntoView({
                        behavior,
                        block: "end",
                    });
                }
            }
        },
        [messages] // messages là dependency chính
    );

    const generateId = () =>
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const sendMessageAndStream = useCallback(
        async (messageContent: string, currentChatId: string) => {
            if (!currentChatId) {
                toast.error("Lỗi: Không xác định được phiên chat.");
                return;
            }
            if (!messageContent.trim()) return;

            // Đóng EventSource cũ nếu có
            if (currentEventSourceRef.current) {
                console.log(
                    "[ChatBox] Closing previous EventSource before new send."
                );
                currentEventSourceRef.current.close();
                currentEventSourceRef.current = null;
            }

            const userMessage: UIMessage = {
                id: `user-${generateId()}`,
                role: "user",
                content: messageContent,
                timestamp: new Date().toISOString(),
            };

            const botMessageId = `bot-${generateId()}`;
            const placeholderBotMessage: UIMessage = {
                id: botMessageId,
                role: "assistant",
                content: "", // Bắt đầu với content rỗng
                timestamp: new Date().toISOString(),
                isStreaming: true, // Đánh dấu là đang stream
                sources: [],
            };

            setMessages((prev) => [
                ...prev,
                userMessage,
                placeholderBotMessage,
            ]);
            if (input === messageContent) {
                // Chỉ xóa input nếu nội dung gửi đi là từ input hiện tại
                setInput("");
            }
            setIsSending(true); // Disable nút gửi và input

            currentEventSourceRef.current = await chatApis.streamChatResponse(
                currentChatId,
                messageContent,
                (payload: StreamDataPayload) => {
                    // onToken
                    if (payload.token) {
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.id === botMessageId
                                    ? {
                                          ...msg,
                                          content: msg.content + payload.token, // Nối token mới
                                          isStreaming: !payload.is_final, // Nếu is_final là true, isStreaming sẽ là false
                                          isError: false,
                                      }
                                    : msg
                            )
                        );
                    }
                    // Nếu backend gửi is_final mà không có token (chỉ là tín hiệu kết thúc)
                    if (payload.is_final) {
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.id === botMessageId
                                    ? {
                                          ...msg,
                                          isStreaming: false,
                                          timestamp: new Date().toISOString(),
                                      } // Đảm bảo isStreaming là false
                                    : msg
                            )
                        );
                        // Không cần gọi setIsSending(false) ở đây, onEnd sẽ làm
                    }
                },
                (payload: SourcesPayload) => {
                    // onSources
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.id === botMessageId
                                ? { ...msg, sources: payload.sources }
                                : msg
                        )
                    );
                },
                (endPayload?: any) => {
                    // onEnd
                    console.log("[ChatBox] Stream ended by server.");
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.id === botMessageId
                                ? {
                                      ...msg,
                                      isStreaming: false,
                                      timestamp: new Date().toISOString(),
                                  } // Đảm bảo tin nhắn cuối cùng không còn streaming
                                : msg
                        )
                    );
                    setIsSending(false);
                    if (currentEventSourceRef.current) {
                        // streamChatResponse đã tự close khi nhận 'end_stream'
                        currentEventSourceRef.current = null;
                    }
                },
                (errorPayload: StreamErrorPayload) => {
                    // onError
                    console.error(
                        "[ChatBox] Stream error from server:",
                        errorPayload
                    );
                    toast.error(
                        errorPayload.error || "Lỗi khi nhận dữ liệu từ bot."
                    );
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.id === botMessageId
                                ? {
                                      ...msg,
                                      content:
                                          msg.content +
                                          `\n\n⚠️ Lỗi: ${
                                              errorPayload.error ||
                                              "Lỗi không xác định từ server."
                                          }`,
                                      isError: true,
                                      isStreaming: false,
                                      timestamp: new Date().toISOString(),
                                  }
                                : msg
                        )
                    );
                    setIsSending(false);
                    if (currentEventSourceRef.current) {
                        currentEventSourceRef.current.close(); // Đảm bảo đóng khi có lỗi
                        currentEventSourceRef.current = null;
                    }
                },
                () => {
                    // onOpen
                    console.log("[ChatBox] EventSource connection opened.");
                }
            );

            if (!currentEventSourceRef.current) {
                console.error("[ChatBox] Failed to initialize EventSource.");
                setIsSending(false);
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === botMessageId
                            ? {
                                  ...m,
                                  content: "Lỗi kết nối streaming.",
                                  isError: true,
                                  isStreaming: false,
                              }
                            : m
                    )
                );
                toast.error(
                    "Không thể thiết lập kết nối streaming với server."
                );
            }
        },
        [input] // Giữ lại input để có thể reset nếu messageContent === input
    );

    useEffect(() => {
        if (
            initialMessages &&
            initialMessages.length > 0 &&
            messages.length === 0
        ) {
            const uiInitialMessages: UIMessage[] = initialMessages.map(
                (msg) => ({
                    ...msg,
                    id: msg.id || `initial-${generateId()}`,
                    sources: msg.sources || [],
                    isStreaming: false, // Tin nhắn ban đầu không bao giờ streaming
                })
            );
            setMessages(uiInitialMessages);
        } else if (initialQueryFromHome && !initialQueryProcessed && chatId) {
            if (
                messages.length === 0 ||
                messages[messages.length - 1]?.role !== "user" ||
                messages[messages.length - 1]?.content !== initialQueryFromHome
            ) {
                sendMessageAndStream(initialQueryFromHome, chatId);
            }
            setInitialQueryProcessed(true);
        }
    }, [
        initialMessages,
        initialQueryFromHome,
        initialQueryProcessed,
        chatId,
        sendMessageAndStream,
        messages.length, // Thêm messages.length để effect chạy lại khi messages thay đổi
        // giúp xử lý trường hợp initialMessages được load sau
    ]);

    const handleSendMessageFromInput = useCallback(async () => {
        if (!input.trim() || isSending) return;
        await sendMessageAndStream(input, chatId);
    }, [input, isSending, chatId, sendMessageAndStream]);

    useEffect(() => {
        // Chỉ cuộn tự động nếu tin nhắn cuối là của bot và đang stream
        // hoặc nếu có tin nhắn mới được thêm vào (messages.length thay đổi)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage?.isStreaming) {
            scrollToBottom("smooth");
        } else {
            scrollToBottom("auto"); // Cuộn "auto" cho tin nhắn user hoặc khi bot đã trả lời xong
        }
    }, [messages, scrollToBottom]); // Phụ thuộc vào messages

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                150
            )}px`; // Giới hạn maxHeight
        }
    }, [input]);

    useEffect(() => {
        return () => {
            if (currentEventSourceRef.current) {
                console.log(
                    "[ChatBox] Unmounting, closing active EventSource."
                );
                currentEventSourceRef.current.close();
                currentEventSourceRef.current = null;
            }
        };
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !isSending) {
            e.preventDefault();
            handleSendMessageFromInput();
        }
    };

    const formatTime = (isoTimestamp: string) => {
        try {
            return new Date(isoTimestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return ""; // Trả về rỗng nếu ngày không hợp lệ
        }
    };

    const TypingIndicator = () => (
        <div
            className="flex items-end gap-2 justify-start mb-5 animate-slide-up"
            style={{ animationFillMode: "forwards" }}
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Bot size={16} />
            </div>
            <div
                className={`px-4 py-3 rounded-2xl shadow-sm border ${
                    effectiveTheme === "light"
                        ? "bg-gray-100 border-gray-200"
                        : "bg-gray-600 border-gray-500"
                }`}
            >
                <div className="flex space-x-1">
                    <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                            effectiveTheme === "light"
                                ? "bg-gray-400"
                                : "bg-gray-300"
                        }`}
                    ></div>
                    <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                            effectiveTheme === "light"
                                ? "bg-gray-400"
                                : "bg-gray-300"
                        }`}
                        style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                            effectiveTheme === "light"
                                ? "bg-gray-400"
                                : "bg-gray-300"
                        }`}
                        style={{ animationDelay: "0.2s" }}
                    ></div>
                </div>
            </div>
        </div>
    );

    // Biến để quyết định có hiển thị TypingIndicator không
    const shouldShowTypingIndicator =
        isSending && // Chỉ hiển thị khi đang chờ phản hồi từ server
        messages.length > 0 &&
        messages[messages.length - 1]?.role === "assistant" && // Tin nhắn cuối là của bot (placeholder)
        messages[messages.length - 1]?.isStreaming === true && // Và nó đang trong trạng thái chờ stream
        messages[messages.length - 1]?.content.length === 0; // Và chưa có nội dung nào được stream về

    const showWelcomeScreen =
        messages.length === 0 &&
        !isSending &&
        (!initialQueryFromHome || initialQueryProcessed);

    if (!chatId) {
        /* ... */
    }

    return (
        <div
            className={`flex flex-col h-full ${
                effectiveTheme === "light"
                    ? "bg-gradient-to-br from-blue-100 to-purple-100"
                    : "bg-gradient-to-br from-gray-900 to-gray-700"
            } rounded-xl overflow-hidden`}
        >
            {/* Header */}
            {/* ... (Header JSX như cũ) ... */}
            <div
                className={`text-center transition-all duration-700 max-w-4xl mx-auto px-2 py-2 md:px-4 md:py-1 ${
                    !showWelcomeScreen
                        ? "justify-start"
                        : "justify-center flex-col flex flex-1"
                }`}
            >
                {showWelcomeScreen ? (
                    <div className="flex flex-col flex-1 items-center justify-center space-y-4 animate-fade-in">
                        <div className="relative">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Bắt đầu cuộc trò chuyện!
                            </h1>
                            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                                <Sparkles size={24} />
                            </div>
                        </div>
                        <p
                            className={`text-lg md:text-xl font-medium ${
                                effectiveTheme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                            }`}
                        >
                            Đặt câu hỏi cho JuriBot.
                        </p>
                        <div className="flex justify-center mt-6 md:mt-8">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                <Bot size={40} className="text-white" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold pt-2 pb-1 md:pt-4 md:pb-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <span
                            className={`text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                                effectiveTheme === "dark"
                                    ? "text-shadow-sm"
                                    : ""
                            }`}
                        >
                            JuriBot Chat
                        </span>
                    </div>
                )}
            </div>

            {/* Vùng hiển thị tin nhắn */}
            {!showWelcomeScreen && (
                <div
                    ref={messagesContainerRef}
                    className={`flex-1 overflow-y-auto ${
                        effectiveTheme === "light"
                            ? "bg-white/80 border-gray-200"
                            : "bg-gray-800/70 border-gray-700" // Điều chỉnh màu nền cho dark theme
                    } backdrop-blur-sm p-3 md:p-6 rounded-2xl border shadow-lg mb-3 md:mb-6 max-w-5xl w-full mx-auto`}
                >
                    {messages.length === 0 && !isSending ? ( // Kiểm tra isSending thay vì isBotStreaming
                        <div
                            className={`text-center h-full flex items-center justify-center ${
                                effectiveTheme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                            }`}
                        >
                            Gửi một tin nhắn để bắt đầu.
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={msg.id}
                                className={`mb-4 md:mb-6 opacity-0 animate-slide-up ${
                                    msg.role === "user"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                                style={{
                                    animationDelay: `${
                                        Math.min(i, 10) * 0.05
                                    }s`,
                                    animationFillMode: "forwards",
                                }}
                            >
                                <div
                                    className={`flex items-end gap-2 md:gap-3 ${
                                        msg.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div
                                        className={`inline-block px-4 py-2 md:px-5 md:py-3 rounded-2xl max-w-[75%] break-words shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 md:hover:-translate-y-1 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                                                : msg.isError
                                                ? "bg-red-100 text-red-800 border border-red-300"
                                                : effectiveTheme === "light"
                                                ? "bg-gray-50 text-gray-900 border border-gray-200"
                                                : "bg-gray-600 text-gray-100 border border-gray-500" // Màu tin nhắn bot cho dark theme
                                        }`}
                                    >
                                        <div className="markdown-content">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                            {/* Bỏ con trỏ nhấp nháy ở đây, TypingIndicator sẽ xử lý */}
                                        </div>
                                        {msg.role === "assistant" &&
                                            msg.sources &&
                                            msg.sources.length > 0 && (
                                                // ... (Sources JSX như cũ) ...
                                                <div
                                                    className={`mt-2 pt-2 border-t text-xs ${
                                                        effectiveTheme ===
                                                        "light"
                                                            ? "border-gray-200"
                                                            : "border-gray-500"
                                                    }`}
                                                >
                                                    <p
                                                        className={`font-semibold mb-1 ${
                                                            effectiveTheme ===
                                                            "light"
                                                                ? "text-gray-600"
                                                                : "text-gray-300"
                                                        }`}
                                                    >
                                                        Nguồn tham khảo:
                                                    </p>
                                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                                        {msg.sources.map(
                                                            (source, idx) => (
                                                                <li
                                                                    key={`${msg.id}-source-${idx}`}
                                                                    className={`${
                                                                        effectiveTheme ===
                                                                        "light"
                                                                            ? "text-gray-700 hover:text-blue-600"
                                                                            : "text-gray-300 hover:text-blue-400"
                                                                    }`}
                                                                >
                                                                    {source.source.startsWith(
                                                                        "http"
                                                                    ) ? (
                                                                        <a
                                                                            href={
                                                                                source.source
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            title={
                                                                                source.page_content_preview
                                                                            }
                                                                            className="inline-flex items-center"
                                                                        >
                                                                            {
                                                                                new URL(
                                                                                    source.source
                                                                                )
                                                                                    .hostname
                                                                            }{" "}
                                                                            <ExternalLink
                                                                                size={
                                                                                    12
                                                                                }
                                                                                className="ml-1"
                                                                            />
                                                                        </a>
                                                                    ) : (
                                                                        <span
                                                                            title={
                                                                                source.page_content_preview
                                                                            }
                                                                        >
                                                                            {
                                                                                source.source
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`text-xs mt-1 md:mt-2 ${
                                        effectiveTheme === "light"
                                            ? "text-gray-600"
                                            : "text-gray-400"
                                    } ${
                                        msg.role === "user"
                                            ? "text-right pr-10 md:pr-11"
                                            : "text-left pl-10 md:pl-11"
                                    }`}
                                >
                                    {formatTime(msg.timestamp)}
                                    {msg.role === "assistant" &&
                                        msg.isStreaming &&
                                        " (đang trả lời...)"}
                                </div>
                            </div>
                        ))
                    )}
                    {shouldShowTypingIndicator && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Vùng Input */}
            {/* ... (Input JSX như cũ, chỉ cần đảm bảo isSending được dùng để disable) ... */}
            <div
                className={`${
                    effectiveTheme === "light"
                        ? "bg-white/90 border-gray-200"
                        : "bg-black/30 border-gray-700" // Điều chỉnh màu input cho dark theme
                } backdrop-blur-sm border rounded-2xl shadow-xl p-3 md:p-4 max-w-5xl mx-auto w-full transition-all duration-300 hover:shadow-2xl mb-1`}
            >
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                        showWelcomeScreen
                            ? "Đặt câu hỏi để bắt đầu..."
                            : "Nhập câu hỏi về luật pháp..."
                    }
                    rows={1}
                    className={`w-full border-2 rounded-xl px-4 py-3 md:px-5 md:py-4 mb-3 md:mb-4 focus:outline-none resize-none text-sm md:text-base transition-all duration-300 scrollbar scrollbar-thin custom-scrollbar
                        ${
                            effectiveTheme === "light"
                                ? "bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-gray-900 scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                                : "bg-gray-700/80 border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-900/50 text-gray-100 scrollbar-thumb-gray-500 scrollbar-track-gray-700"
                        }
                    `}
                    style={{
                        minHeight: "48px",
                        maxHeight: "150px",
                        overflowY: "auto",
                    }}
                    disabled={isSending}
                />
                <div className="flex items-center justify-between">
                    <button
                        className={`group w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl border flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                            ${
                                effectiveTheme === "light"
                                    ? "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 border-gray-300 hover:border-blue-300"
                                    : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-blue-700 hover:to-purple-700 border-gray-500 hover:border-blue-500"
                            }
                        `}
                        disabled={isSending}
                        title="Tải lên tệp (chức năng chưa triển khai)"
                        onClick={() =>
                            toast.error(
                                "Chức năng tải tệp lên chưa được triển khai."
                            )
                        }
                    >
                        <Upload
                            size={18}
                            className={`${
                                effectiveTheme === "light"
                                    ? "text-gray-600 group-hover:text-blue-600"
                                    : "text-gray-300 group-hover:text-blue-400"
                            } transition-colors duration-300`}
                        />
                    </button>
                    <button
                        onClick={handleSendMessageFromInput}
                        disabled={!input.trim() || isSending}
                        className="group relative w-9 h-9 md:w-10 md:h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send
                                size={18}
                                className="transform group-hover:translate-x-0.5 transition-transform duration-200"
                            />
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ... (CSS styles như cũ) ... */
                @keyframes float {
                    0% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slide-up {
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
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #9ca3af;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .markdown-content {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    white-space: normal;
                }
                .markdown-content p,
                .markdown-content pre,
                .markdown-content code,
                .markdown-content ul,
                .markdown-content ol,
                .markdown-content blockquote,
                .markdown-content table,
                .markdown-content tr,
                .markdown-content td,
                .markdown-content th {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    white-space: normal;
                }
                .markdown-content pre {
                    white-space: pre-wrap;
                    overflow-x: auto;
                    padding: 8px;
                    border-radius: 4px;
                    background: ${effectiveTheme === "light"
                        ? "#f3f4f6"
                        : "#374151"}; /* Màu pre cho theme */
                    color: ${effectiveTheme === "light"
                        ? "#1f2937"
                        : "#d1d5db"}; /* Màu text trong pre cho theme */
                }
                .markdown-content code:not(pre code) {
                    white-space: normal;
                    padding: 2px 4px;
                    border-radius: 4px;
                    background: ${effectiveTheme === "light"
                        ? "#e5e7eb"
                        : "#4b5563"}; /* Màu code inline cho theme */
                    color: ${effectiveTheme === "light"
                        ? "#374151"
                        : "#f3f4f6"};
                }
                .markdown-content pre code {
                    white-space: inherit;
                    background: transparent;
                    color: inherit;
                    padding: 0;
                }
                .text-shadow-sm {
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
}
