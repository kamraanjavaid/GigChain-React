import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

export default defineConfig({
  plugins: [react(), viteCommonjs()],
  resolve: {
    alias: {
      ethers: "ethers/dist/ethers.esm.js",
    },
  },
  optimizeDeps: {
    include: ["ethers"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://gigchain-backend.up.railway.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"],
    },
  },
});
