import Icon from '../static/Icon';
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
  rename.innerHTML = '<p id="rename">Rename</p><p id="short-cut">R</p>';
  menu.appendChild(rename);

  const del = document.createElement('li');
  del.setAttribute('class', 'menu-item');
  del.setAttribute('id', 'delete');
  del.innerHTML = `<p id="delete">Delete</p><i id="icon">${Icon.delete()}</i>`;
  menu.appendChild(del);

  container.appendChild(menu);
}

function addMenuStyle(elem: ContextMenu) {
  const style = elem.shadowRoot?.querySelector('style');
  if (!style) return;
  style.innerHTML = `
    #container {
      position: absolute;
      background: #1D1D1D;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
      border-radius: 2px;
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

      width: 140px;
      padding: 12px 0;
    }

    #menu .menu-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px 4px;
    }

    #menu .menu-item #short-cut {
      color: var(--gray);
      padding-right: 2px;
      font-size: 10px;
      font-weight: 400;
    }
    #menu .menu-item #icon {
      width: 12px;
      height: 12px;
    }
    #menu .menu-item #icon .icon {
      stroke: var(--gray);
    }

    #menu .menu-item:hover {
      background-color: #54afe3;
    }

    #menu .menu-item p {
      margin: 0;
      font-size: 1rem;
      color: var(--white);
      font-weight: 500;
    }
  `;
}
