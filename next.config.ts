import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "", // Để trống nếu là port mặc định (443 cho https)
                pathname: "/**", // Cho phép tất cả các đường dẫn con trên hostname này
            },
            // Thêm các hostname khác nếu cần
            // Ví dụ, nếu bạn có ảnh từ API của mình trên một domain khác:
            // {
            //   protocol: 'https',
            //   hostname: 'api.yourdomain.com',
            //   port: '',
            //   pathname: '/uploads/**',
            // },
            // Nếu bạn sử dụng ảnh từ Gravatar (ví dụ):
            // {
            //   protocol: 'https',
            //   hostname: 'www.gravatar.com',
            //   port: '',
            //   pathname: '/avatar/**',
            // }
        ],
        // Bạn cũng có thể dùng `domains` nếu chỉ cần khai báo hostname đơn giản (ít linh hoạt hơn remotePatterns)
        // domains: ['images.unsplash.com', 'api.yourdomain.com', 'www.gravatar.com'],
    },
    /* config options here */
    async rewrites() {
        return [
            {
                source: "/api/:path*", // Tất cả request bắt đầu bằng /api/
                destination: "http://127.0.0.1:5000/api/:path*", // Sẽ được proxy đến backend của bạn
            },
        ];
    },
};

export default nextConfig;
