import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".output",
      ".vinxi",
      ".vercel",
      // Generated bundles: `api/` is esbuild output of `api-src/`, and routeTree.gen.ts
      // is written by the TanStack Router plugin. Linting either one is noise.
      "api/**",
      "src/routeTree.gen.ts",
      // Sanity Studio is a separate package with its own React version and toolchain.
      "studio-enice-group/**",
      // Supabase Edge Functions run on Deno with `npm:`/`jsr:` specifiers that this
      // browser/Node-oriented config cannot resolve. They are checked by `deno check`
      // in CI instead — see .github/workflows/ci.yml.
      "supabase/functions/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Surfaced as a warning so dead imports are visible without failing the build.
      // `_`-prefixed identifiers are the opt-out for deliberately unused bindings.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Vendored shadcn/ui primitives. Co-locating a `cva` variant export with the
    // component is the upstream convention, so the react-refresh heuristic is noise here.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  eslintPluginPrettier,
);
