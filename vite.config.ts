import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [],
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
				background: "./src/background.ts",
				content: "./src/content.ts"
			}
		}
	}
});
