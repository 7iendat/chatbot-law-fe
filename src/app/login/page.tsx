"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 👉 Thêm state show/hide mật khẩu

    const loginApi = async (email: string, password: string) => {
        return new Promise<{ token: string }>((resolve, reject) => {
            setTimeout(() => {
                if (email === "admin@gmail.com" && password === "123456") {
                    resolve({ token: "fake-jwt-token" });
                } else {
                    reject(new Error("Sai email hoặc mật khẩu."));
                }
            }, 1000);
        });
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = useCallback(async () => {
        if (!email || !password) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            toast.error("Vui lòng nhập đầy đủ email và mật khẩu.", {
                duration: 2000,
            });
            return;
        }

        if (!isValidEmail(email)) {
            setError("Email không hợp lệ.");
            toast.error("Email không hợp lệ.", { duration: 2000 });
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { token } = await loginApi(email, password);
            localStorage.setItem("token", token);
            setTimeout(() => {
                router.push("/");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
            toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại.", {
                duration: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [email, password, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="w-full max-w-md bg-white border border-gray-400/50 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Đăng nhập
                </h2>

                {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder="Email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-400"
                />

                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="Mật khẩu"
                        className="w-full p-3 border border-gray-300 rounded outline-none pr-12 focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                    >
                        {showPassword ? <Eye /> : <EyeClosed />}
                    </button>
                </div>

                <button
                    onClick={handleLogin}
                    type="button"
                    disabled={isLoading}
                    className={`w-full py-2 rounded transition text-white cursor-pointer ${
                        isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
                <p className="mt-4 text-sm text-center">
                    Bạn chưa có tài khoản?{" "}
                    <span
                        onClick={() => router.push("/register")}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Đăng kí ngay!
                    </span>
                </p>
            </div>
        </div>
    );
}
