<script>
  import { onMount } from 'svelte';

  export let text = ""; // 타이핑할 전체 문장
  export let speed = 100; // 타이핑 속도 (ms)

  let visibleText = "";
  let i = 0;

  onMount(() => {
    const interval = setInterval(() => {
      visibleText += text.charAt(i);
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  });
</script>

<span class="font-mono text-blue-600 dark:text-[#39ff14]">
  {visibleText}<span class="animate-pulse">_</span>
</span>