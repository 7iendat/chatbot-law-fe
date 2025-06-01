"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../services/authApis"; // Import UserApiResponse

// Interface User có thể giống UserApiResponse hoặc là một phiên bản đơn giản hơn cho UI
interface User {
    email: string;
    username?: string;
    role?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void; // Chỉ cần userData, không cần Promise nếu không có async
    logout: () => Promise<void>; // logout nên là async để chờ API
    isAuthenticated: boolean;
    isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // True khi context đang khởi tạo hoặc fetch user
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    const isAuthenticated = useMemo(() => !!user, [user]);

    useEffect(() => {
        const initializeAuth = async () => {
            console.log("AuthContext: Initializing authentication state...");
            setLoading(true);
            try {
                // Gọi API để lấy thông tin user hiện tại.
                // API này sẽ sử dụng access_token_cookie mà trình duyệt tự gửi.
                const response = await authApi.getCurrentUser(); // Trả về { user: UserApiResponse | null }
                console.log(
                    "AuthContext: Fetched current user response:",
                    response
                );

                if (response && response.user) {
                    const fetchedUser: User = {
                        // Chuyển đổi từ UserApiResponse sang User nếu cần
                        email: response.user.email,
                        username: response.user.username,
                        role: response.user.role,
                        avatar_url: response.user.avatar_url,
                    };
                    setUser(fetchedUser);
                    if (typeof window !== "undefined") {
                        localStorage.setItem(
                            "userData",
                            JSON.stringify(fetchedUser)
                        );
                        console.log(
                            "AuthContext: User data restored to state and localStorage."
                        );
                    }
                } else {
                    setUser(null);
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("userData");
                        console.log(
                            "AuthContext: No valid user session found, userData cleared from localStorage."
                        );
                    }
                }
            } catch (error) {
                console.warn(
                    "AuthContext: Error during initial auth check (fetching current user), assuming logged out.",
                    error
                );
                setUser(null);
                if (typeof window !== "undefined") {
                    localStorage.removeItem("userData");
                }
            } finally {
                setLoading(false);
                setIsInitialized(true);
                // Log sau khi state đã được cập nhật (có thể dùng một effect riêng để log nếu cần độ chính xác cao hơn)
                // console.log("AuthContext: Initialization complete.", {
                //     isLoading: false, // Sẽ là false
                //     isInitialized: true, // Sẽ là true
                //     isAuthenticated: !!user, // Giá trị user ở đây có thể là của lần render trước
                //     currentUserState: user, // Giá trị user ở đây có thể là của lần render trước
                // });
            }
        };

        initializeAuth();
    }, []); // Chạy một lần khi provider mount

    // Effect để log trạng thái sau khi initializeAuth hoàn tất và state đã cập nhật
    useEffect(() => {
        if (isInitialized) {
            console.log("AuthContext: State after initialization.", {
                isLoading: loading, // Nên là false
                isInitialized, // Nên là true
                isAuthenticated, // Dựa trên user state mới
                user, // User state mới
            });
        }
    }, [isInitialized, loading, isAuthenticated, user]);

    // Redirect logic
    useEffect(() => {
        if (!isInitialized || loading) {
            return; // Chờ context ổn định
        }
        if (typeof window === "undefined") {
            return; // Chỉ chạy ở client
        }

        const currentPath = window.location.pathname;

        if (
            isAuthenticated &&
            (currentPath === "/login" ||
                currentPath === "/register" ||
                currentPath === "/welcome")
        ) {
            console.log(
                `AuthContext: Authenticated user (role: ${user?.role}) on public page (${currentPath}). Redirecting...`
            );
            if (user?.role === "admin") {
                router.replace("/admin/dashboard");
            } else {
                router.replace("/"); // Hoặc trang dashboard mặc định của user
            }
        }
        // Việc redirect NẾU KHÔNG XÁC THỰC sẽ do useRouteGuard ở từng trang đảm nhiệm.
    }, [isInitialized, loading, isAuthenticated, user, router]);

    // Hàm login được gọi sau khi backend đã xác minh và set HttpOnly cookies
    const login = useCallback((userData: User): void => {
        // Backend đã set cookies. Frontend chỉ cần cập nhật state và localStorage cho userData.
        setUser(userData);
        if (typeof window !== "undefined") {
            localStorage.setItem("userData", JSON.stringify(userData));
        }
        console.log(
            "AuthContext: User logged in. State and localStorage updated.",
            { user: userData }
        );
        // Không cần Promise nếu không có thao tác bất đồng bộ nào ở đây
    }, []);

    const logout = useCallback(async () => {
        console.log("AuthContext: Initiating logout...");
        setLoading(true);
        try {
            await authApi.logout(); // Gọi API backend để xóa HttpOnly cookies
            console.log(
                "AuthContext: Logout API call successful. Cookies should be cleared by backend."
            );
        } catch (error) {
            console.error(
                "AuthContext: Logout API call failed. Proceeding with client-side cleanup.",
                error
            );
            // Dù API lỗi, vẫn nên clear state và localStorage ở client
        } finally {
            setUser(null);
            if (typeof window !== "undefined") {
                localStorage.removeItem("userData");
            }
            setLoading(false); // Kết thúc loading sau khi đã clear state
            console.log(
                "AuthContext: Client-side state and localStorage cleared for logout."
            );
            router.replace("/welcome");
        }
    }, [router]);

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            isAuthenticated,
            isInitialized,
        }),
        [user, loading, login, logout, isAuthenticated, isInitialized]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
