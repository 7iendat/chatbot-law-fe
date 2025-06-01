"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext"; // Giả sử bạn có AuthContext
import Image from "next/image";
import {
    User,
    Lock,
    Mail,
    Bell,
    Settings as SettingsIcon,
    Save,
    Image as ImageIcon,
    Globe,
} from "lucide-react";
import { authApi } from "../services/authApis";
import toast from "react-hot-toast";

// Giả sử bạn có các API service (sẽ cần tạo)
// import { adminSettingsApi } from '@/app/services/adminSettingsApi';

interface UserProfileData {
    username: string;
    email: string;
    avatar_url: string | null;
}

interface SystemSettingsData {
    siteName: string;
    siteLogoUrl: string | null;
    defaultLanguage: string;
    maintenanceMode: boolean;
    adminEmail: string;
}

const AdminSettingsPage = () => {
    const { user: currentUser } = useAuth(); // Giả sử updateUserContext để cập nhật context sau khi sửa
    const [activeSettingsTab, setActiveSettingsTab] = useState<
        "profile" | "system" | "notifications"
    >("profile");

    // --- Profile Settings State ---
    const [profileData, setProfileData] = useState<UserProfileData>({
        username: "",
        email: "",
        avatar_url: null,
    });
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // --- System Settings State ---
    const [systemSettings, setSystemSettings] = useState<SystemSettingsData>({
        siteName: "JuriBot Platform",
        siteLogoUrl: "/logo_bot.png", // Default logo
        defaultLanguage: "vi",
        maintenanceMode: false,
        adminEmail: "admin@juribot.com",
    });
    const [systemLoading, setSystemLoading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        systemSettings.siteLogoUrl
    );

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                username: currentUser.username || "",
                email: currentUser.email || "",
                avatar_url: currentUser.avatar_url || null,
            });
            setAvatarPreview(currentUser.avatar_url || null);
        }
        // TODO: Fetch system settings từ API
        // const fetchSystemSettings = async () => {
        //   setSystemLoading(true);
        //   try {
        //     const settings = await adminSettingsApi.getSystemSettings();
        //     setSystemSettings(settings);
        //     setLogoPreview(settings.siteLogoUrl);
        //   } catch (error) {
        //     console.error("Failed to fetch system settings", error);
        //     // showToast("Lỗi tải cài đặt hệ thống", "error");
        //   } finally {
        //     setSystemLoading(false);
        //   }
        // };
        // fetchSystemSettings();
    }, [currentUser]);

    const handleProfileInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // const handleUpdateProfile = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setProfileLoading(true);
    //     try {
    //         // TODO: Gọi API cập nhật profile (username, avatar)
    //         // const formDataToSubmit = new FormData();
    //         // formDataToSubmit.append('username', profileData.username);
    //         // if (avatarFile) {
    //         //   formDataToSubmit.append('avatar', avatarFile);
    //         // }
    //         // const updatedUser = await adminSettingsApi.updateProfile(formDataToSubmit);
    //         // updateUserContext(updatedUser); // Cập nhật user trong context
    //         // showToast("Cập nhật thông tin thành công!", "success");
    //         console.log(
    //             "Updating profile (simulated):",
    //             profileData,
    //             avatarFile
    //         );
    //         alert("Cập nhật thông tin thành công! (Giả lập)");
    //         if (avatarPreview && avatarFile) {
    //             // Giả lập cập nhật avatar trong context
    //             if (updateUserContext && currentUser)
    //                 updateUserContext({
    //                     ...currentUser,
    //                     username: profileData.username,
    //                     avatar_url: avatarPreview,
    //                 });
    //         } else if (updateUserContext && currentUser) {
    //             if (updateUserContext && currentUser)
    //                 updateUserContext({
    //                     ...currentUser,
    //                     username: profileData.username,
    //                 });
    //         }
    //     } catch (error) {
    //         console.error("Failed to update profile", error);
    //         // showToast("Lỗi cập nhật thông tin", "error");
    //         alert("Lỗi cập nhật thông tin (Giả lập)");
    //     } finally {
    //         setProfileLoading(false);
    //     }
    // };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            // showToast("Mật khẩu xác nhận không khớp!", "error");
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (newPassword.length < 6) {
            // showToast("Mật khẩu phải có ít nhất 6 ký tự!", "error");
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }
        setPasswordLoading(true);
        try {
            // TODO: Gọi API thay đổi mật khẩu
            // await adminSettingsApi.changePassword({ newPassword });
            // showToast("Đổi mật khẩu thành công!", "success");
            await authApi.changePassword(currentPassword, newPassword);
            toast.success("Đổi mật khẩu thành công");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Failed to change password", error);
            // showToast("Lỗi đổi mật khẩu", "error");
            toast.error("Lỗi đổi mật khẩu");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSystemSettingsInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setSystemSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleUpdateSystemSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSystemLoading(true);
        try {
            // TODO: Gọi API cập nhật system settings
            // const formDataToSubmit = new FormData();
            // Object.keys(systemSettings).forEach(key => {
            //     formDataToSubmit.append(key, systemSettings[key as keyof SystemSettingsData] as string | Blob);
            // });
            // if (logoFile) {
            //   formDataToSubmit.append('siteLogo', logoFile);
            // }
            // const updatedSettings = await adminSettingsApi.updateSystemSettings(formDataToSubmit);
            // setSystemSettings(updatedSettings);
            // if (updatedSettings.siteLogoUrl) setLogoPreview(updatedSettings.siteLogoUrl);
            // showToast("Cập nhật cài đặt hệ thống thành công!", "success");
            console.log(
                "Updating system settings (simulated):",
                systemSettings,
                logoFile
            );
            alert("Cập nhật cài đặt hệ thống thành công! (Giả lập)");
        } catch (error) {
            console.error("Failed to update system settings", error);
            // showToast("Lỗi cập nhật cài đặt hệ thống", "error");
            alert("Lỗi cập nhật cài đặt hệ thống (Giả lập)");
        } finally {
            setSystemLoading(false);
        }
    };

    const renderProfileSettings = () => (
        <div className="space-y-8">
            {/* Update Profile Section */}
            <form
                // onSubmit={handleUpdateProfile}
                className="bg-white p-6 rounded-lg shadow"
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Thông tin cá nhân
                </h3>
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Tên người dùng
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={profileData.username}
                            onChange={handleProfileInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={profileData.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                            readOnly
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email không thể thay đổi.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ảnh đại diện
                        </label>
                        <div className="flex items-center gap-4">
                            <Image
                                src={avatarPreview || "/profile.png"}
                                alt="Avatar Preview"
                                width={80}
                                height={80}
                                className="rounded-full object-cover border border-gray-300"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "/profile.png";
                                }}
                            />
                            <label
                                htmlFor="avatarUpload"
                                className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 text-sm"
                            >
                                <ImageIcon size={16} className="inline mr-2" />{" "}
                                Thay đổi ảnh
                                <input
                                    id="avatarUpload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                    >
                        {profileLoading ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        ) : (
                            <Save size={16} className="mr-2" />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </form>

            {/* Change Password Section */}
            <form
                onSubmit={handleChangePassword}
                className="bg-white p-6 rounded-lg shadow"
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Đổi mật khẩu
                </h3>

                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mật khẩu cũ
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            minLength={6}
                        />
                        {newPassword &&
                            confirmPassword &&
                            newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">
                                    Mật khẩu xác nhận không khớp.
                                </p>
                            )}
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                    >
                        {passwordLoading ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        ) : (
                            <Lock size={16} className="mr-2" />
                        )}
                        Đổi mật khẩu
                    </button>
                </div>
            </form>
        </div>
    );

    const renderSystemSettings = () => (
        <form
            onSubmit={handleUpdateSystemSettings}
            className="bg-white p-6 rounded-lg shadow space-y-6"
        >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cài đặt hệ thống
            </h3>
            <div>
                <label
                    htmlFor="siteName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Tên trang web
                </label>
                <input
                    type="text"
                    name="siteName"
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={handleSystemSettingsInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo trang web
                </label>
                <div className="flex items-center gap-4">
                    <Image
                        src={logoPreview || "/logo_icon.png"} // Fallback logo
                        alt="Site Logo Preview"
                        width={logoPreview ? 120 : 40} // Adjust size based on if preview exists
                        height={40}
                        className="object-contain border border-gray-300 p-1 rounded"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "/logo_icon.png";
                        }}
                    />
                    <label
                        htmlFor="logoUpload"
                        className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 text-sm"
                    >
                        <ImageIcon size={16} className="inline mr-2" /> Thay đổi
                        logo
                        <input
                            id="logoUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                        />
                    </label>
                </div>
            </div>
            <div>
                <label
                    htmlFor="defaultLanguage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Ngôn ngữ mặc định
                </label>
                <select
                    name="defaultLanguage"
                    id="defaultLanguage"
                    value={systemSettings.defaultLanguage}
                    onChange={handleSystemSettingsInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                </select>
            </div>
            <div>
                <label
                    htmlFor="adminEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email quản trị
                </label>
                <input
                    type="email"
                    name="adminEmail"
                    id="adminEmail"
                    value={systemSettings.adminEmail}
                    onChange={handleSystemSettingsInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Email nhận các thông báo quan trọng của hệ thống.
                </p>
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="maintenanceMode"
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onChange={handleSystemSettingsInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                    htmlFor="maintenanceMode"
                    className="ml-2 block text-sm text-gray-900"
                >
                    Chế độ bảo trì
                </label>
            </div>
            {systemSettings.maintenanceMode && (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                    <Globe size={16} className="inline mr-1" /> Khi bật, người
                    dùng thông thường sẽ thấy trang bảo trì. Admin vẫn truy cập
                    được.
                </p>
            )}
            <div className="mt-6">
                <button
                    type="submit"
                    disabled={systemLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                >
                    {systemLoading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    ) : (
                        <Save size={16} className="mr-2" />
                    )}
                    Lưu cài đặt hệ thống
                </button>
            </div>
        </form>
    );

    const renderNotificationSettings = () => (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cài đặt thông báo
            </h3>
            <p className="text-gray-600">
                Cấu hình thông báo qua email, thông báo trong ứng dụng, v.v.
                (Chức năng này đang được phát triển).
            </p>
            {/* Ví dụ: */}
            {/* <div className="mt-4 space-y-3">
                <div className="flex items-center">
                    <input id="emailNewUser" name="emailNewUser" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="emailNewUser" className="ml-2 block text-sm text-gray-900">Gửi email chào mừng người dùng mới</label>
                </div>
                 <div className="flex items-center">
                    <input id="emailPasswordReset" name="emailPasswordReset" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="emailPasswordReset" className="ml-2 block text-sm text-gray-900">Gửi email khi có yêu cầu đặt lại mật khẩu</label>
                </div>
            </div>
            <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu cài đặt thông báo</button> */}
        </div>
    );

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-700">
                    Đang tải thông tin người dùng...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cài đặt tài khoản và hệ thống
            </h2>

            <div className="sm:hidden mb-4">
                <label htmlFor="tabs" className="sr-only">
                    Chọn một tab
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
                    onChange={(e) =>
                        setActiveSettingsTab(e.target.value as any)
                    }
                    value={activeSettingsTab}
                >
                    <option value="profile">Thông tin cá nhân</option>
                    <option value="system">Hệ thống</option>
                    <option value="notifications">Thông báo</option>
                </select>
            </div>

            <div className="hidden sm:block mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveSettingsTab("profile")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                                ${
                                    activeSettingsTab === "profile"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <User size={18} className="mr-2" /> Thông tin cá
                            nhân
                        </button>
                        <button
                            onClick={() => setActiveSettingsTab("system")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                                ${
                                    activeSettingsTab === "system"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <SettingsIcon size={18} className="mr-2" /> Hệ thống
                        </button>
                        <button
                            onClick={() =>
                                setActiveSettingsTab("notifications")
                            }
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                                ${
                                    activeSettingsTab === "notifications"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Bell size={18} className="mr-2" /> Thông báo
                        </button>
                    </nav>
                </div>
            </div>

            <div>
                {activeSettingsTab === "profile" && renderProfileSettings()}
                {activeSettingsTab === "system" && renderSystemSettings()}
                {activeSettingsTab === "notifications" &&
                    renderNotificationSettings()}
            </div>
        </div>
    );
};

export default AdminSettingsPage;
