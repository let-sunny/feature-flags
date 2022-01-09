import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';
import { Feature, Node } from '../types';
import { getAppElement, APP_EVENTS } from '../app/App';

type Attribute = 'type' | 'id' | 'name' | 'editable' | 'visible' | 'node-type';

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

    this.initIcons();
  }

  get visible() {
    return this.getAttribute('visible') === 'true';
  }

  initIcons() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    // visibility icons
    const toggle = shadow.querySelector('.toggle');
    const visibilityIcons = shadow.querySelector(
      '#icons__visibility'
    ) as HTMLTemplateElement;
    toggle?.appendChild(visibilityIcons.content.cloneNode(true));

    // node-type icons
    const nodeType = shadow.querySelector('.node-type');
    const nodeTypeIcons = shadow.querySelector(
      '#icons__node-type'
    ) as HTMLTemplateElement;
    nodeType?.appendChild(nodeTypeIcons.content.cloneNode(true));
  }

  connectedCallback() {
    this.onToggleVisible();
    this.onAddNodes();
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
  onToggleVisible() {
    this.shadowRoot?.querySelector('.toggle')?.addEventListener('click', () => {
      getAppElement()?.dispatchEvent(
        new CustomEvent(APP_EVENTS.CHANGE_VISIBLE, {
          detail: { id: this.id, visible: !this.visible },
        })
      );
    });
  }

  onAddNodes() {
    this.shadowRoot?.querySelector('.add')?.addEventListener('click', () => {
      getAppElement()?.dispatchEvent(
        new CustomEvent(APP_EVENTS.ADD_NODES, {
          detail: { featureId: this.id },
        })
      );
    });
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
