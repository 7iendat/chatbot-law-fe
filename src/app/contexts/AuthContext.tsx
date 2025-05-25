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
import { authApi } from "../services/authApis";

interface User {
    email: string;
    username?: string;
    role?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    // Memoize isAuthenticated for better performance
    const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

    // Check authentication on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check if we're on the client side
                if (typeof window === "undefined") {
                    setLoading(false);
                    setIsInitialized(true);
                    return;
                }

                const storedToken = localStorage.getItem("accessToken");
                const storedUser = localStorage.getItem("userData");

                console.log("Stored token:", !!storedToken);
                console.log("Stored user:", !!storedUser);

                // If both token and user data exist
                if (storedToken && storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);

                        // Optional: Validate token with API
                        try {
                            const isValid = await authApi.validateToken(
                                storedToken
                            );
                            console.log("Token validation result:", isValid);

                            if (isValid.valid) {
                                setToken(storedToken);
                                setUser(userData);
                                console.log(
                                    "Authentication restored successfully"
                                );
                            } else {
                                // Token invalid, clear storage
                                console.log("Token invalid, clearing storage");
                                localStorage.removeItem("accessToken");
                                localStorage.removeItem("userData");
                                setToken(null);
                                setUser(null);
                            }
                        } catch (apiError) {
                            console.error("Token validation failed:", apiError);
                            // If API call fails, assume token is still valid for now
                            setToken(storedToken);
                            setUser(userData);
                            console.log(
                                "API validation failed, but keeping local auth"
                            );
                        }
                    } catch (parseError) {
                        console.error("Error parsing user data:", parseError);
                        // Clear corrupted data
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("userData");
                        setToken(null);
                        setUser(null);
                    }
                } else {
                    // No token or user data found
                    console.log("No stored authentication found");
                    if (storedToken) localStorage.removeItem("accessToken");
                    if (storedUser) localStorage.removeItem("userData");
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                // Clear everything on error
                if (typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("userData");
                }
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
                setIsInitialized(true);
                console.log(
                    "AuthContext Initialized. Loading:",
                    false,
                    "IsAuthenticated:",
                    !!token && !!user,
                    "User:",
                    user
                );
            }
        };

        initAuth();
    }, []);

    // Handle redirect after authentication state changes
    // useEffect(() => {
    //     if (!isInitialized || loading) {
    //         return; // Don't redirect until fully initialized
    //     }

    //     if (typeof window === "undefined") {
    //         return; // Don't redirect on server side
    //     }

    //     const currentPath = window.location.pathname;
    //     const publicPaths = ["/welcome", "/login", "/register"];
    //     const isPublicPath = publicPaths.includes(currentPath);

    //     // If not authenticated and not on a public path, redirect to welcome
    //     if (!isAuthenticated && !isPublicPath) {
    //         console.log(
    //             "Redirecting to welcome page - no valid authentication"
    //         );
    //         router.replace("/welcome");
    //     }

    //     // If authenticated and on login/register page, redirect to home
    //     if (
    //         isAuthenticated &&
    //         (currentPath === "/login" || currentPath === "/register")
    //     ) {
    //         console.log(
    //             "User authenticated, redirecting from public page to home"
    //         );
    //         router.replace("/");
    //     }
    // }, [isInitialized, loading, isAuthenticated, router]);

    useEffect(() => {
        if (!isInitialized || loading) {
            return;
        }
        if (typeof window === "undefined") {
            return;
        }

        const currentPath = window.location.pathname;

        // CHỈ xử lý redirect KHI ĐÃ XÁC THỰC mà vào trang login/register
        if (
            isAuthenticated &&
            (currentPath === "/login" ||
                currentPath === "/register" ||
                currentPath === "/welcome") // Thêm welcome
        ) {
            console.log(
                "AuthContext: Authenticated. Redirecting from public/login/register/welcome page. User role:",
                user?.role
            );
            if (user?.role === "admin") {
                router.replace("/admin/dashboard");
            } else {
                router.replace("/"); // Hoặc trang dashboard của user thường
            }
        }
        // Việc redirect NẾU KHÔNG XÁC THỰC sẽ do useRouteGuard ở từng trang đảm nhiệm.
        // Loại bỏ đoạn:
        // if (!isAuthenticated && !isPublicPath) {
        //     router.replace("/welcome");
        // }
    }, [isInitialized, loading, isAuthenticated, user, router]); // Thêm user vào dependencies

    const login = useCallback(
        async (newToken: string, userData: User): Promise<void> => {
            if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", newToken);
                localStorage.setItem("userData", JSON.stringify(userData));
            }

            // Update state immediately
            setToken(newToken);
            setUser(userData);

            console.log("User logged in successfully", {
                token: !!newToken,
                user: !!userData,
            });

            // Return a promise that resolves after state updates
            return new Promise((resolve) => {
                // Use requestAnimationFrame to ensure state has been updated
                // requestAnimationFrame(() => {
                //     resolve();
                // });
                setTimeout(resolve, 0);
            });
        },
        []
    );

    const logout = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userData");
        }
        setToken(null);
        setUser(null);
        console.log("User logged out");
        router.replace("/welcome");
    }, [router]);

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            login,
            logout,
            isAuthenticated,
            isInitialized,
        }),
        [user, token, loading, login, logout, isAuthenticated, isInitialized]
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
