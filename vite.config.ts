/// <reference types="vitest/config" />

import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	ssr: {
		resolve: {
			externalConditions: ["workerd", "worker"],
		},
	},
	plugins: [cloudflare(), tailwindcss(), reactRouter(), tsconfigPaths()],
	worker: {
		format: "es",
		rollupOptions: {
			output: {
				entryFileNames: (chunkInfo) => {
					if (chunkInfo.name.includes("worker")) {
						return "workers/[name]-[hash].js";
					}
					return "[name]-[hash].js";
				},
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"webllm-worker": ["./app/workers/webllm-worker.ts"],
				},
			},
		},
	},
	server: {
		headers: {
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
		},
	},
});
