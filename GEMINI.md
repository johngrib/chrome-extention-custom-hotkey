# Project Context: Custom Hotkey Clicker

이 프로젝트는 Google Chrome 웹 브라우저에서 특정 URL 패턴과 일치하는 웹 페이지의 요소를 단축키로 클릭할 수 있게 해주는 확장 프로그램입니다.

## 핵심 기능 (Core Features)
- **사용자 친화적 설정**: 테이블 기반 UI로 URL 패턴과 단축키 매핑을 편리하게 관리합니다.
- **시각적 힌트 (Visual Hints)**: 단축키가 할당된 요소 위에 노란색 배지로 단축키 정보를 표시합니다.
- **물리적 키 코드 지원**: Mac 등에서 `Option` 키 조합 시 발생하는 특수문자 문제를 해결하기 위해 `event.code`(물리적 위치)를 함께 체크합니다.
- **지능적 무시**: 사용자가 `input`, `textarea` 등 입력 폼에 포커스가 있을 때는 단축키가 동작하지 않도록 처리되어 있습니다.
- **동적 감시**: 3초 주기로 페이지를 검사하여 AJAX 등으로 동적으로 생성된 요소에도 힌트를 부착합니다.

## 파일 구조 (Project Structure)
- `manifest.json`: V3 명세의 확장 프로그램 설정 파일.
- `options.html` / `options.js`: 테이블 기반 설정 관리 화면 및 JSON 내보내기/가져오기 기능.
- `content.js`: 페이지 로드 시 설정을 불러와 힌트를 렌더링하고 `keydown` 이벤트를 가로채 클릭을 실행하는 핵심 로직.
- `content.css`: 힌트(`.chc-hint`)의 스타일 정의.

## 데이터 스키마 (Configuration Schema)
```json
[
  {
    "url": "regex_pattern",
    "mappings": [
      {
        "selector": "css_selector",
        "key": "character (e.g., 'c', 's')",
        "alt": boolean,
        "shift": boolean,
        "ctrl": boolean,
        "meta": boolean,
        "label": "display_text"
      }
    ]
  }
]
```

## 향후 작업 아이디어 (Next Steps / Backlog)
1. **요소 선택 도구**: 페이지에서 마우스 클릭으로 요소를 선택하여 셀렉터를 자동 생성하는 기능.
2. **단축키 충돌 방지**: 웹사이트 자체 단축키와 충돌할 경우 우선순위 설정 옵션.
3. **성능 최적화**: `setInterval` 대신 `MutationObserver`를 사용하여 DOM 변경 감지.
