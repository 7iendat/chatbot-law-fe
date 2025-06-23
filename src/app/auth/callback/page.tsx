// src/app/auth/callback/page.tsx
"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authApi } from "@/app/services/authApis";

const AuthCallbackHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth(); // Lấy hàm login của context

    useEffect(() => {
        const handleAuthCode = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            if (error) {
                // Xử lý lỗi từ backend
                router.replace("/login?error=google_failed");
                return;
            }

            if (code) {
                try {
                    // Gọi endpoint mới để đổi code lấy token và thông tin user
                    const response = await authApi.exchangeGoogleCode(code);

                    if (response.user) {
                        localStorage.setItem(
                            "userData",
                            JSON.stringify(response.user)
                        );
                        // Gọi hàm login của context để cập nhật state

                        login(response.user);
                        // Chuyển hướng đến trang chính
                        router.replace("/");
                    }
                } catch (err: any) {
                    console.error("Failed to exchange code for token:", err);
                    router.replace(
                        `/login?error=${err.message || "token_exchange_failed"}`
                    );
                }
            } else {
                router.replace("/login?error=no_code");
            }
        };

        handleAuthCode();
    }, [searchParams, router, login]);

    return <div>Đang hoàn tất đăng nhập...</div>;
};

// Sử dụng Suspense để bọc component
const AuthCallbackPage = () => (
    <Suspense fallback={<div>Đang tải...</div>}>
        <AuthCallbackHandler />
    </Suspense>
);

export default AuthCallbackPage;
