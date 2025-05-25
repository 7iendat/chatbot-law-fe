import { api } from "../libs/axios";

// Types for API responses
export interface LoginResponse {
    needsVerification?: boolean;
    accessToken?: string;
    user?: {
        email: string;
        username?: string;
        role?: string;
    };
    message?: string;
}

export interface VerifyCodeResponse {
    accessToken: string;
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

// Authentication API calls
export const authApi = {
    // Login with email and password
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return await api.post<LoginResponse>("/user/login", {
            email,
            password,
        });
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

    // // Send verification code to email
    // sendVerificationCode: async (
    //     email: string
    // ): Promise<SendVerificationResponse> => {
    //     return await api.post<SendVerificationResponse>(
    //         "/user/send-verification",
    //         {
    //             email,
    //         }
    //     );
    // },

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
    getProfile: async (): Promise<{
        user: {
            email: string;
            username?: string;
            role?: string;
            avatar?: string;
            is_active?: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }> => {
        return await api.get("/user/me");
    },

    // // Update user profile
    // updateProfile: async (data: {
    //     name?: string;
    //     currentPassword?: string;
    //     newPassword?: string;
    // }): Promise<{
    //     user: {
    //         id: string;
    //         email: string;
    //         name?: string;
    //         role?: string;
    //     };
    //     message: string;
    // }> => {
    //     return await api.patch("/auth/profile", data);
    // },

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
    // sendVerificationCode,
    register,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    // updateProfile,
} = authApi;
