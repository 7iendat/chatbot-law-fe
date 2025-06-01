"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
    Search as SearchIconLucide,
    Plus,
    Edit,
    Trash2,
    Shield,
    User,
    Users,
    Settings,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    XCircle,
    BookUser,
} from "lucide-react";

import {
    adminApis,
    PaginatedResponse,
    GetListUserParams,
    UserOut,
} from "@/app/services/adminApis"; // <-- ĐIỀU CHỈNH ĐƯỜNG DẪN NÀY

// Hook debounce đơn giản
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const UserManagementSystem = () => {
    const [usersData, setUsersData] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // const { toast } = useToast(); // Loại bỏ toast của shadcn
    const showToast = (
        message: string,
        type: "success" | "error" = "success"
    ) => {
        // Implement một hàm toast đơn giản hoặc tích hợp thư viện toast khác
        alert(`[${type.toUpperCase()}] ${message}`);
        console.log(`Toast: [${type.toUpperCase()}] ${message}`);
    };

    const [apiParams, setApiParams] = useState<GetListUserParams>({
        skip: 0,
        limit: 10,
        sortBy: "created_at",
        sortOrder: -1,
    });
    const [searchTermInput, setSearchTermInput] = useState("");
    const debouncedSearchTerm = useDebounce(searchTermInput, 500);

    const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"create" | "edit" | "view">(
        "view"
    );
    const [selectedUserForEdit, setSelectedUserForEdit] =
        useState<UserOut | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
        is_active: true,
    });

    const roles = [
        {
            value: "admin",
            label: "Quản trị viên",
            color: "bg-red-100 text-red-800",
        },
        {
            value: "user",
            label: "Người dùng",
            color: "bg-green-100 text-green-800",
        },
    ];

    const fetchUsers = useCallback(async (params: GetListUserParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminApis.getListUser(params);
            setUsersData(data);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail ||
                err.message ||
                "Không thể tải danh sách người dùng.";
            setError(errorMessage);
            showToast(errorMessage, "error");
            console.error("Fetch users error:", err);
        } finally {
            setLoading(false);
        }
    }, []); // Bỏ toast khỏi dependencies

    useEffect(() => {
        const newApiParams = {
            ...apiParams,
            search: debouncedSearchTerm || undefined,
            skip: 0,
        };
        if (JSON.stringify(newApiParams) !== JSON.stringify(apiParams)) {
            setApiParams(newApiParams);
        } else {
            fetchUsers(apiParams);
        }
    }, [debouncedSearchTerm]); // Chỉ phụ thuộc debouncedSearchTerm

    useEffect(() => {
        fetchUsers(apiParams);
    }, [apiParams, fetchUsers]);

    const displayedUsers = useMemo(() => {
        if (!usersData?.items) return [];
        let items = [...usersData.items];
        if (selectedRoleFilter !== "all") {
            items = items.filter((user) => user.role === selectedRoleFilter);
        }
        if (selectedStatusFilter !== "all") {
            items = items.filter(
                (user) => user.is_active === (selectedStatusFilter === "active")
            );
        }
        return items;
    }, [usersData, selectedRoleFilter, selectedStatusFilter]);

    const handleSearchInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTermInput(e.target.value);
    };

    const handlePageChange = (newSkip: number) => {
        setApiParams((prev) => ({ ...prev, skip: Math.max(0, newSkip) }));
    };

    const handleLimitChange = (newLimit: number) => {
        setApiParams((prev) => ({ ...prev, limit: newLimit, skip: 0 }));
    };

    const handleSort = (newSortBy: keyof UserOut) => {
        setApiParams((prev) => ({
            ...prev,
            sortBy: newSortBy,
            sortOrder:
                prev.sortBy === newSortBy
                    ? prev.sortOrder === 1
                        ? -1
                        : 1
                    : -1,
            skip: 0,
        }));
    };

    // const handleCreateUser = () => {
    //     setModalType("create");
    //     setSelectedUserForEdit(null);
    //     setFormData({
    //         username: "",
    //         email: "",
    //         password: "",
    //         role: "user",
    //         is_active: true,
    //     });
    //     setShowPassword(false);
    //     setShowModal(true);
    // };

    // const handleEditUser = (user: UserOut) => {
    //     setModalType("edit");
    //     setSelectedUserForEdit(user);
    //     setFormData({
    //         username: user.username,
    //         email: user.email,
    //         password: "",
    //         role: user.role,
    //         is_active: user.is_active,
    //     });
    //     setShowPassword(false);
    //     setShowModal(true);
    // };

    const handleViewUser = (user: UserOut) => {
        setModalType("view");
        setSelectedUserForEdit(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: "",
            role: user.role,
            is_active: user.is_active,
        });
        setShowPassword(false);
        setShowModal(true);
    };

    const handleDeleteUser = async (userId: string | number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            console.log("Xóa người dùng ID:", userId);
            showToast(
                `Chức năng xóa người dùng (ID: ${userId}) đang được phát triển.`
            );
        }
    };

    const handleSubmitModal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowModal(false);
        showToast(
            `Người dùng ${formData.username} đã được ${
                modalType === "create" ? "thêm" : "cập nhật"
            } (giả lập).`,
            "success"
        );
        console.log("Dữ liệu form:", formData, "Loại:", modalType);
        if (modalType === "create") {
            const newUser: UserOut = { ...formData, avatar_url: null };
            setUsersData((prev) =>
                prev
                    ? {
                          ...prev,
                          items: [newUser, ...prev.items],
                          metadata: {
                              ...prev.metadata,
                              total: prev.metadata.total + 1,
                          },
                      }
                    : null
            );
        } else if (selectedUserForEdit) {
            setUsersData((prev) =>
                prev
                    ? {
                          ...prev,
                          items: prev.items.map((u) =>
                              u.email === selectedUserForEdit.email
                                  ? { ...selectedUserForEdit, ...formData }
                                  : u
                          ),
                      }
                    : null
            );
        }
    };

    const getRoleColor = (roleValue: string) => {
        const roleObj = roles.find((r) => r.value === roleValue);
        return roleObj ? roleObj.color : "bg-gray-100 text-gray-800";
    };
    const getRoleLabel = (roleValue: string) => {
        const roleObj = roles.find((r) => r.value === roleValue);
        return roleObj ? roleObj.label : roleValue;
    };

    const statsData = useMemo(() => {
        if (!usersData) return { total: 0, active: 0, staff: 0, admin: 0 };
        // Lưu ý: các số liệu active, staff, admin này đang được tính trên `usersData.items` (dữ liệu của trang hiện tại).
        // Để chính xác, cần fetch toàn bộ hoặc backend cung cấp API riêng cho stats.
        // Hoặc, nếu backend hỗ trợ filter, thì khi fetch toàn bộ với filter đó mới chính xác.
        // Ví dụ: API trả về tổng số user theo từng role, status.
        // Hiện tại là tính trên item đã fetch.
        return {
            total: usersData.metadata.total,
            active: usersData.items.filter((u) => u.is_active).length,
            admin: usersData.items.filter((u) => u.role === "admin").length,
        };
    }, [usersData]);

    if (loading && !usersData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-700">
                    Đang tải danh sách người dùng...
                </p>
            </div>
        );
    }

    if (error && !usersData) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-red-50 p-6 rounded-lg">
                <AlertTriangle size={48} className="mb-4" />
                <h2 className="text-xl font-semibold mb-2">Lỗi tải dữ liệu</h2>
                <p>{error}</p>
                <button
                    onClick={() => fetchUsers(apiParams)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }
    if (!usersData) {
        return <div className="p-6">Không có dữ liệu người dùng.</div>;
    }

    const { items, metadata } = usersData;
    const currentPage = metadata.page;
    const totalPages = metadata.pages;
    const currentLimit = metadata.page_size;

    return (
        <div className="bg-gray-50 p-4 md:p-6 min-h-screen">
            <div className="max-w-full mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                        Quản lý người dùng
                    </h1>
                    <p className="text-sm md:text-base text-gray-600">
                        Quản lý tài khoản, vai trò và trạng thái người dùng
                        trong hệ thống.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                    <StatCard
                        icon={Users}
                        title="Tổng người dùng"
                        value={statsData.total.toString()}
                        color="text-blue-600"
                    />
                    <StatCard
                        icon={CheckCircle}
                        title="Đang hoạt động"
                        value={statsData.active.toString()}
                        color="text-green-600"
                    />

                    <StatCard
                        icon={Shield}
                        title="Quản trị viên"
                        value={statsData.admin.toString()}
                        color="text-orange-600"
                    />
                </div>

                <div className="bg-white rounded-lg shadow mb-6 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
                            <div className="relative grow sm:grow-0">
                                <SearchIconLucide className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email..."
                                    className="pl-10 pr-4 py-2 w-full sm:w-56 md:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTermInput}
                                    onChange={handleSearchInputChange}
                                />
                            </div>
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                value={selectedRoleFilter}
                                onChange={(e) =>
                                    setSelectedRoleFilter(e.target.value)
                                }
                            >
                                <option value="all">Tất cả vai trò</option>
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                value={selectedStatusFilter}
                                onChange={(e) =>
                                    setSelectedStatusFilter(e.target.value)
                                }
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">
                                    Không hoạt động
                                </option>
                            </select>
                        </div>
                        {/* <button
                            onClick={handleCreateUser}
                            className="flex items-center gap-2 mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm người dùng
                        </button> */}
                    </div>
                    {loading && (
                        <div className="text-sm text-blue-500 mt-3">
                            Đang tải lại dữ liệu...
                        </div>
                    )}
                    {error && !loading && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded mt-3">
                            Lỗi: {error}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px] hidden sm:table-cell">
                                    Avatar
                                </th>
                                <th
                                    onClick={() => handleSort("username")}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[150px]"
                                >
                                    Người dùng{" "}
                                    {apiParams.sortBy === "username" &&
                                        (apiParams.sortOrder === 1 ? "▲" : "▼")}
                                </th>
                                <th
                                    onClick={() => handleSort("role")}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]"
                                >
                                    Vai trò{" "}
                                    {apiParams.sortBy === "role" &&
                                        (apiParams.sortOrder === 1 ? "▲" : "▼")}
                                </th>
                                <th
                                    onClick={() => handleSort("is_active")}
                                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[120px]"
                                >
                                    Trạng thái{" "}
                                    {apiParams.sortBy === "is_active" &&
                                        (apiParams.sortOrder === 1 ? "▲" : "▼")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedUsers.length > 0 ? (
                                displayedUsers.map((user) => (
                                    <tr
                                        key={user.email}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                                            <Image
                                                src={
                                                    user.avatar_url ||
                                                    "/profile.png"
                                                }
                                                alt={user.username}
                                                width={36}
                                                height={36}
                                                className="rounded-full object-cover"
                                                onError={(e) => {
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).src = "/profile.png";
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-sm text-gray-900">
                                                {user.username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                                    user.role
                                                )}`}
                                            >
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {user.is_active ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 inline" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500 inline" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1 md:space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewUser(user)
                                                    }
                                                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded hover:bg-indigo-100"
                                                >
                                                    <BookUser className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.email
                                                        )
                                                    }
                                                    className="p-1 text-red-600 hover:text-red-900 rounded hover:bg-red-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-gray-500"
                                    >
                                        {loading
                                            ? "Đang tìm kiếm..."
                                            : "Không tìm thấy người dùng nào khớp với tiêu chí."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {metadata && displayedUsers.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                        <p className="text-sm text-gray-600">
                            Hiển thị {displayedUsers.length} trên tổng số{" "}
                            {metadata.total} người dùng (Trang {currentPage}/
                            {totalPages})
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    handlePageChange(
                                        apiParams.skip! - currentLimit
                                    )
                                }
                                disabled={currentPage <= 1 || loading}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Trước
                            </button>
                            <button
                                onClick={() =>
                                    handlePageChange(
                                        apiParams.skip! + currentLimit
                                    )
                                }
                                disabled={!metadata.has_more || loading}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                            <select
                                value={currentLimit}
                                onChange={(e) =>
                                    handleLimitChange(Number(e.target.value))
                                }
                                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm h-[34px]" // Match button height
                            >
                                {[10, 20, 50, 100].map((val) => (
                                    <option key={val} value={val}>
                                        {val}
                                    </option>
                                ))}
                            </select>
                            <span className="text-sm text-gray-600 hidden sm:inline">
                                mục/trang
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto shadow-xl">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">
                            {modalType === "create"
                                ? "Thêm người dùng mới"
                                : modalType === "edit"
                                ? "Chỉnh sửa người dùng"
                                : "Thông tin tài khoản"}
                        </h2>
                        <form
                            onSubmit={handleSubmitModal}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Họ và tên (Username)
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    disabled={modalType === "view"}
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            username: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    disabled={modalType !== "create"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Mật khẩu{" "}
                                    {modalType === "edit" &&
                                        "(để trống nếu không đổi)"}
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required={modalType === "create"}
                                        disabled={modalType === "view"}
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 flex items-center justify-center"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Vai trò
                                </label>
                                <select
                                    id="role"
                                    disabled={modalType === "view"}
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
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Trạng thái
                                </label>
                                <select
                                    id="status"
                                    disabled={modalType === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={
                                        formData.is_active
                                            ? "active"
                                            : "inactive"
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_active:
                                                e.target.value === "active",
                                        })
                                    }
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">
                                        Không hoạt động
                                    </option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-6">
                                {modalType !== "view" ? (
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {modalType === "create"
                                            ? "Tạo tài khoản"
                                            : "Cập nhật"}
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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

const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
}: {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
}) => (
    <div className="bg-white rounded-lg shadow p-4 md:p-5">
        <div className="flex items-center">
            <div
                className={`p-2 sm:p-3 rounded-full bg-opacity-10 ${color.replace(
                    "text-",
                    "bg-"
                )}`}
            >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
            </div>
            <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    {title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    </div>
);

export default UserManagementSystem;
