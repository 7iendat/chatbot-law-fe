// src/app/auth/callback/page.tsx

"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { authApi } from "@/app/services/authApis";

// Component con cho trạng thái Loading
const LoadingComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <h1 className="mt-4 text-xl font-semibold text-gray-700">
            Đang xác thực
        </h1>
        <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
    </div>
);

// Component con cho trạng thái Lỗi
const ErrorComponent = ({ message }: { message: string }) => {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-xl font-bold text-red-600">Đã xảy ra lỗi</h1>
            <p className="mt-2 text-gray-600">{message}</p>
            <button
                onClick={() => router.replace("/login")}
                className="mt-6 px-6 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                Quay lại trang đăng nhập
            </button>
        </div>
    );
};

// Component chính xử lý logic
const AuthCallbackHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    // Sử dụng state để quản lý trạng thái của component
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        // Chỉ chạy logic khi component đang ở trạng thái 'loading'
        if (status !== "loading") return;

        const handleAuthCode = async () => {
            const code = searchParams.get("code");
            const errorParam = searchParams.get("error");

            if (errorParam) {
                setErrorMessage(`Lỗi từ nhà cung cấp: ${errorParam}`);
                setStatus("error");
                return;
            }

            if (!code) {
                setErrorMessage(
                    "Không tìm thấy mã xác thực. Vui lòng thử lại."
                );
                setStatus("error");
                return;
            }

            try {
                // Gọi API để đổi code
                const response = await authApi.exchangeGoogleCode(code);

                if (response.user) {
                    // Cập nhật state và localStorage thông qua context
                    login(response.user);
                    setStatus("success");
                } else {
                    // Trường hợp API trả về 200 nhưng không có user data
                    throw new Error(
                        "Không nhận được dữ liệu người dùng hợp lệ."
                    );
                }
            } catch (err: any) {
                console.error("Lỗi khi đổi mã xác thực:", err);
                setErrorMessage(err.message || "Không thể hoàn tất đăng nhập.");
                setStatus("error");
            }
        };

        handleAuthCode();
    }, [status, searchParams, login]); // Chạy lại khi status thay đổi (ít khi cần)

    // Dùng một useEffect khác để xử lý việc chuyển hướng khi thành công
    // Tách biệt logic này giúp code rõ ràng hơn
    useEffect(() => {
        if (status === "success") {
            // Chuyển hướng đến trang chính SAU KHI state đã được cập nhật
            router.replace("/");
        }
    }, [status, router]);

    // Render UI dựa trên trạng thái hiện tại
    if (status === "error") {
        return <ErrorComponent message={errorMessage} />;
    }

    // Hiển thị loading cho cả 2 trạng thái 'loading' và 'success'
    // vì việc chuyển hướng sẽ diễn ra ngay lập tức khi 'success'
    return <LoadingComponent />;
};

// Component cha sử dụng Suspense
const AuthCallbackPage = () => (
    <Suspense fallback={<LoadingComponent />}>
        <AuthCallbackHandler />
    </Suspense>
);

export default AuthCallbackPage;
