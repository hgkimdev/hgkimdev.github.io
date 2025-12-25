<script>
  import "./layout.css"; 
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import ProgressBar from "$lib/components/ProgressBar.svelte";
</script>

<ProgressBar />

<div class="min-h-screen flex flex-col font-sans transition-colors duration-300">
  
  <nav class="sticky top-0 z-50 w-full backdrop-blur-xl 
            bg-white/70 dark:bg-[#09090b]/80 
            transition-all duration-300
            
            /* 라이트모드 */
            border-b border-gray-200/50 
            
            /* [다크모드 수정 포인트]
              1. 테두리: border-blue-500/30 (청록색->진한 파랑으로 변경)
              2. 그림자: rgba(0, 100, 255, 0.6) (일렉트릭 블루)
                 - Cyan(0, 255, 255) 대신 순수한 파란색(Blue) 베이스를 사용했습니다.
                 - 블러(60px)를 좀 더 키워서 더 넓고 시원하게 퍼지도록 했습니다.
            */
            dark:border-b dark:border-blue-500/30
            dark:shadow-[0_10px_60px_-15px_rgba(0,100,255,0.6)]">
            
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        
        <div class="flex-shrink-0">
          <a href="/" class="text-lg font-bold text-gray-900 dark:text-white dark:neon-text-glow transition-all">
            Hgkim.Dev
          </a>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="hidden md:flex space-x-6 font-medium text-sm text-gray-600 dark:text-gray-300">
            <a href="/" class="hover:text-blue-600 dark:hover:text-[#0fa] dark:hover:drop-shadow-[0_0_8px_rgba(0,255,170,0.8)] transition-all">홈</a>
            <a href="/blog" class="hover:text-blue-600 dark:hover:text-[#0fa] dark:hover:drop-shadow-[0_0_8px_rgba(0,255,170,0.8)] transition-all">블로그</a>
          </div>
          <ThemeToggle />
        </div>

      </div>
    </div>
    
    </nav>

  <main class="flex-grow w-full">
    <article class="w-full">
      <div class="prose prose-slate lg:prose-lg max-w-none
                  
                  /* 다크모드 타이포그래피 설정 */
                  dark:prose-invert
                  dark:prose-headings:text-white
                  dark:prose-p:text-gray-200
                  dark:prose-li:text-gray-200
                  dark:prose-ul:text-gray-200
                  dark:prose-strong:text-[#39ff14]
                  
                  prose-a:text-blue-600 
                  dark:prose-a:text-[#00ffff] dark:prose-a:no-underline
                  hover:prose-a:text-blue-800 
                  dark:hover:prose-a:text-[#39ff14]
                  
                  dark:prose-blockquote:border-l-[#39ff14]
                  dark:prose-blockquote:text-gray-300
                  dark:prose-code:text-[#00ffff]">
        <slot />
      </div>
    </article>
  </main>

  <footer class="mt-20 py-10 text-center text-sm text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800">
    <p>© 2026 Hgkim Dev.</p>
  </footer>

</div>