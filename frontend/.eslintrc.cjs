module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],

  "check-file/filename-naming-convention": [
    "error",
    {
      "**/*.{ts,tsx}": "KEBAB_CASE",
    },
    {
      // ignore the middle extensions of the filename to support filename like bable.config.js or smoke.spec.ts
      ignoreMiddleExtensions: true,
    },
  ],
  "check-file/folder-naming-convention": [
    "error",
    {
      // all folders within src (except __tests__)should be named in kebab-case
      "src/**/!(__tests__)": "KEBAB_CASE",
    },
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react", "react-hooks", "react-refresh"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-no-target-blank": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
