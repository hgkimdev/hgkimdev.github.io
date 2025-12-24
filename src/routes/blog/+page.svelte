<script>
  export let data;
</script>

<div class="max-w-2xl mx-auto py-20 px-4">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-12 tracking-tight">
    글 목록
  </h1>

  <ul class="space-y-6">
    {#if data.posts.length === 0}
      <p class="text-gray-500 dark:text-gray-400">작성된 글이 없습니다.</p>
    {:else}
      {#each data.posts as post}
        <li class="group relative"> <a href={post.path} 
             class="block p-6 rounded-2xl transition-all duration-300
                    border border-transparent /* 기본 테두리 투명 */
                    
                    /* [라이트모드 설정] */
                    hover:bg-gray-50
                    
                    /* [다크모드 설정 - 핵심!] */
                    dark:hover:bg-transparent          /* 배경색 간섭 제거 */
                    dark:border-white/10               /* 평소엔 아주 희미한 흰색 테두리 */
                    
                    /* 호버 시: 테두리가 라임색(#39ff14)으로 변함 */
                    dark:hover:border-[#39ff14]
                    
                    /* 호버 시: 후광 효과 (CSS 파일 없이 직접 주입) */
                    /* 그림자: x=0 y=0 blur=30px 색상=라임그린(투명도 0.5) */
                    dark:hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]
                    
                    /* 호버 시: 살짝 위로 뜸 */
                    hover:-translate-y-1">
            
            <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <time>{post.meta.date}</time>
              {#if post.meta.categories}
                <span class="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <span class="font-medium text-blue-600 dark:text-cyan-400">
                  {post.meta.categories[0]}
                </span>
              {/if}
            </div>

            <h2 class="text-xl md:text-2xl font-bold transition-colors mb-2
                       text-gray-800 dark:text-gray-100 
                       group-hover:text-blue-700 dark:group-hover:text-[#39ff14]">
              {post.meta.title}
            </h2>

            {#if post.meta.description}
              <p class="leading-relaxed line-clamp-2 text-gray-600 dark:text-gray-400">
                {post.meta.description}
              </p>
            {/if}
            
            <div class="mt-4 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300
                        text-blue-600 dark:text-[#39ff14]">
              Read more →
            </div>
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>