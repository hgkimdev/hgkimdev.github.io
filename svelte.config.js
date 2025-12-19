import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex'; // 1. mdsvex 불러오기

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// 2. preprocess 배열 안에 mdsvex 실행 함수 넣기
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'] // .md 확장자 처리 설정
		})
	],

	kit: {
		adapter: adapter()
	},

	// 3. extensions 배열에 .md 추가
	extensions: ['.svelte', '.md']
};

export default config;