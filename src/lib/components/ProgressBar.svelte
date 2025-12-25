<script>
  let scrollY = 0;
  let innerHeight = 0;
  let percent = 0;

  // 반응형 구문 ($:) : 스크롤(scrollY)이 움직일 때마다 실행됨
  $: {
    // 브라우저 환경인지 확인 (서버 사이드 렌더링 에러 방지)
    if (typeof document !== 'undefined') {
      
      // 전체 문서의 높이 (눈에 안 보이는 아래쪽 영역까지 포함)
      const scrollHeight = document.documentElement.scrollHeight;
      
      // 실제 스크롤 가능한 구간 = 전체 높이 - 현재 화면 높이
      const scrollableHeight = scrollHeight - innerHeight;

      if (scrollableHeight > 0) {
        // 진행률 계산
        percent = (scrollY / scrollableHeight) * 100;
        
        // 100% 넘가는 것 방지
        if (percent > 100) percent = 100;
      } else {
        percent = 0;
      }
    }
  }
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="fixed top-0 left-0 w-full h-1.5 z-[100] bg-transparent pointer-events-none">
  <div 
    class="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-[#39ff14] shadow-[0_0_10px_#00ffff]"
    style="width: {percent}%; transition: width 0.1s linear;"
  >
    <div class="absolute right-0 top-0 h-full w-2 bg-white blur-[2px] opacity-70"></div>
  </div>
</div>