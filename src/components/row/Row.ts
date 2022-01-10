import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';
import { Feature, Node } from '../types';
import { APP_EVENTS, getAppElement } from '../app/App';

type Attribute = 'type' | 'id' | 'name' | 'visible' | 'node-type';

export const ROW_TAG_NAME = 'feature-flags-row';
export const ROW_EVENTS = {
  REQUEST_RENAME: 'REQUEST_RENAME',
};

export default class Row extends CustomElement {
  static get observedAttributes(): Attribute[] {
    return ['name'];
  }

  constructor() {
    super(Template, Style);
  }

  connectedCallback() {
    this.onRequestRename();
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    if (oldValue === newValue) return;
    const container = this.shadowRoot?.querySelector('.container');

    switch (attribute) {
      case 'name': {
        const name = container?.querySelector('.name');
        if (name) {
          name.innerHTML = newValue;
        }
        break;
      }
      default:
        throw new Error('Unknown attribute');
    }
  }

  // event handlers
  onRequestRename() {
    const input = this.shadowRoot?.querySelector('.input') as HTMLInputElement;
    if (!input) return;
    input.addEventListener('blur', () => {
      requestAnimationFrame(() => {
        input.style.display = 'none';
      });
      onRename(this.id, input.value);
    });
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        input.blur();
      }
    });

    this.addEventListener(ROW_EVENTS.REQUEST_RENAME, (() => {
      requestAnimationFrame(() => {
        input.style.display = 'block';
        input.focus();
      });
    }) as EventListener);
  }
}

export const createFeatureRow = (feature: Feature) => {
  const element = document.createElement(ROW_TAG_NAME);
  element.setAttribute('id', feature.id);
  element.setAttribute('name', feature.name);
  element.setAttribute('visible', feature.visible ? 'true' : 'false');
  element.setAttribute('editable', 'true');
  element.setAttribute('type', feature.type);
  return element;
};

export const createNodeRow = (node: Node) => {
  const element = document.createElement(ROW_TAG_NAME);
  element.setAttribute('id', node.id);
  element.setAttribute('name', node.name);
  element.setAttribute('visible', node.visible ? 'true' : 'false');
  element.setAttribute('editable', 'true');
  element.setAttribute('type', node.type);
  element.setAttribute('node-type', node.node);
  return element;
};

const onRename = (id: string, name: string) => {
  getAppElement()?.dispatchEvent(
    new CustomEvent(APP_EVENTS.RENAME_FEATURE, {
      detail: {
        id,
        name: name.trim(),
      },
    })
  );
};
