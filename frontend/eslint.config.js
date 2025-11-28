// eslint.config.js
import next from "eslint-config-next";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules", "dist", ".next"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      }
    },
    plugins: {
      "@typescript-eslint": ts
    },
    rules: {
      ...next.rules,
      "@typescript-eslint/no-unused-vars": ["warn"],
      "react/jsx-no-undef": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];
