import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// API Base URL - can be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 50000, // 10 seconds timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: any) => {
        // Get token from localStorage
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("accessToken")
                : null;

        if (token) {
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

// Response interceptor - Handle responses and errors globally
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
    (error) => {
        // Log error in development
        if (process.env.NODE_ENV === "development") {
            console.error(
                "❌ API Error:",
                error.response?.data || error.message
            );
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Only redirect to login if it's NOT a login request
            // Check if the request URL contains login/auth endpoints
            const isLoginRequest =
                error.config?.url?.includes("/login") ||
                error.config?.url?.includes("/auth") ||
                error.config?.url?.includes("/signin");

            if (!isLoginRequest && typeof window !== "undefined") {
                // Unauthorized for protected routes - redirect to login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
            // For login requests, let the error bubble up to be handled by the component
        }

        if (error.response?.status === 403) {
            // Forbidden - show error message
            console.error("Access forbidden");
        }

        if (error.response?.status >= 500) {
            // Server error
            console.error("Server error occurred");
        }

        return Promise.reject(error);
    }
);

// Helper function to handle API errors consistently
export const handleApiError = (error: any): string => {
    if (axios.isAxiosError(error)) {
        // Network error
        if (!error.response) {
            return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        }

        // Server responded with error - check for FastAPI's detail field first
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
