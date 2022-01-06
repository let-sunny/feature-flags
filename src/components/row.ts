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
    const icon = document.createElement('img');
    icon.setAttribute('id', 'icon');
    icon.setAttribute('class', elem.getAttribute('node-type') || '');
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
    const toggle = document.createElement('button');
    toggle.setAttribute('id', 'toggle');
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
          padding: 5px;
      }
      #container:hover {
          background-color: #f5f5f5;
      }
      #container:active {
          background-color: #eaeaea;
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
          font-size: 14px;
          margin: 0;
      }

      #icon {
          width: 16px;
          height: 16px;
          background-color: red;
      }
    `;
}
