
# Figma Feature Flags – 아키텍처


## 목차

- [1. 개요](#1-개요)
- [2. 설계 목표](#2-설계-목표)
- [3. 상위 아키텍처](#3-상위-아키텍처)
- [4. 핵심 개념 및 데이터 모델](#4-핵심-개념-및-데이터-모델)
- [5. 메인 프로세스 (`code.ts`)](#5-메인-프로세스-codets)
- [6. UI 셸 (`ui.ts`)](#6-ui-셸-uits)
- [7. 이벤트 시스템 (`src/event/emitter.ts`)](#7-이벤트-시스템-srceventemitterts)
- [8. Web Component 아키텍처](#8-web-component-아키텍처)
- [9. App 컴포넌트 (`src/components/app/App.ts`)](#9-app-컴포넌트-srccomponentsappappts)
- [10. Feature Container (`src/components/feature-container/FeatureContainer.ts`)](#10-feature-container-srccomponentsfeature-containerfeaturecontainerts)
- [11. Row 컴포넌트 (`src/components/row/Row.ts`)](#11-row-컴포넌트-srccomponentsrowrowts)
- [12. Context Menu (`src/components/context-menu/ContextMenu.ts`)](#12-context-menu-srccomponentscontext-menucontextmenuts)
- [13. 헬퍼 함수 (`src/components/helper.ts`)](#13-헬퍼-함수-srccomponentshelperts)
- [14. 영속화](#14-영속화)
- [15. 테스트](#15-테스트)
- [16. 한계점 및 향후 개선 방향](#16-한계점-및-향후-개선-방향)


## 1. 개요

이 레포지토리는 Figma 노드에 대해 “feature flag”를 관리할 수 있는 Figma 플러그인을 포함하고 있습니다.

디자이너는 각 시나리오마다 레이어/스크린의 visibility를 직접 켜고 끄는 대신, 아래와 같은 방식으로 사용할 수 있습니다.

- 기능(Feature)을 정의한다 (예: `A/B Test – Variant A`, `Logged-in`, `Dark Mode`)
- 해당 기능에 Figma 노드를 연결한다
- 기능의 visible 상태를 토글하면, 연결된 노드들의 visibility가 문서에서 함께 변경된다

전체 시스템은 다음으로 구성됩니다.

- Figma 플러그인 메인 프로세스(플러그인 샌드박스, `code.ts`)
- 웹 기반 UI(iframe, `ui.ts` + Web Components)
- 상태를 조율하기 위한 이벤트 버스와 타입 기반 모델

---

## 2. 설계 목표

- **관심사 분리**
  - Figma 문서 조작은 메인 프로세스(`code.ts`)에만 존재
  - UI 상태/인터랙션은 iframe 측(`ui.ts` + components)에만 존재
- **예측 가능한 상태 관리**
  - UI 쪽 feature/selection의 단일 소스는 `App` 컴포넌트
  - feature 트리 변환은 순수 함수로만 처리
- **테스트 가능한 프론트엔드**
  - Web Components + 이벤트 버스를 Jest + jsdom으로 테스트
- **플러그인 친화적인 UI 아키텍처**
  - React/Vue 등 프레임워크 의존 없음
  - Web Components + Shadow DOM으로 번들 크기를 작게 유지하고, 의존성을 줄임

Non-goals:

- 디자인 시스템 수준의 풀스케일 feature flag 매니저 제공
- 수천 개 노드/feature가 있는 초대형 문서에 대한 최적화

---

## 3. 상위 아키텍처

```text
┌───────────────────────────────────────────────────────────────────┐
│                          Figma Plugin                            │
│                                                                   │
│  ┌──────────────────────────┐         ┌─────────────────────────┐ │
│  │ Main Process (code.ts)   │         │ UI iframe (ui.ts)       │ │
│  │                          │         │                         │ │
│  │ - Reads Figma selection  │  post   │ - Renders Web Components│ │
│  │ - Builds Feature/Node    │◀───────▶│ - Handles user input    │ │
│  │   data from nodes        │ message │ - Emits UI events via   │ │
│  │ - Toggles node visibility│         │   event bus             │ │
│  │ - Persists to            │         └─────────┬───────────────┘ │
│  │   figma.clientStorage    │                   │ emitter        │
│  └──────────────────────────┘                   ▼                 │
│                                                │                 │
│                             ┌──────────────────┴─────────────┐   │
│                             │   Web Components (components)  │   │
│                             │                                │   │
│                             │  App          FeatureContainer │   │
│                             │   │                 │          │   │
│                             │   ▼                 ▼          │   │
│                             │  Row           ContextMenu     │   │
│                             └───────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 4. 핵심 개념 및 데이터 모델

타입은 `src/components/types.ts`에 정의되어 있습니다.

### Feature

논리적인 feature flag를 나타냅니다.

```ts
type Feature = {
  id: string;
  name: string;
  visible: boolean;
  items: Item[]; // 하위 feature 및 node가 섞여 있는 트리 구조
};
```

### Node

Figma 노드와의 연결을 나타냅니다.

```ts
type Node = {
  id: string;            // Figma node ID
  name: string;          // 연결 시점의 노드 이름
  type: 'NODE';
  featureId: string;     // 소속 feature ID
};
```

### Item

재귀 트리를 위한 유니온 타입입니다.

```ts
type Item = Feature | Node;
```

### Focused

UI 상에서 어떤 항목이 포커스되어 있는지 나타냅니다.

```ts
type Focused = {
  featureId: string | null;
  itemId: string | null;
};
```

---

## 5. 메인 프로세스 (`code.ts`)

역할:

- **Figma 문서에 대한 단일 진입점** 역할
- 플러그인 UI 상태와 Figma 문서 상태를 동기화
- feature 정보를 `figma.clientStorage`에 영속화

### 5.1. UI로부터 들어오는 이벤트

UI → 메인으로 전달되는 주요 메시지 타입:

- `SYNC_FEATURES`
  - 초기 로드 등, UI와 문서 간 feature 상태를 동기화
- `UPDATE_FEATURES`
  - 변경된 feature 리스트를 스토리지에 저장
- `CHANGE_NODE_VISIBLE`
  - 특정 노드의 visibility 토글
- `CHANGE_FIGMA_SELECTION`
  - Figma 문서의 selection 변경
- `SCROLL_TO_NODE`
  - 특정 노드가 화면 중앙에 오도록 viewport 이동

각 메시지는 `figma.ui.onmessage`에서 분기 처리됩니다.

```ts
figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'CHANGE_NODE_VISIBLE':
      changeNodeVisible(msg.nodeId, msg.visible);
      break;
    // ...
  }
};
```

Figma 문서에 대한 실제 조작(`figma.currentPage.selection`, `figma.getNodeById`, `figma.viewport.scrollAndZoomIntoView`)은 이 파일 안에만 존재합니다.

### 5.2. UI로 내보내는 이벤트

메인 → UI:

- `INIT_FEATURES`
  - 플러그인 시작 시 전송, `clientStorage`에서 복원한 feature와 selection 포함
- `UPDATE_FEATURES_FROM_FIGMA_SELECTION`
  - 사용자가 Figma 문서에서 selection을 바꿀 때 전송
- `UPDATE_FEATURES_FROM_STORAGE`
  - 저장소에서 feature를 다시 불러올 때 전송

전송은 아래와 같이 이루어집니다.

```ts
figma.ui.postMessage({
  type: 'INIT_FEATURES',
  features,
  selectionNodes,
});
```

---

## 6. UI 셸 (`ui.ts`)

역할:

- Figma 메시지 API와 내부 이벤트 버스(`mitt`) 사이의 브리지
- 드래그, 키보드 단축키, 컨텍스트 메뉴 닫기 등 글로벌 UI concern 처리

### 6.1. 메시지 브리지

```ts
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  switch (msg.type) {
    case 'INIT_FEATURES':
      emitter.emit('init_features', { features: msg.features, selectionNodes: msg.selectionNodes });
      break;
    // ...
  }
};
```

UI → 메인:

```ts
parent.postMessage(
  { pluginMessage: { type: 'CHANGE_NODE_VISIBLE', nodeId, visible } },
  '*',
);
```

Figma API에 직접 의존하는 코드는 이 파일에만 두고, 나머지 UI는 타입이 정의된 이벤트만 다루도록 합니다.

### 6.2. 글로벌 UI 인터랙션

예시:

- 윈도우 드래그
- `mousedown` 시 컨텍스트 메뉴 닫기
- 키보드 단축키(`Delete`, `R` 등)
- 루트 `<ff-app>` 컴포넌트 생성 및 `document.body`에 마운트

---

## 7. 이벤트 시스템 (`src/event/emitter.ts`)

UI는 단일 이벤트 버스(`mitt`)를 사용해 컴포넌트 간 의존성을 줄입니다.

```ts
type Events = {
  init_features: { features: Feature[]; selectionNodes: Node[] };
  set_features: { features: Feature[] };
  change_feature_visible: { featureId: string; visible: boolean };
  // ...
};
```

- 컴포넌트는 `emitter.on('set_features', handler)` 형식으로 구독
- `on` 호출 시 반환되는 `off` 함수를 컴포넌트 내에 저장해 두었다가, 나중에 disconnect 시 호출

이 구조 덕분에:

- Figma 메시지를 UI 상태 업데이트와 쉽게 연결할 수 있고
- 중첩된 컴포넌트에서 상위로 이벤트를 올릴 때 props-drilling 없이 처리할 수 있습니다.

---

## 8. Web Component 아키텍처

모든 UI 컴포넌트는 `src/components/CustomElement.ts`의 `CustomElement`를 상속합니다.

### 8.1. 기본 클래스: `CustomElement`

주요 역할:

- `connectedCallback`에서 Shadow DOM attach
- HTML 템플릿 + 스타일 주입
- 이벤트 리스너 관리 공통 패턴 제공

```ts
protected registerEventHandlers(handlers: (() => void)[]) {
  this.#clearEventHandlers = [...this.#clearEventHandlers, ...handlers];
}

disconnectedCallback() {
  // 등록된 off() 전부 호출
  this.#clearEventHandlers.forEach((clear) => clear());
}
```

각 컴포넌트는:

- `connectedCallback`(또는 초기화 로직)에서 이벤트 핸들러를 등록하고,
- 반환된 정리 함수(off)를 내부 배열에 저장했다가,
- `disconnectedCallback`에서 모두 호출하여 메모리 누수를 방지합니다.

---

## 9. App 컴포넌트 (`src/components/app/App.ts`)

`<ff-app>`은 UI의 **단일 상태 소스**입니다.

### 9.1. 상태

주요 상태는 attribute(JSON 직렬화)로 저장됩니다.

- `features` – `Feature[]`
- `selectionNodesFromFigmaPage` – Figma selection을 `Node[]`로 표현한 값
- `focused` – 현재 포커스된 대상(`Focused`)

각 attribute는 작은 헬퍼를 통해 타입으로 변환됩니다.

```ts
private get features(): Feature[] { /* parse JSON attribute */ }
private set features(value: Feature[]) { /* stringify to attribute */ }
```

### 9.2. 역할

- `init_features` 이벤트 수신 시 초기 상태 구성
- 다음과 같은 상태 변경 이벤트 처리:

  - `set_features` → features 변경 및 자식에게 전파
  - `change_feature_visible` → feature의 visible 플래그 변경 + Figma에 알림
  - `add_feature` / `delete_feature_item` / `rename_feature` / `add_nodes_to_feature`
  - `change_focused_item`

- 순수 헬퍼와 emitter 사이의 브리지 역할:

  - `addNodesByFeatureId`, `deleteFeatureItem`, `updateFeatureById` 등의 헬퍼로 feature 트리를 불변하게 변환
  - 변환 후 `sync_features_with_figma`, `update_features_storage`, `change_figma_selection` 등의 이벤트를 발행하여 `ui.ts` → `code.ts`로 전달

### 9.3. 렌더링

`App`은 다음을 렌더링합니다.

- 각 루트 feature마다 하나의 `<ff-feature-container>`
- Figma selection에서 넘어온 노드 리스트(아직 feature에 속하지 않은 후보 노드들)

실제 트리 구조 렌더링은 `FeatureContainer`에 위임하여 `App`은 상태와 상위 레이아웃에 집중합니다.

---

## 10. Feature Container (`src/components/feature-container/FeatureContainer.ts`)

단일 feature와 그 하위 아이템을 표현하는 컴포넌트입니다.

### 10.1. Attributes

- `feature-id`
- `name`
- `visible`
- `items` (직렬화된 `Item[]` JSON)

`attributeChangedCallback`에서 `items` 또는 `visible`이 변경되면:

- 기존 DOM을 비우고
- `createFeatureContainer`, `createNodeRow` 등의 헬퍼를 이용해 자식 row를 다시 빌드합니다.

즉, 변경 시마다 전체를 **풀 리렌더**하는 전략을 사용합니다. 예상 규모(수십 개 정도의 노드)에서는 충분히 단순하고 실용적인 방식입니다.

### 10.2. 이벤트

이 컨테이너에 영향을 주는 emitter 이벤트(e.g. `change_feature_visible`, `set_features`)를 구독하고, 필요 시 DOM 이벤트를 발생시켜 상위로 전달합니다.

---

## 11. Row 컴포넌트 (`src/components/row/Row.ts`)

feature 트리의 한 줄(Feature 또는 Node)을 표현합니다.

역할:

- 라벨, 아이콘, visibility 상태를 렌더링
- 다음 인터랙션 처리:
  - 클릭으로 선택
  - 더블클릭으로 이름 변경 시작
  - Delete 키로 삭제
  - 컨텍스트 메뉴 열기

비즈니스 로직은 `App`과 `code.ts`에 두고, `Row`는 주로 UX에 집중합니다.  
필요한 동작은 emitter 이벤트로 전달합니다.

- `change_focused_item`
- `change_feature_visible`
- `delete_feature_item`
- `change_node_visible`
- `scroll_to_node`

---

## 12. Context Menu (`src/components/context-menu/ContextMenu.ts`)

선택된 row에 대한 간단한 컨텍스트 메뉴입니다.

역할:

- 열릴 때 대상 row element를 기억
- “Rename”, “Delete” 액션 제공

액션 선택 시 아래 이벤트를 발행합니다.

- `rename_feature_item`
- `delete_feature_item`

실제 이름 변경/삭제 로직은 `App`이 헬퍼를 통해 처리합니다.

---

## 13. 헬퍼 함수 (`src/components/helper.ts`)

feature 트리에 대한 순수 변환 헬퍼들:

- `getNewFeature(name: string): Feature`
- `addNodesByFeatureId(features, featureId, nodes)`
- `deleteFeatureItem(features, featureId, itemId)`
- `updateFeatureById(features, featureId, updater)`
- `findFeatureById(features, featureId)`
- `filterFeatureItemByType(features, type)`

이 함수들은:

- 기존 배열/객체를 직접 변경하지 않고
- 항상 새 feature 배열을 반환하며
- “트리 변형” 로직을 한곳에 모아 두어 테스트 및 유지보수를 쉽게 합니다.

---

## 14. 영속화

feature 정보는 `code.ts`에서 `figma.clientStorage`에 저장됩니다.

- 플러그인 시작 시:
  - `getAsync('features')` 호출
  - 값이 있으면 `INIT_FEATURES` 메시지로 UI에 전달
- UI에서 `UPDATE_FEATURES` 메시지가 오면:
  - 메인 프로세스에서 `setAsync('features', features)`로 최신 상태를 저장

UI는 스토리지에 직접 접근하지 않고, 메시지를 통해서만 간접적으로 동기화합니다.

---

## 15. 테스트

테스트는 `src/__test__/`에 위치합니다.

주요 패턴:

- `jest` + `jsdom`으로 Web Components를 가짜 DOM에 마운트
- 다음을 검증:

  - `emitter` 이벤트 배선
  - 이벤트 발생 시 `App` 상태 업데이트
  - `FeatureContainer` / `Row`의 attribute 변경 후 DOM 구조
  - `ui.ts`에서 메시지 수신 시 올바르게 내부 이벤트로 변환되는지 (`INIT_FEATURES` 등)

이를 통해 실제 Figma 환경이 아닌 상태에서도 UI 로직 대부분을 검증할 수 있습니다.

---

## 16. 한계점 및 향후 개선 방향

- **메시지 타입 계약**
  - 현재 플러그인 메시지 타입은 문자열 리터럴로 여러 파일에서 재사용 중입니다.
  - 공유 `PluginMessage` 유니온 타입과 `MESSAGE_TYPE` 상수로 리팩터링하면 안정성이 올라갑니다.
- **공유 모델 타입**
  - `Feature`/`Node` 타입 정의가 사실상 `code.ts`와 UI 쪽에 중복되어 있습니다.
  - 공용 `types` 모듈로 분리하면 `any`를 제거하고 컴파일 타임 안전성을 높일 수 있습니다.
- **렌더링 성능**
  - `FeatureContainer`는 변경 시마다 자식들을 전부 다시 빌드합니다.
  - 더 큰 트리를 지원하려면 diff 기반 또는 부분 업데이트 전략을 도입할 수 있습니다.
- **ID 생성**
  - 현재 Feature ID는 `Date.now() - index`에 기반합니다.
  - `crypto.randomUUID()` 등으로 교체하면 충돌 가능성을 더 줄일 수 있습니다.

위 한계점이 있지만, 현재 아키텍처는 의도적으로 단순하게 유지했습니다.

- 메인(Figma)과 UI의 경계가 명확하고
- 중앙 상태(`App`)를 기준으로
- 타입 기반 emitter로 이벤트를 주고받으며
- Web Components는 테스트 가능한 단위로 설계되어 있습니다.

이 구조는 현재 플러그인의 스코프에는 충분히 적합하며, 코드베이스가 커질 경우 타입/메시지 계약을 조금씩 강화하는 방향으로 확장할 수 있습니다.
