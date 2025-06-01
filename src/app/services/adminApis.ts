import { api } from "../libs/axios";

export interface PaginationMetadata {
    total: number;
    page: number;
    page_size: number;
    pages: number;
    has_more: boolean;
}

export interface UserOut {
    username: string;
    email: string;
    role: string;
    avatar_url: string | null;
    is_active: boolean;
}

export interface PaginatedResponse {
    items: UserOut[];
    metadata: PaginationMetadata;
}

// Định nghĩa type cho các tham số của hàm getListUser
export interface GetListUserParams {
    skip?: number;
    limit?: number;
    search?: string;
    sortBy?: string; // frontend thường dùng camelCase
    sortOrder?: 1 | -1; // 1 for ascending, -1 for descending
}

export const adminApis = {
    getListUser: async (
        params: GetListUserParams = {}
    ): Promise<PaginatedResponse> => {
        const {
            skip, // Mặc định của backend là 0
            limit, // Mặc định của backend là 10
            search, // Mặc định của backend là None/null
            sortBy, // Mặc định của backend là "created_at"
            sortOrder, // Mặc định của backend là -1
        } = params;

        try {
            const queryParams: Record<string, any> = {};
            if (skip !== undefined) queryParams.skip = skip;
            if (limit !== undefined) queryParams.limit = limit;
            if (search) queryParams.search = search; // Chỉ gửi nếu search có giá trị
            if (sortBy) queryParams.sort_by = sortBy; // Chuyển camelCase sang snake_case cho API
            if (sortOrder !== undefined) queryParams.sort_order = sortOrder; // Chuyển camelCase sang snake_case
            const response = await api.get<PaginatedResponse>(
                "/user/list_users",
                {
                    params: queryParams,
                }
            );
            return response; // Axios trả về dữ liệu trong `response.data`
        } catch (error) {
            console.error("Error fetching user list:", error);
            throw error; // Ném lại lỗi để component gọi hàm có thể xử lý (ví dụ: hiển thị thông báo lỗi)
        }
    },
};
