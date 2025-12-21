<script>
  // +page.js에서 리턴한 { posts } 데이터가 여기로 들어옵니다.
  // Rails 컨트롤러에서 @posts 변수를 뷰로 넘겨준 것과 똑같습니다.
  export let data;
</script>

<div class="max-w-2xl mx-auto py-10 px-4">
  <h1 class="text-3xl font-bold mb-8">개발 블로그</h1>

  <ul class="space-y-4">
    {#if data.posts.length === 0}
      <p class="text-gray-500">아직 작성된 글이 없습니다.</p>
    {:else}
      {#each data.posts as post}
        <li class="border p-4 rounded-lg hover:shadow-lg transition bg-white">
          <a href={post.path} class="block">
            <h2 class="text-xl font-semibold text-blue-600">
              {post.meta.title}
            </h2>
            <div class="flex justify-between items-center mt-2">
              <span class="text-gray-500 text-sm">{post.meta.date}</span>
              {#if post.meta.description}
                <span class="text-gray-400 text-sm truncate max-w-xs">{post.meta.description}</span>
              {/if}
            </div>
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>