import globals from "globals";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
// You have eslint-config-google in devDependencies, but it's not directly usable in flat config
// without a compat layer or manually taking its rules. For simplicity, we'll use recommended sets.

export default tseslint.config(
  {
    // Global ignores within the functions directory
    ignores: ["lib/**", "node_modules/**", "eslint.config.js"],
  },
  // Base recommended ESLint rules
  // eslint.configs.recommended, // This would be from a top-level eslint import if using `eslint` package directly for this.
  // For tseslint, the equivalent is often part of its own recommended sets or you build from scratch.
  
  // TypeScript specific configurations
  {
    files: ["src/**/*.ts", "src/**/*.js"], // Target your source files
    languageOptions: {
      globals: {
        ...globals.node, // Node.js global variables
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Path to your functions tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Correctly resolves project path
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import": pluginImport,
    },
    rules: {
      // Common rules from your previous .eslintrc.js, adjust as needed
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "object-curly-spacing": ["error", "always"],
      "max-len": ["warn", { "code": 120 }],
      
      // Rules from eslint-plugin-import (examples)
      "import/no-unresolved": "off", // Often handled by TypeScript compiler checks
      "import/export": "error",
      "import/no-duplicates": "error",

      // TypeScript specific rules (can customize from tseslint.configs.recommended)
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off", // Can be useful for functions
      
      // Allow specific unsafe operations due to using 'any' for context/data in onCall
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off", // Proactively adding this for functions called on 'any'
      "@typescript-eslint/no-unsafe-return": "off", // Proactively adding this for functions returning 'any'
      "@typescript-eslint/no-unsafe-argument": "off", // Proactively adding this

      // If you were using rules from eslint-config-google, you'd add them here manually
      // e.g., "require-jsdoc": "off", "valid-jsdoc": "off"
      "no-console": "warn", // Example: discourage console.log in production code
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
  // Apply recommended TypeScript rules (this includes many useful defaults)
  // These are arrays of config objects, so spread them.
  // ...tseslint.configs.recommendedTypeChecked, // Or .strictTypeChecked for more rules
  // If you want ESLint's own recommended rules (not TypeScript specific)
  // you might need to import `eslint` itself and use `eslint.configs.recommended`
); 