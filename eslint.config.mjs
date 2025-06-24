// File: eslint.config.mjs

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser"; // Cần import parser

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // Bước 1: Kế thừa từ các bộ cấu hình của Next.js
    // Chú ý: "next/core-web-vitals" thường đã bao gồm các rule cho TypeScript
    // khi nó phát hiện file tsconfig.json. Bạn có thể bỏ "next/typescript".
    ...compat.extends("next/core-web-vitals"),

    // Bước 2: Thêm một đối tượng cấu hình mới để tùy chỉnh các quy tắc
    {
        // Áp dụng cho các file TypeScript/TSX
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: typescriptParser, // Chỉ định parser cho TypeScript
        },
        rules: {
            // Đây là nơi bạn định nghĩa quy tắc
            // Nếu muốn TẮT quy tắc:
            "@typescript-eslint/no-explicit-any": "off",

            // Nếu muốn nó là một CẢNH BÁO (warning):
            // "@typescript-eslint/no-explicit-any": "warn",

            // Bạn có thể thêm các quy tắc khác ở đây
            // ví dụ: "react/prop-types": "off"
        },
    },
];

export default eslintConfig;
