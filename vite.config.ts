import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const input = process.argv[4]?.split("=")?.[1];
if (input) {
	console.log("Single building: " + input);
}

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
		emptyOutDir: false,
		rollupOptions: {
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
				inlineDynamicImports: true
			},
			input: input
		}
	}
});
