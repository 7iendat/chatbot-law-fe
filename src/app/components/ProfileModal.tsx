import React, { useEffect, useRef } from "react";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
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
    user = {
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        role: "Quản trị viên",
        plan: "Gói Pro",
        joinedAt: "12/02/2024",
    };
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
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
            >
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center">
                    Thông tin người dùng
                </h2>

                <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between">
                        <span className="font-medium">Họ tên:</span>
                        <span>{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Vai trò:</span>
                        <span>{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Gói tài khoản:</span>
                        <span>{user.plan}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Ngày tham gia:</span>
                        <span>{user.joinedAt}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
