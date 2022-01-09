export default class CustomElement extends HTMLElement {
  constructor(template: string, style: string) {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    initTemplate(shadow, template);
    initStyle(shadow, style);
  }
}

const initTemplate = (shadow: ShadowRoot, content: string) => {
  const template = document.createElement('template');
  template.innerHTML = content;
  shadow.appendChild(template.content.cloneNode(true));
};

const initStyle = (shadow: ShadowRoot, content: string) => {
  const style = document.createElement('style');
  style.textContent = content;
  shadow.appendChild(style);
};
