import { defineConfig } from "vite";

import pluginReactSwc from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression2";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from 'tailwindcss';

export default defineConfig({
  root: "js",
  base: "/assets",

  plugins: [
    // Use the SWC compiler for React components
    pluginReactSwc(),

    // Enable GZIP/Brotli compression for the output files
    viteCompression({ algorithm: "brotliCompress" }),
    viteCompression({ algorithm: "gzip" }),

    // Load Typescript paths from the tsconfig.json file
    tsconfigPaths(),
  ],

  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },

  build: {
    manifest: true,
    rollupOptions: {
      input: "js/index.tsx",
    },
    outDir: "../server/assets",
  },

  server: {
    origin: "http://localhost:5173",
  },
});
