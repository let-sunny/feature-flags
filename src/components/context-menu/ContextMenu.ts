import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';
import { ROW_TAG_NAME, ROW_EVENTS } from '../row/Row';
import { getAppElement, APP_EVENTS } from '../app/App';
import { ItemType } from '../types';

export const CONTEXT_MENU_TAG_NAME = 'feature-flags-context-menu';
export default class ContextMenu extends CustomElement {
  target: HTMLElement | null;
  constructor() {
    super(Template, Style);

    this.target = null;
  }

  connectedCallback() {
    document.addEventListener(
      'contextmenu',
      this.contextMenuHandler.bind(this)
    );
    document.addEventListener('click', this.closeHandler.bind(this));

    const actions: ('rename' | 'delete')[] = ['rename', 'delete'];
    actions.forEach((action) => {
      this.shadowRoot
        ?.querySelector(`#${action}`)
        ?.addEventListener('click', this[action].bind(this));
    });
  }

  disconnectedCallback() {
    document.removeEventListener('contextmenu', this.contextMenuHandler);
    document.removeEventListener('click', this.closeHandler);
  }

  close() {
    requestAnimationFrame(() => {
      this.style.display = 'none';
    });
  }

  contextMenuHandler(e: MouseEvent) {
    e.preventDefault();

    const row = (e.composedPath() as HTMLElement[]).find(
      (target) => target.tagName === ROW_TAG_NAME.toUpperCase()
    );
    this.target = row || null;
    if (this.target) {
      requestAnimationFrame(() => {
        this.style.display = 'block';
        this.style.left = `${e.pageX}px`;
        this.style.top = `${e.pageY}px`;
      });
    }
  }

  closeHandler(e: MouseEvent) {
    e.preventDefault();

    const closed = (e.composedPath() as HTMLElement[]).every(
      (target) => target.tagName !== CONTEXT_MENU_TAG_NAME.toUpperCase()
    );
    if (closed) {
      this.close();
    }
  }

  rename() {
    this.target?.dispatchEvent(
      new CustomEvent(ROW_EVENTS.REQUEST_RENAME, {
        detail: {
          id: this.target.getAttribute('id'),
          type: this.target.getAttribute('type'),
        },
      })
    );
    this.close();
  }

  delete() {
    const type = this.target?.getAttribute('type') as ItemType;
    const eventName =
      type === 'FEATURE' ? APP_EVENTS.DELETE_FEATURE : APP_EVENTS.DELETE_NODE;
    getAppElement()?.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          id: this.target?.getAttribute('id'),
        },
      })
    );
    this.close();
  }
}
