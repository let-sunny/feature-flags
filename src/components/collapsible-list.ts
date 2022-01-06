import Icon from '../static/Icon';
class CollapsibleList extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', this.clickHandler);
    const style = document.createElement('style');
    const container = document.createElement('li');
    container.setAttribute('id', 'container');
    container.setAttribute('class', 'closed');

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(container);
    shadow.appendChild(style);
  }

  clickHandler(e: MouseEvent) {
    const target = e.composedPath()[0] as HTMLElement;
    if (target.getAttribute('id') === 'header') {
      target.parentElement?.classList.toggle('closed');
    }
  }

  connectedCallback() {
    // element added to page.
    addListTemplate(this);
    addListStyle(this);
  }

  disconnectedCallback() {
    // element removed from page.
    this.removeEventListener('click', this.clickHandler);
  }
}

function addListTemplate(elem: CollapsibleList) {
  const container = elem.shadowRoot?.querySelector('#container');
  if (!container) return;
  const headerContainer = document.createElement('div');
  headerContainer.setAttribute('id', 'header');
  const headerIcon = document.createElement('div');
  headerIcon.setAttribute('id', 'icon');
  headerIcon.innerHTML = Icon.arrow();
  const headerTitle = document.createElement('div');
  headerTitle.setAttribute('id', 'title');

  headerContainer.appendChild(headerIcon);
  headerContainer.appendChild(headerTitle);

  const contentContainer = document.createElement('ul');
  contentContainer.setAttribute('id', 'content');

  container.appendChild(headerContainer);
  container.appendChild(contentContainer);
}

function addListStyle(elem: CollapsibleList) {
  const style = elem.shadowRoot?.querySelector('style');
  if (!style) return;
  style.innerHTML = `
    #container {
      display: flex;
      flex-direction: column;
    }
    #container.closed #header #icon {
      transform: rotate(0deg);
    }
    #container.closed #content {
      display: none;
    }
    #header #icon {
      width: var(--icon-size, 1rem);
      height: var(--icon-size, 1rem);
      transform: rotate(90deg);
    }
    #header #icon .icon {
      fill: var(--gray);
    }
    #header #title {
      padding-left: 8px;
    }
    #header, #content li {
      padding: 0 14px;
    }
    #header {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    #header:hover, #content li:hover {
          background-color: var(--key-color);
    }
    #content {
      padding-left: 44px;
      display: block;
    }
  `;
}

customElements.define('feature-flags-list', CollapsibleList);
