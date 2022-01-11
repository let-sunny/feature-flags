import App, { APP_TAG_NAME, APP_EVENTS } from './app/App';
import Row, { ROW_EVENTS, ROW_TAG_NAME } from './row/Row';
import FeatureContainer, {
  CONTAINER_TAG_NAME,
} from './feature-container/FeatureContainer';
import ContextMenu, {
  CONTEXT_MENU_TAG_NAME,
  CONTEXT_MENU_EVENTS,
} from './context-menu/ContextMenu';
import * as componentHelper from './helper';

export const TAG_NAMES = {
  APP: APP_TAG_NAME,
  ROW: ROW_TAG_NAME,
  CONTAINER: CONTAINER_TAG_NAME,
  CONTEXT_MENU: CONTEXT_MENU_TAG_NAME,
};

export const EVENTS = {
  ...APP_EVENTS,
  ...CONTEXT_MENU_EVENTS,
  ...ROW_EVENTS,
};

export const helper = componentHelper;

customElements.define(APP_TAG_NAME, App);
customElements.define(ROW_TAG_NAME, Row);
customElements.define(CONTAINER_TAG_NAME, FeatureContainer);
customElements.define(CONTEXT_MENU_TAG_NAME, ContextMenu);
