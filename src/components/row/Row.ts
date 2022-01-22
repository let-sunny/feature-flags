import { Events } from './../../event/type';
import CustomElement from '../CustomElement';
import Style from './style.scss';
import Template from './template.html';
import { ItemType } from '../types';

type Attribute = 'type' | 'id' | 'name' | 'visible' | 'node-type';
export const ROW_TAG_NAME = 'feature-flags-row';
export default class Row extends CustomElement {
  static get observedAttributes(): Attribute[] {
    return ['name'];
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  get type() {
    return this.getAttribute('type') || '';
  }

  constructor() {
    super(Template, Style);
  }

  connectedCallback() {
    this.registerEventHandlers([
      this.onRequestRename.bind(this),
      this.onContextMenu.bind(this),
      this.onRequestFocus.bind(this),
    ]);
  }

  attributeChangedCallback(
    attribute: Attribute,
    oldValue: string,
    newValue: string
  ) {
    if (oldValue === newValue) return;
    const container = this.shadowRoot?.querySelector('.container');

    switch (attribute) {
      case 'name': {
        const name = container?.querySelector('.name');
        if (name) {
          name.innerHTML = newValue;
        }
        break;
      }
      default:
        throw new Error('Unknown attribute');
    }
  }

  // event handlers
  onRequestRename() {
    const input = this.shadowRoot?.querySelector('.input') as HTMLInputElement;
    const blur = () => {
      requestAnimationFrame(() => {
        input.style.display = 'none';
      });
      this.requestRenameFeature(this.id, input.value);
    };
    const keydown = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        input.blur();
      }
    };
    const editName = ({ id }: Events['editFeatureName']) => {
      if (id !== this.id || this.type !== 'FEATURE') return;
      requestAnimationFrame(() => {
        input.style.display = 'block';
        input.value = this.name;
        input.focus();
      });
    };

    input.addEventListener('blur', blur);
    input.addEventListener('keydown', keydown);
    this.emitter.on('editFeatureName', editName);
    return () => {
      input.removeEventListener('blur', blur);
      input.removeEventListener('keydown', keydown);
      this.emitter.off('editFeatureName', editName);
    };
  }

  onContextMenu() {
    const handler = (event: MouseEvent) => {
      this.requestOpenContextMenu({ x: event.pageX, y: event.pageY });
    };
    this.addEventListener('contextmenu', handler);
    return () => {
      this.removeEventListener('contextmenu', handler);
    };
  }

  onRequestFocus() {
    this.addEventListener('click', this.requestFocus.bind(this));
    return () => {
      this.removeEventListener('click', this.requestFocus);
    };
  }

  // dispatch events
  requestRenameFeature = (id: string, name: string) => {
    this.emitter.emit('renameFeature', {
      id,
      name: name.trim(),
    });
  };

  requestOpenContextMenu = (position: { x: number; y: number }) => {
    this.emitter.emit('openContextMenu', {
      target: this,
      position,
    });
  };

  requestFocus() {
    const focused = {
      id: this.id,
      parentId: this.getAttribute('parentId') || '',
      type: this.getAttribute('type') as ItemType,
    };
    this.emitter.emit('focus', focused);
  }
}
