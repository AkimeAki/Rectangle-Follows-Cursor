import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@/": `${__dirname}/src/`
		}
	},
	root: "./src/",
	build: {
		outDir: "../dist/",
		emptyOutDir: true,
		rollupOptions: {
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]"
			},
			input: {
				option: "./src/option.html",
				demo: "./src/demo.html",
				background: "./src/background.ts",
				content: "./src/content.ts"
			}
		}
	}
});
