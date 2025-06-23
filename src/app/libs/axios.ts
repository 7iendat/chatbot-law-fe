import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"; // Giả sử đây là http://localhost:8000

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 90000,
    // BỎ header 'Content-Type': 'application/json' mặc định ở đây
    // Chúng ta sẽ xử lý nó trong interceptor để linh hoạt hơn
    headers: {
        Accept: "application/json", // Giữ lại Accept nếu cần
    },
    withCredentials: true,
});

// --- Các interface và biến cho refresh token (giữ nguyên) ---
interface RefreshResponsePayload {
    user?: {
        id: string;
        username: string;
        email: string;
        role: string;
    };
    message?: string;
    success?: boolean;
}

interface ApiErrorResponse {
    detail?: string;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}> = [];
let hasRefreshFailedDefinitively = false;

const processQueue = (
    error: AxiosError | null,
    token: string | null = null
) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getCSRFToken = (): string | null => {
    if (typeof window === "undefined") return null;
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute("content") : null;
};

const redirectToLogin = (forceRedirect: boolean = false) => {
    // ... (giữ nguyên logic redirectToLogin)
    if (typeof window !== "undefined") {
        console.log(
            "Attempting to redirect to login. Current path:",
            window.location.pathname,
            "Force redirect:",
            forceRedirect
        );

        localStorage.removeItem("userData");
        sessionStorage.removeItem("userData");

        window.dispatchEvent(new CustomEvent("auth:logout"));

        const currentPathname = window.location.pathname;
        const currentSearch = window.location.search;
        const isAuthPage =
            currentPathname === "/login" || currentPathname === "/welcome";

        if (!isAuthPage || forceRedirect) {
            const returnUrlPath =
                currentPathname !== "/login" && currentPathname !== "/welcome"
                    ? currentPathname + currentSearch
                    : "";
            const returnUrlQuery = returnUrlPath
                ? `?returnUrl=${encodeURIComponent(returnUrlPath)}`
                : "";
            const targetUrl = `/welcome${returnUrlPath ? returnUrlQuery : ""}`;

            if (window.location.href !== window.location.origin + targetUrl) {
                console.log("Redirecting to:", targetUrl);
                window.location.href = targetUrl;
            } else {
                console.log(
                    "Already on the target login page or avoiding loop."
                );
            }
        } else {
            console.log("On auth page and not forced, no redirect.");
        }
    }
};

const autoRefreshTokenAndRetry = async (
    originalRequestConfig: InternalAxiosRequestConfig
): Promise<AxiosResponse> => {
    // ... (giữ nguyên logic autoRefreshTokenAndRetry)
    if (hasRefreshFailedDefinitively) {
        console.warn("🚫 Refresh token has definitively failed. Aborting.");
        redirectToLogin();
        return Promise.reject(new Error("Refresh token previously failed."));
    }
    try {
        console.log("🔄 Attempting to refresh token...");
        const response = await apiClient.post<RefreshResponsePayload>(
            "/user/refresh-token",
            {},
            { headers: { "X-Skip-Auth-Refresh": "true" } }
        );
        console.log("✅ Token refreshed. Server response:", response.data);
        hasRefreshFailedDefinitively = false;
        if (response.data.user && typeof window !== "undefined") {
            localStorage.setItem(
                "userData",
                JSON.stringify(response.data.user)
            );
            window.dispatchEvent(
                new CustomEvent("auth:refreshed", {
                    detail: response.data.user,
                })
            );
        }
        processQueue(null, response.data.success ? "refreshed" : null);
        return apiClient(originalRequestConfig);
    } catch (refreshError: any) {
        console.error(
            "❌ Token refresh failed:",
            refreshError.response?.data || refreshError.message
        );
        hasRefreshFailedDefinitively = true;
        processQueue(refreshError as AxiosError, null);
        redirectToLogin();
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } finally {
        isRefreshing = false;
    }
};
// --- Kết thúc phần refresh token ---

