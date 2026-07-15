import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "bootstrap/**",
      "scripts/**",
      "shell/**",
      "dry_runs/**",
      "agent_runs/**",
      "_forgeshell_archive/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
