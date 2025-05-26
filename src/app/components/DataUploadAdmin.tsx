import React, { useState, useRef } from "react";
import {
    Upload,
    FileText,
    Database,
    AlertCircle,
    CheckCircle,
    X,
    Eye,
    Download,
    Trash2,
    RefreshCw,
    FileCheck,
} from "lucide-react";

const ChatbotDataUpload = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadStats, setUploadStats] = useState({
        totalFiles: 0,
        successfulUploads: 0,
        failedUploads: 0,
        totalSize: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState("law_documents");
    const [processingStatus, setProcessingStatus] = useState({});
    const fileInputRef = useRef(null);

    const categories = [
        {
            value: "law_documents",
            label: "Văn bản pháp luật",
            icon: FileText,
            color: "blue",
        },
        {
            value: "case_studies",
            label: "Án lệ tham khảo",
            icon: Database,
            color: "green",
        },
        {
            value: "legal_qa",
            label: "Câu hỏi - Đáp án mẫu",
            icon: FileCheck,
            color: "purple",
        },
        {
            value: "regulations",
            label: "Quy định, thông tư",
            icon: AlertCircle,
            color: "orange",
        },
    ];

    const allowedFileTypes = {
        "application/pdf": "PDF",
        "application/msword": "DOC",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "DOCX",
        "text/plain": "TXT",
        "application/json": "JSON",
        "text/csv": "CSV",
        "application/vnd.ms-excel": "XLS",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            "XLSX",
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (files) => {
        const validFiles = files.filter((file) => {
            if (!Object.keys(allowedFileTypes).includes(file.type)) {
                alert(`Không hỗ trợ định dạng file: ${file.name}`);
                return false;
            }
            if (file.size > 50 * 1024 * 1024) {
                // 50MB limit
                alert(`File quá lớn: ${file.name}. Giới hạn 50MB.`);
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map((file) => ({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            category: selectedCategory,
            status: "pending", // pending, uploading, success, error, processing
            progress: 0,
            uploadedAt: new Date().toISOString(),
            error: null,
            processedRecords: 0,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);

        // Start uploading files
        newFiles.forEach((fileData) => {
            uploadFile(fileData);
        });
    };

    const uploadFile = async (fileData) => {
        try {
            // Update status to uploading
            setUploadedFiles((prev) =>
                prev.map((f) =>
                    f.id === fileData.id ? { ...f, status: "uploading" } : f
                )
            );

            const formData = new FormData();
            formData.append("file", fileData.file);
            formData.append("category", fileData.category);
            formData.append("fileName", fileData.name);

            // Simulate upload progress
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress((prev) => ({
                        ...prev,
                        [fileData.id]: progress,
                    }));

                    setUploadedFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileData.id ? { ...f, progress } : f
                        )
                    );
                }
            });

            xhr.onload = function () {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);

                    setUploadedFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileData.id
                                ? {
                                      ...f,
                                      status: "success",
                                      progress: 100,
                                      processedRecords:
                                          response.recordsProcessed || 0,
                                  }
                                : f
                        )
                    );

                    // Start processing the file
                    processFile(fileData.id);

                    setUploadStats((prev) => ({
                        ...prev,
                        successfulUploads: prev.successfulUploads + 1,
                    }));
                } else {
                    throw new Error("Upload failed");
                }
            };

            xhr.onerror = function () {
                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileData.id
                            ? {
                                  ...f,
                                  status: "error",
                                  error: "Lỗi kết nối mạng",
                              }
                            : f
                    )
                );

                setUploadStats((prev) => ({
                    ...prev,
                    failedUploads: prev.failedUploads + 1,
                }));
            };

            // Replace with your actual API endpoint
            xhr.open("POST", "/api/chatbot/upload-data");
            xhr.send(formData);
        } catch (error) {
            setUploadedFiles((prev) =>
                prev.map((f) =>
                    f.id === fileData.id
                        ? { ...f, status: "error", error: error.message }
                        : f
                )
            );

            setUploadStats((prev) => ({
                ...prev,
                failedUploads: prev.failedUploads + 1,
            }));
        }
    };

    const processFile = async (fileId) => {
        try {
            setProcessingStatus((prev) => ({
                ...prev,
                [fileId]: "processing",
            }));

            // Simulate processing API call
            // Replace with your actual processing endpoint
            const response = await fetch(`/api/chatbot/process/${fileId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const result = await response.json();
                setProcessingStatus((prev) => ({
                    ...prev,
                    [fileId]: "completed",
                }));

                setUploadedFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? {
                                  ...f,
                                  processedRecords: result.processedRecords,
                                  processingComplete: true,
                              }
                            : f
                    )
                );
            } else {
                throw new Error("Processing failed");
            }
        } catch (error) {
            setProcessingStatus((prev) => ({ ...prev, [fileId]: "failed" }));
        }
    };

    const retryUpload = (fileData) => {
        setUploadedFiles((prev) =>
            prev.map((f) =>
                f.id === fileData.id
                    ? { ...f, status: "pending", error: null, progress: 0 }
                    : f
            )
        );
        uploadFile(fileData);
    };

    const removeFile = (fileId) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
        setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    };

    const clearAll = () => {
        setUploadedFiles([]);
        setUploadProgress({});
        setUploadStats({
            totalFiles: 0,
            successfulUploads: 0,
            failedUploads: 0,
            totalSize: 0,
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "uploading":
                return (
                    <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                );
            default:
                return <FileText className="h-5 w-5 text-gray-400" />;
        }
    };

    const getCategoryInfo = (categoryValue) => {
        return (
            categories.find((cat) => cat.value === categoryValue) ||
            categories[0]
        );
    };

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
                        chatbot
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Upload className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Tổng files
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadedFiles.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Thành công
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        uploadedFiles.filter(
                                            (f) => f.status === "success"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Lỗi
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {
                                        uploadedFiles.filter(
                                            (f) => f.status === "error"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Database className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Đã xử lý
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {uploadedFiles.reduce(
                                        (sum, f) =>
                                            sum + (f.processedRecords || 0),
                                        0
                                    )}
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

                        {/* Category Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn loại dữ liệu
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
                                Hỗ trợ: PDF, DOC, DOCX, TXT, JSON, CSV, XLS,
                                XLSX (Tối đa 50MB)
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
                                accept=".pdf,.doc,.docx,.txt,.json,.csv,.xls,.xlsx"
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
                                    Files đã upload ({uploadedFiles.length})
                                </h3>
                                <button
                                    onClick={clearAll}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                            <div className="space-y-3">
                                {uploadedFiles.map((fileData) => {
                                    const categoryInfo = getCategoryInfo(
                                        fileData.category
                                    );
                                    const IconComponent = categoryInfo.icon;

                                    return (
                                        <div
                                            key={fileData.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className="flex-shrink-0">
                                                        {getStatusIcon(
                                                            fileData.status
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
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
                                                        <div className="flex items-center space-x-4 mt-1">
                                                            <p className="text-xs text-gray-500">
                                                                {formatFileSize(
                                                                    fileData.size
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {allowedFileTypes[
                                                                    fileData
                                                                        .type
                                                                ] || "Unknown"}
                                                            </p>
                                                            {fileData.processedRecords >
                                                                0 && (
                                                                <p className="text-xs text-green-600">
                                                                    {
                                                                        fileData.processedRecords
                                                                    }{" "}
                                                                    bản ghi đã
                                                                    xử lý
                                                                </p>
                                                            )}
                                                        </div>
                                                        {fileData.error && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                {fileData.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
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
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            {fileData.status ===
                                                "uploading" && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>
                                                            Đang upload...
                                                        </span>
                                                        <span>
                                                            {fileData.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${fileData.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Processing Status */}
                                            {processingStatus[fileData.id] && (
                                                <div className="mt-3 flex items-center space-x-2">
                                                    {processingStatus[
                                                        fileData.id
                                                    ] === "processing" && (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                                                            <span className="text-sm text-blue-600">
                                                                Đang xử lý dữ
                                                                liệu...
                                                            </span>
                                                        </>
                                                    )}
                                                    {processingStatus[
                                                        fileData.id
                                                    ] === "completed" && (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm text-green-600">
                                                                Xử lý hoàn tất
                                                            </span>
                                                        </>
                                                    )}
                                                    {processingStatus[
                                                        fileData.id
                                                    ] === "failed" && (
                                                        <>
                                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                                            <span className="text-sm text-red-600">
                                                                Lỗi xử lý dữ
                                                                liệu
                                                            </span>
                                                        </>
                                                    )}
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
                                <li>• DOC/DOCX - Tài liệu Word</li>
                                <li>• TXT - File text thuần</li>
                                <li>• JSON - Dữ liệu có cấu trúc</li>
                                <li>• CSV/XLS/XLSX - Dữ liệu bảng</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">
                                Lưu ý quan trọng:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Kích thước file tối đa: 50MB</li>
                                <li>• Đảm bảo nội dung bằng tiếng Việt</li>
                                <li>
                                    • Chọn đúng loại dữ liệu trước khi upload
                                </li>
                                <li>
                                    • Kiểm tra lại thông tin trước khi xác nhận
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
