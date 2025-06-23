// src/app/admin/dashboard/layout.tsx
"use client";

import { AuthLoadingSpinner } from "@/app/components/AuthLoadingSpinner";
import { useAdminGuard } from "@/app/hooks/useRouteGuard";
import { ReactNode } from "react";

const AdminDashboardLayout = ({ children }: { children: ReactNode }) => {
    const { isLoading, isAuthorized } = useAdminGuard();

    // Trong khi guard đang kiểm tra, hiển thị màn hình chờ
    if (isLoading) {
        return <AuthLoadingSpinner />;
    }

    // Nếu được ủy quyền (đã đăng nhập VÀ là admin), hiển thị nội dung
    if (isAuthorized) {
        return <main>{children}</main>;
    }

    // Nếu không, hook đã tự chuyển hướng, không render gì cả
    return null;
};

export default AdminDashboardLayout;
