import React, { useState, useRef, useEffect } from "react";
import {
    Upload,
    FileText,
    Database,
    AlertCircle,
    CheckCircle,
    // X, // Not used directly in current version
    // Eye, // Not used
    // Download, // Not used
    Trash2,
    RefreshCw,
    FileCheck,
    Loader2, // Using this for processing_backend
} from "lucide-react";
import { documentApi } from "../services/documentApi";
// Adjust path as needed

// Define the structure of a file being uploaded/managed
// This helps with TypeScript if you convert, or just for clarity
interface UploadedFile {
    id: number;
    file: File;
    name: string;
    size: number;
    type: string;
    category: string;
    status:
        | "pending"
        | "uploading"
        | "processing_backend"
        | "skipped"
        | "error"
        | "success_processed"; // success_processed for future when backend confirms
    progress: number;
    uploadedAt: string;
    error: string | null;
    backend_filename?: string | null;
    backend_output_path?: string | null;
    // processedRecords: number; // This was removed as backend /upload doesn't provide it immediately
}

const ChatbotDataUpload = () => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    // uploadProgress is now part of each fileData object
    // const [uploadProgress, setUploadProgress] = useState({}); // Removed
    const [uploadStats, setUploadStats] = useState({
        totalFiles: 0,
        successfulUploads: 0, // Files sent to backend for processing
        failedUploads: 0,
        // totalSize: 0, // Could be calculated if needed
    });
    const [selectedCategory, setSelectedCategory] = useState("law_documents");
    // processingStatus is now part of the fileData.status
    // const [processingStatus, setProcessingStatus] = useState({}); // Removed
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Backend supported extensions: .pdf, .txt, .md, .docx
    // Adjusted categories to better reflect backend support
    const categories = [
        {
            value: "law_documents",
            label: "Văn bản pháp luật & Khác", // Generic category for all supported types by /upload
            icon: FileText,
            color: "blue",
            accept: ".pdf,.txt,.md,.docx",
            // These MIME types are for frontend validation, backend uses extension.
            allowedMimeTypes: [
                "application/pdf",
                "text/plain",
                "text/markdown", // Common for .md
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                "application/msword", // .doc (though backend may not fully support .doc content extraction as well as .docx)
            ],
        },
        // If you have other *backend endpoints* for different categories, add them.
        // For now, assuming one /upload endpoint for these document types.
    ];

    const currentCategoryConfig =
        categories.find((c) => c.value === selectedCategory) || categories[0];

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
            if (fileInputRef.current) {
                // Clear the input value to allow re-uploading the same file
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFiles = (files: File[]) => {
        const validFiles = files.filter((file) => {
            const fileExtension =
                "." + file.name.split(".").pop()?.toLowerCase();
            const allowedExtensions = currentCategoryConfig.accept.split(",");

            // Primary check based on extension as backend uses it
            if (!allowedExtensions.includes(fileExtension)) {
                alert(
                    `Định dạng file không được hỗ trợ: ${
                        file.name
                    } (${fileExtension}).\nChỉ chấp nhận: ${currentCategoryConfig.accept
                        .toUpperCase()
                        .replaceAll(",", ", ")}`
                );
                return false;
            }
            // Secondary check for MIME type if extension matches (less critical if backend relies on ext)
            // if (!currentCategoryConfig.allowedMimeTypes.includes(file.type) && !file.type.startsWith("text/")) {
            //     console.warn(`MIME type ${file.type} for ${file.name} might not match expected types, but extension ${fileExtension} is allowed.`);
            // }

            if (file.size > 50 * 1024 * 1024) {
                // 50MB limit
                alert(`File quá lớn: ${file.name}. Giới hạn 50MB.`);
                return false;
            }
            return true;
        });

        const newFiles: UploadedFile[] = validFiles.map((file) => ({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            category: selectedCategory,
            status: "pending",
            progress: 0,
            uploadedAt: new Date().toISOString(),
            error: null,
            // processedRecords: 0, // Removed
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach((fileData) => uploadSingleFile(fileData)); // Changed to uploadSingleFile
    };

    // Renamed from uploadFile to avoid conflict if old one is still around
    const uploadSingleFile = async (fileData: UploadedFile) => {
        setUploadedFiles((prev) =>
            prev.map((f) =>
                f.id === fileData.id
                    ? { ...f, status: "uploading", progress: 0, error: null }
                    : f
            )
        );

        try {
            const response = await documentApi.uploadDocument(
                fileData.file,
                (progressUpdate: any) => {
                    setUploadedFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileData.id
                                ? { ...f, progress: progressUpdate.percentage }
                                : f
                        )
                    );
                }
            );

            if (response.status === "processing") {
                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileData.id
                            ? {
                                  ...f,
                                  status: "processing_backend",
                                  progress: 100,
                                  backend_filename: response.filename,
                                  backend_output_path: response.output_path,
                              }
                            : f
                    )
                );
                setUploadStats((prevStats) => ({
                    // Use functional update for stats
                    ...prevStats,
                    successfulUploads: prevStats.successfulUploads + 1,
                }));
            } else if (response.status === "skipped") {
                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileData.id
                            ? {
                                  ...f,
                                  status: "skipped",
                                  progress: 100,
                                  error: response.message,
                                  backend_filename: response.filename,
                              }
                            : f
                    )
                );
                // Skipped files are not errors, but also not "newly processed"
            } else {
                // Should not happen if types are aligned
                throw new Error(
                    response.message ||
                        `Trạng thái không mong đợi từ server: ${response.status}`
                );
            }
        } catch (error: any) {
            setUploadedFiles((prev) =>
                prev.map((f) =>
                    f.id === fileData.id
                        ? {
                              ...f,
                              status: "error",
                              error:
                                  error.message ||
                                  "Lỗi không xác định khi tải lên.",
                          }
                        : f
                )
            );
            setUploadStats((prevStats) => ({
                // Use functional update for stats
                ...prevStats,
                failedUploads: prevStats.failedUploads + 1,
            }));
        }
    };

    // processFile is no longer needed as the backend /upload schedules processing

    const retryUpload = (fileData: UploadedFile) => {
        const fileToRetry = {
            ...fileData,
            status: "pending" as "pending", // Type assertion
            error: null,
            progress: 0,
        };
        setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileData.id ? fileToRetry : f))
        );
        uploadSingleFile(fileToRetry);
    };

    const removeFile = (fileId: number) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
        // Note: This doesn't cancel an ongoing upload or delete from backend
    };

    const clearAll = () => {
        setUploadedFiles([]);
        setUploadStats({
            totalFiles: 0,
            successfulUploads: 0,
            failedUploads: 0,
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getStatusIconAndText = (fileData: UploadedFile) => {
        switch (fileData.status) {
            case "processing_backend":
                return {
                    icon: (
                        <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                    ),
                    text: "Đang xử lý (server)",
                    color: "text-yellow-600",
                };
            case "success_processed": // For future use when backend confirms processing is done
                return {
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    text: "Hoàn tất xử lý",
                    color: "text-green-600",
                };
            case "error":
                return {
                    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
                    text: "Lỗi",
                    color: "text-red-600",
                };
            case "uploading":
                return {
                    icon: (
                        <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                    ),
                    text: `Đang tải lên... ${fileData.progress}%`,
                    color: "text-blue-600",
                };
            case "skipped":
                return {
                    icon: <FileCheck className="h-5 w-5 text-gray-500" />,
                    text: "Đã tồn tại, bỏ qua",
                    color: "text-gray-600",
                };
            case "pending":
            default:
                return {
                    icon: <FileText className="h-5 w-5 text-gray-400" />,
                    text: "Chờ tải lên",
                    color: "text-gray-500",
                };
        }
    };

    const getCategoryInfo = (categoryValue: string) => {
        return (
            categories.find((cat) => cat.value === categoryValue) ||
            categories[0]
        );
    };

    useEffect(() => {
        setUploadStats((prev) => ({
            ...prev,
            totalFiles: uploadedFiles.length,
        }));
    }, [uploadedFiles.length]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tải dữ liệu cho Chatbot Pháp luật
                    </h1>
                    <p className="text-gray-600">
                        Upload dữ liệu để huấn luyện và cập nhật kiến thức cho
                        chatbot.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Upload className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Tổng files đã chọn
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadStats.totalFiles}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Đã gửi xử lý
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadStats.successfulUploads}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Lỗi Upload
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadStats.failedUploads}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Upload dữ liệu mới
                        </h2>

                        {/* Category Selection (Now simplified as backend handles types similarly) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại dữ liệu (hỗ trợ các định dạng bên dưới)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {categories.map((category) => {
                                    const IconComponent = category.icon;
                                    return (
                                        <button
                                            key={category.value}
                                            onClick={() =>
                                                setSelectedCategory(
                                                    category.value
                                                )
                                            }
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                selectedCategory ===
                                                category.value
                                                    ? `border-${category.color}-500 bg-${category.color}-50`
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <IconComponent
                                                className={`h-6 w-6 mx-auto mb-2 ${
                                                    selectedCategory ===
                                                    category.value
                                                        ? `text-${category.color}-600`
                                                        : "text-gray-400"
                                                }`}
                                            />
                                            <p
                                                className={`text-sm font-medium ${
                                                    selectedCategory ===
                                                    category.value
                                                        ? `text-${category.color}-900`
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {category.label}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragActive
                                    ? "border-blue-400 bg-blue-50"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">
                                Kéo thả files vào đây hoặc click để chọn
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Hỗ trợ:{" "}
                                {currentCategoryConfig.accept
                                    .toUpperCase()
                                    .replaceAll(",", ", ")}{" "}
                                (Tối đa 50MB)
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Chọn files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept={currentCategoryConfig.accept}
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* File List */}
                    {uploadedFiles.length > 0 && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Files đang xử lý ({uploadedFiles.length})
                                </h3>
                                <button
                                    onClick={clearAll}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Xóa tất cả khỏi danh sách
                                </button>
                            </div>

                            <div className="space-y-3">
                                {uploadedFiles.map((fileData) => {
                                    const categoryInfo = getCategoryInfo(
                                        fileData.category
                                    );
                                    const IconComponent = categoryInfo.icon;
                                    const statusInfo =
                                        getStatusIconAndText(fileData);

                                    return (
                                        <div
                                            key={fileData.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    {" "}
                                                    {/* Added min-w-0 for truncation */}
                                                    <div className="flex-shrink-0">
                                                        {statusInfo.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {" "}
                                                        {/* Added min-w-0 */}
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {fileData.name}
                                                            </p>
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800`}
                                                            >
                                                                <IconComponent className="h-3 w-3 mr-1" />
                                                                {
                                                                    categoryInfo.label
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                            {" "}
                                                            {/* Grouped small info */}
                                                            <span>
                                                                {formatFileSize(
                                                                    fileData.size
                                                                )}
                                                            </span>
                                                            <span>|</span>
                                                            <span>
                                                                {fileData.type ||
                                                                    "Unknown type"}
                                                            </span>
                                                            <span>|</span>
                                                            <span
                                                                className={
                                                                    statusInfo.color
                                                                }
                                                            >
                                                                {
                                                                    statusInfo.text
                                                                }
                                                            </span>
                                                        </div>
                                                        {fileData.error &&
                                                            fileData.status !==
                                                                "skipped" && ( // Don't show generic "skipped" message as error
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    Lỗi chi
                                                                    tiết:{" "}
                                                                    {
                                                                        fileData.error
                                                                    }
                                                                </p>
                                                            )}
                                                        {fileData.status ===
                                                            "skipped" &&
                                                            fileData.error && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    Thông báo:{" "}
                                                                    {
                                                                        fileData.error
                                                                    }
                                                                </p>
                                                            )}
                                                        {fileData.backend_output_path && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Đã lưu tại:{" "}
                                                                {
                                                                    fileData.backend_output_path
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    {fileData.status ===
                                                        "error" && (
                                                        <button
                                                            onClick={() =>
                                                                retryUpload(
                                                                    fileData
                                                                )
                                                            }
                                                            className="p-1 text-blue-600 hover:text-blue-800"
                                                            title="Thử lại"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            removeFile(
                                                                fileData.id
                                                            )
                                                        }
                                                        className="p-1 text-red-600 hover:text-red-800"
                                                        title="Xóa khỏi danh sách"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Progress Bar for uploading - status text now handles other states */}
                                            {fileData.status ===
                                                "uploading" && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-150"
                                                            style={{
                                                                width: `${fileData.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                        Hướng dẫn upload dữ liệu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">
                                Định dạng file được hỗ trợ:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• PDF - Văn bản pháp luật, quy định</li>
                                <li>
                                    • DOCX - Tài liệu Word (khuyến nghị OpenXML)
                                </li>
                                <li>• TXT - File text thuần</li>
                                <li>• MD - File Markdown</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">
                                Lưu ý quan trọng:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Kích thước file tối đa: 50MB</li>
                                <li>
                                    • Đảm bảo nội dung bằng tiếng Việt và đúng
                                    định dạng.
                                </li>
                                <li>
                                    • Hệ thống sẽ tự động xử lý file sau khi tải
                                    lên thành công.
                                </li>
                                <li>
                                    • File đã tồn tại trên server với cùng tên
                                    sẽ được bỏ qua.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotDataUpload;
