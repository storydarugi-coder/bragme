import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // React 19 ships `react-hooks/set-state-in-effect` as an error. The rule
  // is correct in spirit but too aggressive for legit external-state
  // syncing patterns we use (sessionStorage hydration on mount, countdown
  // timers in RewardedAdGate, etc.). Downgrade to warn so it surfaces in
  // dev without blocking the prod build.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
