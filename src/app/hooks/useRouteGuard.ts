"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

/**
 * Các tùy chọn để cấu hình Route Guard.
 */
interface RouteGuardOptions {
    /**
     * Trang sẽ chuyển hướng đến nếu người dùng không được xác thực.
     * @default '/login'
     */
    redirectTo?: string;
    /**
     * Route này có yêu cầu đăng nhập không?
     * @default true
     */
    requireAuth?: boolean;
    /**
     * Route này có chỉ dành cho người dùng có vai trò 'admin' không?
     * @default false
     */
    adminOnly?: boolean;
}

/**
 * Hook tùy chỉnh để bảo vệ các route dựa trên trạng thái xác thực và vai trò của người dùng.
 * Nó tự động xử lý việc chuyển hướng.
 *
 * @param options - Các tùy chọn để cấu hình guard.
 * @returns một object chứa trạng thái loading và trạng thái ủy quyền.
 */
export const useRouteGuard = (options: RouteGuardOptions = {}) => {
    const {
        isAuthenticated,
        loading: authLoading,
        user,
        isInitialized,
    } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const {
        redirectTo = "/login",
        requireAuth = true,
        adminOnly = false,
    } = options;

    const isLoading = !isInitialized || authLoading;

    useEffect(() => {
        // --- Điều kiện tiên quyết: Chỉ hành động khi AuthContext đã sẵn sàng ---
        if (isLoading) {
            return; // Chờ cho đến khi quá trình khởi tạo hoàn tất.
        }

        // --- Logic kiểm tra và chuyển hướng ---

        // 1. Nếu trang yêu cầu đăng nhập, nhưng người dùng chưa đăng nhập
        if (requireAuth && !isAuthenticated) {
            console.log(
                `RouteGuard: Access denied to "${pathname}". User not authenticated. Redirecting...`
            );
            // Lưu lại URL hiện tại để có thể quay lại sau khi đăng nhập
            router.replace(`${redirectTo}?returnUrl=${pathname}`);
            return;
        }

        // 2. Nếu đã đăng nhập, kiểm tra các quyền đặc biệt
        if (isAuthenticated) {
            const currentUserRole = user?.role?.toLowerCase();

            // Kiểm tra trang chỉ dành cho admin
            if (adminOnly && currentUserRole !== "admin") {
                console.log(
                    `RouteGuard: Access denied to admin-only page "${pathname}".`
                );
                router.replace("/unauthorized"); // Chuyển đến trang báo lỗi không có quyền
                return;
            }
        }
    }, [
        isInitialized,
        authLoading,
        isAuthenticated,
        user,
        router,
        pathname,
        requireAuth,
        redirectTo,
        adminOnly,
        isLoading, // Thêm isLoading vào dependency để đảm bảo không chạy khi đang loading
    ]);

    // --- Tính toán trạng thái ủy quyền cuối cùng để trả về ---
    let isAuthorized = false;
    if (!isLoading) {
        if (!requireAuth) {
            isAuthorized = true; // Trang công khai
        } else if (isAuthenticated) {
            const currentUserRole = user?.role?.toLowerCase();
            if (adminOnly && currentUserRole !== "admin") {
                isAuthorized = false; // Yêu cầu admin nhưng không phải admin
            } else {
                isAuthorized = true; // Các trường hợp còn lại đều được phép
            }
        } else {
            isAuthorized = false; // Yêu cầu auth nhưng chưa đăng nhập
        }
    }

    return {
        isLoading,
        isAuthorized,
    };
};

// ==============================================================================
// CÁC HELPER HOOK ĐỂ SỬ DỤNG DỄ DÀNG HƠN
// ==============================================================================

/**
 * Bảo vệ một trang chỉ cho phép quản trị viên truy cập.
 */
export const useAdminGuard = () => {
    return useRouteGuard({
        requireAuth: true,
        adminOnly: true,
        redirectTo: "/login", // Luôn chuyển về trang login nếu chưa đăng nhập
    });
};

/**
 * Bảo vệ một trang yêu cầu người dùng phải đăng nhập (bất kỳ vai trò nào).
 */
export const useAuthGuard = () => {
    return useRouteGuard({
        requireAuth: true,
        redirectTo: "/login",
    });
};
