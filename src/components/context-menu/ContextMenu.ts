import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';
import { ItemType } from '../types';
import { Events } from './../../event/type';

export const CONTEXT_MENU_TAG_NAME = 'feature-flags-context-menu';
export default class ContextMenu extends CustomElement {
  target: HTMLElement | null;
  constructor() {
    super(Template, Style);
    this.target = null;
  }

  connectedCallback() {
    this.registerEventHandlers([
      this.onOpen.bind(this),
      this.onClose.bind(this),
      this.onRequestRename.bind(this),
      this.onRequestDelete.bind(this),
    ]);
  }

  close() {
    requestAnimationFrame(() => {
      this.style.display = 'none';
    });
  }

  // event handlers
  onOpen() {
    const handler = ({
      target,
      position: { x, y },
    }: Events['openContextMenu']) => {
      this.target = target;
      requestAnimationFrame(() => {
        // rename is able only for feature
        if (target.getAttribute('type') === 'FEATURE') {
          this.shadowRoot
            ?.querySelector('.menu-item.rename')
            ?.classList.remove('hidden');
        } else {
          this.shadowRoot
            ?.querySelector('.menu-item.rename')
            ?.classList.add('hidden');
        }

        this.style.display = 'block';
        this.style.left = `${x}px`;
        this.style.top = `${y}px`;
      });
    };
    this.emitter.on('openContextMenu', handler);
    return () => {
      this.emitter.off('openContextMenu', handler);
    };
  }

  onClose() {
    this.emitter.on('closeContextMenu', this.close.bind(this));
    return () => {
      this.emitter.off('closeContextMenu', this.close);
    };
  }

  onRequestRename() {
    const button = this.shadowRoot?.querySelector('#rename');
    const handler = () => {
      if (this.target) {
        this.emitter.emit('editFeatureName', { id: this.target.id });
      }
      this.close();
    };
    button?.addEventListener('click', handler);
    return () => {
      button?.removeEventListener('click', handler);
    };
  }

  onRequestDelete() {
    const button = this.shadowRoot?.querySelector('#delete');
    const handler = () => {
      const type = this.target?.getAttribute('type') as ItemType;
      const targetId = this.target?.getAttribute('id');

      if (type && targetId) {
        this.requestDeleteFeatureChild(type, targetId);
      }
      this.close();
    };
    button?.addEventListener('click', handler);
    return () => {
      button?.removeEventListener('click', handler);
    };
  }

  // dispatch events
  requestDeleteFeatureChild(type: ItemType, id: string) {
    this.emitter.emit('deleteItem', {
      id,
      type,
    });
  }
}
