import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';
import { ROW_TAG_NAME, ROW_EVENTS } from '../row/Row';
import { getAppElement, APP_EVENTS } from '../app/App';
import { ItemType } from '../types';

export const CONTEXT_MENU_TAG_NAME = 'feature-flags-context-menu';
export const EVENTS = {
  OPEN_CONTEXT_MENU: 'OPEN_CONTEXT_MENU',
  CLOSE_CONTEXT_MENU: 'CLOSE_CONTEXT_MENU',
};
export default class ContextMenu extends CustomElement {
  target: HTMLElement | null;
  constructor() {
    super(Template, Style);

    this.target = null;
  }

  connectedCallback() {
    this.onOpen();
    this.onClose();
    this.onRequestRename();
    this.onRequestDelete();
  }

  close() {
    requestAnimationFrame(() => {
      this.style.display = 'none';
    });
  }

  onOpen() {
    this.addEventListener(EVENTS.OPEN_CONTEXT_MENU, (({
      detail: event,
    }: CustomEvent) => {
      const row = (event.composedPath() as HTMLElement[]).find(
        (target) => target.tagName === ROW_TAG_NAME.toUpperCase()
      );

      this.target = row || null;
      if (this.target) {
        const type = this.target.getAttribute('type') as ItemType;
        requestAnimationFrame(() => {
          // rename is able only for feature
          if (type === 'FEATURE') {
            this.shadowRoot
              ?.querySelector('.menu-item.rename')
              ?.classList.remove('hidden');
          } else {
            this.shadowRoot
              ?.querySelector('.menu-item.rename')
              ?.classList.add('hidden');
          }

          this.style.display = 'block';
          this.style.left = `${event.pageX}px`;
          this.style.top = `${event.pageY}px`;
        });
      }
    }) as EventListener);
  }

  // event handlers
  onClose() {
    this.addEventListener(EVENTS.CLOSE_CONTEXT_MENU, (() => {
      this.close();
    }) as EventListener);
  }

  onRequestRename() {
    this.shadowRoot?.querySelector('#rename')?.addEventListener('click', () => {
      onRenameFeature(this.target);
      this.close();
    });
  }

  onRequestDelete() {
    this.shadowRoot?.querySelector('#delete')?.addEventListener('click', () => {
      const type = this.target?.getAttribute('type') as ItemType;
      const targetId = this.target?.getAttribute('id');
      if (type && targetId) {
        onDeleteFeatureChild(type, targetId);
      }
      this.close();
    });
  }
}

const onRenameFeature = (featureElement: HTMLElement | null) => {
  featureElement?.dispatchEvent(new CustomEvent(ROW_EVENTS.REQUEST_RENAME));
};

const onDeleteFeatureChild = (type: ItemType, id: string) => {
  const eventName =
    type === 'FEATURE' ? APP_EVENTS.DELETE_FEATURE : APP_EVENTS.DELETE_NODE;
  const app = getAppElement();
  app?.dispatchEvent(
    new CustomEvent(eventName, {
      detail: {
        id,
      },
    })
  );
};
