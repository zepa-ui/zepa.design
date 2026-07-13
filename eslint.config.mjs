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
    // Generated coverage report (vitest --coverage output):
    "coverage/**",
  ]),
  {
    rules: {
      // Intentionally using <img> instead of next/image:
      // - Registry demos (content/registry/**) are DISTRIBUTED code — consumers
      //   install them into projects without our next.config image domains, so
      //   next/image would break their builds on Cloudinary URLs.
      // - Site usages are tiny local logos (zzepa.png, git.png) where image
      //   optimization has no measurable benefit.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
