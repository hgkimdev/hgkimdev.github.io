// 1. adapter-auto 대신 adapter-static을 불러옵니다.
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			layout: {
        _: "./src/lib/layouts/PostLayout.svelte" 
      }
		})
	],

	kit: {
		// 2. 어댑터 설정: 모든 파일을 'build' 폴더로 내보냅니다.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: false,
			strict: true
		})
	},

	extensions: ['.svelte', '.md']
};

export default config;