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
      background-color: #eee;
      padding: 10px;
    }
    #container.closed {
      border: 1px solid #ccc;
    }
    #container.closed #content {
      display: none;
    }

    #header {
      width: 100%;
      height: 30px;
    }
    #content {
      margin-bottom: 5px;
      height: 200px;
      display: block;
    }
  `;
}

customElements.define('feature-flags-list', CollapsibleList);
