// src/contexts/AuthContext.tsx

"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "../services/authApis";

// Interface User (giữ nguyên)
interface User {
    email: string;
    username?: string;
    role?: string;
    avatar_url?: string;
    login_type?: string; // Thêm trường này nếu cần
}

// === BƯỚC 1: THÊM checkAuthStatus VÀO INTERFACE ===
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isInitialized: boolean;
    checkAuthStatus: () => Promise<void>;
    isLoggingOut: boolean; // <-- HÀM ĐƯỢC THÊM VÀO
}
// ===============================================

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const isAuthenticated = useMemo(() => !!user, [user]);

    // Hàm checkAuthStatus được định nghĩa bằng useCallback
    const checkAuthStatus = useCallback(async () => {
        // Không set loading ở đây để tránh xung đột
        console.log("AuthContext: Checking authentication status via API...");
        try {
            const response = await authApi.getCurrentUser();
            if (response && response.user) {
                const fetchedUser: User = {
                    email: response.user.email,
                    username: response.user.username,
                    role: response.user.role,
                    avatar_url: response.user.avatar_url,
                };
                setUser(fetchedUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.warn(
                "AuthContext: Auth check failed, setting user to null.",
                error
            );
            setUser(null);
        }
    }, []); // Hàm này không có dependency động

    // useEffect để khởi tạo lần đầu
    useEffect(() => {
        const initialize = async () => {
            console.log("AuthProvider: Initializing...");
            setLoading(true);
            await checkAuthStatus();
            setIsInitialized(true);
            setLoading(false);
            console.log("AuthProvider: Initialization complete.");
        };

        initialize();
    }, [checkAuthStatus]); // Chạy một lần khi component mount

    // useEffect để xử lý chuyển hướng (logic đã được cải tiến)
    useEffect(() => {
        if (!isInitialized || loading) return;

        // CÁC TRANG CÔNG KHAI - người dùng chưa đăng nhập được phép vào
        const publicPaths = [
            "/login",
            "/register",
            "/welcome",
            "/forgot-password",
        ];
        // TRANG ĐẶC BIỆT - không được can thiệp
        const specialPaths = ["/auth/callback"];

        // Nếu đang ở trên trang đặc biệt, không làm gì cả, để cho trang đó tự xử lý
        if (specialPaths.includes(pathname)) {
            console.log(
                "AuthProvider: On a special path, skipping redirect logic."
            );
            return;
        }

        // Kịch bản 1: Đã đăng nhập nhưng lại vào trang public -> Về dashboard
        if (isAuthenticated && publicPaths.includes(pathname)) {
            console.log(
                "AuthProvider: Authenticated user on public page. Redirecting to /."
            );
            router.replace("/");
        }

        // Kịch bản 2: Chưa đăng nhập nhưng lại cố vào trang private -> Về trang welcome
        // (Lưu ý: Logic này có thể được xử lý bởi RouteGuard, nhưng để ở đây cũng an toàn)
        const isTryingToAccessPrivatePage = !publicPaths.includes(pathname);
        if (!isAuthenticated && isTryingToAccessPrivatePage) {
            console.log(
                `AuthProvider: Unauthenticated user on private page "${pathname}". Redirecting to /welcome.`
            );
            router.replace(`/welcome?returnUrl=${pathname}`);
        }
    }, [isInitialized, loading, isAuthenticated, pathname, router]);

    // Hàm login (không thay đổi)
    const login = useCallback((userData: User) => {
        setUser(userData);
        // Logic redirect sẽ được useEffect ở trên xử lý
    }, []);

    // Hàm logout (không thay đổi)
    const logout = useCallback(async () => {
        if (isLoggingOut) return; // Ngăn chặn click nhiều lần

        console.log("AuthContext: Initiating logout...");
        setIsLoggingOut(true); // <<== BẮT ĐẦU LOADING

        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout API call failed.", error);
        } finally {
            setUser(null);
            localStorage.removeItem("userData"); // Dọn dẹp cả localStorage
            router.replace("/login");
            setIsLoggingOut(false);
        }
    }, [isLoggingOut, router]);

    // === BƯỚC 2: THÊM checkAuthStatus VÀO VALUE CỦA CONTEXT ===
    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            isAuthenticated,
            isInitialized,
            checkAuthStatus,
            isLoggingOut, // <<== THÊM VÀO ĐÂY
        }),
        [
            user,
            loading,
            login,
            logout,
            isAuthenticated,
            isInitialized,
            checkAuthStatus,
            isLoggingOut,
        ]
    );
    // ========================================================

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// Hook useAuth không cần thay đổi
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
