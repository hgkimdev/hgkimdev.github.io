// Intro 존에는 푸터가 없다. default.tsx가 있는데도 이 파일이 따로 필요하다 —
// 소프트 내비게이션에서 매칭되지 않은 슬롯은 default로 떨어지지 않고 직전
// 활성 페이지를 그대로 유지하기 때문이다(Next 문서: default.js). 그게 없으면
// /blog에서 /로 돌아왔을 때 푸터가 홈에 남는다.
export default function NoFooter() {
  return null;
}
