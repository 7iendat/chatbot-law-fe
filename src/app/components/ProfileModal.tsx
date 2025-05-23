import React, { useEffect, useRef, useState } from "react";
import { User, Mail, Shield, Crown, Calendar, X } from "lucide-react";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: {
        name: string;
        email: string;
        role: string;
        plan: string;
        joinedAt: string;
    };
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
    user,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Default user data
    const defaultUser = {
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        role: "Quản trị viên",
        plan: "Gói Pro",
        joinedAt: "12/02/2024",
    };

    const userData = user || defaultUser;

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

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    const profileItems = [
        {
            icon: User,
            label: "Họ tên",
            value: userData.name,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            icon: Mail,
            label: "Email",
            value: userData.email,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            icon: Shield,
            label: "Vai trò",
            value: userData.role,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            icon: Crown,
            label: "Gói tài khoản",
            value: userData.plan,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            icon: Calendar,
            label: "Ngày tham gia",
            value: userData.joinedAt,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
        },
    ];

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
                className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md h-[90vh] relative overflow-auto scrollbar-hide transition-all duration-300 ease-out transform ${
                    isAnimating
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4"
                }`}
                style={{
                    boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    scrollbarGutter: "stable",
                }}
            >
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                    <button
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 focus:text-white focus:bg-white/20 active:text-white active:bg-white/20 rounded-full p-2 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:rotate-90 focus:scale-110 focus:rotate-90 active:scale-110 active:rotate-90"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm animate-pulse">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            Thông tin người dùng
                        </h2>
                        <p className="text-white/80 text-sm">
                            Chi tiết tài khoản của bạn
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        {profileItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] group"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation: isAnimating
                                            ? "slideInUp 0.5s ease-out forwards"
                                            : "none",
                                    }}
                                >
                                    <div
                                        className={`${item.bgColor} ${item.color} p-3 rounded-xl transition-all duration-200 group-hover:scale-110`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600 mb-1 block">
                                                {item.label}
                                            </span>
                                        </div>
                                        <span className="text-gray-900 font-semibold">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                            onClick={() => {
                                console.log("Edit profile clicked");
                            }}
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .scrollbar-hide {
                    scrollbar-width: auto; /* Firefox */
                    -ms-overflow-style: auto; /* IE and Edge */
                }

                .scrollbar-hide::-webkit-scrollbar {
                    width: 8px;
                }

                .scrollbar-hide::-webkit-scrollbar-track {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.95
                    ); /* Match modal background */
                }

                .scrollbar-hide::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    border-radius: 4px;
                    border: 2px solid rgba(255, 255, 255, 0.95); /* Match modal background */
                    background-clip: content-box;
                    transition: background-color 0.2s ease;
                }

                .scrollbar-hide:hover::-webkit-scrollbar-thumb,
                .scrollbar-hide:active::-webkit-scrollbar-thumb,
                .scrollbar-hide:focus::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.95); /* Match modal background */
                }

                .scrollbar-hide::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0, 0, 0, 0.5);
                }
            `}</style>
        </div>
    );
};

export default ProfileModal;
