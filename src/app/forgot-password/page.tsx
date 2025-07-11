"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeClosed,
    Mail,
    Lock,
    ArrowLeft,
    Shield,
    KeyRound,
    Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../services/authApis";

type Step = "email" | "verification" | "reset" | "success";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState("");

    // Verification states
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

    // Password reset states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetError, setResetError] = useState("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPassword = (password: string) => {
        return password.length >= 6;
    };

    // API calls (mock implementations)
    const sendResetCodeApi = async (email: string) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                // Simulate API call
                if (email === "test@error.com") {
                    reject(new Error("Email không tồn tại trong hệ thống."));
                } else {
                    resolve();
                }
            }, 1500);
        });
    };

    const verifyResetCodeApi = async (email: string, code: string) => {
        try {
            const res = await authApi.verifyForgotPassCode(email, code);
            return res;
        } catch (error) {
            throw new Error("Mã xác thực không đúng.");
        }
    };

    const resetPasswordApi = async (code: string, newPassword: string) => {
        try {
            const res = await authApi.resetPassword(code, newPassword);
            return res;
        } catch (error: any) {
            throw new Error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    // Step 1: Email input
    const handleSendResetCode = useCallback(async () => {
        if (!email) {
            setError("Vui lòng nhập email.");
            toast.error("Vui lòng nhập email.", { duration: 2000 });
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
            const res = await authApi.forgotPassword(email);
            if (res.message) {
                setCurrentStep("verification");
                setResendTimer(60);
                toast.success(res.message, {
                    duration: 2000,
                });
            }
        } catch (error: any) {
            setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
            toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.", {
                duration: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [email]);

    // Step 2: Verification
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
            const res = await verifyResetCodeApi(email, codeToVerify);
            if (res?.message) {
                setCurrentStep("reset");
                toast.success("Xác thực thành công!", { duration: 1500 });
            }
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
            await sendResetCodeApi(email);
            setResendTimer(60);
            toast.success("Mã xác thực mới đã được gửi!", { duration: 2000 });
        } catch (err: any) {
            toast.error(
                err.message || "Không thể gửi lại mã. Vui lòng thử lại.",
                {
                    duration: 2000,
                }
            );
        }
    };

    // Step 3: Password reset
    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setResetError(
                "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu."
            );
            toast.error(
                "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.",
                {
                    duration: 2000,
                }
            );
            return;
        }

        if (!isValidPassword(newPassword)) {
            setResetError("Mật khẩu phải có ít nhất 6 ký tự.");
            toast.error("Mật khẩu phải có ít nhất 6 ký tự.", {
                duration: 2000,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setResetError("Mật khẩu xác nhận không khớp.");
            toast.error("Mật khẩu xác nhận không khớp.", { duration: 2000 });
            return;
        }

        setIsResetting(true);
        setResetError("");

        try {
            await resetPasswordApi(verificationCode.join(""), newPassword);
            setCurrentStep("success");
            toast.success("Đặt lại mật khẩu thành công!", { duration: 2000 });
        } catch (err: any) {
            setResetError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
            toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại.", {
                duration: 2000,
            });
        } finally {
            setIsResetting(false);
        }
    };

    const handleBackStep = () => {
        switch (currentStep) {
            case "verification":
                setCurrentStep("email");
                setVerificationCode(["", "", "", "", "", ""]);
                setVerificationError("");
                setResendTimer(0);
                break;
            case "reset":
                setCurrentStep("verification");
                setNewPassword("");
                setConfirmPassword("");
                setResetError("");
                break;
            case "success":
                router.push("/login");
                break;
            default:
                router.back();
        }
    };

    const renderEmailStep = () => (
        <>
            {/* Header */}
            <div
                className={`text-center mb-8 transform transition-all duration-1000 ease-out ${
                    isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
            >
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Quên mật khẩu
                </h2>
                <p className="text-gray-600 mt-2">
                    Nhập email để nhận mã đặt lại mật khẩu
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
                                ? "border-orange-400 bg-white shadow-lg ring-4 ring-orange-100 transform scale-[1.02]"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                    />
                </div>
            </div>

            {/* Send code button */}
            <button
                onClick={handleSendResetCode}
                type="button"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer ${
                    isLoading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                } ${
                    isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "600ms" }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                    </div>
                ) : (
                    "Gửi mã xác thực"
                )}
            </button>

            {/* Back to login */}
            <p
                className={`mt-6 text-sm text-center text-gray-600 transform transition-all duration-1000 ease-out ${
                    isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "700ms" }}
            >
                Nhớ mật khẩu rồi?{" "}
                <span
                    onClick={() => router.push("/login")}
                    className="text-orange-600 hover:text-red-600 hover:underline cursor-pointer font-semibold transition-all duration-200 hover:scale-105 inline-block"
                >
                    Đăng nhập ngay!
                </span>
            </p>
        </>
    );

    const renderVerificationStep = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Xác thực
                </h2>
                <p className="text-gray-600 mt-2">Nhập mã 6 số được gửi đến</p>
                <p className="text-blue-600 font-semibold text-sm">{email}</p>
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
                            ref={(el: any) => (inputRefs.current[index] = el)}
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
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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

            {/* Demo code */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold mb-1">
                    Demo Code:
                </p>
                <p className="text-xs text-blue-700">123456</p>
            </div>
        </>
    );

    const renderResetStep = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Đặt lại mật khẩu
                </h2>
                <p className="text-gray-600 mt-2">
                    Nhập mật khẩu mới cho tài khoản của bạn
                </p>
            </div>

            {/* Error message */}
            {resetError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
                    {resetError}
                </div>
            )}

            {/* New password input */}
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (resetError) setResetError("");
                        }}
                        onFocus={() => setFocusedField("newPassword")}
                        onBlur={() => setFocusedField("")}
                        placeholder="Mật khẩu mới"
                        className={`w-full p-4 pl-12 pr-12 border rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                            focusedField === "newPassword"
                                ? "border-green-400 bg-white shadow-lg ring-4 ring-green-100 transform scale-[1.02]"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer transition-all duration-200 hover:scale-110"
                    >
                        {showNewPassword ? (
                            <Eye className="w-5 h-5" />
                        ) : (
                            <EyeClosed className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Confirm password input */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (resetError) setResetError("");
                        }}
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField("")}
                        placeholder="Xác nhận mật khẩu mới"
                        className={`w-full p-4 pl-12 pr-12 border rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                            focusedField === "confirmPassword"
                                ? "border-green-400 bg-white shadow-lg ring-4 ring-green-100 transform scale-[1.02]"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer transition-all duration-200 hover:scale-110"
                    >
                        {showConfirmPassword ? (
                            <Eye className="w-5 h-5" />
                        ) : (
                            <EyeClosed className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Reset button */}
            <button
                onClick={handleResetPassword}
                disabled={isResetting}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer ${
                    isResetting
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
                {isResetting ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang đặt lại...
                    </div>
                ) : (
                    "Đặt lại mật khẩu"
                )}
            </button>
        </>
    );

    const renderSuccessStep = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-4 animate-bounce">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Thành công!
                </h2>
                <p className="text-gray-600 mt-2">
                    Mật khẩu của bạn đã được đặt lại thành công
                </p>
            </div>

            {/* Success message */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
                <p className="font-semibold mb-2">
                    Đặt lại mật khẩu thành công!
                </p>
                <p className="text-sm">
                    Bạn có thể đăng nhập với mật khẩu mới.
                </p>
            </div>

            {/* Login button */}
            <button
                onClick={() => router.push("/login")}
                className="w-full py-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
                Đăng nhập ngay
            </button>
        </>
    );

    const getStepContent = () => {
        switch (currentStep) {
            case "email":
                return renderEmailStep();
            case "verification":
                return renderVerificationStep();
            case "reset":
                return renderResetStep();
            case "success":
                return renderSuccessStep();
            default:
                return renderEmailStep();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-20 animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-100 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full opacity-10 animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>

            {/* Back button */}
            <button
                onClick={handleBackStep}
                className={`absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-110 z-20 ${
                    isLoaded
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Main card */}
            <div
                className={`w-full max-w-md bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl p-8 relative z-10 transform transition-all duration-1000 ease-out ${
                    isLoaded
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-8 opacity-0 scale-95"
                }`}
            >
                {getStepContent()}
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-300 rounded-full opacity-40 animate-bounce"
                    style={{ animationDelay: "0s", animationDuration: "3s" }}
                ></div>
                <div
                    className="absolute top-3/4 right-1/4 w-2 h-2 bg-red-300 rounded-full opacity-40 animate-bounce"
                    style={{ animationDelay: "1s", animationDuration: "4s" }}
                ></div>
                <div
                    className="absolute top-1/2 right-1/3 w-1 h-1 bg-purple-300 rounded-full opacity-40 animate-bounce"
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