// --- REQUEST INTERCEPTOR ĐÃ SỬA ---
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Log cơ bản để debug
        // console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params || "");

        // 1. Xử lý CSRF Token
        if (
            ["post", "put", "patch", "delete"].includes(
                config.method?.toLowerCase() || ""
            )
        ) {
            const csrfToken = getCSRFToken();
            if (
                csrfToken &&
                config.headers &&
                !config.headers["X-CSRF-Token"]
            ) {
                config.headers["X-CSRF-Token"] = csrfToken;
            }
        }

        // 2. Xử lý Content-Type
        if (config.data instanceof FormData) {
            // Nếu data là FormData, Axios sẽ tự động set Content-Type đúng
            // (multipart/form-data cùng với boundary).
            // Chúng ta cần đảm bảo không có Content-Type nào khác (như application/json)
            // được set từ cấu hình mặc định hoặc từ nơi khác làm ghi đè.
            if (config.headers && config.headers["Content-Type"]) {
                // console.log(`Interceptor: Data is FormData. Current Content-Type is '${config.headers['Content-Type']}'. Deleting it to let Axios handle.`);
                delete config.headers["Content-Type"];
            }
        } else {
            // Đối với các request không phải FormData, nếu chưa có Content-Type,
            // chúng ta có thể muốn set nó là 'application/json'.
            if (config.headers && !config.headers["Content-Type"]) {
                config.headers["Content-Type"] = "application/json";
                // console.log("Interceptor: Data is not FormData. Set Content-Type to 'application/json'.");
            }
        }
        // Token Authorization được thêm ở đây nếu logic của bạn yêu cầu
        // Ví dụ:
        // const token = localStorage.getItem('authToken');
        // if (token && config.headers) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

        return config;
    },
    (error) => {
        console.error("❌ Request interceptor error:", error);
        return Promise.reject(error);
    }
);
// --- KẾT THÚC REQUEST INTERCEPTOR ĐÃ SỬA ---

// --- RESPONSE INTERCEPTOR (giữ nguyên logic refresh token) ---
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response; // Trả về toàn bộ response object
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };
        // console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.response?.data || error.message);

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest.url?.includes("/user/refresh-token") &&
            !originalRequest.headers?.["X-Skip-Auth-Refresh"] &&
            !originalRequest._retry
        ) {
            if (hasRefreshFailedDefinitively) {
                console.warn("🚫 Auth refresh previously failed. Redirecting.");
                redirectToLogin();
                return Promise.reject(error);
            }
            if (isRefreshing) {
                console.log("➕ Request added to queue.");
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }
            console.log("🚩 Intercepted 401. Refreshing token.");
            originalRequest._retry = true;
            isRefreshing = true;
            return autoRefreshTokenAndRetry(originalRequest);
        }
        return Promise.reject(error);
    }
);
// --- KẾT THÚC RESPONSE INTERCEPTOR ---

