type ContextMenuAttributeKey = 'for' | 'x' | 'y';

class ContextMenu extends HTMLElement {
  static get observedAttributes(): ContextMenuAttributeKey[] {
    return ['for', 'x', 'y'];
  }

  constructor() {
    super();

    const style = document.createElement('style');
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    container.setAttribute('class', 'hidden');

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(container);
    shadow.appendChild(style);
  }

  connectedCallback() {
    // element added to page.
    addMenuTemplate(this);
    addMenuStyle(this);
  }

  attributeChangedCallback(
    attribute: ContextMenuAttributeKey,
    oldValue: string,
    newValue: string
  ) {
    const container = this.shadowRoot?.querySelector(
      '#container'
    ) as HTMLElement;

    switch (attribute) {
      case 'for': {
        if (newValue) {
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
        break;
      }
      case 'x': {
        container.style.left = `${newValue}px`;
        break;
      }
      case 'y': {
        container.style.top = `${newValue}px`;
        break;
      }
      default:
        throw new Error('Unknown attribute');
    }
  }
}

customElements.define('feature-flags-context-menu', ContextMenu);

function addMenuTemplate(elem: ContextMenu) {
  const container = elem.shadowRoot?.querySelector('#container');
  if (!container) return;

  const menu = document.createElement('ul');
  menu.setAttribute('id', 'menu');

  const rename = document.createElement('li');
  rename.setAttribute('class', 'menu-item');
  rename.setAttribute('id', 'rename');
  rename.innerHTML = '<p id="rename">Rename</p><p>R</p>';
  menu.appendChild(rename);

  const del = document.createElement('li');
  del.setAttribute('class', 'menu-item');
  del.setAttribute('id', 'delete');
  del.innerHTML = '<p id="delete">Delete</p><p>D</p>';
  menu.appendChild(del);

  container.appendChild(menu);
}

function addMenuStyle(elem: ContextMenu) {
  const style = elem.shadowRoot?.querySelector('style');
  if (!style) return;
  style.innerHTML = `
    #container {
      position: absolute;
      background-color: #eee;
    }
    #container.hidden {
      display: none;
    }

    #menu {
      display: flex;
      flex-direction: column;
      list-style: none;
      margin: 0;
      padding: 0;

      width: 130px;
    }

    #menu .menu-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 2px;
    }

    #menu .menu-item:hover {
      background-color: #f5f5f5;
    }

    #menu .menu-item p {
      margin: 0;
    }
  `;
}
