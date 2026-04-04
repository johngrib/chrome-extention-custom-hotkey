# Custom Hotkey Clicker

특정 웹 페이지의 요소를 단축키로 클릭할 수 있게 해주는 크롬 확장 프로그램입니다.

## 설치 방법

1. 크롬 브라우저에서 `chrome://extensions` 에 접속합니다.
2. 우측 상단의 '개발자 모드(Developer mode)'를 켭니다.
3. '압축해제된 확장 프로그램을 로드합니다(Load unpacked)' 버튼을 누릅니다.
4. 이 프로젝트의 루트 디렉토리를 선택합니다.

## 설정 방법

1. 확장 프로그램 아이콘을 우클릭하고 '옵션'을 선택합니다.
2. JSON 형식으로 설정을 입력하고 'Save'를 누릅니다.

### 설정 JSON 예시

```json
[
  {
    "url": "https://www.google.com/.*",
    "mappings": [
      {
        "selector": "input[name='btnK']",
        "key": "s",
        "alt": true,
        "label": "Alt+S"
      }
    ]
  }
]
```

- `url`: 매칭할 URL 패턴 (정규식)
- `mappings`: 단축키와 셀렉터 목록
    - `selector`: 클릭할 요소의 CSS 셀렉터
    - `key`: 단축키 (예: `s`, `enter`, `f1`)
    - `alt`, `shift`, `ctrl`, `meta`: 보조키 여부 (true/false)
    - `label`: 화면에 표시될 힌트 텍스트

## 특징

- **커스텀 단축키**: 원하는 요소에 원하는 키를 매핑할 수 있습니다.
- **시각적 힌트**: 매핑된 요소 위에 힌트(예: Alt+S)가 표시됩니다.
- **정기적 갱신**: 3초마다 페이지를 체크하여 동적으로 생성된 요소에도 힌트를 붙입니다.
- **입력 폼 무시**: Input이나 Textarea에 입력 중일 때는 단축키가 동작하지 않습니다.
