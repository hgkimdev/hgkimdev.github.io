<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // ★ 1단계에서 얻은 값을 여기에 붙여넣으세요!
  const REPO = "hgkimdev/hgkimdev.github.io"; 
  const REPO_ID = "R_kgDOQqd-eg";
  const CATEGORY = "General"; // 아까 선택한 카테고리 이름 (보통 General)
  const CATEGORY_ID = "DIC_kwDOQqd-es4C0Ou0";

  let theme = 'light'; // 기본 테마

  // 현재 사이트 테마 상태를 확인하고 Giscus 테마를 결정하는 함수
  function getGiscusTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    // 다크모드일 때: 'transparent_dark' (배경이 투명해서 우리 네온 테마와 잘 어울림)
    // 라이트모드일 때: 'light'
    return isDark ? 'transparent_dark' : 'light';
  }

  // 테마 변경 메시지를 Giscus iframe으로 전송하는 함수
  function updateGiscusTheme() {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    
    const newTheme = getGiscusTheme();
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: newTheme } } },
      'https://giscus.app'
    );
  }

  onMount(() => {
    if (!browser) return;

    theme = getGiscusTheme();

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', REPO);
    script.setAttribute('data-repo-id', REPO_ID);
    script.setAttribute('data-category', CATEGORY);
    script.setAttribute('data-category-id', CATEGORY_ID);
    script.setAttribute('data-mapping', 'pathname'); // URL 기준으로 댓글 매칭
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', theme); // 초기 테마 설정
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    const container = document.getElementById('giscus-container');
    container.appendChild(script);

    // 테마 변경 감지 (html 태그의 class 속성 변화를 감시)
    const observer = new MutationObserver(() => {
      updateGiscusTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  });
</script>

<div class="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
  <div id="giscus-container"></div>
</div>