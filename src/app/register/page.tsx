"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeClosed,
    Mail,
    Lock,
    UserPlus,
    ArrowLeft,
    Check,
    X,
    User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../services/authApis";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [focusedField, setFocusedField] = useState("");

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const registerApi = async (email: string, password: string) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (email !== "admin@gmail.com") {
                    resolve();
                } else {
                    reject(new Error("Email đã được đăng ký."));
                }
            }, 1000);
        });
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidUsername = (username: string) => {
        username = username.trim();
        const minLength = 4;
        const maxLength = 30;

        if (username.length === 0) return true; // Allow empty during typing
        if (username.length < minLength || username.length > maxLength) {
            return false; // Invalid length
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return false; // Invalid characters
        }

        return true;
    };

    const getUsernameError = (username: string) => {
        username = username.trim();
        const minLength = 4;
        const maxLength = 30;

        if (username.length === 0) return "";
        if (username.length < minLength || username.length > maxLength) {
            return "Tên người dùng phải từ 4 đến 30 ký tự.";
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return "Tên người dùng chỉ có thể chứa chữ cái, số và dấu gạch dưới (_).";
        }

        return "";
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: "", color: "" };

        let strength = 0;
        const checks = {
            length: password.length,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        // Length-based scoring
        if (checks.length >= 12) strength += 2;
        else if (checks.length >= 8) strength += 1;
        else if (checks.length < 6) strength = 1; // Minimum strength for short passwords

        // Additional criteria
        if (checks.hasUpperCase) strength += 1;
        if (checks.hasLowerCase) strength += 1;
        if (checks.hasNumber) strength += 1;
        if (checks.hasSpecialChar) strength += 1;

        // Enforce special character for higher strength levels
        if (!checks.hasSpecialChar && strength > 3) strength = 3;

        // Cap strength at 5
        strength = Math.min(strength, 5);

        // Map strength to label and color
        const strengthMap = [
            { strength: 0, label: "", color: "" },
            { strength: 1, label: "Rất yếu", color: "text-red-600" },
            { strength: 2, label: "Yếu", color: "text-red-500" },
            { strength: 3, label: "Trung bình", color: "text-yellow-500" },
            { strength: 4, label: "Mạnh", color: "text-green-500" },
            { strength: 5, label: "Rất mạnh", color: "text-green-600" },
        ];

        return (
            strengthMap.find((item) => item.strength === strength) ||
            strengthMap[0]
        );
    };

    const passwordMatch =
        password && confirmPassword && password === confirmPassword;
    const passwordStrength = getPasswordStrength(password);

    const handleRegister = useCallback(async () => {
        setError("");

        if (!username || !email || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            toast.error("Vui lòng điền đầy đủ thông tin.", { duration: 2000 });
            return;
        }

        // Check username validity
        const usernameError = getUsernameError(username);
        if (usernameError) {
            setError(usernameError);
            toast.error(usernameError, { duration: 2000 });
            return;
        }

        if (!isValidEmail(email)) {
            setError("Email không hợp lệ.");
            toast.error("Email không hợp lệ.", { duration: 2000 });
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            toast.error("Mật khẩu phải có ít nhất 6 ký tự.", {
                duration: 2000,
            });
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu nhập lại không khớp.");
            toast.error("Mật khẩu nhập lại không khớp.", { duration: 2000 });
            return;
        }

        setIsLoading(true);

        try {
            const res = await authApi.register(username, password, email);
            toast.success(res.message || "Đăng ký thành công! 🎉", {
                duration: 1500,
            });

            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
            toast.error(err.message || "Đăng ký thất bại. Vui lòng thử lại.", {
                duration: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [username, email, password, confirmPassword, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 text-black p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full opacity-10 animate-pulse"
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

            {/* Main register card */}
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
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Đăng ký tài khoản
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Tạo tài khoản Angel AI của bạn
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
                        {error}
                    </div>
                )}

                {/* Username input */}
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
                            <User className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (error) setError("");
                            }}
                            onFocus={() => setFocusedField("username")}
                            onBlur={() => setFocusedField("")}
                            placeholder="Username"
                            className={`w-full p-4 pl-12 border rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                                focusedField === "username"
                                    ? "border-green-400 bg-white shadow-lg ring-4 ring-green-100 transform scale-[1.02]"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                        />
                        {username && isValidUsername(username) && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                        )}
                    </div>
                </div>

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
                                    ? "border-green-400 bg-white shadow-lg ring-4 ring-green-100 transform scale-[1.02]"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                        />
                        {email && isValidEmail(email) && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Password input */}
                <div
                    className={`mb-4 transform transition-all duration-1000 ease-out ${
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
                                    ? "border-green-400 bg-white shadow-lg ring-4 ring-green-100 transform scale-[1.02]"
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

                    {/* Password strength indicator */}
                    {password && (
                        <div className="mt-2 px-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">
                                    Độ mạnh mật khẩu:
                                </span>
                                <span
                                    className={`text-xs font-semibold ${passwordStrength.color}`}
                                >
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        passwordStrength.strength === 0
                                            ? "bg-gray-200 w-0"
                                            : passwordStrength.strength === 1
                                            ? "bg-red-600 w-1/5"
                                            : passwordStrength.strength === 2
                                            ? "bg-red-500 w-2/5"
                                            : passwordStrength.strength === 3
                                            ? "bg-yellow-500 w-3/5"
                                            : passwordStrength.strength === 4
                                            ? "bg-green-500 w-4/5"
                                            : passwordStrength.strength === 5
                                            ? "bg-green-600 w-full"
                                            : "w-0"
                                    }`}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password input */}
                <div
                    className={`mb-6 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "700ms" }}
                >
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (error) setError("");
                            }}
                            onFocus={() => setFocusedField("confirmPassword")}
                            onBlur={() => setFocusedField("")}
                            placeholder="Nhập lại mật khẩu"
                            className={`w-full p-4 pl-12 pr-12 border rounded-xl outline-none transition-all duration-300 bg-gray-50/50 ${
                                focusedField === "confirmPassword"
                                    ? "border-green-400 bg-white shadow-lg ring-4 ring-green-100 transform scale-[1.02]"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer transition-all duration-200 hover:scale-110"
                        >
                            {showConfirmPassword ? (
                                <Eye className="w-5 h-5" />
                            ) : (
                                <EyeClosed className="w-5 h-5" />
                            )}
                        </button>

                        {/* Password match indicator */}
                        {confirmPassword && (
                            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                                {passwordMatch ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <X className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Register button */}
                <button
                    onClick={handleRegister}
                    type="button"
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform cursor-pointer ${
                        isLoading
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    } ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "800ms" }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang đăng ký...
                        </div>
                    ) : (
                        "Đăng ký"
                    )}
                </button>

                {/* Login link */}
                <p
                    className={`mt-6 text-sm text-center text-gray-600 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "900ms" }}
                >
                    Đã có tài khoản?{" "}
                    <span
                        onClick={() => router.push("/login")}
                        className="text-green-600 hover:text-blue-600 hover:underline cursor-pointer font-semibold transition-all duration-200 hover:scale-105 inline-block"
                    >
                        Đăng nhập
                    </span>
                </p>

                {/* Password requirements */}
                <div
                    className={`mt-6 p-4 bg-green-50 rounded-lg border border-green-200 transform transition-all duration-1000 ease-out ${
                        isLoaded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "1000ms" }}
                >
                    <p className="text-xs text-green-600 font-semibold mb-2">
                        Yêu cầu mật khẩu:
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                        <li className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    password.match(/[!@#$%^&*(),.?":{}|<>]/)
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                }`}
                            ></div>
                            Chứa kí tự đặc biệt (khuyến nghị)
                        </li>
                        <li className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    password.length >= 8
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                }`}
                            ></div>
                            Từ 8 ký tự trở lên (khuyến nghị)
                        </li>
                        <li className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    /[A-Z]/.test(password) &&
                                    /[0-9]/.test(password)
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                }`}
                            ></div>
                            Chứa chữ hoa và số (khuyến nghị)
                        </li>
                    </ul>
                </div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300 rounded-full opacity-40 animate-bounce"
                    style={{ animationDelay: "0s", animationDuration: "3s" }}
                ></div>
                <div
                    className="absolute top-3/4 right-1/4 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-bounce"
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
