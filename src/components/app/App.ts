import { ROW_TAG_NAME, ROW_EVENTS } from './../row/Row';
import CustomElement from '../CustomElement';
import Template from './template.html';
import Style from './style.scss';

import { Feature, Focused } from '../types';
import { CONTEXT_MENU_TAG_NAME } from './../context-menu/ContextMenu';
import {
  CONTAINER_TAG_NAME,
  createFeatureContainer,
  updateFeatureContainer,
} from '../feature-container/FeatureContainer';

type Attribute = 'features' | 'focused' | 'selection';

export const APP_TAG_NAME = 'feature-flags-app';
export const APP_EVENTS = {
  CHANGE_VISIBLE: 'CHANGE_VISIBLE',
  RENAME_FEATURE: 'RENAME_FEATURE',
  REQUEST_RENAME_FEATURE: 'REQUEST_RENAME_FEATURE',
  DELETE_NODE: 'DELETE_NODE',
  DELETE_FEATURE: 'DELETE_FEATURE',
  UPDATE_FEATURES: 'UPDATE_FEATURES',
  ADD_NODES: 'ADD_NODES',
  CHANGE_NODE_VISIBLE: 'CHANGE_NODE_VISIBLE',
  FOCUS: 'FOCUS',
  DELETE_ITEM: 'DELETE_ITEM',
};

export default class App extends CustomElement {
  index: number;
  static get observedAttributes(): Attribute[] {
    return ['features', 'focused'];
  }

  get features(): Feature[] {
    return JSON.parse(this.getAttribute('features') || '[]');
  }

  set features(feature: Feature[]) {
    this.setAttribute('features', JSON.stringify(feature));
  }

  get selectionNodesFromFigmaPage() {
    return JSON.parse(this.getAttribute('selection') || '[]');
  }

  get focused() {
    return JSON.parse(this.getAttribute('focused') || 'null') as Focused;
  }

  constructor() {
    super(Template, Style);
    this.index = 0;
  }

  connectedCallback() {
    this.index = this.features.length + 1;

    this.onCreateFeature();
    this.onDeleteFeature();
    this.onRenameFeature();
    this.onChangeFeatureVisible();
    this.onDeleteNode();
    this.onAddNodes();
    this.onFocus();
    this.onDeleteItem();
    this.onRequestRenameFeature();
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    switch (attribute) {
      case 'features': {
        onUpdateFeature(this.features);

        requestAnimationFrame(() => {
          this.updateFeatureCount();
          const container = this.shadowRoot?.querySelector('section');

          // compare old and new features
          const newFeatures = JSON.parse(newValue) as Feature[];
          const oldFeatures = (JSON.parse(oldValue) || []) as Feature[];

          // case 1. features only has old features
          const deletedFeatures = oldFeatures.filter(
            (feature) =>
              !newFeatures.find((newFeature) => newFeature.id === feature.id)
          );
          deletedFeatures.forEach((feature) => {
            this.shadowRoot
              ?.querySelector(`${CONTAINER_TAG_NAME}[id="${feature.id}"]`)
              ?.remove();
          });

          // case 2. features has both old and new features
          const updatedFeatures = newFeatures.filter((feature) =>
            oldFeatures.find((oldFeature) => oldFeature.id === feature.id)
          );
          updatedFeatures.forEach((feature) => {
            const featureContainer = this.shadowRoot?.querySelector(
              `${CONTAINER_TAG_NAME}[id="${feature.id}"]`
            ) as HTMLElement;
            if (featureContainer) {
              updateFeatureContainer(featureContainer, feature);
            }
          });

          // case 3. features only has new features
          const addedFeatures = newFeatures.filter(
            (feature) =>
              !oldFeatures.find((oldFeature) => oldFeature.id === feature.id)
          );
          addedFeatures.forEach((feature) => {
            container?.appendChild(createFeatureContainer(feature));
          });
        });
        break;
      }
      case 'focused': {
        this.features.forEach((feature) => {
          const featureContainer = this.shadowRoot?.querySelector(
            `${CONTAINER_TAG_NAME}[id="${feature.id}"]`
          ) as HTMLElement;
          if (featureContainer) {
            updateFeatureContainer(featureContainer, {
              ...feature,
              focused: this.focused,
            });
          }
        });
        break;
      }
      default:
        throw new Error('Unknown attribute');
    }
  }

  updateFeatureCount() {
    const countEl = this.shadowRoot?.querySelector('#count');
    if (countEl) {
      countEl.innerHTML = `${this.features.length}`;
    }
  }

