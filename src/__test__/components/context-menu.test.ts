/**
 * @jest-environment jsdom
 */
import ContextMenu, {
  CONTEXT_MENU_TAG_NAME,
} from '../../components/context-menu/ContextMenu';

describe(CONTEXT_MENU_TAG_NAME, () => {
  customElements.define(CONTEXT_MENU_TAG_NAME, ContextMenu);

  test('should have defined', () => {
    expect(customElements.get(CONTEXT_MENU_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(CONTEXT_MENU_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(CONTEXT_MENU_TAG_NAME)).toBeDefined();
  });
});
