import Icon from '../static/Icon';

type RowAttributeKey =
  | 'type'
  | 'key'
  | 'name'
  | 'editable'
  | 'visible'
  | 'node-type';

class Row extends HTMLElement {
  static get observedAttributes(): RowAttributeKey[] {
    return ['type', 'name', 'editable', 'visible', 'node-type'];
  }

  constructor() {
    super();

    const style = document.createElement('style');
    const container = document.createElement('div');
    container.setAttribute('id', 'container');

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(container);
    shadow.appendChild(style);
  }

  connectedCallback() {
    // element added to page.
    addRowTemplate(this);
    addRowStyle(this);
  }

  disconnectedCallback() {
    // element removed from page.
  }

  attributeChangedCallback(
    attribute: RowAttributeKey,
    oldValue: string,
    newValue: string
  ) {
    if (oldValue === newValue) return;
    const container = this.shadowRoot?.querySelector('#container');

    switch (attribute) {
      case 'name': {
        const name = container?.querySelector('#name');
        if (name) {
          name.innerHTML = newValue;
        }
        break;
      }
      case 'editable': {
        if (newValue != null) {
          container?.classList.add('editable');
        } else {
          container?.classList.remove('editable');
        }
        break;
      }
      case 'visible': {
        const toggleClasses = container?.querySelector('#toggle')?.classList;
        if (newValue != null) {
          toggleClasses?.add('visible');
        } else {
          toggleClasses?.remove('visible');
        }
        break;
      }
      case 'node-type': {
        const iconClasses = container?.querySelector('#toggle')?.classList;
        iconClasses?.remove(oldValue);
        iconClasses?.add(newValue);
        break;
      }
      case 'type':
      case 'key':
        // nothing to do
        break;
      default:
        throw new Error('Unknown attribute');
    }
  }
}

customElements.define('feature-flags-row', Row);

function addRowTemplate(elem: HTMLElement) {
  const container = elem.shadowRoot?.querySelector('#container');
  if (!container) return;

  const type = elem.getAttribute('type') || 'feature';

  // add content
  const content = document.createElement('div');
  content.setAttribute('id', 'content');
  // feature doesn't have icon
  if (type !== 'feature') {
    const icon = document.createElement('div');
    icon.setAttribute('id', 'icon');
    icon.innerHTML = Icon[elem.getAttribute('node-type') || '']();
    content.appendChild(icon);
  }
  const name = document.createElement('p');
  name.setAttribute('id', 'name');
  name.innerHTML = elem.getAttribute('name') || '';
  content.appendChild(name);
  container.appendChild(content);

  // only feature has controls
  if (type === 'feature') {
    // add controls
    const controls = document.createElement('div');
    controls.setAttribute('id', 'controls');
    const toggle = document.createElement('div');
    toggle.setAttribute('id', 'toggle');
    toggle.innerHTML = `
      <div id="visible">${Icon.visible()}</div>
      <div id="invisible">${Icon.invisible()}</div>
    `;
    controls.appendChild(toggle);
    container.appendChild(controls);
  }
}

function addRowStyle(elem: HTMLElement) {
  const style = elem.shadowRoot?.querySelector('style');
  if (!style) return;

  style.textContent = `
      #container {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
      }
      #container > *, #container .icon {
        color: var(--gray) !important;
        fill: var(--gray) !important;
      }
      #container.editable > *, #container.editable .icon {
        color: var(--black) !important;
        fill: var(--black) !important;
      }

      #content, #controls {
          display: flex;
          flex-direction: row;
          align-items: center;
      }
      #content {
        flex: 1;
      }

      #name {
          font-size: 1rem;
          margin: 0;
      }

      #icon {
          width: var(--icon-size, 1rem);
          height: var(--icon-size, 1rem);
          padding-right: 8px;
      }

      #toggle {
        display: flex;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        width: var(--icon-size, 1rem);
        height: var(--icon-size, 1rem);
      }
      #toggle #visible {
        display: none;
      }
      #toggle #invisible {
        display: block;
      }
      #toggle.visible #visible {
        display: block;
      }
      #toggle.visible #invisible {
        display: none;
      }
    `;
}
