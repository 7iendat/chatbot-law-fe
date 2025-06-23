// services/chatApis.ts
import { api, handleApiError } from "../libs/axios"; // Đảm bảo đường dẫn này đúng

// --- CÁC INTERFACE HIỆN CÓ ---
interface CreateChatResponse {
    chat_id: string;
}
interface QueryRequest {
    chat_id: string;
    input: string;
}
interface SourceDocument {
    // Đây là SourceDocument từ backend Pydantic
    source: string;
    page_content_preview: string;
}
export interface AnswerResponse {
    // Dùng cho API /chat (non-streaming)
    answer: string;
    sources: SourceDocument[] | string | null; // Backend có thể trả về string nếu là "dictionary"
    processing_time: number;
}

export interface ApiMessageItem {
    role: string;
    content: string;
    timestamp: string;
}

export interface ApiConversationItem {
    conversation_id: string;
    created_at: string;
    updated_at: string;
    messages: ApiMessageItem[];
}

export interface ApiChatHistoryMessage {
    role: string;
    content: string;
    timestamp: string;
    sources?: SourceDocument[]; // Thêm sources nếu backend trả về trong history
}

export interface ApiChatHistoryResponse {
    chat_id: string;
    history: ApiChatHistoryMessage[];
    created_at: string;
    updated_at: string;
    user_id: string;
}

// --- INTERFACES CHO STREAMING (THÊM MỚI) ---
export interface StreamDataPayload {
    // Dữ liệu cho mỗi token stream
    token?: string;
    is_final?: boolean;
    // Cờ báo hiệu chunk cuối (tùy chọn, backend có thể không gửi)
    // Không nên gửi source ở đây, dùng event riêng cho sources
}

export interface SourceDocumentUI {
    // Dùng cho UI, có thể giống hệt SourceDocument
    source: string;
    page_content_preview: string;
}

export interface SourcesPayload {
    // Dữ liệu cho event 'sources'
    sources: SourceDocumentUI[];
}

export interface StreamErrorPayload {
    // Dữ liệu cho event 'error_stream'
    error: string;
    detail?: string;
    status_code?: number;
}

// --- KẾT THÚC INTERFACES CHO STREAMING ---

