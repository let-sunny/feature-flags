import { Events } from './../../event/type';
import CustomElement from '../CustomElement';
import Template from './template.html';
import Style from './style.scss';

import { Feature, Node, Focused, Item } from '../types';
import {
  createFeatureContainer,
  getNewFeature,
  updateFeatureContainer,
} from '../helper';
import { CONTAINER_TAG_NAME } from '../feature-container/FeatureContainer';

type Attribute = 'features' | 'selection';

export const APP_TAG_NAME = 'feature-flags-app';

export default class App extends CustomElement {
  index: number;
  focused: Focused = {};
  static get observedAttributes(): Attribute[] {
    return ['features'];
  }

  get features(): Feature[] {
    return JSON.parse(this.getAttribute('features') || '[]');
  }

  set features(features: Feature[]) {
    this.setAttribute('features', JSON.stringify(features));
  }

  get selectionNodesFromFigmaPage(): Node[] {
    return JSON.parse(this.getAttribute('selection') || '[]');
  }

  set selectionNodesFromFigmaPage(nodes: Node[]) {
    this.setAttribute('selection', JSON.stringify(nodes));
  }

  constructor() {
    super(Template, Style);
    this.index = 0;
  }

  connectedCallback() {
    this.index = this.features.length + 1;
    this.registerEventHandlers([
      this.onSetFeatures.bind(this),
      this.onCreateFeature.bind(this),
      this.onSyncFeatures.bind(this), // sync features from figma page
      this.onChangeFeatureVisible.bind(this),
      this.onAddNodes.bind(this),
      this.onDeleteItem.bind(this), // delete feature or node
      this.onDeleteFocusedItem.bind(this), // delete focused feature or node
      this.onRenameFeature.bind(this), // set name
      this.onEditFocusedFeatureName.bind(this), // request to display input for editing name
      this.onSetFeatures.bind(this),
      this.onSetSelectionNodes.bind(this), // set selection nodes from figma page
      this.onFocus.bind(this),
    ]);
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    switch (attribute) {
      case 'features': {
        this.requestUpdateFeature(this.features);

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
            this.getFeatureContainerElement(feature.id)?.remove();
          });

          // case 2. features has both old and new features
          const updatedFeatures = newFeatures.filter((feature) =>
            oldFeatures.find((oldFeature) => oldFeature.id === feature.id)
          );
          updatedFeatures.forEach((feature) => {
            const featureContainer = this.getFeatureContainerElement(
              feature.id
            );
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
            container?.appendChild(createFeatureContainer(feature, feature.id));
          });
        });
        break;
      }
      default:
        throw new Error('Unknown attribute');
    }
  }

  getFeatureContainerElement(featureId: string) {
    return this.shadowRoot?.querySelector(
      `${CONTAINER_TAG_NAME}[id="${featureId}"]`
    ) as HTMLElement;
  }

  updateFeatureCount() {
    const countEl = this.shadowRoot?.querySelector('#count');
    if (countEl) {
      countEl.innerHTML = `${this.features.length}`;
    }
  }

  deleteFeature(id: Feature['id']) {
    this.features = this.features.filter((feature) => feature.id !== id);
  }

  deleteNode(id: Node['id']) {
    this.features = deleteFeatureItem(this.features, id);
  }

  deleteItem({ id, type }: Pick<Item, 'id' | 'type'>) {
    if (type === 'NODE') {
      this.deleteNode(id);
    } else if (type === 'FEATURE') {
      this.deleteFeature(id);
    } else {
      throw new Error('Unknown type');
    }
  }

  // event handlers
  onSetSelectionNodes() {
    const handler = ({ nodes }: Events['setSelectionNodes']) => {
      this.selectionNodesFromFigmaPage = nodes;
    };
    this.emitter.on('setSelectionNodes', handler);
    return () => {
      this.emitter.off('setSelectionNodes', handler);
    };
  }

  onAddNodes() {
    const handler = ({ id }: Events['addSelectedNodesToFeature']) => {
      this.features = addNodesByFeatureId(
        this.features,
        id,
        this.selectionNodesFromFigmaPage
      );
      const newFeature = findFeatureById(this.features, id);
      if (newFeature) {
        this.requestSyncNodeVisible(newFeature);
      }
    };
    this.emitter.on('addSelectedNodesToFeature', handler);
    return () => {
      this.emitter.off('addSelectedNodesToFeature', handler);
    };
  }

  onCreateFeature() {
    const button = this.shadowRoot?.querySelector('#add-feature');
    const handler = () => {
      this.features = [...this.features, getNewFeature(this.index)];
      this.index += 1;
    };
    button?.addEventListener('click', handler);
    return () => {
      button?.removeEventListener('click', handler);
    };
  }

  onSyncFeatures() {
    const button = this.shadowRoot?.querySelector('#sync');
    button?.addEventListener('click', this.requestSyncFeatures.bind(this));
    return () => {
      button?.removeEventListener('click', this.requestSyncFeatures);
    };
  }

  onRenameFeature() {
    const handler = ({ id, name }: Events['renameFeature']) => {
      this.features = updateFeatureById(this.features, id, { name });
    };
    this.emitter.on('renameFeature', handler);
    return () => {
      this.emitter.off('renameFeature', handler);
    };
  }

  onChangeFeatureVisible() {
    const handler = ({ id, visible }: Events['changeFeatureVisible']) => {
      const targetFeature = findFeatureById(this.features, id);
      if (!targetFeature) return;
      const newFeature = { ...targetFeature, visible };

      this.features = updateFeatureById(this.features, id, { visible });
      this.requestSyncNodeVisible(newFeature);
    };
    this.emitter.on('changeFeatureVisible', handler);
    return () => {
      this.emitter.off('changeFeatureVisible', handler);
    };
  }

  onDeleteItem() {
    const handler = (event: Events['deleteItem']) => {
      this.deleteItem(event);
    };
    this.emitter.on('deleteItem', handler);
    return () => {
      this.emitter.off('deleteItem', handler);
    };
  }

  onDeleteFocusedItem() {
    const handler = () => {
      if (!this.focused?.id || !this.focused.type) return;
      const { id, type } = this.focused;
      this.deleteItem({ id, type });
    };
    this.emitter.on('deleteFocusedItem', handler);
    return () => {
      this.emitter.off('deleteFocusedItem', handler);
    };
  }

  onEditFocusedFeatureName() {
    const handler = () => {
      if (this.focused?.id) {
        this.emitter.emit('editFeatureName', { id: this.focused.id });
      }
    };
    this.emitter.on('editFocusedFeatureName', handler);
    return () => {
      this.emitter.off('editFocusedFeatureName', handler);
    };
  }

  onSetFeatures() {
    const handler = ({ features }: Events['setFeatures']) => {
      this.features = features;
    };
    this.emitter.on('setFeatures', handler);
    return () => {
      this.emitter.off('setFeatures', handler);
    };
  }

  onFocus() {
    const handler = (focused: Events['focus']) => {
      this.focused = focused;
    };
    this.emitter.on('focus', handler);
    return () => {
      this.emitter.off('focus', handler);
    };
  }

  // dispatch events
  requestUpdateFeature(features: Feature[]) {
    this.emitter.emit('updateFeatures', {
      features,
    });
  }

  requestSyncNodeVisible(feature: Feature) {
    this.emitter.emit('changeNodeVisible', {
      nodes: filterFeatureItemByType(feature, 'NODE'),
      visible: feature.visible,
    });
  }

  requestSyncFeatures() {
    this.emitter.emit('syncFeatures');
  }
}

