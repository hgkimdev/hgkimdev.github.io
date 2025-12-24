<script>
  import "./layout.css"; 
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
</script>

<div class="min-h-screen flex flex-col font-sans transition-colors duration-300">
  
  <nav class="sticky top-0 z-50 w-full backdrop-blur-xl 
            bg-white/70 dark:bg-[#09090b]/80 
            dark:header-glow
            transition-all duration-300">
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
      <div class="prose prose-slate dark:prose-invert lg:prose-lg 
                  prose-a:text-blue-600 dark:prose-a:text-[#0fa] max-w-none">
        <slot />
      </div>
    </article>
  </main>

  <footer class="mt-20 py-10 text-center text-sm text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800">
    <p>© 2026 Hgkim Dev.</p>
  </footer>

</div>