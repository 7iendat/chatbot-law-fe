import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import MenuDropPorofile from "./MenuDropProfile";

interface SidebarProps {
    collapsed?: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!event.target.closest(".relative")) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="flex flex-col justify-between h-full mx-3 py-4">
                {/* TOP: Logo + Lịch sử */}
                <div className="flex flex-col gap-4">
                    <div
                        className={`transition-all duration-300 ${
                            collapsed ? "text-center" : ""
                        }`}
                    >
                        <div className="flex items-center justify-start hover:cursor-pointer gap-2 mb-4 hover:bg-gray-200 rounded-xl p-2">
                            <Image
                                width={40}
                                height={40}
                                src="/logo.jpg"
                                alt="Logo"
                                className={`rounded-full ${
                                    collapsed ? "hidden" : "block"
                                }`}
                            />
                            <h1
                                className={`text-base font-bold ${
                                    collapsed ? "hidden" : "block"
                                }`}
                            >
                                Angel AI
                            </h1>
                        </div>
                        <h2
                            className={`text-base font-semibold px-2 ${
                                collapsed ? "hidden" : "block"
                            }`}
                        >
                            Lịch sử chat
                        </h2>
                    </div>

                    <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                            <button
                                key={i}
                                className={`w-full text-left px-2 py-2 rounded hover:bg-gray-200 ${
                                    collapsed ? "text-center px-1" : ""
                                }`}
                            >
                                {collapsed ? (
                                    <MessageCircle />
                                ) : (
                                    `Cuộc trò chuyện #${i + 1}`
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BOTTOM: Profile */}
                <div className="relative">
                    <div
                        className="mt-4 mb-2 border border-gray-400/40 flex items-center  gap-2 hover:bg-gray-200 p-3 rounded-lg cursor-pointer"
                        onClick={handleMenuToggle}
                    >
                        <Image
                            width={32}
                            height={32}
                            src="/profile.png"
                            alt="User Avatar"
                            className="rounded-full"
                        />
                        {!collapsed && (
                            <>
                                <span className="text-sm font-medium">
                                    Nguyễn Văn A
                                </span>
                            </>
                        )}
                    </div>
                    {/* Menu dropdown */}
                    {isMenuOpen && <MenuDropPorofile />}

                    {!collapsed && (
                        <p className="text-xs text-center text-gray-500">
                            © 2023 Angel AI. All rights reserved.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
