// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class", // QUAN TRỌNG: Bật chế độ class cho dark mode
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        // Thêm các đường dẫn khác nơi bạn sử dụng class Tailwind
    ],
    theme: {
        extend: {
            // Bạn có thể di chuyển các biến màu từ CSS variables vào đây nếu muốn
            // Ví dụ:
            // colors: {
            //   background: 'hsl(var(--background))', // Nếu vẫn muốn dùng CSS var
            //   foreground: 'hsl(var(--foreground))',
            //   // Hoặc định nghĩa màu trực tiếp
            //   // myBackgroundLight: '#ffffff',
            //   // myBackgroundDark: '#0a0a0a',
            // },
            fontFamily: {
                sans: [
                    "Inter",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
                mono: ["Menlo", "Monaco", "Courier New", "monospace"],
            },
        },
    },
    plugins: [
        // Nếu bạn đang dùng @tailwindcss/postcss trong postcss.config.mjs,
        // bạn không cần thêm plugin Tailwind ở đây nữa.
        // Tuy nhiên, các plugin khác của Tailwind như @tailwindcss/forms, @tailwindcss/typography
        // có thể được thêm vào đây nếu cần.
    ],
};
