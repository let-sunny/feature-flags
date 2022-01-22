import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';

import './ui.css';
import { TAG_NAMES, helper, defineComponents } from './components';
import emitter from './event/emitter';

const { findElementByTagName, getAppElement, getContextMenuElement } = helper;
defineComponents();

// UI event handler
export class UIEventHandler {
  constructor() {
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
          emitter.emit('setFeatures', { features: value.features });
          break;
        }
        case 'UPDATE_SELECTION': {
          emitter.emit('setSelectionNodes', { nodes: value.nodes });
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
          emitter.emit('addSelectedNodesToFeature', { id: feature.id });
        }
      }
      dropFromFigma = false;
    });
    document.addEventListener('mouseleave', () => {
      dropFromFigma = true;
    });
  }

  onContextMenu() {
    document.addEventListener('click', (event: MouseEvent) => {
      const contextMenu = findElementByTagName(
        event.composedPath() as HTMLElement[],
        TAG_NAMES.CONTEXT_MENU
      );
      if (!contextMenu) {
        // clicked outside of it
        emitter.emit('closeContextMenu');
      }
    });
  }

  onKeyPressed() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        emitter.emit('deleteFocusedItem');
      } else if (event.key.toUpperCase() === 'R') {
        emitter.emit('editFocusedFeatureName');
      }
    });
  }

  onDoubleClick() {
    document.addEventListener('dblclick', () => {
      emitter.emit('editFocusedFeatureName');
    });
  }

  onRequestChangeNodeVisible() {
    emitter.on('changeNodeVisible', ({ nodes, visible }) => {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CHANGE_NODE_VISIBLE',
            nodes,
            visible,
          },
        },
        '*'
      );
    });
  }

  onRequestUpdatedFeatures() {
    emitter.on('updateFeatures', ({ features }) => {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'UPDATE_FEATURES',
            features,
          },
        },
        '*'
      );
    });
  }

  onRequestSync() {
    emitter.on('syncFeatures', () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SYNC_FEATURES',
          },
        },
        '*'
      );
    });
  }
}

const appElement = getAppElement();
const contextMenuElement = getContextMenuElement();
if (appElement && contextMenuElement) {
  new UIEventHandler();
}
