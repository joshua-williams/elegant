// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true, // Enables global APIs like describe, it, expect
    environment: "jsdom", // Use 'jsdom' for browser-like tests, 'node' for backend
    coverage: {
      reporter: ["text", "html"], // Output coverage reports in text and HTML format
    },
  },
});