// --- Helper functions và API call wrappers (giữ nguyên) ---
export const handleApiError = (error: any): string => {
    // ... (giữ nguyên logic handleApiError)
    if (axios.isAxiosError(error)) {
        if (
            error.message ===
                "Phiên đăng nhập đã hết hạn hoặc không thể làm mới. Vui lòng đăng nhập lại." ||
            error.message ===
                "Refresh token previously failed. Please log in again."
        ) {
            return error.message;
        }
        if (!error.response) return "Không thể kết nối đến server.";
        const errorData = error.response.data as ApiErrorResponse;
        if (errorData?.errors && typeof errorData.errors === "object") {
            const firstError = Object.values(errorData.errors)[0];
            return Array.isArray(firstError)
                ? firstError[0]
                : String(firstError);
        }
        const message =
            errorData?.detail ||
            errorData?.message ||
            errorData?.error ||
            (typeof errorData === "string" ? errorData : null) ||
            error.response.statusText;
        switch (error.response.status) {
            case 400:
                return message || "Dữ liệu gửi lên không hợp lệ.";
            case 401:
                return "Phiên đăng nhập đã hết hạn.";
            case 403:
                return "Bạn không có quyền thực hiện hành động này.";
            case 404:
                return "Không tìm thấy tài nguyên yêu cầu.";
            case 409:
                return message || "Dữ liệu bị xung đột.";
            case 422:
                return message || "Dữ liệu không hợp lệ."; // Sẽ hiển thị chi tiết từ server nếu có
            case 429:
                return "Quá nhiều yêu cầu.";
            case 500:
                return "Lỗi server nội bộ.";
            case 502:
                return "Server tạm thời không khả dụng.";
            case 503:
                return "Dịch vụ đang bảo trì.";
            default:
                return (
                    message || `Lỗi không xác định (${error.response.status}).`
                );
        }
    }
    return error.message || "Có lỗi không xác định xảy ra.";
};

// Thay đổi apiCall để trả về response.data trực tiếp nếu response interceptor của bạn
// không làm điều đó và bạn muốn hành vi này.
// Trong trường hợp này, response interceptor của bạn trả về `response` (toàn bộ object),
// nên `apiCall` và các hàm `api.get`, `api.post` sẽ cần lấy `response.data`.
export const apiCall = async <T = any>(
    requestConfig: AxiosRequestConfig
): Promise<T> => {
    try {
        const response = await apiClient(requestConfig); // apiClient trả về AxiosResponse
        return response.data; // Lấy data từ response
    } catch (error: any) {
        // handleApiError có thể được gọi ở nơi sử dụng các hàm này
        throw error; // Ném lại lỗi để nơi gọi xử lý
    }
};

export const api = {
    get: async <T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "GET", url, ...config }),
    post: async <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "POST", url, data, ...config }),
    put: async <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "PUT", url, data, ...config }),
    patch: async <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "PATCH", url, data, ...config }),
    delete: async <T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => apiCall({ method: "DELETE", url, ...config }),
};
// --- Kết thúc helper functions ---

// --- Auth utils (giữ nguyên) ---
export const authUtils = {
    isAuthenticated: async (): Promise<boolean> => {
        if (
            hasRefreshFailedDefinitively &&
            typeof window !== "undefined" &&
            !localStorage.getItem("userData")
        ) {
            return false;
        }
        try {
            await api.get("/user/me");
            return true;
        } catch (error) {
            return false;
        }
    },
    logout: async (): Promise<void> => {
        try {
            await api.post("/user/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            hasRefreshFailedDefinitively = false;
            localStorage.removeItem("userData");
            redirectToLogin(true);
        }
    },
    checkAuthStatus: async (): Promise<{
        isAuthenticated: boolean;
        user?: any;
    }> => {
        if (
            hasRefreshFailedDefinitively &&
            typeof window !== "undefined" &&
            !localStorage.getItem("userData")
        ) {
            return { isAuthenticated: false };
        }
        try {
            const userFromApi = await api.get<RefreshResponsePayload["user"]>(
                "/user/me"
            );
            if (userFromApi && typeof window !== "undefined") {
                localStorage.setItem("userData", JSON.stringify(userFromApi));
                window.dispatchEvent(
                    new CustomEvent("auth:refreshed", { detail: userFromApi })
                );
            }
            return { isAuthenticated: true, user: userFromApi };
        } catch (error) {
            return { isAuthenticated: false };
        }
    },
    clearRefreshFailedFlag: () => {
        hasRefreshFailedDefinitively = false;
    },
};
// --- Kết thúc Auth utils ---

export default apiClient; // Xuất apiClient nếu bạn cần dùng trực tiếp ở đâu đó (ví dụ cho testing)
// Hoặc chỉ xuất `api` và `authUtils` nếu đó là cách bạn muốn sử dụng.
