import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';

import { APP_EVENTS } from '../app/App';
import { getAppElement } from '../helper';

type Attribute = 'type' | 'id' | 'name' | 'visible' | 'node-type';

export const ROW_TAG_NAME = 'feature-flags-row';
export const ROW_EVENTS = {
  REQUEST_RENAME: 'REQUEST_RENAME',
};

export default class Row extends CustomElement {
  static get observedAttributes(): Attribute[] {
    return ['name'];
  }

  get name() {
    return this.getAttribute('name') || '';
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
        input.value = this.name;
        input.focus();
      });
    }) as EventListener);
  }
}

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
