"use client";

import { useState, useCallback, useEffect, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeClosed, Mail, Lock, ArrowLeft, Shield } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { authApi } from "../services/authApis";
import { useAuth } from "../contexts/AuthContext";

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" aria-hidden="true">
        <path
            fill="#4285F4"
            d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
            fill="#34A853"
            d="M43.611 20.083H24v8h11.303c-1.649 4.657-6.08 8-11.303 8V36c6.627 0 12-5.373 12-12c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
            fill="#FBBC05"
            d="M12 24c0-3.059 1.154-5.842 3.039-7.961l-5.657-5.657C6.053 13.954 4 18.732 4 24s2.053 10.046 5.382 13.618l5.657-5.657C13.154 29.842 12 27.059 12 24z"
        />
        <path
            fill="#EA4335"
            d="M24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4v8c3.059 0 5.842 1.154 7.961 3.039l-5.657 5.657C29.842 13.154 27.059 12 24 12z"
        />
    </svg>
);

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState("");
    const searchParams = useSearchParams();

    // Verification states
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const { login } = useAuth();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // === EFFECT ĐỂ XỬ LÝ LỖI TỪ URL ===
    useEffect(() => {
        // Lấy giá trị của tham số 'error' từ URL
        const errorParam = searchParams.get("error");

        if (errorParam) {
            let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
            // Dịch các mã lỗi thành thông báo thân thiện với người dùng
            switch (errorParam) {
                case "no_code":
                    errorMessage =
                        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
                    break;
                case "google_auth_failed":
                    errorMessage =
                        "Không thể xác thực với Google. Vui lòng đảm bảo bạn đã cấp quyền cho ứng dụng.";
                    break;
                case "token_exchange_failed":
                    errorMessage =
                        "Không thể hoàn tất đăng nhập. Vui lòng thử lại sau ít phút.";
                    break;
                case "context_error":
                    errorMessage =
                        "Lỗi hệ thống, không thể khởi tạo phiên đăng nhập.";
                    break;
            }

            // Cập nhật state và hiển thị toast
            setError(errorMessage);
            toast.error(errorMessage, { duration: 4000 });

            // Xóa tham số lỗi khỏi URL để không hiển thị lại khi người dùng refresh
            // Bằng cách thay thế lịch sử trình duyệt
            router.replace("/login", { scroll: false });
        }
    }, [searchParams, router]); // Chạy lại khi searchParams thay đổi

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Timer for resend code
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(
                () => setResendTimer(resendTimer - 1),
                1000
            );
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const verifyCodeApi = async (code: string) => {
        try {
            const res = await authApi.verifyCode(email, code);
            console.log("res", res);
            return res;
        } catch (error: any) {
            throw new Error("Mã xác thực không đúng.");
        }
    };

    // const sendVerificationCodeApi = async (email: string) => {
    //     return new Promise<void>((resolve) => {
    //         setTimeout(() => {
    //             resolve();
    //         }, 1000);
    //     });
    // };

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
            const res = await authApi.login(email, password);

            console.log("res", res);
            if (res.message) {
                setShowVerification(true);
                setResendTimer(60);
                toast.success(res.message, { duration: 2000 });
                return;
            }
            // if (needsVerification) {
            //     await sendVerificationCodeApi(email);
            //     setShowVerification(true);
            //     setResendTimer(60);
            //     toast.success("Mã xác thực đã được gửi đến email của bạn!", {
            //         duration: 2000,
            //     });
            // }
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(
                    error.response.data.detail ||
                        "Có lỗi xảy ra. Vui lòng thử lại."
                );
            } else {
                setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
            }
            toast.error(
                error.message ||
                    error.response?.data?.detail ||
                    "Có lỗi xảy ra. Vui lòng thử lại.",
                {
                    duration: 2000,
                }
            );
        } finally {
            setIsLoading(false);
        }
    }, [email, password]);

    const handleGoogleLogin = () => {
        setIsLoading(true); // Hiển thị trạng thái loading để người dùng biết có hành động xảy ra
        try {
            // Gọi hàm API, nó sẽ tự động chuyển hướng trang hiện tại
            authApi.loginWithGoogle();
        } catch (err: any) {
            toast.error(
                err.message || "Không thể bắt đầu đăng nhập bằng Google."
            );
            setIsLoading(false);
        }
    };

    const handleVerificationInput = (index: number, value: string) => {
        if (value.length > 1) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        setVerificationError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all digits are entered
        if (
            newCode.every((digit) => digit !== "") &&
            newCode.join("").length === 6
        ) {
            handleVerifyCode(newCode.join(""));
        }
    };

    const handleVerificationKeyDown = (
        index: number,
        e: React.KeyboardEvent
    ) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyCode = async (code?: string) => {
        const codeToVerify = code || verificationCode.join("");

        if (codeToVerify.length !== 6) {
            setVerificationError("Vui lòng nhập đầy đủ 6 số.");
            return;
        }

        setIsVerifying(true);
        setVerificationError("");

        try {
            const { user } = await verifyCodeApi(codeToVerify);
            localStorage.setItem("userData", JSON.stringify(user));
            toast.success("Đăng nhập thành công!", { duration: 1500 });
            console.log("user", user);

            const userData = user; // Assuming userData is a global variable or context
            await login(userData);
            setTimeout(() => {
                if (user.role === "admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/");
                }
            }, 1500);
        } catch (err: any) {
            setVerificationError(err.message || "Mã xác thực không đúng.");
            toast.error(err.message || "Mã xác thực không đúng.", {
                duration: 2000,
            });
            // Clear code on error
            setVerificationCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        try {
            const res = await authApi.resentVerificationCode(email);
            setResendTimer(60);

            toast.success(res.message || "Mã xác thực mới đã được gửi!", {
                duration: 2000,
            });
        } catch (err) {
            toast.error("Không thể gửi lại mã. Vui lòng thử lại.", {
                duration: 2000,
            });
        }
    };

    const handleBackToLogin = () => {
        setShowVerification(false);
        setVerificationCode(["", "", "", "", "", ""]);
        setVerificationError("");
        setResendTimer(0);
    };

    if (showVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black p-4 relative overflow-hidden">
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
                    onClick={handleBackToLogin}
                    className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-sm cursor-pointer rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-110 z-20"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                {/* Verification card */}
                <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl p-8 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Xác thực
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Nhập mã 6 số được gửi đến
                        </p>
                        <p className="text-blue-600 font-semibold text-sm">
                            {email}
                        </p>
                    </div>

                    {/* Error message */}
                    {verificationError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
                            {verificationError}
                        </div>
                    )}

                    {/* Code inputs */}
                    <div className="mb-6">
                        <div className="flex gap-3 justify-center">
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el: any) =>
                                        (inputRefs.current[index] = el)
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleVerificationInput(
                                            index,
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleVerificationKeyDown(index, e)
                                    }
                                    className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all duration-300 bg-gray-50/50 focus:border-blue-400 focus:bg-white focus:shadow-lg focus:ring-4 focus:ring-blue-100 hover:border-gray-400"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Verify button */}
                    <button
                        onClick={() => handleVerifyCode()}
                        disabled={
                            isVerifying ||
                            verificationCode.some((digit) => digit === "")
                        }
                        className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer mb-4 ${
                            isVerifying ||
                            verificationCode.some((digit) => digit === "")
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                    >
                        {isVerifying ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang xác thực...
                            </div>
                        ) : (
                            "Xác thực"
                        )}
                    </button>

                    {/* Resend code */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                            Không nhận được mã?
                        </p>
                        <button
                            onClick={handleResendCode}
                            disabled={resendTimer > 0}
                            className={`text-sm font-semibold transition-all duration-200 ${
                                resendTimer > 0
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-600 hover:text-purple-600 hover:underline cursor-pointer hover:scale-105"
                            }`}
                        >
                            {resendTimer > 0
                                ? `Gửi lại sau ${resendTimer}s`
                                : "Gửi lại mã"}
                        </button>
                    </div>
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
                <Toaster />
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black p-4 relative overflow-hidden">
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
                    onClick={() => router.back()}
                    className={`absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-110 z-20 ${
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

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                    >
                        <GoogleIcon />
                        Tiếp tục với Google
                    </button>

                    <div className="flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">
                            HOẶC ĐĂNG NHẬP VỚI EMAIL
                        </span>
                        <div className="flex-grow border-t border-gray-200"></div>
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

                        <p
                            className={`mt-2 text-sm text-right pr-1 text-gray-600 transform transition-all duration-1000 ease-out ${
                                isLoaded
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-4 opacity-0"
                            }`}
                            style={{ transitionDelay: "800ms" }}
                        >
                            <span
                                onClick={() => router.push("/forgot-password")}
                                className="text-blue-600 hover:text-purple-600 hover:underline cursor-pointer font-semibold transition-all duration-200 hover:scale-105 inline-block"
                            >
                                Quên mật khẩu?
                            </span>
                        </p>
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
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-bounce"
                        style={{
                            animationDelay: "0s",
                            animationDuration: "3s",
                        }}
                    ></div>
                    <div
                        className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-40 animate-bounce"
                        style={{
                            animationDelay: "1s",
                            animationDuration: "4s",
                        }}
                    ></div>
                    <div
                        className="absolute top-1/2 right-1/3 w-1 h-1 bg-green-300 rounded-full opacity-40 animate-bounce"
                        style={{
                            animationDelay: "2s",
                            animationDuration: "5s",
                        }}
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
        </>
    );
}
