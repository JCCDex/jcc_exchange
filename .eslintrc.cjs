/* eslint-env node */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "no-console": "off",
    "no-async-promise-executor": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "prefer-const": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ]
  },
  overrides: [
    {
      files: ["src/types/**/*.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "no-unused-vars": "off"
      }
    }
  ],
  ignorePatterns: ["lib/", "coverage/", "node_modules/"]
};