export const chatApis = {
    createChat: async (): Promise<CreateChatResponse> => {
        try {
            // Axios trả về response có dạng { data: YourResponseType, status, headers, ... }
            // Bạn cần lấy response.data nếu API của bạn trả về JSON trực tiếp trong body
            // Hoặc response nếu API của bạn trả về một cấu trúc có key 'data'
            const response = await api.post<CreateChatResponse>(
                "/chat/create-chat"
            );
            return response; // Giả sử API trả về dữ liệu trong response.data
        } catch (error: any) {
            console.error("[chatApis] Error creating chat:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                throw new Error(error.response.data.detail);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("An unexpected error occurred while creating chat");
        }
    },

    sendChatMessage: async (
        // API Non-streaming
        chatId: string,
        message: string
    ): Promise<AnswerResponse> => {
        try {
            const requestBody: QueryRequest = {
                chat_id: chatId,
                input: message,
            };
            const response = await api.post<AnswerResponse>(
                "/chat",
                requestBody
            );
            return response; // Giả sử API trả về dữ liệu trong response.data
        } catch (error: any) {
            console.error("[chatApis] Error sending chat message:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                throw new Error(error.response.data.detail);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(
                "An unexpected error occurred while sending message"
            );
        }
    },

    getConversations: async (): Promise<ApiConversationItem[]> => {
        try {
            // console.log("[chatApis] Calling GET /chat/conversations");
            const response = await api.get<ApiConversationItem[]>(
                "/chat/conversations"
            );
            // console.log("[chatApis] Response from GET /chat/conversations:", response.data);

            if (response && Array.isArray(response)) {
                return response;
            } else {
                console.warn(
                    "[chatApis] GET /chat/conversations did not return an array in response.data. Response:",
                    response
                );
                return [];
            }
        } catch (error: any) {
            console.error("[chatApis] Error fetching conversations:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                throw new Error(error.response.data.detail);
            }
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch conversations: ${error.message}`
                );
            }
            throw new Error(
                "An unexpected error occurred while fetching conversations"
            );
        }
    },

    getConversationHistory: async (
        chatId: string
    ): Promise<ApiChatHistoryResponse> => {
        try {
            // console.log(`[chatApis] Calling GET /chat/c/${chatId}`);
            const response = await api.get<ApiChatHistoryResponse>(
                `/chat/c/${chatId}`
            );
            // console.log(`[chatApis] Response from GET /chat/c/${chatId}:`, response.data);
            return response;
        } catch (error: any) {
            console.error(
                `[chatApis] Error fetching conversation history for ${chatId}:`,
                error
            );
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                throw new Error(error.response.data.detail);
            }
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch history for ${chatId}: ${error.message}`
                );
            }
            throw new Error(
                `An unexpected error occurred while fetching history for ${chatId}`
            );
        }
    },

    // --- HÀM MỚI CHO STREAMING ---
    streamChatResponse: async (
        chatId: string,
        message: string,
        // Callbacks
        onToken: (payload: StreamDataPayload) => void,
        onSources: (payload: SourcesPayload) => void,
        onEnd: (payload?: any) => void,
        onError: (payload: StreamErrorPayload) => void,
        onOpen?: () => void
    ): Promise<EventSource | null> => {
        // Trả về Promise chứa EventSource hoặc null nếu lỗi ban đầu
        const queryParams = new URLSearchParams({
            chat_id: chatId,
            input: message,
        });

        const streamPathForProxy = `/api/chat/stream?${queryParams.toString()}`;

        try {
            // console.log(
            //     "[chatApis] Pre-flight check with apiClient to URL:",
            //     streamPathForProxy
            // );

            // await apiClient.get(streamPathForProxy, {
            //     // Không cần responseType: 'stream' ở đây vì chúng ta không xử lý stream từ axios
            //     // Mục đích chính là để interceptor chạy và xác thực.
            //     // Nếu server trả về 200 OK cho GET này mà không phải là text/event-stream,
            //     // nó vẫn ổn cho mục đích "pre-flight" này.
            //     // Tuy nhiên, lý tưởng nhất là endpoint /chat/stream cũng chấp nhận GET
            //     // và trả về lỗi 401/403 nếu không được xác thực, trước khi bắt đầu stream.
            //     headers: {
            //         Accept: "text/event-stream", // Gợi ý cho server rằng client có thể muốn stream
            //     },
            // });
            // console.log("[chatApis] Pre-flight check successful.");

            // Bước 2: Nếu pre-flight thành công, khởi tạo EventSource
            console.log(
                `[chatApis] Creating EventSource to: ${streamPathForProxy}`
            );
            const eventSource = new EventSource(streamPathForProxy, {
                withCredentials: true,
            });

            if (onOpen) {
                eventSource.onopen = () => {
                    console.log("[chatApis] EventSource connection opened.");
                    onOpen();
                };
            }

            eventSource.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(
                        event.data
                    ) as StreamDataPayload;
                    onToken(parsedData);
                } catch (e) {
                    console.error(
                        "[chatApis] Error parsing stream data (onmessage):",
                        event.data,
                        e
                    );
                }
            };

            eventSource.addEventListener("sources", (event) => {
                try {
                    const parsedData = JSON.parse(
                        (event as MessageEvent).data
                    ) as SourcesPayload;
                    onSources(parsedData);
                } catch (e) {
                    console.error(
                        "[chatApis] Error parsing 'sources' event data:",
                        (event as MessageEvent).data,
                        e
                    );
                }
            });

            eventSource.addEventListener("error_stream", (event) => {
                try {
                    const parsedData = JSON.parse(
                        (event as MessageEvent).data
                    ) as StreamErrorPayload;
                    onError(parsedData);
                } catch (e) {
                    console.error(
                        "[chatApis] Error parsing 'error_stream' event data:",
                        (event as MessageEvent).data,
                        e
                    );
                    onError({ error: "Lỗi không xác định từ stream server." });
                }
            });

            eventSource.addEventListener("end_stream", (event) => {
                try {
                    const payload = (event as MessageEvent).data
                        ? JSON.parse((event as MessageEvent).data)
                        : { message: "Stream ended by server." };
                    onEnd(payload);
                } catch (e) {
                    console.error(
                        "[chatApis] Error parsing 'end_stream' event data:",
                        (event as MessageEvent).data,
                        e
                    );
                    onEnd({
                        message: "Stream ended, error parsing end event.",
                    });
                }
                eventSource.close();
            });

            eventSource.onerror = (errEvent: Event) => {
                console.error(
                    "[chatApis] EventSource.onerror triggered:",
                    errEvent
                );
                // Nếu đây là MessageEvent và có data, có thể là event 'error_stream' chưa được bắt bởi addEventListener
                if ((errEvent as MessageEvent).data) {
                    try {
                        const parsedError = JSON.parse(
                            (errEvent as MessageEvent).data
                        );
                        if (parsedError.error) {
                            // Đã có addEventListener cho 'error_stream', không cần gọi lại onError ở đây
                            // chỉ log hoặc return
                            console.warn(
                                "[chatApis] Potential custom error in onerror, likely handled by 'error_stream' listener:",
                                parsedError
                            );
                            return;
                        }
                    } catch (e) {
                        /* Ignore */
                    }
                }

                if (eventSource.readyState === EventSource.CLOSED) {
                    console.log("[chatApis] EventSource closed.");
                } else if (eventSource.readyState === EventSource.CONNECTING) {
                    console.warn(
                        "[chatApis] EventSource is attempting to reconnect..."
                    );
                } else {
                    onError({
                        error: "Lỗi kết nối streaming. Vui lòng thử lại.",
                    });
                    eventSource.close();
                }
            };

            return eventSource; // Trả về instance EventSource đã tạo
        } catch (error: any) {
            // Lỗi này từ apiClient.get (ví dụ 401 đã được xử lý bởi interceptor và redirect, hoặc lỗi mạng)
            console.error(
                "[chatApis] Error during pre-flight stream check:",
                error
            );
            // Xử lý lỗi bằng handleApiError đã có hoặc gọi onError callback
            const errorMessage = handleApiError(error); // Sử dụng handleApiError của bạn
            onError({
                error: errorMessage,
                detail: error.response?.data?.detail,
            });

            // Nếu lỗi là do hasRefreshFailedDefinitively, thì redirect đã được gọi
            // Nếu là lỗi khác, bạn có thể muốn thông báo cho người dùng.
            // Không cần return eventSource vì nó chưa được tạo hoặc không nên được sử dụng
            return null;
        }
    },
    // --- KẾT THÚC HÀM STREAMING ---

    deleteConversationbyChatId: async (
        chatId: string
    ): Promise<{ message: string }> => {
        try {
            const res = await api.delete<{ message: string }>(
                `/chat/chats/${chatId}`
            );
            return res;
        } catch (error: any) {
            console.error("[chatApis] Error fetching conversations:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                throw new Error(error.response.data.detail);
            }
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch conversations: ${error.message}`
                );
            }
            throw new Error(
                "An unexpected error occurred while fetching conversations"
            );
        }
    },
};
