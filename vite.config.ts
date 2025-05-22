import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
  },
  optimizeDeps: {
    esbuildOptions: {},
  },

  plugins: [
    tsconfigPaths(),
    react(),
    svgr({
      svgrOptions: {
        // для оптимизации и удаления stroke/fill у svg
        // необходима установка @svgr/plugin-svgo
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
      },
      include: "**/*.svg",
    }),
  ],
  server: {
    hmr: { overlay: false },
    open: true,
    port: 4041,
  },
  resolve: {
    alias: {
      "~assets": path.resolve(__dirname, "./src/assets"),
      "~styles": path.resolve(__dirname, "./src/styles"),
      "~components": path.resolve(__dirname, "./src/components"),
      "~constants": path.resolve(__dirname, "./src/constants"),
      "~hooks": path.resolve(__dirname, "./src/hooks"),
      "~routes": path.resolve(__dirname, "./src/routes"),
      "~types": path.resolve(__dirname, "./src/types"),
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler",
      },
    },
  },
});
