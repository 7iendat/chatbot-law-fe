"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handleRegister = useCallback(async () => {
        setError("");

        if (!email || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            toast.error("Vui lòng điền đầy đủ thông tin.", { duration: 2000 });
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
                duration: 1000,
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
            await registerApi(email, password);
            toast.success("Đăng ký thành công! 🎉", { duration: 1000 });
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
            toast.error(err.message || "Đăng ký thất bại. Vui lòng thử lại.", {
                duration: 1000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [email, password, confirmPassword, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
            {" "}
            <Toaster position="top-center" reverseOrder={false} />
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-400/50">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Đăng ký tài khoản
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
                        className="w-full p-3 border border-gray-300 rounded outline-none pr-12 focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {showPassword ? <Eye /> : <EyeClosed />}
                    </button>
                </div>

                <div className="relative mb-4">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full p-3 border border-gray-300 rounded outline-none pr-12 focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {showConfirmPassword ? <Eye /> : <EyeClosed />}
                    </button>
                </div>

                <button
                    onClick={handleRegister}
                    type="button"
                    disabled={isLoading}
                    className={`w-full py-2 rounded transition text-white cursor-pointer ${
                        isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
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
