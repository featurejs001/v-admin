import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

function resolve(dir) {
	return path.join(__dirname, dir);
}

// 专门用于 /gy/projects 路径的配置
export default defineConfig((mode) => {
	const env = loadEnv(mode.mode, process.cwd());

	return {
		plugins: [vue()],
		resolve: {
			alias: {
				"@": resolve("src"),
			}
		},
		base: "/gy/industry/",
		build: {
			outDir: 'dist-industry',
			assetsDir: 'assets'
		},
		server: {
			host: "0.0.0.0",
			port: env.VITE_PORT,
			open: true,
		}
	}
}) 