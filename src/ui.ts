import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';

import './ui.css';
import { EVENTS, TAG_NAMES, helper } from './components';

const { findElementByTagName, getAppElement, getContextMenuElement } = helper;

// UI event handler
export class UIEventHandler {
  app: HTMLElement;
  contextMenu: HTMLElement;

  constructor(appElement: HTMLElement, contextMenuElement: HTMLElement) {
    this.app = appElement;
    this.contextMenu = contextMenuElement;

    this.onMessageFromFigma();
    this.onDropFromFigma();
    this.onContextMenu();
    this.onRequestChangeNodeVisible();
    this.onRequestUpdatedFeatures();
    this.onKeyPressed();
    this.onRequestSync();
    this.onDoubleClick();
  }

  onMessageFromFigma() {
    onmessage = (event) => {
      const { type, value } = event.data.pluginMessage;
      switch (type) {
        case 'UPDATE_FEATURES': {
          this.app.dispatchEvent(
            new CustomEvent(EVENTS.SET_FEATURES, {
              detail: { features: value.features },
            })
          );
          break;
        }
        case 'UPDATE_SELECTION': {
          this.app.dispatchEvent(
            new CustomEvent(EVENTS.SET_SELECTION_NODES, {
              detail: { nodes: value.nodes },
            })
          );
          break;
        }
        default:
          throw new Error('Unknown message type');
      }
    };
  }

  onDropFromFigma() {
    let dropFromFigma = false;
    document.addEventListener('mousedown', () => {
      dropFromFigma = false;
    });
    document.addEventListener('mouseup', (event: MouseEvent) => {
      if (dropFromFigma) {
        const feature = findElementByTagName(
          event.composedPath() as HTMLElement[],
          TAG_NAMES.CONTAINER
        );
        if (feature) {
          // mouse up on feature
          this.app.dispatchEvent(
            new CustomEvent(EVENTS.ADD_NODES, {
              detail: {
                featureId: feature.id,
              },
            })
          );
        }
      }
      dropFromFigma = false;
    });
    document.addEventListener('mouseleave', () => {
      dropFromFigma = true;
    });
  }

  onContextMenu() {
    document.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault();

      this.contextMenu.dispatchEvent(
        new CustomEvent(EVENTS.OPEN_CONTEXT_MENU, {
          detail: event,
        })
      );
    });
    document.addEventListener('click', (event: MouseEvent) => {
      const contextMenu = findElementByTagName(
        event.composedPath() as HTMLElement[],
        TAG_NAMES.CONTEXT_MENU
      );
      if (!contextMenu) {
        // clicked outside of it
        this.contextMenu.dispatchEvent(
          new CustomEvent(EVENTS.CLOSE_CONTEXT_MENU)
        );
      }
    });
  }

  onKeyPressed() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.app.dispatchEvent(new CustomEvent(EVENTS.DELETE_ITEM));
      } else if (event.key.toUpperCase() === 'R') {
        this.app.dispatchEvent(new CustomEvent(EVENTS.REQUEST_RENAME_FEATURE));
      }
    });
  }

  onDoubleClick() {
    document.addEventListener('dblclick', () => {
      this.app.dispatchEvent(new CustomEvent(EVENTS.REQUEST_RENAME_FEATURE));
    });
  }

  onRequestChangeNodeVisible() {
    document.addEventListener(EVENTS.REQUEST_CHANGE_NODE_VISIBLE, ((
      event: CustomEvent
    ) => {
      parent.postMessage(
        {
          pluginMessage: {
            type: EVENTS.REQUEST_CHANGE_NODE_VISIBLE,
            nodes: event.detail.nodes,
            visible: event.detail.visible,
          },
        },
        '*'
      );
    }) as EventListener);
  }

  onRequestUpdatedFeatures() {
    document.addEventListener(EVENTS.REQUEST_UPDATE_FEATURES, ((
      event: CustomEvent
    ) => {
      parent.postMessage(
        {
          pluginMessage: {
            type: EVENTS.REQUEST_UPDATE_FEATURES,
            features: event.detail.features,
          },
        },
        '*'
      );
    }) as EventListener);
  }

  onRequestSync() {
    document.addEventListener(EVENTS.REQUEST_SYNC_FEATURES, (() => {
      parent.postMessage(
        {
          pluginMessage: {
            type: EVENTS.REQUEST_SYNC_FEATURES,
          },
        },
        '*'
      );
    }) as EventListener);
  }
}

const appElement = getAppElement();
const contextMenuElement = getContextMenuElement();
if (appElement && contextMenuElement) {
  new UIEventHandler(appElement, contextMenuElement);
}
