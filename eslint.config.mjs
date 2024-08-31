import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2021,
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "functional/no-expression-statements": ["error", { ignoreVoid: true }],
      "no-console": "off",
      "no-underscore-dangle": "off",
      "no-bitwise": "off",
      "no-undef": "error",
      "no-unused-vars": "off",
      semi: "error",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "no-implicit-coercion": "error",
      "prefer-const": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/naming-convention": "error",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    ignores: ["**/*.d.ts", "dist/**", "node_modules/**"],
  }
);
