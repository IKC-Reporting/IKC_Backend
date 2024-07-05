import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "tailwind.config.ts"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      exclude: [
        // says there is an error but that is not the case
        // @ts-ignore
        ...configDefaults.coverage.exclude,
        "*.config.ts",
        "codegen.ts",
        "**/__mocks__/*",
        "prisma/*",
        "**/prisma.ts",
        // ignoring resolvers for now as it only passes through and we will likely not be adding any tests to it
        "src/resolvers/index.ts",
      ],
    },
  },
});