  // event handlers
  onFocus() {
    this.addEventListener(APP_EVENTS.FOCUS, ((e: CustomEvent) => {
      const { detail } = e;
      this.setAttribute('focused', JSON.stringify(detail));
    }) as EventListener);
  }

  onDeleteNode() {
    this.addEventListener(APP_EVENTS.DELETE_NODE, ((e: CustomEvent) => {
      const { detail } = e;
      this.features = this.features.map((feature) => {
        if (feature.items.find((item) => item.id === detail.id)) {
          return {
            ...feature,
            items: feature.items.filter((item) => item.id !== detail.id),
          };
        } else {
          return feature;
        }
      });
    }) as EventListener);
  }

  onAddNodes() {
    this.addEventListener(APP_EVENTS.ADD_NODES, ((e: CustomEvent) => {
      const { detail } = e;
      this.features = this.features.map((feature) => {
        if (feature.id === detail.featureId) {
          const newFeature = {
            ...feature,
            items: [...feature.items, ...this.selectionNodesFromFigmaPage],
          };
          syncNodeVisible(newFeature);
          return newFeature;
        } else {
          return feature;
        }
      });
    }) as EventListener);
  }

  onCreateFeature() {
    this.shadowRoot
      ?.querySelector('#add-feature')
      ?.addEventListener('click', () => {
        this.features = [...this.features, getNewFeature(this.index)];
        this.index += 1;
      });
  }

  onDeleteFeature() {
    this.addEventListener(APP_EVENTS.DELETE_FEATURE, ((e: CustomEvent) => {
      const { detail } = e;
      this.features = this.features.filter(
        (feature) => feature.id !== detail.id
      );
    }) as EventListener);
  }

  onRenameFeature() {
    this.addEventListener(APP_EVENTS.RENAME_FEATURE, ((e: CustomEvent) => {
      const { detail } = e;

      this.features = this.features.map((feature) => {
        if (feature.id === detail.id) {
          return { ...feature, name: detail.name };
        } else {
          return feature;
        }
      });
    }) as EventListener);
  }

  onChangeFeatureVisible() {
    this.addEventListener(APP_EVENTS.CHANGE_VISIBLE, ((e: CustomEvent) => {
      const { detail } = e;
      const targetFeature = this.features.find(
        (feature) => feature.id === detail.id
      );
      if (!targetFeature) return;

      this.features = this.features.map((feature) => {
        if (feature.id == detail.id) {
          const newFeature = { ...feature, visible: detail.visible };
          syncNodeVisible(newFeature);
          return newFeature;
        } else {
          return feature;
        }
      });
    }) as EventListener);
  }

  onDeleteItem() {
    this.addEventListener(APP_EVENTS.DELETE_ITEM, (() => {
      if (!this.focused?.id) return;
      const eventName =
        this.focused.type === 'NODE'
          ? APP_EVENTS.DELETE_NODE
          : APP_EVENTS.DELETE_FEATURE;

      this.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { id: this.focused.id },
        })
      );
    }) as EventListener);
  }

  onRequestRenameFeature() {
    this.addEventListener(APP_EVENTS.REQUEST_RENAME_FEATURE, (() => {
      if (!this.focused?.id) return;

      if (this.focused.id && this.focused.type === 'FEATURE') {
        this.shadowRoot
          ?.querySelector(`${CONTAINER_TAG_NAME}[id="${this.focused.id}"]`)
          ?.querySelector(ROW_TAG_NAME)
          ?.dispatchEvent(new CustomEvent(ROW_EVENTS.REQUEST_RENAME));
      }
    }) as EventListener);
  }
}

export const getAppElement = () => {
  return document.querySelector(APP_TAG_NAME);
};

export const getContextMenu = () => {
  return getAppElement()?.shadowRoot?.querySelector(CONTEXT_MENU_TAG_NAME);
};

const getNewFeature = (index: number): Feature => {
  return {
    id: `${index}`,
    name: `Feature ${index}`,
    type: 'FEATURE',
    visible: true,
    focused: {},
    items: [],
  };
};

const onUpdateFeature = (features: Feature[]) => {
  document.dispatchEvent(
    new CustomEvent(APP_EVENTS.UPDATE_FEATURES, {
      detail: {
        features,
      },
    })
  );
};

const syncNodeVisible = (feature: Feature) => {
  document.dispatchEvent(
    new CustomEvent(APP_EVENTS.CHANGE_NODE_VISIBLE, {
      detail: {
        nodes: feature.items.filter((item) => item.type === 'NODE'),
        visible: feature.visible,
      },
    })
  );
};
