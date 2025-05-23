"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black p-6 relative overflow-hidden">
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

            {/* Main content */}
            <div
                className={`relative z-10 max-w-2xl mx-auto text-center transform transition-all duration-1000 ease-out ${
                    isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                }`}
            >
                {/* Logo/Icon placeholder */}
                <div
                    className={`mb-8 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0"
                    }`}
                    style={{ transitionDelay: "200ms" }}
                >
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <svg
                            className="w-10 h-10 text-white"
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
                </div>

                {/* Title */}
                <h1
                    className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "400ms" }}
                >
                    Chào mừng đến với
                    <br />
                    <span className="inline-block transition-transform duration-300">
                        JuriBot!
                    </span>
                </h1>

                {/* Description */}
                <p
                    className={`text-gray-600 mb-10 text-lg md:text-xl leading-relaxed max-w-xl mx-auto transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "600ms" }}
                >
                    JuriBot là trợ lý ảo chuyên hỗ trợ bạn các vấn đề pháp lý.
                    Đăng nhập để tiếp tục hoặc đăng ký tài khoản nếu bạn mới
                    đến.
                </p>

                {/* Buttons */}
                <div
                    className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "800ms" }}
                >
                    <button
                        onClick={() => router.push("/login")}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out w-full sm:w-auto min-w-[140px] cursor-pointer"
                    >
                        <span className="relative z-10">Đăng nhập</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>

                    <button
                        onClick={() => router.push("/register")}
                        className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out w-full sm:w-auto min-w-[140px] cursor-pointer"
                    >
                        <span className="relative z-10">Đăng ký</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Additional features hint */}
                <div
                    className={`mt-12 text-sm text-gray-500 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "1000ms" }}
                >
                    <div className="flex items-center justify-center gap-6 flex-wrap cursor-default">
                        <div className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-300">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>Tư vấn 24/7</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-green-600 transition-colors duration-300">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <span>Bảo mật cao</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-purple-600 transition-colors duration-300">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            <span>Phản hồi nhanh</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating particles animation */}
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
        </div>
    );
}
