import { api } from "../libs/axios";

// Types for API responses
export interface LoginResponse {
    needsVerification?: boolean;
    // accessToken?: string;
    user?: {
        email: string;
        username?: string;
        role?: string;
    };
    message?: string;
}

export interface VerifyCodeResponse {
    // accessToken: string;
    user: {
        email: string;
        username?: string;
        role?: string;
        avatar_url?: string;
    };
    message?: string;
}

export interface SendVerificationResponse {
    message: string;
    expiresIn?: number; // seconds until code expires
}

export interface RegisterResponse {
    // user: {
    //     id: string;
    //     email: string;
    //     name?: string;
    // };
    message: string;
}

export interface ErrorResponse {
    response: {
        status: number;
        data: {
            detail: string;
        };
    };
    message: string;
}

export interface UserApiResponse {
    email: string;
    username?: string;
    role?: string;
    avatar_url?: string;
    is_active?: boolean; // Thêm is_active nếu API trả về
    // Thêm các trường khác nếu API /user/me trả về
}

// Interface này định nghĩa cấu trúc của toàn bộ response từ getCurrentUser
// Nó chứa một key 'user' có thể là UserApiResponse hoặc null
export interface UserDataResponse {
    user: UserApiResponse | null;
    // Có thể thêm các trường khác nếu API /user/me trả về nhiều hơn (ví dụ: message)
}

// Authentication API calls
export const authApi = {
    // Login with email and password
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return await api.post<LoginResponse>("/user/login", {
            email,
            password,
        });
    },

    loginWithGoogle: (): void => {
        // Redirect to Google OAuth login

        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/user/login/google`;
    },

    exchangeGoogleCode: async (
        code: string
    ): Promise<{ user: UserApiResponse }> => {
        // Endpoint này sẽ trả về thông tin user sau khi set cookie thành công
        const response = await api.post<{ user: UserApiResponse }>(
            `/user/token/google?code=${code}`
        );
        return response;
    },

    // Verify authentication code
    verifyCode: async (
        email: string,
        code: string
    ): Promise<VerifyCodeResponse> => {
        return await api.post<VerifyCodeResponse>("/user/verify-login", {
            email,
            code,
        });
    },

    verifyForgotPassCode: async (
        email: string,
        code: string
    ): Promise<VerifyCodeResponse> => {
        return await api.post<VerifyCodeResponse>(
            "/user/forgot-password/verify-code",
            {
                email,
                code,
            }
        );
    },

    validateToken: async (
        token: string
    ): Promise<{ valid: boolean; message?: string }> => {
        try {
            const response = await api.post<{
                valid: boolean;
                message?: string;
            }>("/user/validate-token", {
                token: token,
            });
            return response;
        } catch (error: any) {
            console.error("Token validation error:", error);

            // Handle different error status codes
            if (error.response?.status === 422) {
                throw new Error("Invalid request format");
            }
            if (error.response?.status === 401) {
                return {
                    valid: false,
                    message: error.response.data.detail || "Token invalid",
                };
            }
            if (error.response?.status === 400) {
                throw new Error(error.response.data.detail || "Bad request");
            }

            // Handle other potential errors
            throw new Error(error.message || "Unknown error occurred");
        }
    },

    resentVerificationCode: async (
        email: string
    ): Promise<{ message: string }> => {
        try {
            const response = await api.post<{ message: string }>(
                "/user/resent-verification-code",
                { email }
            );
            return response;
        } catch (error: any) {
            // Handle HTTPException from server
            if (error.response?.status === 500) {
                throw new Error(`${error.response.data.detail}`);
            }
            // Handle other potential errors
            throw new Error(`${error.message || "Unknown error"}`);
        }
    },

    // Register new user
    register: async (
        username: string,
        password: string,
        email: string
    ): Promise<RegisterResponse> => {
        try {
            const res = await api.post<RegisterResponse>("/user/register", {
                username,
                password,
                email,
            });
            return res;
        } catch (error: any) {
            throw new Error(
                `Registration failed: ${
                    error.response?.data?.detail || error.message
                }`
            );
        }
    },

    // Refresh token
    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        return await api.post<LoginResponse>("/user/refresh-token", {
            refreshToken,
        });
    },

    // Logout
    logout: async (): Promise<{ message: string }> => {
        return await api.post<{ message: string }>("/user/logout");
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        return await api.post<{ message: string }>("/user/forgot-password", {
            email,
        });
    },

    // Reset password
    resetPassword: async (
        code: string,
        newPassword: string
    ): Promise<{ message: string }> => {
        return await api.post<{ message: string }>(`/user/reset-password`, {
            code,
            newPassword,
        });
    },

    // Get current user profile
    getCurrentUser: async (): Promise<UserDataResponse> => {
        try {
            // Endpoint này cần được bảo vệ và đọc access_token_cookie
            // Giả sử api.get trả về trực tiếp payload JSON của response (tức là UserApiResponse)
            // Nếu API /user/me của bạn trả về { "user": { ... } } thì dòng dưới cần là:
            // const response = await api.get<{ user: UserApiResponse }>("/user/me");
            // return { user: response.user };

            // Còn nếu API /user/me của bạn trả về trực tiếp object user: { email: ..., username: ...}
            // thì code như sau:
            const userApiResponse = await api.get<UserApiResponse>("/user/me"); // Gọi tới endpoint /user/me
            console.log("check", userApiResponse);
            // Nếu request thành công và userApiResponse có dữ liệu (ví dụ không phải null hay undefined từ api.get)
            if (userApiResponse) {
                // console.log("authApi.getCurrentUser: User data fetched successfully:", userApiResponse);
                return { user: userApiResponse }; // Trả về cấu trúc { user: UserApiResponse }
            } else {
                // Trường hợp hiếm gặp: API trả về 200 OK nhưng data là null/undefined
                // console.warn("authApi.getCurrentUser: Fetched user data is null/undefined despite 200 OK.");
                return { user: null };
            }
        } catch (error: any) {
            // Nếu API trả về lỗi (ví dụ 401, 403, 500), Axios interceptor sẽ ném lỗi
            console.warn(
                "authApi.getCurrentUser: Error fetching user. Likely not authenticated or API error.",
                error.message || error // Log message của lỗi
            );
            // Không ném lỗi ở đây để AuthProvider có thể xử lý việc user là null
            return { user: null }; // Quan trọng: Trả về cấu trúc { user: null } khi có lỗi
        }
    },

    changePassword: async (
        current_password: string,
        new_password: string
    ): Promise<{ message: string }> => {
        try {
            return await api.post<{ message: string }>(
                "/user/change-password",
                {
                    current_password,
                    new_password,
                }
            );
        } catch (error: any) {
            // Handle HTTPException from server
            if (error.response?.status === 500) {
                throw new Error(`${error.response.data.detail}`);
            }
            // Handle other potential errors
            throw new Error(`${error.message || "Unknown error"}`);
        }
    },
};

// Export individual functions for convenience
export const {
    login,
    verifyCode,
    loginWithGoogle,
    register,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    // updateProfile,
} = authApi;
