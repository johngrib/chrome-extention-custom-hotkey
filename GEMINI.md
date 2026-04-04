# Project Context: Custom Hotkey Clicker

이 프로젝트는 Google Chrome 웹 브라우저에서 특정 URL 패턴과 일치하는 웹 페이지의 요소를 단축키로 클릭할 수 있게 해주는 확장 프로그램입니다.

## 핵심 기능 (Core Features)
- **사용자 친화적 설정 (Table UI)**: 복잡한 JSON 대신 테이블 형식의 UI를 통해 URL 패턴과 단축키 매핑을 직관적으로 관리합니다.
- **물리적 키 코드 지원 (Physical Key Support)**: Mac의 `Option` 키 조합 시 발생하는 특수문자 문제를 해결하기 위해 `event.code`(물리적 위치)를 인식하여 정확한 단축키 매칭을 보장합니다.
- **시각적 힌트 (Visual Hints)**: 단축키가 할당된 요소 위에 노란색 배지로 단축키 정보를 표시하여 사용자가 즉시 인지할 수 있게 합니다.
- **지능적 입력 보호**: 사용자가 `input`, `textarea`, `contenteditable` 요소에 포커스가 있는 상태에서는 단축키 동작을 중지하여 일반적인 타이핑을 방지합니다.
- **동적 요소 감지**: 3초 주기로 페이지를 스캔하여 SPA(Single Page Application)나 동적으로 로드되는 버튼에도 자동으로 힌트를 부착합니다.

## 파일 구조 (Project Structure)
- `manifest.json`: Chrome Extension V3 명세 기반 설정 파일.
- `options.html` / `options.js`: 테이블 기반의 설정 관리 UI 및 고급 사용자를 위한 JSON 편집 모드 제공.
- `content.js`: 메인 로직. 설정 로드, URL 매칭, 힌트 렌더링, 키보드 이벤트 캡처 및 클릭 트리거 담당.
- `content.css`: 페이지 내에 표시되는 힌트 배지의 스타일.

## 데이터 스키마 (Configuration Schema)
설정 데이터는 `chrome.storage.sync`에 `customHotkeyConfig` 키로 저장됩니다.
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
1. **요소 선택 도구 (Element Picker)**: 개발자 도구를 열지 않고도 페이지에서 직접 마우스로 요소를 클릭하여 셀렉터를 추출하는 기능.
2. **성능 최적화**: `setInterval` 기반의 스캔을 `MutationObserver`로 교체하여 브라우저 부하 최소화.
3. **단축키 충돌 관리**: 웹사이트 자체 단축키와 충돌할 때의 우선순위 결정 옵션 추가.
4. **설정 백업/복원**: JSON 파일을 통한 설정 내보내기 및 가져오기 기능 강화.
