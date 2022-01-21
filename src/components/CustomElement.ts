import emitter from '../event/emitter';

type ClearEventHandler = () => void;
type EventHandlers = () => ClearEventHandler;
export default class CustomElement extends HTMLElement {
  emitter = emitter;
  eventHandlers: EventHandlers[] = [];
  constructor(template: string, style: string) {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    initTemplate(shadow, template);
    initStyle(shadow, style);
  }

  registerEventHandlers(handlers: EventHandlers[]) {
    this.eventHandlers = this.eventHandlers.concat(handlers);
    this.eventHandlers.forEach((handler) => handler());
  }

  disconnectedCallback() {
    this.eventHandlers.forEach((handler) => handler()());
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
