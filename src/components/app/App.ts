import CustomElement from '../CustomElement';
import Template from './template.html';
import Style from './style.scss';

import { Feature } from '../types';
import { createFeatureContainer } from '../feature-container/FeatureContainer';

type Attribute = 'features' | 'selected' | 'selection';

export const APP_TAG_NAME = 'feature-flags-app';
export const APP_EVENTS = {
  CHANGE_VISIBLE: 'CHANGE_VISIBLE',
  RENAME_FEATURE: 'RENAME_FEATURE',
  DELETE_NODE: 'DELETE_NODE',
  DELETE_FEATURE: 'DELETE_FEATURE',
  UPDATE_FEATURES: 'UPDATE_FEATURES',
  ADD_NODES: 'ADD_NODES',
  CHANGE_NODE_VISIBLE: 'CHANGE_NODE_VISIBLE',
};

export default class App extends CustomElement {
  index: number;
  static get observedAttributes(): Attribute[] {
    return ['features'];
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
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    switch (attribute) {
      case 'features': {
        onUpdateFeature(this.features);
        this.updateFeatureCount();
        const container = this.shadowRoot?.querySelector('section');
        const features = JSON.parse(newValue) as Feature[];
        const featureElements = features.map((feature) => {
          return createFeatureContainer(feature);
        });
        container?.replaceChildren(...featureElements);
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

  // ---- event handlers ----
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
          return {
            ...feature,
            items: [...feature.items, ...this.selectionNodesFromFigmaPage],
          };
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
      if (detail.type === 'FEATURE') {
        this.features = this.features.map((feature) => {
          if (feature.id == detail.id) {
            return { ...feature, name: detail.name };
          } else {
            return feature;
          }
        });
      }
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
          return { ...feature, visible: detail.visible };
        } else {
          return feature;
        }
      });

      document.dispatchEvent(
        new CustomEvent(APP_EVENTS.CHANGE_NODE_VISIBLE, {
          detail: {
            nodes: targetFeature.items.filter((item) => item.type === 'NODE'),
            visible: detail.visible,
          },
        })
      );
    }) as EventListener);
  }
}

export const getAppElement = () => {
  return document.querySelector(APP_TAG_NAME);
};

const getNewFeature = (index: number): Feature => {
  return {
    id: `${index}`,
    name: `Feature ${index}`,
    type: 'FEATURE',
    visible: true,
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
