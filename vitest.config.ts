// vite.config.js
import { defineConfig } from "vitest/config";
import { loadEnv } from 'vite'
import * as path from 'node:path';

export default defineConfig(({mode}) => ({
  test: {
    globals: true, // Enables global APIs like describe, it, expect
    environment: "jsdom", // Use 'jsdom' for browser-like tests, 'node' for backend
    env: loadEnv(mode, path.dirname(__filename), 'ELEGANT'),
    coverage: {
      "provider": "v8",
      reporter: ["text", "html"], // Output coverage reports in text and HTML format
    },
    silent: false,
    disableConsoleIntercept:true,
    onConsoleLog(log) {
      console.log(log)
    }
  },
}))
