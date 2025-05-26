// services/chatApis.ts
import { api } from "../libs/axios"; // Đảm bảo đường dẫn này đúng

// Các interface đã có
interface CreateChatResponse {
    chat_id: string;
}
interface QueryRequest {
    chat_id: string;
    input: string;
}
interface SourceDocument {
    source: string;
    page_content_preview: string;
}
interface AnswerResponse {
    answer: string;
    sources: SourceDocument[] | string | null;
    processing_time: number;
}

// --- BẮT ĐẦU THAY ĐỔI ---

export interface ApiMessageItem {
    role: string;
    content: string;
    timestamp: string; // Backend Pydantic model định nghĩa là str
}

export interface ApiConversationItem {
    conversation_id: string;
    created_at: string; // API trả về chuỗi ISO datetime
    updated_at: string; // API trả về chuỗi ISO datetime
    messages: ApiMessageItem[]; // Đây là thay đổi quan trọng
}

export interface ApiChatHistoryMessage {
    // Tương ứng với Pydantic model Message ở backend
    role: string;
    content: string;
    timestamp: string; // Backend sẽ serialize datetime thành ISO string
}

export interface ApiChatHistoryResponse {
    // Tương ứng với Pydantic model ChatHistoryResponse
    chat_id: string;
    history: ApiChatHistoryMessage[];
    created_at: string;
    updated_at: string;
    user_id: string;
}

// Kiểu dữ liệu cho response từ API /conversations
// API của bạn trả về một mảng trực tiếp, không phải object có key
// export interface ConversationsResponse {
//     conversations: ApiConversationItem[];
// }

export const chatApis = {
    createChat: async (): Promise<CreateChatResponse> => {
        // ... (như cũ)
        try {
            const { data } = await api.post<CreateChatResponse>(
                "/chat/create-chat"
            ); // Giả sử API trả về { data: ... }
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("An unexpected error occurred while creating chat");
        }
    },

    sendChatMessage: async (
        chatId: string,
        message: string
    ): Promise<AnswerResponse> => {
        // ... (như cũ)
        try {
            const requestBody: QueryRequest = {
                chat_id: chatId,
                input: message,
            };
            const { data } = await api.post<AnswerResponse>(
                "/chat",
                requestBody
            ); // Giả sử API trả về { data: ... }
            return data;
        } catch (error) {
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
            console.log("[chatApis] Calling GET /conversations");
            const response = await api.get<ApiConversationItem[]>(
                "/chat/conversations"
            );
            console.log(
                "[chatApis] Response from GET /conversations:",
                response
            );

            // Kiểm tra xem response.data có thực sự là một mảng không
            // Axios thường trả về dữ liệu trong response.data
            if (response && Array.isArray(response)) {
                return response;
            } else {
                // Nếu response.data không phải là mảng, hoặc response không có data
                // Đây là một tình huống không mong đợi
                console.warn(
                    "[chatApis] GET /conversations did not return an array in response.data. Response:",
                    response
                );
                // Trả về mảng rỗng để tránh lỗi ở component gọi
                // Hoặc bạn có thể ném lỗi cụ thể hơn
                // throw new Error("API response for conversations was not an array.");
                return []; // Trả về mảng rỗng như một fallback an toàn
            }
        } catch (error) {
            console.error("[chatApis] Error fetching conversations:", error);
            if (error instanceof Error) {
                // Ném lại lỗi để component gọi có thể bắt và xử lý UI
                throw new Error(
                    `Failed to fetch conversations: ${error.message}`
                );
            }
            // Lỗi không xác định
            throw new Error(
                "An unexpected error occurred while fetching conversations"
            );
        }
    },

    // ... (createChat, sendChatMessage, getConversations như cũ) ...

    // --- HÀM MỚI ĐỂ LẤY LỊCH SỬ CHAT ---
    getConversationHistory: async (
        chatId: string
    ): Promise<ApiChatHistoryResponse> => {
        try {
            console.log(`[chatApis] Calling GET /chat/c/${chatId}`);
            // Axios trả về response có dạng { data: YourResponseType }
            const response = await api.get<ApiChatHistoryResponse>(
                `/chat/c/${chatId}`
            );
            console.log(
                `[chatApis] Response from GET /chat/c/${chatId}:`,
                response
            );
            return response; // Trả về phần data của response
        } catch (error) {
            console.error(
                `[chatApis] Error fetching conversation history for ${chatId}:`,
                error
            );
            if (error instanceof Error && (error as any).response) {
                // Kiểm tra thêm (error as any).response
                const axiosError = error as any;
                // Ném lại lỗi với thông tin chi tiết hơn từ response của API (nếu có)
                throw new Error(
                    axiosError.response.data?.detail ||
                        `Failed to fetch history for ${chatId}: ${axiosError.message}`
                );
            } else if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch history for ${chatId}: ${error.message}`
                );
            }
            throw new Error(
                `An unexpected error occurred while fetching history for ${chatId}`
            );
        }
    },
};

// Add more chat-related API methods here as neede

// --- KẾT THÚC THAY ĐỔI ---
