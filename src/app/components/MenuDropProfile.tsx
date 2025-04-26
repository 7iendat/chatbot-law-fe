import { CircleUser, Globe, LogOut, SunMoon } from "lucide-react";
import React, { useState } from "react";
import ProfileModal from "./ProfileModal";

const MenuDropProfile = () => {
    const [activeSubmenu, setActiveSubmenu] = useState<
        null | "language" | "theme"
    >(null);

    const toggleSubmenu = (name: "language" | "theme") => {
        setActiveSubmenu((prev) => (prev === name ? null : name));
    };
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleProfileClick = () => {
        setShowProfileModal(true);
    };

    return (
        <>
            <div className="absolute bottom-full mt-2 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <ul className="space-y-2 p-3">
                    <li>
                        <button
                            className="w-full text-left text-sm text-gray-700 hover:bg-gray-200 rounded-md p-2 cursor-pointer"
                            onClick={() => toggleSubmenu("theme")}
                        >
                            <div className="flex items-center gap-2">
                                <SunMoon />
                                Themes
                            </div>
                        </button>
                        {activeSubmenu === "theme" && (
                            <ul className="absolute left-full top-0 ml-2 bg-white border border-gray-300 rounded-md shadow-md z-50">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                    Dark
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                    Light
                                </li>
                            </ul>
                        )}
                    </li>

                    <li>
                        <button
                            className="w-full text-left text-sm text-gray-700 hover:bg-gray-200 rounded-md p-2 cursor-pointer"
                            onClick={handleProfileClick}
                        >
                            <div className="flex items-center gap-2">
                                <CircleUser />
                                Profile
                            </div>
                        </button>
                    </li>

                    <li>
                        <div className="relative">
                            <button
                                onClick={() => toggleSubmenu("language")}
                                className="w-full text-left text-sm text-gray-700 hover:bg-gray-200 rounded-md p-2 flex items-center gap-2"
                            >
                                <Globe />
                                Language
                            </button>
                            {activeSubmenu === "language" && (
                                <ul className="absolute left-full top-0 ml-2 bg-white border border-gray-300 rounded-md shadow-md z-50">
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                        English
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                        Vietnamese
                                    </li>
                                </ul>
                            )}
                        </div>
                    </li>

                    <li>
                        <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-200 rounded-md p-2 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <LogOut />
                                Logout
                            </div>
                        </button>
                    </li>
                </ul>
            </div>
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </>
    );
};

export default MenuDropProfile;
