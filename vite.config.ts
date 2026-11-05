import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import employeeAccess from "./server/employee-access.mjs";
import auth from "./server/auth.mjs";
import javaGroups from "./server/java-groups.mjs";

const employeeApi = {
  name: "employee-api",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.split("?")[0] === "/api/acesso-funcionario") {
        void employeeAccess(req, res);
      } else if (/^\/api\/java\/grupos\/?$/i.test(req.url?.split("?")[0] || "")) {
        void javaGroups(req, res);
      } else if (
        /^\/api\/auth\/(login|me|logout)$/.test(req.url?.split("?")[0] || "")
      ) {
        void auth(req, res);
      } else next();
    });
  },
  configurePreviewServer(server: import("vite").PreviewServer) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.split("?")[0] === "/api/acesso-funcionario") {
        void employeeAccess(req, res);
      } else if (/^\/api\/java\/grupos\/?$/i.test(req.url?.split("?")[0] || "")) {
        void javaGroups(req, res);
      } else if (
        /^\/api\/auth\/(login|me|logout)$/.test(req.url?.split("?")[0] || "")
      ) {
        void auth(req, res);
      } else next();
    });
  },
};

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  // O middleware de funcionários também usa a configuração do servidor.
  const pythonApiUrl =
    process.env.SOULUP_PYTHON_API_URL ||
    environment.SOULUP_PYTHON_API_URL ||
    "https://soulup-api-python.onrender.com";
  const javaApiUrl =
    process.env.SOULUP_JAVA_API_URL ||
    environment.SOULUP_JAVA_API_URL ||
    process.env.SOULUP_API_URL ||
    environment.SOULUP_API_URL ||
    "https://challeng-sprin4-java.onrender.com";
  process.env.SOULUP_JAVA_API_URL = javaApiUrl;
  process.env.SOULUP_PYTHON_API_URL = pythonApiUrl;
  const proxy = {
    "/api/java": {
      target: javaApiUrl,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/java/, ""),
    },
    "/api": {
      target: pythonApiUrl,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ""),
    },
  };

  return {
    plugins: [employeeApi, react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      // O ZIP pode ficar bloqueado pelo Windows/OneDrive durante a geração.
      // Artefatos da entrega não precisam participar do recarregamento do site.
      watch: { ignored: ["**/output/**", "**/*.zip"] },
      proxy,
    },
    preview: { proxy },
  };
});
