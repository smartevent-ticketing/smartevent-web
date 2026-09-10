import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const transportRestrictions = [
  {
    selector: "CallExpression[callee.name='fetch']",
    message:
      "Move transport calls to the feature's api/ layer; views and hooks use its typed API functions.",
  },
  {
    selector:
      "CallExpression[callee.type='MemberExpression'][callee.object.name=/^(window|globalThis)$/][callee.property.name='fetch']",
    message: "Move transport calls to the feature's api/ layer.",
  },
]

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/features/**/*.{ts,tsx}"],
    ignores: ["src/features/*/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/api/client", "**/lib/api/client"],
              message: "Only feature api/ modules may import the transport client.",
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", ...transportRestrictions],
    },
  },
  {
    files: ["src/features/*/model/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/**",
                "react-dom",
                "react-dom/**",
                "next",
                "next/**",
                "@/lib/api/client",
                "**/lib/api/client",
                "@/features/*/api/**",
                "../api/**",
                "../../api/**",
                "@/features/*/hooks/**",
                "../hooks/**",
                "../../hooks/**",
                "@/features/*/components/**",
                "../components/**",
                "../../components/**",
              ],
              message:
                "Domain models stay independent of React, UI, and network access; orchestration belongs in application/ or hooks/.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