// feature helper function
const addNodesByFeatureId = (
  features: Feature[],
  id: Feature['id'],
  nodes: Node[]
) => {
  return features.map((feature) => {
    if (feature.id === id) {
      const newFeature = {
        ...feature,
        items: [
          ...feature.items,
          ...nodes.filter((newNode) =>
            feature.items.every((exist) => exist.id !== newNode.id)
          ),
        ],
      };
      return newFeature;
    } else {
      return feature;
    }
  });
};

const deleteFeatureItem = (features: Feature[], itemId: Item['id']) => {
  return features.map((feature) => {
    if (feature.items.find((item) => item.id === itemId)) {
      return {
        ...feature,
        items: feature.items.filter((item) => item.id !== itemId),
      };
    } else {
      return feature;
    }
  });
};

const updateFeatureById = (
  features: Feature[],
  id: Feature['id'],
  newFeature: Partial<Feature>
) => {
  return features.map((feature) => {
    if (feature.id === id) {
      return { ...feature, ...newFeature };
    } else {
      return feature;
    }
  });
};

const findFeatureById = (features: Feature[], id: Feature['id']) => {
  return features.find((feature) => feature.id === id);
};

const filterFeatureItemByType = (feature: Feature, type: Item['type']) => {
  return feature.items.filter((item) => item.type === type);
};
