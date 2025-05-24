"use client";

import { on } from "events";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { authApi } from "../services/authApis";
import { toast } from "react-hot-toast";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    isOpen,
    onClose,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [error, setError] = useState("");

    // Handle modal opening/closing animations
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setShouldRender(false), 300);
        }
    }, [isOpen]);

    // Reset form when modal closes
    const handleClose = () => {
        setPasswordData({
            current_password: "",
            new_password: "",
        });
        setError("");
        onClose();
    };

    const handleChangePassword = async (passwordData: any) => {
        try {
            const res = await authApi.changePassword(
                passwordData.current_password,
                passwordData.new_password
            );
            toast.success(res.message);
            handleClose();
            return res;
        } catch (error: any) {
            setError(error.message || "Đã xảy ra lỗi khi đổi mật khẩu");
            throw new Error(error.message || "Đã xảy ra lỗi khi đổi mật khẩu");
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setError("");

            // Validation
            if (!passwordData.current_password || !passwordData.new_password) {
                setError("Vui lòng điền đầy đủ thông tin");
                return;
            }

            if (passwordData.new_password.length < 6) {
                setError("Mật khẩu mới phải có ít nhất 6 ký tự");
                return;
            }
            setIsChangingPassword(true);
            await handleChangePassword(passwordData);
        } catch (error: any) {
            setError(error.message || "Đã xảy ra lỗi khi đổi mật khẩu");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Check if the click is outside the modal
            if (modalRef.current && !modalRef.current.contains(target)) {
                handleClose();
            }
        };

        if (isOpen) {
            // Add a small delay to prevent immediate triggering
            const timeoutId = setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 100);

            document.body.style.overflow = "hidden";

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
                isAnimating
                    ? "bg-black/50 backdrop-blur-sm"
                    : "bg-black/0 backdrop-blur-0"
            }`}
        >
            <div
                ref={modalRef}
                className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md relative transition-all duration-300 ease-out transform ${
                    isAnimating
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4"
                }`}
                style={{
                    boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 text-white relative overflow-hidden rounded-t-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-red-400/20 animate-pulse"></div>
                    <button
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:rotate-90"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Đổi mật khẩu</h2>
                        <p className="text-white/80 text-sm">
                            Cập nhật mật khẩu mới cho tài khoản
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu hiện tại
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={passwordData.current_password}
                                    onChange={(e) =>
                                        setPasswordData((prev) => ({
                                            ...prev,
                                            current_password: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={passwordData.new_password}
                                    onChange={(e) =>
                                        setPasswordData((prev) => ({
                                            ...prev,
                                            new_password: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isChangingPassword
                                    ? "Đang xử lý..."
                                    : "Cập nhật"}
                            </button>
                            <button
                                type="button"
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
                                onClick={handleClose}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
