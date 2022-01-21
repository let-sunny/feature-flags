import { Events } from './../../event/type';
import { ROW_TAG_NAME } from './../row/Row';
import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';

import { Feature } from '../types';
import { createFeatureContainer, createNodeRow } from '../helper';

type Attribute = 'items' | 'visible' | 'name';

export const CONTAINER_TAG_NAME = 'feature-flags-container';

export default class FeatureContainer extends CustomElement {
  static get observedAttributes(): Attribute[] {
    return ['items', 'visible', 'name'];
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

    this.registerEventHandlers([
      this.onToggle.bind(this),
      this.onRequestToggleVisible.bind(this),
      this.onRequestAddNodes.bind(this),
      this.onFocus.bind(this),
    ]);
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
                createFeatureContainer(
                  {
                    ...item,
                    visible: this.visible,
                  },
                  this.id
                )
              );
              break;
            }
            case 'NODE': {
              listItem.appendChild(
                createNodeRow(
                  {
                    ...item,
                    visible: this.visible,
                  },
                  this.id
                )
              );
              break;
            }
            default:
              throw new Error('Unknown child type');
          }

          return listItem;
        });

        container?.replaceChildren(...childrenElements);
        break;
      }

      default:
        throw new Error('Unknown attribute');
    }
  }

  // event handlers
  onToggle() {
    const button = this.shadowRoot?.querySelector('.toggle');
    const handler = () => {
      this.closed = !this.closed;
    };
    button?.addEventListener('click', handler);
    return () => {
      button?.removeEventListener('click', handler);
    };
  }

  onRequestToggleVisible() {
    const button = this.shadowRoot?.querySelector('#toggle-visible');
    const handler = () => {
      this.requestToggleVisible(this.id, !this.visible);
    };
    button?.addEventListener('click', handler);
    return () => {
      button?.removeEventListener('click', handler);
    };
  }

  onRequestAddNodes() {
    const button = this.shadowRoot?.querySelector('#add-node');
    const handler = () => {
      this.requestAddNodes(this.id);
    };
    button?.addEventListener('click', handler);
    return () => {
      button?.removeEventListener('click', handler);
    };
  }

  onFocus() {
    const handler = (focused: Events['focus']) => {
      requestAnimationFrame(() => {
        // reset
        Array.from(this.shadowRoot?.querySelectorAll('.focused') || []).forEach(
          (el) => {
            el.classList.remove('focused');
          }
        );
        if (focused.id === this.id) {
          // add focused style
          this.shadowRoot?.querySelector('.header')?.classList.add('focused');
        } else if (this.id === focused.parentId) {
          // add focused style
          this.shadowRoot
            ?.getElementById(`${focused.id}`)
            ?.classList.add('focused');
        }
      });
    };
    this.emitter.on('focus', handler);
    return () => {
      this.emitter.off('focus', handler);
    };
  }

  // dispatch events
  requestAddNodes(id: string) {
    this.emitter.emit('addSelectedNodesToFeature', { id });
  }

  requestToggleVisible(id: string, visible: boolean) {
    this.emitter.emit('changeFeatureVisible', { id, visible });
  }
}
