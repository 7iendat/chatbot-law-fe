"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed, Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState("");

    useEffect(() => {
        setIsLoaded(true);
    }, []);

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
            toast.success("Đăng nhập thành công!", { duration: 1500 });
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black p-4 relative overflow-hidden">
            {/* <Toaster position="top-center" reverseOrder={false} /> */}

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-100 rounded-full opacity-10 animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>

            {/* Back button */}
            <button
                onClick={() => router.push("/")}
                className={`absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-sm  cursor-pointer rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-110 z-20 ${
                    isLoaded
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Main login card */}
            <div
                className={`w-full max-w-md bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl p-8 relative z-10 transform transition-all duration-1000 ease-out ${
                    isLoaded
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-8 opacity-0 scale-95"
                }`}
            >
                {/* Logo/Icon */}
                <div
                    className={`text-center mb-8 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "300ms" }}
                >
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Đăng nhập
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Chào mừng trở lại với JuriBot!
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
                        {error}
                    </div>
                )}

                {/* Email input */}
                <div
                    className={`mb-6 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "500ms" }}
                >
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField("")}
                            placeholder="Email"
                            className={`w-full p-4 pl-12 border rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                                focusedField === "email"
                                    ? "border-blue-400 bg-white shadow-lg ring-4 ring-blue-100 transform scale-[1.02]"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                        />
                    </div>
                </div>

                {/* Password input */}
                <div
                    className={`mb-6 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "600ms" }}
                >
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField("")}
                            placeholder="Mật khẩu"
                            className={`w-full p-4 pl-12 pr-12 border rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                                focusedField === "password"
                                    ? "border-blue-400 bg-white shadow-lg ring-4 ring-blue-100 transform scale-[1.02]"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer transition-all duration-200 hover:scale-110"
                        >
                            {showPassword ? (
                                <Eye className="w-5 h-5" />
                            ) : (
                                <EyeClosed className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Login button */}
                <button
                    onClick={handleLogin}
                    type="button"
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer ${
                        isLoading
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    } ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "700ms" }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 ">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang đăng nhập...
                        </div>
                    ) : (
                        "Đăng nhập"
                    )}
                </button>

                {/* Register link */}
                <p
                    className={`mt-6 text-sm text-center text-gray-600 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "800ms" }}
                >
                    Bạn chưa có tài khoản?{" "}
                    <span
                        onClick={() => router.push("/register")}
                        className="text-blue-600 hover:text-purple-600 hover:underline cursor-pointer font-semibold transition-all duration-200 hover:scale-105 inline-block"
                    >
                        Đăng ký ngay!
                    </span>
                </p>

                {/* Demo credentials */}
                <div
                    className={`mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "900ms" }}
                >
                    <p className="text-xs text-blue-600 font-semibold mb-1">
                        Demo Account:
                    </p>
                    <p className="text-xs text-blue-700">
                        Email: admin@gmail.com
                    </p>
                    <p className="text-xs text-blue-700">Password: 123456</p>
                </div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-bounce"
                    style={{ animationDelay: "0s", animationDuration: "3s" }}
                ></div>
                <div
                    className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-40 animate-bounce"
                    style={{ animationDelay: "1s", animationDuration: "4s" }}
                ></div>
                <div
                    className="absolute top-1/2 right-1/3 w-1 h-1 bg-green-300 rounded-full opacity-40 animate-bounce"
                    style={{ animationDelay: "2s", animationDuration: "5s" }}
                ></div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
