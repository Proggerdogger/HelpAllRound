import nextPlugin from "@next/eslint-plugin-next";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export default [
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
      "@next/next": nextPlugin,
      "@typescript-eslint": typescriptEslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    // Extend recommended configurations
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...typescriptEslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Disable react-in-jsx-scope
      "react/no-unescaped-entities": "off",
    },
    // Add React settings
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
