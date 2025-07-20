import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

function resolve(dir) {
	return path.join(__dirname, dir);
}


// https://vite.dev/config/
export default defineConfig((mode) => {
	const env = loadEnv(mode.mode, process.cwd());

	return {
		plugins: [vue()],
		resolve: {
			alias: {
				"@": resolve("src"),
			}
		},
		base: "/gy/projects/",
		 build: {
		    outDir: 'dist',
		    assetsDir: 'assets'
		  },
		server: {
			host: "0.0.0.0",
			port: env.VITE_PORT,
			open: true,
			// proxy: {
			// 	[env.VITE_APP_BASE_API]: {
			// 		target: "https://api.d.vlightcap.com",
			// 		ws: true,
			// 		changeOrigin: true,
			// 		rewrite: (path) => {
			// 			let reg = new RegExp("^" + env.VITE_APP_BASE_API);
			// 			console.log("____reg", reg);
			// 			// return path.replace(/^\/api/, "");
			// 			return path.replace(reg, "");
			// 		},
			// 	},
			// },
		}
	}
})
