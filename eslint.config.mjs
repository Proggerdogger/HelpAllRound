import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Global ignores for all files
    ignores: [
      "**/node_modules/",
      "**/.next/",
      "**/dist/",
      "**/build/",
      "**/coverage/",
      "**/public/build/",
    ],
  },
  // Spread the configurations from compat.extends() here
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Your custom configuration object for specific files
  {
    // Specify the files to lint
    files: ["**/*.{js,jsx,ts,tsx}"],
    // Configure the parser for TypeScript
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // Add plugins
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    // Custom rules
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "react/react-in-jsx-scope": "off", // Disable to avoid previous errors
      "@typescript-eslint/no-explicit-any": "off", // Allow explicit any
    },
    
    // Add React settings
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

export default eslintConfig; 
