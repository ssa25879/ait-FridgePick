# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

# ait-fridgepick

## Apps in Toss

```bash
npm run dev
npm run build
npm run deploy
```

플랫폼 설정은 `apps-in-toss.config.ts`에서 관리해요.

## 광고 ID 설정

`npm run build`는 항상 공식 테스트 배너 ID를 사용합니다. 실제 ID는 소스·테스트·Git에 작성하지 않습니다.

출시 설정의 기본 위치는 저장소 밖 `../local-config/ait-fridgepick/.env.release.local`입니다.
`config/release.env.example`을 이 위치로 복사하고 `FRIDGEPICK_BANNER_AD_GROUP_ID`에
콘솔에서 발급된 실제 그룹 ID를 입력한 뒤 `npm run build:release`를 실행합니다.
기존 설정 파일은 덮어쓰지 마세요. CI에서는
`FRIDGEPICK_BANNER_AD_GROUP_ID`를 보호된 환경변수로 제공할 수 있습니다.

출시 ID가 없거나 현재 지원하는 그룹 ID 형식과 다르면 출시 빌드를 중단합니다.
기본 빌드는 출시 설정을 읽지 않습니다. 이 분리는 Git 소스 노출을 줄이기 위한 것입니다.
광고 SDK가 사용하는 실제 ID는 출시 번들의 클라이언트 코드에 포함됩니다.
인증키나 비밀값을 이 설정으로 전달하지 마세요.
([Vite 환경변수·빌드 치환](https://vite.dev/guide/env-and-mode))

기존 원격 커밋에 남은 ID는 이 변경으로 제거되지 않습니다.
이력 정리·강제 푸시·광고 그룹 교체는 별도로 결정하고 진행합니다.
