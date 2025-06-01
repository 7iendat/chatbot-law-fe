import {
    Check,
    CircleUser,
    Globe,
    KeyRound,
    Laptop,
    LogOut,
    Moon,
    Sun,
    SunMoon,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "../contexts/AuthContext";
import { Theme, useTheme } from "../contexts/ThemeContext";

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
    const { logout } = useAuth();
    const { theme, setTheme, effectiveTheme } = useTheme();

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

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        setActiveSubmenu(null); // Đóng submenu sau khi chọn
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (submenuTimeoutRef.current) {
                clearTimeout(submenuTimeoutRef.current);
            }
        };
    }, []);

    const menuBgClass =
        effectiveTheme === "dark"
            ? "bg-gray-800/95 text-gray-200"
            : "bg-white/95 text-gray-700";
    const menuItemHoverBgClass =
        effectiveTheme === "dark"
            ? "hover:bg-gray-700/50 hover:text-white"
            : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-gray-900"; // Giữ nguyên gradient cho light
    const submenuBgClass =
        effectiveTheme === "dark" ? "bg-gray-700/95" : "bg-white/95";
    const submenuItemHoverBgClass =
        effectiveTheme === "dark"
            ? "hover:bg-gray-600/70"
            : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100";
    const borderColorClass =
        effectiveTheme === "dark" ? "border-gray-700/50" : "border-gray-200/50";

    return (
        <>
            <div
                className={`absolute bottom-full mt-2 left-0 ${
                    !collapsed ? "w-full" : "w-44" // Tăng chiều rộng một chút cho submenu theme
                } ${menuBgClass} backdrop-blur-sm border ${borderColorClass} rounded-xl shadow-2xl z-50 transition-all duration-300 ease-out transform ${
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
                    {/* Theme Submenu */}
                    <li>
                        <div
                            className="relative"
                            onMouseEnter={() =>
                                handleSubmenuMouseEnter("theme")
                            }
                            onMouseLeave={handleSubmenuMouseLeave}
                        >
                            <button
                                className={`w-full text-left text-sm rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group ${menuItemHoverBgClass}`}
                                onClick={() => toggleSubmenu("theme")}
                            >
                                <div className="flex items-center gap-3">
                                    <SunMoon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                    <span className="font-medium">Chủ đề</span>
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
                                <ul
                                    className={`${submenuBgClass} backdrop-blur-sm border ${borderColorClass} rounded-lg shadow-xl z-50 overflow-hidden w-36`}
                                >
                                    <li
                                        className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1 flex items-center justify-between ${submenuItemHoverBgClass}`}
                                        onClick={() =>
                                            handleThemeChange("light")
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            <Sun className="w-4 h-4" /> Sáng{" "}
                                            {/* Hoặc dùng icon ☀️ */}
                                        </span>
                                        {theme === "light" && (
                                            <Check className="w-4 h-4 text-blue-500" />
                                        )}
                                    </li>
                                    <li
                                        className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1 flex items-center justify-between ${submenuItemHoverBgClass}`}
                                        onClick={() =>
                                            handleThemeChange("dark")
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            <Moon className="w-4 h-4" /> Tối{" "}
                                            {/* Hoặc dùng icon 🌙 */}
                                        </span>
                                        {theme === "dark" && (
                                            <Check className="w-4 h-4 text-blue-500" />
                                        )}
                                    </li>
                                    <li
                                        className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1 flex items-center justify-between ${submenuItemHoverBgClass}`}
                                        onClick={() =>
                                            handleThemeChange("system")
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            <Laptop className="w-4 h-4" /> Hệ
                                            thống
                                        </span>
                                        {theme === "system" && (
                                            <Check className="w-4 h-4 text-blue-500" />
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>

                    {/* Profile Button */}
                    <li>
                        <button
                            className={`w-full text-left text-sm rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group ${
                                effectiveTheme === "dark"
                                    ? "hover:bg-gray-700/50 hover:text-white"
                                    : "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-gray-900"
                            }`}
                            onClick={handleProfileClick}
                        >
                            <div className="flex items-center gap-3">
                                <CircleUser className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                                <span className="font-medium">
                                    Hồ sơ người dùng
                                </span>
                            </div>
                        </button>
                    </li>

                    {/* Language Submenu */}
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
                                className={`w-full text-left text-sm rounded-lg p-3 flex items-center gap-3 transition-all duration-200 ease-in-out transform hover:scale-[1.02] group ${
                                    effectiveTheme === "dark"
                                        ? "hover:bg-gray-700/50 hover:text-white"
                                        : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:text-gray-900"
                                }`}
                            >
                                <Globe className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                <span className="font-medium">Ngôn ngữ</span>
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
                                <ul
                                    className={`${submenuBgClass} backdrop-blur-sm border ${borderColorClass} rounded-lg shadow-xl z-50 overflow-hidden w-36`}
                                >
                                    <li
                                        className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1 ${submenuItemHoverBgClass}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            🇺🇸 Tiếng anh
                                        </span>
                                    </li>
                                    <li
                                        className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 ease-in-out transform hover:translate-x-1 ${submenuItemHoverBgClass}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            🇻🇳 Tiếng Việt
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>

                    {/* Change Password Button */}
                    <li>
                        <button
                            className={`w-full text-left text-sm rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group ${
                                effectiveTheme === "dark"
                                    ? "hover:bg-gray-700/50 hover:text-white"
                                    : "hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-gray-900"
                            }`}
                            onClick={handleChangePasswordClick}
                        >
                            <div className="flex items-center gap-3">
                                <KeyRound className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                <span className="font-medium">
                                    Đổi mật khẩu
                                </span>
                            </div>
                        </button>
                    </li>

                    {/* Logout Button */}
                    <li>
                        <button
                            onClick={logout}
                            className={`w-full text-left text-sm rounded-lg p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] group ${
                                effectiveTheme === "dark"
                                    ? "hover:bg-red-700/50 hover:text-red-400"
                                    : "hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                                <span className="font-medium">Đăng xuất</span>
                            </div>
                        </button>
                    </li>
                </ul>
            </div>
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                // Truyền theme vào modal nếu cần
            />
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                // Truyền theme vào modal nếu cần
            />
        </>
    );
};

export default MenuDropProfile;
