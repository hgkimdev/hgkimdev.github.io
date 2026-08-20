// 하드 로드에서 이 슬롯의 활성 상태를 복구할 수 없을 때의 대비책. 슬롯을
// 만들었으면 반드시 있어야 한다(없으면 Next가 에러를 낸다). 소프트
// 내비게이션용 대비는 옆의 page.tsx가 맡는다 — 둘 다 필요한 이유는 거기에
// 적어뒀다.
export default function NoFooter() {
  return null;
}
