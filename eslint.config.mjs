import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // next/navigation의 useRouter를 직접 쓰면 router.push/replace가 스크롤을
  // 리셋하지 않아 ZoneSwitcher 필이 튀는 문제(lib/scroll.ts 참고)를 매
  // 트리거마다 다시 겪는다. lib/router.ts의 useAppRouter만 예외로 두고
  // 나머지 전체에서 막아서, 새 네비게이션 트리거가 이 처리를 빠뜨릴 수
  // 없게 한다.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["lib/router.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/navigation",
              importNames: ["useRouter"],
              message:
                "Import useAppRouter from @/lib/router instead — it resets scroll before navigating (lib/scroll.ts), which next/navigation's useRouter doesn't.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
