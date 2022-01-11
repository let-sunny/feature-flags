import { Focused, ItemType } from './../types';
import { ROW_TAG_NAME } from './../row/Row';
import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';

import { Feature } from '../types';
import { APP_EVENTS } from '../app/App';
import { createFeatureContainer, createNodeRow } from '../helper';

type Attribute = 'items' | 'visible' | 'focused' | 'name';

export const CONTAINER_TAG_NAME = 'feature-flags-container';

export default class FeatureContainer extends CustomElement {
  focused: Focused;

  static get observedAttributes(): Attribute[] {
    return ['items', 'visible', 'focused', 'name'];
  }

  constructor() {
    super(Template, Style);
    this.focused = {};
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

    const header = this.shadowRoot?.querySelector(
      '.header-content'
    ) as HTMLElement;
    this.onRequestFocus(header);
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    switch (attribute) {
      case 'name': {
        this.querySelector(ROW_TAG_NAME)?.setAttribute('name', newValue);
        break;
      }
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
          const listItem = (
            this.shadowRoot?.getElementById('list-item') as HTMLTemplateElement
          ).content.firstElementChild?.cloneNode(true) as HTMLElement;
          listItem.id = item.id;

          switch (item.type) {
            case 'FEATURE': {
              listItem.appendChild(
                createFeatureContainer({
                  ...item,
                  visible: this.visible,
                })
              );
              break;
            }
            case 'NODE': {
              listItem.appendChild(
                createNodeRow({
                  ...item,
                  visible: this.visible,
                })
              );
              break;
            }
            default:
              throw new Error('Unknown child type');
          }

          this.onRequestFocus(listItem);
          return listItem;
        });

        container?.replaceChildren(...childrenElements);
        break;
      }
      case 'focused': {
        const newFocused = JSON.parse(newValue) as Focused;
        if (!newFocused.id) return;

        requestAnimationFrame(() => {
          if (
            this.id === newFocused.id &&
            this.focused?.type === newFocused.type
          ) {
            // add focused style
            this.shadowRoot?.querySelector('.header')?.classList.add('focused');
            this.shadowRoot
              ?.getElementById(`${newFocused.id}`)
              ?.classList.remove('focused');
          } else if (this.id === newFocused.parentId) {
            // add focused style
            this.shadowRoot
              ?.getElementById(`${newFocused.id}`)
              ?.classList.add('focused');

            this.shadowRoot
              ?.querySelector('.header')
              ?.classList.remove('focused');
          } else {
            this.focused = {};
            // remove focused style
            this.shadowRoot
              ?.querySelector('.header')
              ?.classList.remove('focused');
            this.shadowRoot
              ?.getElementById(`${newFocused.id}`)
              ?.classList.remove('focused');
          }
        });
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
        this.requestToggleVisible(this.id, !this.visible);
      });
  }

  onRequestAddNodes() {
    this.shadowRoot
      ?.querySelector('#add-node')
      ?.addEventListener('click', () => {
        this.requestAddNodes(this.id);
      });
  }

  onRequestFocus(elem?: HTMLElement | null) {
    elem?.addEventListener('click', (event) => {
      event.composedPath().find((target) => {
        const element = target as HTMLElement;
        if (element.tagName === ROW_TAG_NAME.toUpperCase()) {
          this.focused = {
            id: element.id,
            parentId: this.id,
            type: element.getAttribute('type') as ItemType,
          };

          this.requestFocus(this.focused);
        }
      });
    });
  }

  // dispatch events
  requestAddNodes(featureId: string) {
    this.dispatchEvent(
      new CustomEvent(APP_EVENTS.ADD_NODES, {
        detail: { featureId },
        composed: true,
      })
    );
  }

  requestToggleVisible(featureId: string, visible: boolean) {
    this.dispatchEvent(
      new CustomEvent(APP_EVENTS.CHANGE_VISIBLE, {
        detail: { id: featureId, visible },
        composed: true,
      })
    );
  }

  requestFocus(focused: Focused) {
    this.dispatchEvent(
      new CustomEvent(APP_EVENTS.FOCUS, {
        detail: focused,
        composed: true,
      })
    );
  }
}
