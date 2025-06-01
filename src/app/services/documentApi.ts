// src/apis/documentApi.ts (or your preferred path)

import { api } from "../libs/axios"; // Your configured Axios instance
import { AxiosRequestConfig } from "axios"; // For onUploadProgress type in config

// ---- Types for Document API ----

/**
 * Response structure for a successful document upload or if the document was skipped.
 * This should match the JSON response from your FastAPI /upload endpoint.
 */
export interface UploadDocumentResponse {
    message: string;
    status: "processing" | "skipped"; // "processing" if new upload, "skipped" if file already exists
    filename: string; // The original filename as recognized/saved by the backend
    output_path?: string; // The path where the processed file is (or will be) stored, typically if status is "processing"
}

/**
 * Structure for progress event data passed to the onUploadProgress callback.
 */
export interface FileUploadProgress {
    loaded: number; // Bytes uploaded
    total: number; // Total bytes to upload
    percentage: number; // Upload progress percentage (0-100)
}

// If your FastAPI backend returns a specific error structure for validation (422) or other client errors (4xx)
// that is different from the generic `detail` string, you might define an interface for it here.
// For example:
// export interface DocumentValidationError {
//     loc: (string | number)[];
//     msg: string;
//     type: string;
// }
// export interface DocumentApiErrorDetail {
//     detail: string | DocumentValidationError[];
// }

// ---- Document API Calls ----

export const documentApi = {
    /**
     * Uploads a document file to the server.
     * The backend API endpoint is POST /upload.
     *
     * @param file The File object (from a file input) to be uploaded.
     * @param onUploadProgress Optional callback function to receive upload progress updates.
     * @returns A promise that resolves with an UploadDocumentResponse object on success.
     * @throws Will throw an Error with a message from the backend's 'detail' field or a generic error message if the upload fails.
     */
    uploadDocument: async (
        file: File,
        onUploadProgress?: (progress: FileUploadProgress) => void
    ): Promise<UploadDocumentResponse> => {
        const formData = new FormData();
        // Your FastAPI backend expects the file under the field name "file"
        console.log("Tên file input:", file.name);
        console.log("Kích thước file input:", file.size);
        console.log("Loại file input:", file.type);
        console.log('Appending to FormData with key "file"');
        formData.append("file", file, file.name);
        // Log FormData entries để kiểm tra
        console.log("FormData entries after append:");
        for (let pair of formData.entries()) {
            console.log(
                pair[0] +
                    ": " +
                    (pair[1] instanceof File
                        ? `File: ${pair[1].name}, Size: ${pair[1].size}`
                        : pair[1])
            );
        }
        const config: AxiosRequestConfig = {};
        if (onUploadProgress) {
            config.onUploadProgress = (progressEvent) => {
                const { loaded, total } = progressEvent;
                // Ensure total is a valid number to prevent division by zero or NaN
                if (typeof total === "number" && total > 0) {
                    const percentage = Math.floor((loaded * 100) / total);
                    onUploadProgress({ loaded, total, percentage });
                } else {
                    // Handle cases where total might not be available (e.g., streaming without Content-Length)
                    // or is zero. In such cases, percentage might not be meaningful or can be set to 0 or 100 if loaded > 0.
                    onUploadProgress({
                        loaded,
                        total: total || 0,
                        percentage: loaded > 0 && !total ? 100 : 0,
                    });
                }
            };
        }

        try {
            // Make the POST request to the "/upload" endpoint.
            // It's assumed that your `api` instance (from `../libs/axios`) is configured to:
            // 1. Include the base URL.
            // 2. Add any necessary headers (e.g., Authorization Bearer token via request interceptors).
            // 3. Automatically set 'Content-Type': 'multipart/form-data' for FormData.
            //    (Your Axios interceptor might delete a default 'Content-Type': 'application/json' if it exists for FormData).
            // 4. Return the `response.data` directly due to a response interceptor (as suggested by authApi.ts usage).
            const responseData = await api.post<UploadDocumentResponse>(
                "/documents/upload",
                formData,
                config
            );
            return responseData;
        } catch (error: any) {
            // Error handling:
            // Axios errors often have `error.response` if the server responded with an error status.
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                // This catches FastAPI's HTTPException responses which typically include a "detail" field.
                throw new Error(error.response.data.detail);
            } else if (error.request) {
                // The request was made but no response was received (e.g., network issue)
                throw new Error(
                    "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
                );
            } else {
                // Something else happened in setting up the request or a non-HTTP error.
                throw new Error(
                    `Lỗi khi tải file lên: ${
                        error.message || "Đã xảy ra lỗi không xác định"
                    }`
                );
            }
        }
    },

    // --- You can add other document-related API functions below ---
    // Example:
    // getDocumentStatus: async (filename: string): Promise<DocumentStatusResponse> => {
    //   try {
    //     const responseData = await api.get<DocumentStatusResponse>(`/document/status/${filename}`);
    //     return responseData;
    //   } catch (error: any) {
    //     if (error.response?.data?.detail) {
    //       throw new Error(error.response.data.detail);
    //     }
    //     throw new Error(`Failed to get status for ${filename}: ${error.message || "Unknown error"}`);
    //   }
    // },
};

// Export individual functions for direct import, similar to authApi.ts
export const {
    uploadDocument,
    // getDocumentStatus, // if you add more functions
} = documentApi;
