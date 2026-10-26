import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import packageJson from './package.json' with {type: 'json'};

export default defineConfig({
	plugins: [
		react(),
		legacy({targets: packageJson.browserslist.production}),
	],
	build: {
		outDir: 'build',
	},
	test: {
		environment: 'jsdom',
	},
});
