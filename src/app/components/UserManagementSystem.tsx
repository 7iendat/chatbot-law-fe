import React, { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Shield,
    User,
    Users,
    Settings,
    Eye,
    EyeOff,
} from "lucide-react";

const UserManagementSystem = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "Nguyễn Văn An",
            email: "an.nguyen@lawfirm.vn",
            role: "admin",
            status: "active",
            lastLogin: "2024-05-25 14:30",
            createdAt: "2024-01-15",
            permissions: ["manage_users", "view_analytics", "manage_content"],
        },
        {
            id: 2,
            name: "Trần Thị Bình",
            email: "binh.tran@lawyer.vn",
            role: "lawyer",
            status: "active",
            lastLogin: "2024-05-26 09:15",
            createdAt: "2024-02-20",
            permissions: ["answer_questions", "view_cases"],
        },
        {
            id: 3,
            name: "Lê Hoàng Cường",
            email: "cuong.le@citizen.vn",
            role: "user",
            status: "inactive",
            lastLogin: "2024-05-20 16:45",
            createdAt: "2024-03-10",
            permissions: ["ask_questions"],
        },
    ]);

    const [filteredUsers, setFilteredUsers] = useState(users);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
        permissions: [],
    });

    const roles = [
        {
            value: "admin",
            label: "Quản trị viên",
            color: "bg-red-100 text-red-800",
        },
        {
            value: "lawyer",
            label: "Luật sư",
            color: "bg-blue-100 text-blue-800",
        },
        {
            value: "moderator",
            label: "Điều hành viên",
            color: "bg-yellow-100 text-yellow-800",
        },
        {
            value: "user",
            label: "Người dùng",
            color: "bg-green-100 text-green-800",
        },
    ];

    const permissionOptions = [
        { value: "manage_users", label: "Quản lý người dùng" },
        { value: "manage_content", label: "Quản lý nội dung" },
        { value: "view_analytics", label: "Xem thống kê" },
        { value: "answer_questions", label: "Trả lời câu hỏi" },
        { value: "moderate_content", label: "Kiểm duyệt nội dung" },
        { value: "view_cases", label: "Xem hồ sơ vụ việc" },
        { value: "ask_questions", label: "Đặt câu hỏi" },
    ];

    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedRole !== "all") {
            filtered = filtered.filter((user) => user.role === selectedRole);
        }

        if (selectedStatus !== "all") {
            filtered = filtered.filter(
                (user) => user.status === selectedStatus
            );
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, selectedRole, selectedStatus]);

    const handleCreateUser = () => {
        setModalType("create");
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "user",
            status: "active",
            permissions: ["ask_questions"],
        });
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setModalType("edit");
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            status: user.status,
            permissions: user.permissions,
        });
        setShowModal(true);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            setUsers(users.filter((user) => user.id !== userId));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalType === "create") {
            const newUser = {
                id: Date.now(),
                ...formData,
                lastLogin: "Chưa đăng nhập",
                createdAt: new Date().toISOString().split("T")[0],
            };
            setUsers([...users, newUser]);
        } else {
            setUsers(
                users.map((user) =>
                    user.id === selectedUser.id
                        ? { ...user, ...formData }
                        : user
                )
            );
        }

        setShowModal(false);
    };

    const handlePermissionChange = (permission) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter((p) => p !== permission)
                : [...prev.permissions, permission],
        }));
    };

    const getRoleColor = (role) => {
        const roleObj = roles.find((r) => r.value === role);
        return roleObj ? roleObj.color : "bg-gray-100 text-gray-800";
    };

    const getRoleLabel = (role) => {
        const roleObj = roles.find((r) => r.value === role);
        return roleObj ? roleObj.label : role;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Quản lý người dùng - Hệ thống JuriBot
                    </h1>
                    <p className="text-gray-600">
                        Quản lý tài khoản người dùng, phân quyền và theo dõi
                        hoạt động
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Tổng người dùng
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Đang hoạt động
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        users.filter(
                                            (u) => u.status === "active"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <User className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Luật sư
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        users.filter((u) => u.role === "lawyer")
                                            .length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Settings className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Quản trị viên
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        users.filter((u) => u.role === "admin")
                                            .length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên hoặc email..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={selectedRole}
                                    onChange={(e) =>
                                        setSelectedRole(e.target.value)
                                    }
                                >
                                    <option value="all">Tất cả vai trò</option>
                                    {roles.map((role) => (
                                        <option
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                >
                                    <option value="all">
                                        Tất cả trạng thái
                                    </option>
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">
                                        Không hoạt động
                                    </option>
                                </select>
                            </div>
                            <button
                                onClick={handleCreateUser}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm người dùng
                            </button>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lần đăng nhập cuối
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                                    user.role
                                                )}`}
                                            >
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {user.status === "active"
                                                    ? "Hoạt động"
                                                    : "Không hoạt động"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.lastLogin}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.createdAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">
                            {modalType === "create"
                                ? "Thêm người dùng mới"
                                : "Chỉnh sửa người dùng"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu{" "}
                                    {modalType === "edit" &&
                                        "(để trống nếu không thay đổi)"}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required={modalType === "create"}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            role: e.target.value,
                                        })
                                    }
                                >
                                    {roles.map((role) => (
                                        <option
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">
                                        Không hoạt động
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quyền hạn
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {permissionOptions.map((permission) => (
                                        <label
                                            key={permission.value}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.permissions.includes(
                                                    permission.value
                                                )}
                                                onChange={() =>
                                                    handlePermissionChange(
                                                        permission.value
                                                    )
                                                }
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                {permission.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {modalType === "create"
                                        ? "Tạo tài khoản"
                                        : "Cập nhật"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementSystem;
