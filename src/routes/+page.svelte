<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<script>
  // 레일즈 컨트롤러에서 @name = "Dev" 한 것과 같습니다.
  let name = "Svelte Beginner";
</script>

<div class="p-10 max-w-2xl mx-auto">
  <h1 class="text-4xl font-bold text-blue-600 mb-4">
    안녕하세요, {name}님!
  </h1>
  
  <p class="text-gray-700 text-lg">
    이것은 저의 첫 번째 스벨트 블로그입니다.
    <br/>
    Rails와 다르게 <strong>변수 변경이 즉시 반영</strong>됩니다.
  </p>

  <button 
    class="mt-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
    on:click={() => name = "Svelte Master"}
  >
    이름 바꾸기 (클릭!) 
  </button>
</div>