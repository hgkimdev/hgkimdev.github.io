<script>
  import Comment from "$lib/components/Comment.svelte";
</script>

<div class="prose prose-slate lg:prose-lg max-w-none
            dark:prose-invert
            dark:prose-headings:text-white
            dark:prose-p:text-gray-200
            dark:prose-a:text-[#00ffff]
            dark:prose-strong:text-[#39ff14]
            mb-16"> <slot />
</div>

<Comment />