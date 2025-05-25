export const AuthLoadingSpinner = () => (
    <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4 animate-fadeIn">
            <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
                <p className="text-gray-600 font-medium">Đang xác thực...</p>
                <p className="text-gray-400 text-sm mt-1">
                    Vui lòng chờ trong giây lát
                </p>
            </div>
        </div>
        <style jsx>{`
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .animate-fadeIn {
                animation: fadeIn 0.3s ease-out;
            }
        `}</style>
    </div>
);
