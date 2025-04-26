// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            // 🟡 Gọi API xác thực ở đây (bạn có thể thay bằng real API)
            if (email === "admin@gmail.com" && password === "123456") {
                // 👉 Giả lập đăng nhập thành công
                localStorage.setItem("token", "fake-jwt-token");
                router.push("/"); // chuyển hướng về trang chính
            } else {
                setError("Sai email hoặc mật khẩu.");
            }
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
            console.log(err); // Ghi log lỗi ra console
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
            <div className="w-full max-w-md bg-white border border-gray-400/50 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Đăng nhập
                </h2>

                {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded outline-none"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full p-3 mb-4 border border-gray-300 rounded outline-none"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    );
}
