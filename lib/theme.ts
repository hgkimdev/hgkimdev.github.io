/**
 * <meta name="theme-color">에 쓰는 라이트/다크 배경색. app/globals.css의
 * --background(라이트 #faf9f6, 다크 oklch(0.18 0 0))와 같은 값이어야
 * 모바일 브라우저 크롬이 실제 페이지 배경과 어긋나지 않는다. meta는 CSS
 * 변수를 못 읽으므로 여기 문자열로 따로 들고 있다 — globals.css의 값을
 * 바꾸면 이 상수도 같이 바꿔야 한다. 다크 값은 oklch(0.18 0 0)을 sRGB로
 * 변환한 값(#121212).
 */
export const THEME_COLOR_LIGHT = "#faf9f6";
export const THEME_COLOR_DARK = "#121212";
