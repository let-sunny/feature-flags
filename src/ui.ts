import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';

import { APP_EVENTS, APP_TAG_NAME, getAppElement } from './components/app/App';
import { CONTAINER_TAG_NAME } from './components/feature-container/FeatureContainer';

import './components';
import './ui.css';
import { Node } from './components/types';

onmessage = (event) => {
  const { type, value } = event.data.pluginMessage;
  switch (type) {
    case 'INIT_FEATURES': {
      const app = document.createElement(APP_TAG_NAME);
      app.setAttribute('features', JSON.stringify(value.features));
      document.querySelector('#ui')?.appendChild(app);
      break;
    }
    case 'UPDATE_SELECTION': {
      getAppElement()?.setAttribute('selection', JSON.stringify(value.nodes));
      break;
    }
    default:
      throw new Error('Unknown message type');
  }
};

document.addEventListener(APP_EVENTS.UPDATE_FEATURES, ((event: CustomEvent) => {
  parent.postMessage(
    {
      pluginMessage: {
        type: APP_EVENTS.UPDATE_FEATURES,
        features: event.detail.features,
      },
    },
    '*'
  );
}) as EventListener);

document.addEventListener(APP_EVENTS.CHANGE_NODE_VISIBLE, ((
  event: CustomEvent
) => {
  parent.postMessage(
    {
      pluginMessage: {
        type: APP_EVENTS.CHANGE_NODE_VISIBLE,
        nodes: event.detail.nodes,
        visible: event.detail.visible,
      },
    },
    '*'
  );
}) as EventListener);

(function () {
  let dropFromFigma = false;
  document.addEventListener('mousedown', () => {
    dropFromFigma = false;
  });
  document.addEventListener('mouseup', (event: MouseEvent) => {
    if (dropFromFigma) {
      const target = event.composedPath() as HTMLElement[];
      const feature = target.find(
        (el) => el.tagName === CONTAINER_TAG_NAME.toUpperCase()
      );

      if (feature) {
        getAppElement()?.dispatchEvent(
          new CustomEvent(APP_EVENTS.ADD_NODES, {
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
})();
