# 벤더링한 에디터 테마

`tokyo-night-light.json`은 [enkia/tokyo-night-vscode-theme](https://github.com/enkia/tokyo-night-vscode-theme)의
`themes/tokyo-night-light-color-theme.json`을 그대로 가져온 것이다 (MIT, 전문은
`tokyo-night-light.LICENSE.txt`).

shiki 번들에는 `tokyo-night`(다크)만 있고 라이트 짝이 없어서 원본에서 직접 가져왔다.
가져오면서 두 군데를 손봤다:

1. **JSONC → JSON**: VS Code 테마 파일은 주석과 트레일링 콤마를 허용하지만 `import`는
   엄격한 JSON만 받는다. 주석을 걷어내고 트레일링 콤마를 지웠다(값은 그대로).
2. **`"type": "dark"` → `"light"`**: 원본 파일의 오기다. 이름도 배경색(#e6e7ed)도
   라이트인데 type만 dark로 적혀 있다. shiki가 이 값으로 기본 전경/배경을 고르므로
   바로잡았다.
3. **에디터 전용 키 제거**: `semanticTokenColors`·`semanticClass`·
   `tokenColorCustomizations`·`author`·`maintainers`를 지웠다. shiki가 정적
   하이라이팅에 쓰는 건 `name`/`type`/`colors`/`tokenColors`뿐이라 결과는 같고,
   `semanticTokenColors`는 값 모양이 shiki 타입과 달라 TS 캐스팅이 필요해진다.

업데이트할 일이 생기면 위 두 가지를 다시 적용해야 한다.
