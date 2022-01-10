import { ROW_TAG_NAME } from './../row/Row';
import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';

import { Feature } from '../types';
import { createFeatureRow, createNodeRow } from '../row/Row';
import { getAppElement, APP_EVENTS } from '../app/App';

type Attribute = 'items' | 'visible';

export const CONTAINER_TAG_NAME = 'feature-flags-container';

export default class FeatureContainer extends CustomElement {
  static get observedAttributes(): Attribute[] {
    return ['items', 'visible'];
  }

  constructor() {
    super(Template, Style);
  }

  get closed() {
    return this.getAttribute('closed') === 'true';
  }

  set closed(value: boolean) {
    this.setAttribute('closed', value ? 'true' : 'false');
  }

  get visible() {
    return this.getAttribute('visible') === 'true';
  }

  get items() {
    return JSON.parse(this.getAttribute('items') || '[]') as Feature['items'];
  }

  connectedCallback() {
    this.closed = true;
    this.shadowRoot?.querySelector('.toggle')?.addEventListener('click', () => {
      this.closed = !this.closed;
    });

    this.onRequestToggleVisible();
    this.onRequestAddNodes();
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    switch (attribute) {
      case 'visible':
      case 'items': {
        const container = this.shadowRoot?.querySelector('.content');
        const items =
          attribute === 'items'
            ? (JSON.parse(newValue) as Feature['items'])
            : this.items;

        if (attribute === 'visible') {
          this.querySelector(ROW_TAG_NAME)?.setAttribute('visible', newValue);
        }

        const childrenElements = items.map((item) => {
          switch (item.type) {
            case 'FEATURE':
              return createFeatureContainer({
                ...item,
                visible: this.visible,
              });
            case 'NODE':
              return createNodeRow({
                ...item,
                visible: this.visible,
              });
            default:
              throw new Error('Unknown child type');
          }
        });

        container?.replaceChildren(...childrenElements);
        break;
      }
      default:
        throw new Error('Unknown attribute');
    }
  }

  // event handlers
  onRequestToggleVisible() {
    this.shadowRoot
      ?.querySelector('#toggle-visible')
      ?.addEventListener('click', () => {
        onToggleVisible(this.id, !this.visible);
      });
  }

  onRequestAddNodes() {
    this.shadowRoot
      ?.querySelector('#add-node')
      ?.addEventListener('click', () => {
        onAddNodes(this.id);
      });
  }
}

export const createFeatureContainer = (feature: Feature) => {
  const element = document.createElement(CONTAINER_TAG_NAME);
  element.setAttribute('id', feature.id);
  element.setAttribute('items', JSON.stringify(feature.items));
  element.setAttribute('visible', JSON.stringify(feature.visible));

  const featureRow = createFeatureRow(feature);
  element.appendChild(featureRow);
  return element;
};

export const updateFeatureContainer = (
  element: HTMLElement,
  feature: Feature
) => {
  element?.setAttribute('items', JSON.stringify(feature.items));
  element?.setAttribute('visible', JSON.stringify(feature.visible));
};

const onAddNodes = (featureId: string) => {
  getAppElement()?.dispatchEvent(
    new CustomEvent(APP_EVENTS.ADD_NODES, {
      detail: { featureId },
    })
  );
};

const onToggleVisible = (featureId: string, visible: boolean) => {
  getAppElement()?.dispatchEvent(
    new CustomEvent(APP_EVENTS.CHANGE_VISIBLE, {
      detail: { id: featureId, visible },
    })
  );
};
