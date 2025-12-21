// src/routes/blog/+page.js

export const load = async () => {
  // 1. Rails의 Post.all과 같습니다. 
  // 현재 폴더(./) 아래의 모든 .md 파일을 찾습니다.
  const allPostFiles = import.meta.glob('./**/*.md', { eager: true });

  // 2. 파일 목록을 우리가 쓰기 좋게 가공합니다.
  const posts = Object.entries(allPostFiles).map(([path, post]) => {
    // path 예시: "./rails-vs-svelte/+page.md"
    // 여기서 불필요한 앞뒤 경로를 잘라내고 폴더명("rails-vs-svelte")만 남겨서 링크로 만듭니다.
    const postPath = path.slice(2, -9); 
    
    return {
      path: `/blog/${postPath}`, // 링크 주소
      meta: post.metadata // 마크다운 상단의 --- 내용 (제목, 날짜 등)
    };
  });

  // 3. 날짜 최신순 정렬 (Rails의 .order(date: :desc))
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.meta.date) - new Date(a.meta.date);
  });

  // 4. +page.svelte로 데이터를 넘겨줍니다.
  return {
    posts: sortedPosts
  };
};