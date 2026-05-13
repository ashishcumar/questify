import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: { index: "src/react/index.ts" },
    outDir: "dist/react",
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    external: ["react"],
  },
  {
    entry: { index: "src/vue/index.ts" },
    outDir: "dist/vue",
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    external: ["vue"],
  },
]);
