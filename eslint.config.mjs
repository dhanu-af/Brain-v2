import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The 3D graph renders via react-three-fiber's useFrame loop and pointer
    // events, which mutate plain Three.js/simulation objects outside React's
    // render cycle for performance. The react-hooks purity/immutability/refs
    // rules assume React-Compiler-style render semantics and don't recognize
    // that pattern, so they're disabled for this imperative rendering layer.
    files: ["src/components/graph/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
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
]);

export default eslintConfig;
