// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");

        if (!email || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp.");
            return;
        }

        try {
            // 🟡 Gọi API đăng ký ở đây (mock tạm)
            console.log("Đăng ký:", { email, password });

            // 👉 Giả lập đăng ký thành công → chuyển sang login
            router.push("/login");
        } catch (err) {
            setError("Đăng ký thất bại. Vui lòng thử lại.");
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-400/50">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Đăng ký tài khoản
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

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full p-3 mb-4 border border-gray-300 rounded outline-none"
                />

                <button
                    onClick={handleRegister}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
                >
                    Đăng ký
                </button>

                <p className="mt-4 text-sm text-center">
                    Đã có tài khoản?{" "}
                    <span
                        onClick={() => router.push("/login")}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Đăng nhập
                    </span>
                </p>
            </div>
        </div>
    );
}
