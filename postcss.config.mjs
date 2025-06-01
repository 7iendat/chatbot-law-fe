// postcss.config.mjs
const config = {
    plugins: [
        "@tailwindcss/postcss", // Đảm bảo nó load được tailwind.config.js
        "autoprefixer",
    ],
};
export default config;
