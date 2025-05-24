import { CircleUser, Globe, KeyRound, LogOut, SunMoon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";
import { authApi } from "../services/authApis";
import { toast } from "react-hot-toast";
import ChangePasswordModal from "./ChangePasswordModal";

const MenuDropProfile = ({ collapsed }: any) => {
    const [activeSubmenu, setActiveSubmenu] = useState<
        null | "language" | "theme"
    >(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showChangePasswordModal, setShowChangePasswordModal] =
        useState(false);
    const handleChangePasswordClick = () => {
        setShowChangePasswordModal(true);
    };
    const handleLogout = async () => {
        try {
            const res = await authApi.logout();
            console.log(res);
            if (res.message) localStorage.removeItem("accessToken");
            toast.success("Đăng xuất thành công");
            window.location.href = "/login";
        } catch (error) {
            toast.error("Đăng xuất không thành công");
        }
    };

    // Animate in when component mounts
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const toggleSubmenu = (name: "language" | "theme") => {
        // Clear any existing timeout
        if (submenuTimeoutRef.current) {
            clearTimeout(submenuTimeoutRef.current);
        }

        setActiveSubmenu((prev) => (prev === name ? null : name));
    };

    const handleProfileClick = () => {
        setShowProfileModal(true);
    };

    const handleSubmenuMouseEnter = (name: "language" | "theme") => {
        if (submenuTimeoutRef.current) {
            clearTimeout(submenuTimeoutRef.current);
        }
        setActiveSubmenu(name);
    };

    const handleSubmenuMouseLeave = () => {
        submenuTimeoutRef.current = setTimeout(() => {
            setActiveSubmenu(null);
        }, 150); // Small delay to prevent flickering
    };

    const handleSubmenuMouseEnterStay = () => {
        if (submenuTimeoutRef.current) {
            clearTimeout(submenuTimeoutRef.current);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (submenuTimeoutRef.current) {
                clearTimeout(submenuTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div
                className={`absolute bottom-full mt-2 left-0 ${
                    !collapsed ? "w-full" : "w-40"
                } bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-2xl z-50 transition-all duration-300 ease-out transform ${
                    isVisible
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-2 scale-95"
                }`}
                style={{
                    backdropFilter: "blur(10px)",
                    boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
            >
                <ul className="space-y-1 p-3">
                    <li>
                        <div
                            className="relative"
                            onMouseEnter={() =>
                                handleSubmenuMouseEnter("theme")
                            }
                            onMouseLeave={handleSubmenuMouseLeave}
                        >
                            <button
                                className="w-full text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-gray-900 rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group"
                                onClick={() => toggleSubmenu("theme")}
                            >
                                <div className="flex items-center gap-3">
                                    <SunMoon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                    <span className="font-medium">Themes</span>
                                </div>
                            </button>
                            <div
                                className={`absolute left-full top-0 ml-2 transition-all duration-200 ease-out transform ${
                                    activeSubmenu === "theme"
                                        ? "opacity-100 translate-x-0 scale-100 visible"
                                        : "opacity-0 -translate-x-2 scale-95 invisible"
                                }`}
                                onMouseEnter={handleSubmenuMouseEnterStay}
                                onMouseLeave={handleSubmenuMouseLeave}
                            >
                                <ul className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <li className="px-4 w-32 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1">
                                        <span className="flex  items-center gap-2">
                                            🌙 Dark
                                        </span>
                                    </li>
                                    <li className="px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1">
                                        <span className="flex items-center gap-2">
                                            ☀️ Light
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>

                    <li>
                        <button
                            className="w-full text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-gray-900 rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group"
                            onClick={handleProfileClick}
                        >
                            <div className="flex items-center gap-3">
                                <CircleUser className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                                <span className="font-medium">Profile</span>
                            </div>
                        </button>
                    </li>

                    <li>
                        <div
                            className="relative"
                            onMouseEnter={() =>
                                handleSubmenuMouseEnter("language")
                            }
                            onMouseLeave={handleSubmenuMouseLeave}
                        >
                            <button
                                onClick={() => toggleSubmenu("language")}
                                className="w-full text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:text-gray-900 rounded-lg p-3 flex items-center gap-3 transition-all duration-200 ease-in-out transform hover:scale-[1.02] group"
                            >
                                <Globe className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                <span className="font-medium">Language</span>
                            </button>
                            <div
                                className={`absolute left-full top-0 ml-2 transition-all duration-200 ease-out transform ${
                                    activeSubmenu === "language"
                                        ? "opacity-100 translate-x-0 scale-100 visible"
                                        : "opacity-0 -translate-x-2 scale-95 invisible"
                                }`}
                                onMouseEnter={handleSubmenuMouseEnterStay}
                                onMouseLeave={handleSubmenuMouseLeave}
                            >
                                <ul className="bg-white/95 w-34 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <li className="px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1">
                                        <span className="flex items-center gap-2">
                                            🇺🇸 English
                                        </span>
                                    </li>
                                    <li className="px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1">
                                        <span className="flex items-center gap-2">
                                            🇻🇳 Vietnamese
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>

                    <li>
                        <button
                            className="w-full text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-gray-900 rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group"
                            onClick={handleChangePasswordClick}
                        >
                            <div className="flex items-center gap-3">
                                <KeyRound className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                <span className="font-medium">
                                    Change Password
                                </span>
                            </div>
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                                <span className="font-medium">Logout</span>
                            </div>
                        </button>
                    </li>
                </ul>
            </div>
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />

            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
        </>
    );
};

export default MenuDropProfile;
