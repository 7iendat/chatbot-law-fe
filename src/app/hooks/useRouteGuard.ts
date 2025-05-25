import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

interface RouteGuardOptions {
    redirectTo?: string;
    requiredRole?: string;
    requireAuth?: boolean;
    adminOnly?: boolean;
    restrictedForUsers?: boolean;
}

export const useRouteGuard = (options: RouteGuardOptions = {}) => {
    const { isAuthenticated, loading, user, isInitialized, token } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const mountedRef = useRef(true);
    const hasPerformedInitialCheck = useRef(false); // Dùng để reset state khi hook được dùng ở trang mới

    const {
        redirectTo = "/welcome",
        requiredRole,
        requireAuth = true,
        adminOnly = false,
        restrictedForUsers = false,
    } = options;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const performAuthCheck = useCallback(() => {
        if (!mountedRef.current || !isInitialized || loading) {
            // Nếu AuthContext chưa sẵn sàng, hoặc component đã unmount, không làm gì cả
            // Điều này quan trọng vì performAuthCheck có thể được gọi từ setTimeout (nếu còn dùng)
            // hoặc sau khi isInitialized/loading thay đổi
            console.log(
                "Route Guard - performAuthCheck: AuthContext not ready or unmounted. isInitialized:",
                isInitialized,
                "loading:",
                loading
            );
            return;
        }

        // Dòng log này rất quan trọng để theo dõi giá trị đầu vào của performAuthCheck
        console.log("Route Guard - Performing auth check with values:", {
            isAuthenticated,
            token: !!token,
            user: !!user,
            requireAuth,
            isInitialized,
            loading,
            userRole: user?.role,
            adminOnly,
            restrictedForUsers,
            hasPerformedInitialCheckCurrent: hasPerformedInitialCheck.current,
            // Các state nội tại tại thời điểm gọi performAuthCheck
            _internal_hasCheckedAuth: hasCheckedAuth,
            _internal_isRedirecting: isRedirecting,
        });

        // Ngăn chặn kiểm tra lại nếu đã kiểm tra và không đang chuyển hướng
        // Quan trọng: Dùng giá trị `hasCheckedAuth` và `isRedirecting` hiện tại từ closure
        // không phải từ state snapshot lúc useCallback được tạo nếu chúng là dependencies.
        // Nhưng vì chúng không còn là dependencies, nó sẽ dùng giá trị state hiện tại.
        if (
            hasPerformedInitialCheck.current &&
            hasCheckedAuth &&
            !isRedirecting
        ) {
            console.log(
                "Route Guard - Already checked and authorized, not redirecting. Bypassing new check."
            );
            // Nếu đã authorized và hasCheckedAuth, có thể setIsAuthorized(true) ở đây để đảm bảo.
            // Tuy nhiên, if (isAuthorized) return; cũng là một lựa chọn ở đầu hàm.
            // Hiện tại, logic này sẽ ngăn performAuthCheck chạy lại nếu không cần.
            return;
        }

        hasPerformedInitialCheck.current = true; // Đánh dấu đã thực hiện kiểm tra ít nhất một lần

        // Case 1: Không yêu cầu xác thực
        if (!requireAuth) {
            console.log(
                "Route Guard - No authentication required, granting access"
            );
            if (mountedRef.current) {
                setIsAuthorized(true);
                setHasCheckedAuth(true);
                setIsRedirecting(false);
            }
            return;
        }

        // Case 2: Yêu cầu xác thực nhưng người dùng chưa xác thực (hoặc token/user không hợp lệ)
        if (!isAuthenticated || !token || !user) {
            console.log(
                "Route Guard - Authentication required but not valid, redirecting to:",
                redirectTo
            );
            if (mountedRef.current) {
                setIsAuthorized(false);
                setHasCheckedAuth(true); // Đã kiểm tra, kết quả là không được phép
                setIsRedirecting(true);
                // Dùng setTimeout để đảm bảo việc redirect không gây lỗi state update trong render
                setTimeout(() => {
                    if (mountedRef.current) {
                        router.replace(redirectTo);
                        // Sau khi redirect, có thể không cần setIsRedirecting(false)
                        // vì component sẽ unmount hoặc useRouteGuard sẽ chạy lại ở trang mới.
                    }
                }, 0);
            }
            return;
        }

        // Case 3: Người dùng đã xác thực - kiểm tra quyền
        const userRole = user.role?.toLowerCase();

        // Admin có toàn quyền
        if (userRole === "admin") {
            console.log(
                "Route Guard - Admin user detected, granting full access"
            );
            if (mountedRef.current) {
                setIsAuthorized(true);
                setHasCheckedAuth(true);
                setIsRedirecting(false);
            }
            return;
        }

        // Kiểm tra trang chỉ dành cho admin
        if (adminOnly) {
            // userRole ở đây không phải admin (đã check ở trên)
            console.log(
                "Route Guard - Admin-only page accessed by non-admin user, redirecting"
            );
            if (mountedRef.current) {
                setIsAuthorized(false);
                setHasCheckedAuth(true);
                setIsRedirecting(true);
                setTimeout(() => {
                    if (mountedRef.current) router.replace("/unauthorized");
                }, 0);
            }
            return;
        }

        // Kiểm tra trang bị hạn chế cho user thường (nếu userRole là 'user')
        if (restrictedForUsers && userRole === "user") {
            console.log(
                "Route Guard - User trying to access restricted page, redirecting"
            );
            if (mountedRef.current) {
                setIsAuthorized(false);
                setHasCheckedAuth(true);
                setIsRedirecting(true);
                setTimeout(() => {
                    if (mountedRef.current) router.replace("/unauthorized");
                }, 0);
            }
            return;
        }

        // Kiểm tra vai trò cụ thể được yêu cầu
        if (requiredRole && userRole !== requiredRole.toLowerCase()) {
            console.log(
                `Route Guard - Required role: ${requiredRole}, User role: ${userRole}, redirecting`
            );
            if (mountedRef.current) {
                setIsAuthorized(false);
                setHasCheckedAuth(true);
                setIsRedirecting(true);
                setTimeout(() => {
                    if (mountedRef.current) router.replace("/unauthorized");
                }, 0);
            }
            return;
        }

        // Nếu đến được đây, người dùng được phép truy cập
        console.log("Route Guard - User authorized for this route");
        if (mountedRef.current) {
            setIsAuthorized(true);
            setHasCheckedAuth(true);
            setIsRedirecting(false);
        }
    }, [
        // Dependencies của useCallback:
        // Chỉ bao gồm những gì thực sự khiến logic của performAuthCheck thay đổi.
        // Các state nội tại (hasCheckedAuth, isRedirecting) KHÔNG nên ở đây.
        isAuthenticated,
        token,
        user, // Từ AuthContext
        requireAuth,
        adminOnly,
        restrictedForUsers,
        requiredRole,
        redirectTo, // Từ options
        router, // Từ next/navigation
        isInitialized,
        loading, // Từ AuthContext (quan trọng để re-eval khi context sẵn sàng)
        // BỎ: hasCheckedAuth, isRedirecting
    ]);

    useEffect(() => {
        console.log(
            "Route Guard - Main effect triggered. isInitialized:",
            isInitialized,
            "loading:",
            loading
        );

        if (!isInitialized || loading) {
            console.log(
                "Route Guard - Main effect: Auth context not initialized or still loading. Waiting..."
            );
            // Quan trọng: Nếu chưa init hoặc đang loading, ta KHÔNG reset hasCheckedAuth
            // vì có thể nó đã được set từ một lần chạy trước đó của effect này khi isInitialized=true
            // và ta chỉ đang chờ AuthContext ổn định lại (ví dụ: sau refresh trang).
            // Ta chỉ nên reset hasCheckedAuth khi instance của hook này là mới hoàn toàn cho một trang.
            return;
        }

        // Chỉ reset state khi hook này được mount lần đầu cho một component/route instance mới.
        // hasPerformedInitialCheck.current sẽ là false khi AdminDashboard mount.
        if (!hasPerformedInitialCheck.current) {
            console.log(
                "Route Guard - Main effect: First run for this hook instance (e.g. new page). Resetting internal checks."
            );
            if (mountedRef.current) {
                setHasCheckedAuth(false);
                setIsAuthorized(false);
                setIsRedirecting(false);
            }
        }

        // Gọi performAuthCheck trực tiếp thay vì dùng setTimeout
        // Effect này đã đảm bảo isInitialized=true và loading=false
        console.log(
            "Route Guard - Main effect: Auth context ready. Calling performAuthCheck."
        );
        performAuthCheck();
    }, [
        isInitialized,
        loading, // Khi AuthContext sẵn sàng/thay đổi
        isAuthenticated,
        user,
        token, // Khi trạng thái xác thực thay đổi
        performAuthCheck, // Hàm callback (dependencies của nó đã được tối ưu)
        // Bỏ options trực tiếp (requireAuth, adminOnly, etc.) vì chúng đã là deps của performAuthCheck
    ]);

    const finalIsLoading =
        !isInitialized || loading || (requireAuth && !hasCheckedAuth);

    const finalIsAuthorized =
        isInitialized &&
        !loading &&
        hasCheckedAuth &&
        isAuthorized &&
        !isRedirecting;

    console.log("Route Guard - Return State:", {
        isLoading: finalIsLoading,
        isAuthorized: finalIsAuthorized,
        _internal_isInitialized: isInitialized,
        _internal_loading_auth: loading,
        _internal_hasCheckedAuth: hasCheckedAuth,
        _internal_isAuthorized_state: isAuthorized,
        _internal_isRedirecting: isRedirecting,
        _internal_hasPerformedInitialCheck: hasPerformedInitialCheck.current,
    });

    return {
        isAuthorized: finalIsAuthorized,
        isLoading: finalIsLoading,
        user,
        isAuthenticated,
        userRole: user?.role?.toLowerCase(),
        isAdmin: user?.role?.toLowerCase() === "admin",
        isUser: user?.role?.toLowerCase() === "user",
        token,
    };
};

// Helper hooks không thay đổi
export const useAdminGuard = (redirectTo?: string) => {
    return useRouteGuard({
        requireAuth: true,
        adminOnly: true,
        redirectTo: redirectTo || "/unauthorized",
    });
};

export const useUserGuard = (redirectTo?: string) => {
    return useRouteGuard({
        requireAuth: true,
        requiredRole: "user",
        redirectTo: redirectTo || "/welcome",
    });
};

export const useAuthGuard = (redirectTo?: string) => {
    return useRouteGuard({
        requireAuth: true,
        redirectTo: redirectTo || "/welcome",
    });
};
