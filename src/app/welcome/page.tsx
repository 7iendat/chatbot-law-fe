"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
            <h1 className="text-4xl font-bold mb-4 text-center">
                Chào mừng đến với Angel AI!
            </h1>
            <p className="text-gray-700 mb-8 text-center max-w-lg">
                Angel AI là trợ lý ảo chuyên hỗ trợ bạn các vấn đề pháp lý. Đăng
                nhập để tiếp tục hoặc đăng ký tài khoản nếu bạn mới đến.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                    Đăng nhập
                </button>
                <button
                    onClick={() => router.push("/register")}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                    Đăng ký
                </button>
            </div>
        </div>
    );
}
