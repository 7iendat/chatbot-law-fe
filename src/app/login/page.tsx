// File: app/login/page.tsx (HOÀN THIỆN)

import { Suspense } from "react";
import LoginForm from "./LoginForm";

// Đây là một component đơn giản để hiển thị trong khi LoginForm đang tải.
// Bạn có thể tùy chỉnh nó để giống với UI của bạn, ví dụ dùng skeleton.
function LoginPageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default function LoginPage() {
    return (
        // Bọc toàn bộ logic động trong Suspense.
        // Next.js sẽ render LoginPageLoading trước, sau đó thay thế bằng LoginForm khi nó sẵn sàng.
        <Suspense fallback={<LoginPageLoading />}>
            <LoginForm />
        </Suspense>
    );
}
