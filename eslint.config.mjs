import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      // A box that scrolls sideways must take focus, or a keyboard cannot scroll it.
      // Such a box is a labelled region, so only that role may have a tabIndex.
      "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["region"] }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright's output: the HTML report and the traces of failed tests.
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
