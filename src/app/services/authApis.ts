import { api } from "../libs/axios";

// Types for API responses
export interface LoginResponse {
    needsVerification?: boolean;
    access_token?: string;
    user?: {
        id: string;
        email: string;
        username?: string;
        role?: string;
    };
    message?: string;
}

export interface VerifyCodeResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        username?: string;
        role?: string;
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
        email: string,
        password: string,
        username?: string
    ): Promise<RegisterResponse> => {
        return await api.post<RegisterResponse>("/user/register", {
            email,
            password,
            username,
        });
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
