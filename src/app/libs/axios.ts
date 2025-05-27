import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from "axios";

// API Base URL - can be configured via environment variables
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 70000, // 50 seconds timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // Include cookies (e.g., refresh_token) in requests
});

// Helper functions for token management
export const getAccessToken = (): string | null => {
    return typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
};

export const setAccessToken = (token: string): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", token);
    }
};

export const clearAccessToken = (): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
    }
};

// Interface for refresh token response
interface RefreshResponse {
    accessToken: string;
    username: string;
    email: string;
    role: string;
}

// Auto-refresh token function
const autoRefreshToken = async (
    error: AxiosError,
    retryRequest: () => Promise<AxiosResponse>
): Promise<AxiosResponse> => {
    try {
        if (!error.response || error.response.status !== 401) {
            throw new Error("Không phải lỗi 401, không thể làm mới token");
        }

        // Call the refresh endpoint
        const response = await apiClient.post<RefreshResponse>(
            "/uset/refresh-token",
            {}
        );

        // Update access token
        setAccessToken(response.data.accessToken);

        // Retry the original request
        return await retryRequest();
    } catch (refreshError: any) {
        console.error(
            "Làm mới token thất bại:",
            refreshError.message || refreshError
        );
        clearAccessToken();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new Error("Làm mới token thất bại. Vui lòng đăng nhập lại.");
    }
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === "development") {
            console.log(
                `🚀 ${config.method?.toUpperCase()} ${config.url}`,
                config.data
            );
        }

        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses, errors, and token refresh
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === "development") {
            console.log(
                `✅ ${response.config.method?.toUpperCase()} ${
                    response.config.url
                }`,
                response.data
            );
        }
        return response;
    },
    async (error: AxiosError) => {
        // Log error in development
        if (process.env.NODE_ENV === "development") {
            console.error(
                "❌ API Error:",
                error.response?.data || error.message
            );
        }

        // Handle 401 Unauthorized with token refresh
        if (error.response && error.response.status === 401 && error.config) {
            const isLoginRequest =
                error.config.url?.includes("/login") ||
                error.config.url?.includes("/auth") ||
                error.config.url?.includes("/signin") ||
                error.config.url?.includes("/refresh");

            if (!isLoginRequest) {
                try {
                    const response = await autoRefreshToken(error, () =>
                        apiClient.request({
                            ...error.config,
                            headers: {
                                ...error.config?.headers,
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        })
                    );
                    return response;
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
        }

        // Handle other errors
        if (error.response && error.response.status === 403) {
            console.error("Access forbidden");
        }
        if (error.response && error.response.status >= 500) {
            console.error("Server error occurred");
        }

        return Promise.reject(error);
    }
);

// Helper function to handle API errors consistently
export const handleApiError = (error: any): string => {
    if (axios.isAxiosError(error)) {
        console.error("Axios error:", error);
        if (!error.response) {
            return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        }

        const message =
            error.response.data?.detail ||
            error.response.data?.message ||
            error.response.data?.error ||
            error.response.statusText;

        return message || "Có lỗi xảy ra. Vui lòng thử lại.";
    }

    return error.message || "Có lỗi không xác định xảy ra.";
};

// Generic API call wrapper with error handling
export const apiCall = async <T = any>(
    requestConfig: AxiosRequestConfig
): Promise<T> => {
    try {
        const response = await apiClient(requestConfig);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Convenient methods for different HTTP verbs
export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiCall({ method: "GET", url, ...config }),

    post: <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "POST", url, data, ...config }),

    put: <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "PUT", url, data, ...config }),

    patch: <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "PATCH", url, data, ...config }),

    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiCall({ method: "DELETE", url, ...config }),
};

// Export the configured axios instance
export default apiClient;
