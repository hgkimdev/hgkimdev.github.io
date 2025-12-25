<script>
  import { fade } from 'svelte/transition';
  import Typewriter from "$lib/components/Typewriter.svelte";
</script>

<div class="max-w-2xl mx-auto px-4 pt-20 pb-16" in:fade={{ duration: 500 }}>
  <div class="mb-12">
    <h1 class="text-3xl md:text-4xl font-bold mb-6 tracking-tight
               text-gray-900 dark:text-white">
      안녕하세요, <Typewriter text="김형근입니다." speed={150} />
    </h1>
    
    <div class="prose prose-lg leading-relaxed
                text-gray-600 dark:text-gray-300 dark:prose-invert">
      <p>
        Ruby on Rails와 SvelteKit을 즐겨 사용하는 초보 개발자입니다.
        <br/>
        복잡한 문제를 단순하게 해결하는 것을 좋아하며, 
        <br/>
        만들면서 배우는 탑다운 학습 방식을 선호합니다.
      </p>
      <p>
        현재는 1인 SaaS 개발과 모던 웹 기술에 관심이 많습니다.
      </p>
    </div>
  </div>

  <div class="flex gap-6 text-lg font-medium">
    <a href="/blog" class="flex items-center transition-colors group
                           text-blue-600 hover:text-blue-800
                           dark:text-blue-400 dark:hover:text-blue-300">
      글 목록 보기 
      <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
    </a>
    
    <a href="https://github.com/hgkimdev" target="_blank" class="transition-colors
       text-gray-500 hover:text-gray-900
       dark:text-gray-400 dark:hover:text-white">
      GitHub
    </a>
  </div>

  <hr class="my-16 border-gray-100 dark:border-gray-800" />

</div>