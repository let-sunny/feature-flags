
# Feature Flags for Figma – Architecture


## Table of Contents

- [1. Overview](#1-overview)
- [2. Design Goals](#2-design-goals)
- [3. High-Level Architecture](#3-high-level-architecture)
- [4. Core Concepts & Data Model](#4-core-concepts--data-model)
- [5. Main Process (`code.ts`)](#5-main-process-codets)
- [6. UI Shell (`ui.ts`)](#6-ui-shell-uits)
- [7. Event System (`src/event/emitter.ts`)](#7-event-system-srceventemitterts)
- [8. Web Component Architecture](#8-web-component-architecture)
- [9. App Component (`src/components/app/App.ts`)](#9-app-component-srccomponentsappappts)
- [10. Feature Container (`src/components/feature-container/FeatureContainer.ts`)](#10-feature-container-srccomponentsfeature-containerfeaturecontainerts)
- [11. Row Component (`src/components/row/Row.ts`)](#11-row-component-srccomponentsrowrowts)
- [12. Context Menu (`src/components/context-menu/ContextMenu.ts`)](#12-context-menu-srccomponentscontext-menucontextmenuts)
- [13. Helper Functions (`src/components/helper.ts`)](#13-helper-functions-srccomponentshelperts)
- [14. Persistence](#14-persistence)
- [15. Testing](#15-testing)
- [16. Known Limitations & Future Work](#16-known-limitations--future-work)


## 1. Overview

This repository contains a Figma plugin that lets designers manage “feature flags” on Figma nodes.

Instead of manually toggling visibility of layers/screens for each scenario, users can:

- Define features (e.g. `A/B Test – Variant A`, `Logged-in`, `Dark Mode`)
- Attach Figma nodes to those features
- Toggle feature visibility and have the corresponding nodes’ visibility updated in the document

The system consists of:

- A Figma plugin “main” process (plugin sandbox, `code.ts`)
- A web-based UI (iframe, `ui.ts` + Web Components)
- A shared event bus + strongly-typed models to coordinate state between components

---

## 2. Design Goals

- **Clear separation of concerns**
  - Figma document operations live only in the plugin main (`code.ts`)
  - UI state & interactions are isolated in the iframe side (`ui.ts` + components)
- **Predictable state management**
  - Single source of truth for features and selection in the UI (`App` component)
  - Pure functions for transforming feature trees
- **Testable front-end**
  - Web Components + event bus are covered by Jest + jsdom tests
- **Plugin-friendly UI architecture**
  - No framework dependency (React/Vue etc.)
  - Web Components + Shadow DOM to keep the bundle small and self-contained

Non-goals:

- Providing a full design-system level feature flag manager
- Optimizing for extremely large documents (thousands of nodes/features)

---

## 3. High-Level Architecture

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

## 4. Core Concepts & Data Model

Types are defined in `src/components/types.ts`.

### Feature

Represents a logical feature flag.

```ts
type Feature = {
  id: string;
  name: string;
  visible: boolean;
  items: Item[]; // nested feature and node entries
};
```

### Node

Represents a connection to a Figma node.

```ts
type Node = {
  id: string;            // Figma node ID
  name: string;          // node name at the time of linking
  type: 'NODE';
  featureId: string;     // owner feature
};
```

### Item

Union type for recursive tree:

```ts
type Item = Feature | Node;
```

### Focused

UI focus state:

```ts
type Focused = {
  featureId: string | null;
  itemId: string | null;
};
```

---

## 5. Main Process (`code.ts`)

Responsibilities:

- Acts as the **single gateway to the Figma document**
- Syncs plugin UI state with Figma document state
- Persists features to `figma.clientStorage`

### 5.1. Incoming events from UI

Main message types (from UI → main):

- `SYNC_FEATURES`
  - Sync features between UI and document (e.g. initial load)
- `UPDATE_FEATURES`
  - Persist updated features to storage
- `CHANGE_NODE_VISIBLE`
  - Toggle visibility of a node in the document
- `CHANGE_FIGMA_SELECTION`
  - Change selection in the document
- `SCROLL_TO_NODE`
  - Center viewport on a node

Each message is parsed in `figma.ui.onmessage` and mapped to a strongly scoped function:

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

All operations on the Figma document (`figma.currentPage.selection`, `figma.getNodeById`, `figma.viewport.scrollAndZoomIntoView`) stay in this file.

### 5.2. Outgoing events to UI

Main → UI:

- `INIT_FEATURES`
  - Sent on plugin start; includes features restored from `clientStorage`
- `UPDATE_FEATURES_FROM_FIGMA_SELECTION`
  - Sent when the user changes selection in the Figma document
- `UPDATE_FEATURES_FROM_STORAGE`
  - When features are reloaded from persistent storage

These are sent via:

```ts
figma.ui.postMessage({
  type: 'INIT_FEATURES',
  features,
  selectionNodes,
});
```

---

## 6. UI Shell (`ui.ts`)

Responsibilities:

- Bridge between Figma message API and the internal event bus (`mitt`)
- Global UI-level concerns: drag-and-drop, keyboard shortcuts, closing context menus, etc.

### 6.1. Message bridge

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

UI → main:

```ts
parent.postMessage(
  { pluginMessage: { type: 'CHANGE_NODE_VISIBLE', nodeId, visible } },
  '*',
);
```

All Figma specific messaging is centralized in this file; the rest of the UI only deals with typed events.

### 6.2. Global UI interactions

Examples:

- Dragging the window
- Closing context menus on `mousedown`
- Keybindings (`Delete`, `R` to rename, etc.)
- Creating the root `<ff-app>` component and attaching it to `document.body`

---

## 7. Event System (`src/event/emitter.ts`)

The UI uses a single event bus (`mitt`) to decouple components:

```ts
type Events = {
  init_features: { features: Feature[]; selectionNodes: Node[] };
  set_features: { features: Feature[] };
  change_feature_visible: { featureId: string; visible: boolean };
  // ...
};
```

- Components subscribe via `emitter.on('set_features', handler)`
- The emitter returns an `off` function, which is stored and later called when the component is disconnected (see below).

This makes it easy to:

- Wire Figma messages into UI state updates
- Handle actions from nested components without prop-drilling

---

## 8. Web Component Architecture

All UI components extend a common base class (`CustomElement`) in `src/components/CustomElement.ts`.

### 8.1. Base class: `CustomElement`

Key responsibilities:

- Attach Shadow DOM once in `connectedCallback`
- Inject HTML template + styles
- Provide a unified way to manage event listeners

```ts
protected registerEventHandlers(handlers: (() => void)[]) {
  this.#clearEventHandlers = [...this.#clearEventHandlers, ...handlers];
}

disconnectedCallback() {
  // call every off()
  this.#clearEventHandlers.forEach((clear) => clear());
}
```

Each component:

- Registers event handlers during `connectedCallback` (or initialization)
- Pushes the cleanup function into the handler list
- On `disconnectedCallback`, all handlers are removed to prevent memory leaks

---

## 9. App Component (`src/components/app/App.ts`)

`<ff-app>` is the **UI’s single source of truth**.

### 9.1. State

It stores the primary state as attributes (serialized JSON):

- `features` – array of `Feature`
- `selectionNodesFromFigmaPage` – current Figma selection, as `Node[]`
- `focused` – current focus target (`Focused`)

Attributes are converted to typed values through small helpers:

```ts
private get features(): Feature[] { /* parse JSON attribute */ }
private set features(value: Feature[]) { /* stringify to attribute */ }
```

### 9.2. Responsibilities

- Initialize UI state on `init_features`
- Respond to state-change events:

  - `set_features` → update features and propagate to children
  - `change_feature_visible` → update feature visibility and notify Figma
  - `add_feature` / `delete_feature_item` / `rename_feature` / `add_nodes_to_feature`
  - `change_focused_item`

- Bridge between pure helpers and emitter:

  - Uses helpers like `addNodesByFeatureId`, `deleteFeatureItem`, `updateFeatureById` to transform feature trees immutably
  - Emits `sync_features_with_figma` / `update_features_storage` / `change_figma_selection` etc. to `ui.ts`

### 9.3. Rendering

`App` renders:

- A list of `<ff-feature-container>` elements, one for each root feature
- The list of “selection nodes” from Figma as candidate nodes to attach

Rendering is intentionally “dumb”: it delegates the actual tree layout to `FeatureContainer`.

---

## 10. Feature Container (`src/components/feature-container/FeatureContainer.ts`)

Represents a single feature and its nested items.

### 10.1. Attributes

- `feature-id`
- `name`
- `visible`
- `items` (serialized `Item[]` as JSON)

On `attributeChangedCallback`, when `items` or `visible` changes:

- Clears the content
- Rebuilds child rows using helpers like `createFeatureContainer` and `createNodeRow`

This means the component does **full rerender** on any change. For the expected scale (tens of nodes), this is acceptable and keeps logic simple.

### 10.2. Events

Subscribes to emitter events that affect this container (e.g. `change_feature_visible`, `set_features`) and dispatches DOM events as needed.

---

## 11. Row Component (`src/components/row/Row.ts`)

Represents a single row in the feature tree (either feature or node).

Responsibilities:

- Render label, icons, and visibility state
- Handle:
  - Click selection
  - Double-click rename
  - Delete key
  - Context menu open

Communicates with `App` by emitting emitter events:

- `change_focused_item`
- `change_feature_visible`
- `delete_feature_item`
- `change_node_visible`
- `scroll_to_node`

This keeps business logic in `App` and `code.ts`, while `Row` is mostly about UX.

---

## 12. Context Menu (`src/components/context-menu/ContextMenu.ts`)

Simple context menu for a selected row.

Responsibilities:

- Remember the target row element when opened
- Provide “Rename” and “Delete” actions

When an action is chosen, it emits:

- `rename_feature_item`
- `delete_feature_item`

The actual rename/delete logic is handled in `App` via helpers.

---

## 13. Helper Functions (`src/components/helper.ts`)

Pure transformation helpers on the feature tree:

- `getNewFeature(name: string): Feature`
- `addNodesByFeatureId(features, featureId, nodes)`
- `deleteFeatureItem(features, featureId, itemId)`
- `updateFeatureById(features, featureId, updater)`
- `findFeatureById(features, featureId)`
- `filterFeatureItemByType(features, type)`

These functions:

- Avoid mutating existing arrays/objects
- Always return new feature arrays
- Contain the “tree mutation” logic in one place, making them easier to test

---

## 14. Persistence

Features are persisted in `figma.clientStorage` (from `code.ts`).

- On plugin start:
  - Attempt to `getAsync('features')`
  - If found, send `INIT_FEATURES` to UI
- On any change from UI (`UPDATE_FEATURES`):
  - Main process writes the new features back via `setAsync('features', features)`

UI itself treats storage as “external” and only interacts via messages.

---

## 15. Testing

Tests are located under `src/__test__/`.

The main patterns:

- Use `jest` + `jsdom` to mount Web Components in a fake DOM
- Assert:

  - Event wiring via `emitter`
  - State updates in `App` when events occur
  - DOM structure after attribute changes in `FeatureContainer` / `Row`
  - UI message bridge behavior in `ui.ts` (e.g., on incoming `INIT_FEATURES`)

This allows validating the majority of the UI logic without running inside Figma.

---

## 16. Known Limitations & Future Work

- **Typed message contract**
  - Currently, plugin message types are string literals reused across files.
  - Could be refactored to a shared `PluginMessage` union type and `MESSAGE_TYPE` constants.
- **Shared model types**
  - `Feature`/`Node` type definitions are effectively duplicated between `code.ts` and UI side.
  - A shared `types` module could remove `any` usages and strengthen compile-time safety.
- **Rendering performance**
  - `FeatureContainer` rebuilds all children on any update.
  - For larger trees, a diffing strategy or incremental update could be introduced.
- **ID generation**
  - Feature IDs are currently based on timestamps (`Date.now() - index`).
  - Could be replaced with `crypto.randomUUID()` or more robust ID generation.

Despite these limitations, the current architecture is intentionally simple:

- Clear boundaries (Figma main vs UI)
- Centralized state (`App`)
- Event-driven communication via a typed emitter
- Testable Web Components

This structure has been sufficient for the intended plugin scope, while leaving room for incremental tightening of types and message contracts if the codebase grows.
