// // src/apis/documentApi.ts (or your preferred path)

// import { api } from "../libs/axios"; // Your configured Axios instance
// import { AxiosRequestConfig } from "axios"; // For onUploadProgress type in config

// export interface UploadDocumentResponse {
//     message: string;
//     status: "processing" | "skipped";
//     filename: string;
//     output_path?: string;
// }

// export interface FileUploadProgress {
//     loaded: number;
//     total: number;
//     percentage: number;
// }

// export const documentApi = {
//     /**
//      * Uploads a document file to the server.
//      * The backend API endpoint is POST /upload.
//      *
//      * @param file The File object (from a file input) to be uploaded.
//      * @param onUploadProgress Optional callback function to receive upload progress updates.
//      * @returns A promise that resolves with an UploadDocumentResponse object on success.
//      * @throws Will throw an Error with a message from the backend's 'detail' field or a generic error message if the upload fails.
//      */
//     uploadDocument: async (
//         file: File,
//         onUploadProgress?: (progress: FileUploadProgress) => void
//     ): Promise<UploadDocumentResponse> => {
//         const formData = new FormData();
//         // Your FastAPI backend expects the file under the field name "file"
//         console.log("Tên file input:", file.name);
//         console.log("Kích thước file input:", file.size);
//         console.log("Loại file input:", file.type);
//         console.log('Appending to FormData with key "file"');
//         formData.append("file", file, file.name);
//         // Log FormData entries để kiểm tra
//         console.log("FormData entries after append:");
//         for (let pair of formData.entries()) {
//             console.log(
//                 pair[0] +
//                     ": " +
//                     (pair[1] instanceof File
//                         ? `File: ${pair[1].name}, Size: ${pair[1].size}`
//                         : pair[1])
//             );
//         }
//         const config: AxiosRequestConfig = {};
//         if (onUploadProgress) {
//             config.onUploadProgress = (progressEvent) => {
//                 const { loaded, total } = progressEvent;
//                 // Ensure total is a valid number to prevent division by zero or NaN
//                 if (typeof total === "number" && total > 0) {
//                     const percentage = Math.floor((loaded * 100) / total);
//                     onUploadProgress({ loaded, total, percentage });
//                 } else {
//                     // Handle cases where total might not be available (e.g., streaming without Content-Length)
//                     // or is zero. In such cases, percentage might not be meaningful or can be set to 0 or 100 if loaded > 0.
//                     onUploadProgress({
//                         loaded,
//                         total: total || 0,
//                         percentage: loaded > 0 && !total ? 100 : 0,
//                     });
//                 }
//             };
//         }

//         try {
//             const responseData = await api.post<UploadDocumentResponse>(
//                 "/documents/upload",
//                 formData,
//                 config
//             );
//             return responseData;
//         } catch (error: any) {
//             // Error handling:
//             // Axios errors often have `error.response` if the server responded with an error status.
//             if (
//                 error.response &&
//                 error.response.data &&
//                 error.response.data.detail
//             ) {
//                 // This catches FastAPI's HTTPException responses which typically include a "detail" field.
//                 throw new Error(error.response.data.detail);
//             } else if (error.request) {
//                 // The request was made but no response was received (e.g., network issue)
//                 throw new Error(
//                     "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
//                 );
//             } else {
//                 // Something else happened in setting up the request or a non-HTTP error.
//                 throw new Error(
//                     `Lỗi khi tải file lên: ${
//                         error.message || "Đã xảy ra lỗi không xác định"
//                     }`
//                 );
//             }
//         }
//     },
// };

// // Export individual functions for direct import, similar to authApi.ts
// export const { uploadDocument } = documentApi;

// src/services/documentApi.ts

import { api } from "../libs/axios"; // Your configured Axios instance
import { AxiosRequestConfig } from "axios";

// ----- CÁC INTERFACE ĐƯỢC CẬP NHẬT CHO PHÙ HỢP VỚI API MỚI -----

// Báo cáo cho một file được chấp nhận
export interface AcceptedFileReport {
    filename: string;
    hash: string;
}

// Báo cáo cho một file bị bỏ qua
export interface SkippedFileReport {
    filename: string;
    reason: string;
}

// Phản hồi từ API upload nhiều file
export interface UploadMultipleDocumentsResponse {
    message: string;
    accepted_files: AcceptedFileReport[];
    skipped_files: SkippedFileReport[];
}

export interface FileUploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export const documentApi = {
    /**
     * Tải lên một hoặc nhiều file tài liệu.
     * Endpoint API backend là POST /upload/.
     *
     * @param files Mảng các đối tượng File cần tải lên.
     * @param onUploadProgress Callback tùy chọn để nhận tiến trình tải lên.
     * @returns Một promise phân giải thành đối tượng UploadMultipleDocumentsResponse.
     */
    uploadMultipleDocuments: async (
        files: File[],
        onUploadProgress?: (progress: FileUploadProgress) => void
    ): Promise<UploadMultipleDocumentsResponse> => {
        const formData = new FormData();

        // API FastAPI mong đợi một danh sách các file dưới cùng một key là "files"
        files.forEach((file) => {
            formData.append("files", file, file.name);
        });

        // Cấu hình để theo dõi tiến trình upload
        const config: AxiosRequestConfig = {};
        if (onUploadProgress) {
            config.onUploadProgress = (progressEvent) => {
                const { loaded, total } = progressEvent;
                if (typeof total === "number" && total > 0) {
                    const percentage = Math.floor((loaded * 100) / total);
                    onUploadProgress({ loaded, total, percentage });
                }
            };
        }

        try {
            // Gọi đến endpoint mới /upload/
            const response = await api.post<UploadMultipleDocumentsResponse>(
                "/documents/upload", // <<<< Đổi endpoint ở đây
                formData,
                config
            );
            return response; // Axios trả về dữ liệu trong `response.data`
        } catch (error: any) {
            // Xử lý lỗi (giữ nguyên logic cũ vì nó đã tốt)
            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {
                // Xử lý lỗi từ FastAPI (HTTPException)
                if (typeof error.response.data.detail === "object") {
                    // Nếu detail là một object (như trường hợp không có file nào được chấp nhận)
                    throw new Error(
                        error.response.data.detail.message ||
                            "Lỗi không xác định từ server."
                    );
                }
                throw new Error(error.response.data.detail);
            } else if (error.request) {
                throw new Error(
                    "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
                );
            } else {
                throw new Error(
                    `Lỗi khi tải file lên: ${
                        error.message || "Đã xảy ra lỗi không xác định"
                    }`
                );
            }
        }
    },
};

// Export hàm mới để sử dụng trong component
export const { uploadMultipleDocuments } = documentApi;
