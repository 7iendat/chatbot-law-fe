"use client"; // Đảm bảo đây là Client Component nếu dùng trong App Router

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext"; // Đảm bảo đường dẫn đúng

interface RouteGuardOptions {
    redirectTo?: string; // Trang chuyển hướng đến nếu không xác thực/ủy quyền
    requiredRole?: string; // Vai trò cụ thể yêu cầu cho route này
    requireAuth?: boolean; // Route này có yêu cầu đăng nhập không? (mặc định là true)
    adminOnly?: boolean; // Route này chỉ dành cho admin?
    restrictedForUsers?: boolean; // Route này có bị hạn chế đối với user thường không?
}

export const useRouteGuard = (options: RouteGuardOptions = {}) => {
    const {
        isAuthenticated,
        loading: authContextLoading, // Trạng thái loading từ AuthContext
        user,
        isInitialized: authContextInitialized, // Trạng thái initialized từ AuthContext
    } = useAuth();
    const router = useRouter();

    // State nội tại của hook để quản lý quá trình kiểm tra và ủy quyền cho route hiện tại
    const [isAuthorizedForRoute, setIsAuthorizedForRoute] = useState(false);
    const [hasPerformedCheck, setHasPerformedCheck] = useState(false); // Đã thực hiện kiểm tra quyền cho route này chưa
    const [isRedirecting, setIsRedirecting] = useState(false); // Đang trong quá trình chuyển hướng programmatic

    const mountedRef = useRef(true); // Theo dõi component có còn mounted không
    // Theo dõi xem instance của hook này đã thực hiện khởi tạo nội bộ hay chưa (cho route/component hiện tại)
    const instanceLogicInitializedRef = useRef(false);

    // Destructure options với giá trị mặc định
    const {
        redirectTo = "/welcome",
        requiredRole,
        requireAuth = true,
        adminOnly = false,
        restrictedForUsers = false,
    } = options;

    // Effect để quản lý mounted state của component
    useEffect(() => {
        mountedRef.current = true;
        // Khi component unmount (hoặc key thay đổi khiến hook chạy lại cho instance mới),
        // reset instanceLogicInitializedRef để lần sau hook được dùng sẽ thực hiện lại logic khởi tạo nội bộ.
        return () => {
            mountedRef.current = false;
            instanceLogicInitializedRef.current = false;
            // console.log("RouteGuard: Unmounted or instance key changed. Resetting instanceLogicInitializedRef.");
        };
    }, []); // Chạy một lần khi hook mount

    // Hàm thực hiện kiểm tra xác thực và ủy quyền
    const performCheck = useCallback(() => {
        // Điều kiện bypass:
        // 1. Component đã unmount.
        // 2. AuthContext chưa initialized hoặc đang loading (chờ AuthContext ổn định).
        // 3. Đang trong quá trình chuyển hướng (để tránh check lặp lại khi redirect đang diễn ra).
        if (
            !mountedRef.current ||
            !authContextInitialized ||
            authContextLoading ||
            isRedirecting
        ) {
            // console.log("RouteGuard - performCheck: Bypassed (AuthContext not ready or redirecting).", { authContextInitialized, authContextLoading, isRedirecting });
            return;
        }

        // Nếu đã kiểm tra và được ủy quyền cho route này rồi, và không đang redirect, thì không cần làm gì thêm.
        // Điều này giúp tránh việc kiểm tra lại không cần thiết nếu các dependency của performCheck thay đổi
        // nhưng kết quả ủy quyền không đổi.
        if (hasPerformedCheck && isAuthorizedForRoute && !isRedirecting) {
            // console.log("RouteGuard - performCheck: Already checked and authorized for this route instance. Bypassing actual check logic.");
            return;
        }

        // console.log(`RouteGuard - Performing check on ${typeof window !== "undefined" ? window.location.pathname : "server-side"} with values:`, {
        //     isAuthenticated, // Đây là giá trị mới nhất từ AuthContext
        //     userPresent: !!user,
        //     userRole: user?.role,
        //     optionsPassed: options, // Log options để debug
        //     _internal_hasPerformedCheck_before: hasPerformedCheck,
        //     _internal_isAuthorizedForRoute_before: isAuthorizedForRoute,
        // });

        let authorized = false;
        let shouldRedirectTo: string | null = null;

        if (!requireAuth) {
            authorized = true;
            // console.log("RouteGuard: No authentication required for this route. Access granted.");
        } else if (!isAuthenticated) {
            // Yêu cầu xác thực nhưng người dùng chưa được xác thực (isAuthenticated từ AuthContext là false)
            authorized = false;
            shouldRedirectTo = redirectTo;
            // console.log(`RouteGuard: Authentication required, but user is not authenticated. Preparing to redirect to: ${redirectTo}`);
        } else {
            // Người dùng đã được xác thực (isAuthenticated là true), tiến hành kiểm tra quyền (authorization)
            const currentUserRole = user?.role?.toLowerCase();
            // console.log(`RouteGuard: User is authenticated. Role: ${currentUserRole}. Checking specific permissions...`);

            if (currentUserRole === "admin") {
                authorized = true; // Admin luôn có quyền truy cập
                // console.log("RouteGuard: Admin user detected. Full access granted.");
            } else if (adminOnly) {
                // Trang này chỉ dành cho admin, nhưng user hiện tại không phải admin
                authorized = false;
                shouldRedirectTo = "/unauthorized"; // Hoặc một trang lỗi quyền cụ thể
                // console.log("RouteGuard: Admin-only page accessed by non-admin user. Redirecting to /unauthorized.");
            } else if (restrictedForUsers && currentUserRole === "user") {
                // Trang này bị hạn chế cho user thường, và user hiện tại là 'user'
                authorized = false;
                shouldRedirectTo = "/unauthorized";
                // console.log("RouteGuard: User (role 'user') trying to access a page restricted for users. Redirecting to /unauthorized.");
            } else if (
                requiredRole &&
                currentUserRole !== requiredRole.toLowerCase()
            ) {
                // Yêu cầu vai trò cụ thể nhưng vai trò của user không khớp
                authorized = false;
                shouldRedirectTo = "/unauthorized";
                // console.log(`RouteGuard: Role mismatch. Required: '${requiredRole}', User has: '${currentUserRole}'. Redirecting to /unauthorized.`);
            } else {
                // Tất cả các kiểm tra quyền khác đều qua, user được phép
                authorized = true;
                // console.log("RouteGuard: User authorization successful for this route.");
            }
        }

        if (mountedRef.current) {
            // Cập nhật state nội bộ của hook
            // Chỉ cập nhật nếu giá trị thực sự thay đổi để tránh re-render không cần thiết
            if (isAuthorizedForRoute !== authorized) {
                setIsAuthorizedForRoute(authorized);
            }
            // Đánh dấu là đã thực hiện kiểm tra ít nhất một lần cho instance này
            if (!hasPerformedCheck) {
                setHasPerformedCheck(true);
            }

            if (shouldRedirectTo && !isRedirecting) {
                // Chỉ thực hiện redirect nếu cần và chưa làm
                setIsRedirecting(true); // Đặt cờ báo đang chuyển hướng
                console.log(
                    `RouteGuard: Condition met for redirect. Executing redirect to: ${shouldRedirectTo}`
                );
                // Sử dụng setTimeout để việc redirect không gây lỗi "cannot update state on unmounted component"
                // và để đảm bảo nó xảy ra sau khi render hiện tại hoàn tất.
                setTimeout(() => {
                    if (mountedRef.current) {
                        // Kiểm tra lại mounted state trước khi redirect
                        router.replace(shouldRedirectTo);
                        // Sau khi router.replace, component này có thể sẽ unmount.
                        // Việc reset isRedirecting về false sẽ được xử lý khi hook chạy lại ở trang mới
                        // hoặc khi instanceLogicInitializedRef được reset.
                    }
                }, 0);
            } else if (!shouldRedirectTo && isRedirecting) {
                // Nếu trước đó đang redirect nhưng điều kiện hiện tại không cần redirect nữa
                // (ví dụ: user logout rồi login lại rất nhanh và state thay đổi)
                setIsRedirecting(false);
            } else if (!shouldRedirectTo && !isRedirecting) {
                // Trường hợp không cần redirect và không đang redirect, không làm gì với cờ isRedirecting
            }
        }
    }, [
        // Dependencies của useCallback:
        authContextInitialized,
        authContextLoading,
        isAuthenticated,
        user, // Từ AuthContext
        options, // options object để tái tạo callback nếu options thay đổi (ít xảy ra với RouteGuard)
        router, // từ next/navigation
        // Các giá trị options đã destructure để ổn định:
        requireAuth,
        redirectTo,
        requiredRole,
        adminOnly,
        restrictedForUsers,
        // State nội bộ cần thiết để tránh vòng lặp hoặc hành vi không đúng:
        isRedirecting, // Nếu đang redirect, không nên gọi lại performCheck với logic cũ
        hasPerformedCheck,
        isAuthorizedForRoute, // Để tránh re-check nếu đã authorized và không có gì thay đổi
    ]);

    // Effect chính để kích hoạt kiểm tra khi AuthContext sẵn sàng hoặc trạng thái xác thực thay đổi
    useEffect(() => {
        // console.log("RouteGuard - Main Effect Triggered. AuthContext State:", { authContextInitialized, authContextLoading });

        // Chờ AuthContext hoàn toàn sẵn sàng (đã initialized và không còn loading)
        if (!authContextInitialized || authContextLoading) {
            // console.log("RouteGuard: AuthContext not fully initialized or is loading. Waiting...");
            return; // Không làm gì nếu AuthContext chưa sẵn sàng
        }

        // Nếu đây là lần đầu tiên hook này chạy logic cho instance component hiện tại
        // (ví dụ, khi điều hướng đến một trang mới), reset các state kiểm tra nội bộ.
        if (!instanceLogicInitializedRef.current) {
            // console.log("RouteGuard: First logical run for this hook instance. Resetting internal check states.");
            if (mountedRef.current) {
                setHasPerformedCheck(false); // Quan trọng: reset để kiểm tra lại từ đầu cho route mới
                setIsAuthorizedForRoute(false); // Reset trạng thái ủy quyền
                setIsRedirecting(false); // Reset cờ chuyển hướng
                instanceLogicInitializedRef.current = true; // Đánh dấu đã thực hiện khởi tạo logic cho instance này
            }
        }

        // Sau khi AuthContext sẵn sàng và các state nội bộ có thể đã được reset (nếu cần),
        // thì thực hiện kiểm tra.
        // `performCheck` sẽ tự quyết định có chạy logic kiểm tra đầy đủ hay không dựa trên các điều kiện bên trong nó.
        // console.log("RouteGuard: AuthContext ready. Calling performCheck.");
        performCheck();
    }, [
        authContextInitialized,
        authContextLoading, // Kích hoạt khi AuthContext sẵn sàng
        isAuthenticated,
        user, // Kích hoạt khi trạng thái xác thực/user thay đổi (quan trọng sau login/logout)
        performCheck, // Hàm callback đã được memoized
        // Options không cần ở đây nữa vì chúng là dependencies của performCheck
    ]);

    // Tính toán trạng thái loading cuối cùng của RouteGuard
    const routeGuardLoading =
        !authContextInitialized || // AuthContext chưa hoàn thành khởi tạo
        authContextLoading || // AuthContext đang thực hiện thao tác (ví dụ: fetch user ban đầu)
        (requireAuth && !hasPerformedCheck && !isRedirecting) || // Nếu yêu cầu auth, chưa check xong, và không đang redirect
        isRedirecting; // Hoặc đang trong quá trình chuyển hướng programmatic

    // Tính toán trạng thái ủy quyền cuối cùng của RouteGuard
    const finalRouteAuthorized =
        authContextInitialized && // AuthContext phải initialized
        !authContextLoading && // AuthContext không được loading
        hasPerformedCheck && // Guard phải đã thực hiện kiểm tra
        isAuthorizedForRoute && // Kết quả kiểm tra là được phép
        !isRedirecting; // Và không đang trong quá trình chuyển hướng

    // console.log("RouteGuard - Final Return State:", {
    //     routeGuardLoading,
    //     finalRouteAuthorized,
    //     _internal_isInitialized: authContextInitialized,
    //     _internal_authLoading: authContextLoading,
    //     _internal_hasPerformedCheck: hasPerformedCheck,
    //     _internal_isAuthorizedForRoute: isAuthorizedForRoute,
    //     _internal_isRedirecting: isRedirecting,
    //     _internal_instanceLogicInitialized: instanceLogicInitializedRef.current,
    // });

    return {
        isAuthorized: finalRouteAuthorized,
        isLoading: routeGuardLoading,
        user, // Thông tin user từ AuthContext
        isAuthenticated, // Trạng thái xác thực từ AuthContext
        // Các helper role để tiện sử dụng trong component
        userRole: user?.role?.toLowerCase(),
        isAdmin: user?.role?.toLowerCase() === "admin",
        isUser: user?.role?.toLowerCase() === "user",
    };
};

// Các helper hooks (useAdminGuard, useUserGuard, useAuthGuard)
// Chúng không thay đổi vì chỉ truyền options vào useRouteGuard.

export const useAdminGuard = (redirectTo?: string) => {
    return useRouteGuard({
        requireAuth: true,
        adminOnly: true,
        // Nếu admin chưa login, nên chuyển đến trang login, không phải /unauthorized
        redirectTo: redirectTo || "/login", // Hoặc "/welcome" nếu trang login của bạn là welcome
    });
};

export const useUserGuard = (redirectTo?: string) => {
    return useRouteGuard({
        requireAuth: true,
        // requiredRole: "user", // Thường thì không cần chỉ định nếu chỉ muốn user thường
        // Nếu một route chỉ dành cho role "user" và không cho admin, bạn có thể thêm logic này.
        // Nhưng thường thì admin có quyền của user.
        redirectTo: redirectTo || "/welcome",
    });
};

// Guard chung yêu cầu đăng nhập, không quan tâm role cụ thể
export const useAuthGuard = (redirectTo?: string) => {
    return useRouteGuard({
        requireAuth: true,
        redirectTo: redirectTo || "/welcome",
    });
};
