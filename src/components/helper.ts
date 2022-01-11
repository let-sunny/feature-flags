import { Feature, Node } from './types';
import { APP_TAG_NAME } from './app/App';
import { CONTEXT_MENU_TAG_NAME } from './context-menu/ContextMenu';
import { CONTAINER_TAG_NAME } from './feature-container/FeatureContainer';
import { ROW_TAG_NAME } from './row/Row';

export const findElementByTagName = (
  elements: HTMLElement[],
  tagName: string
) => elements.find((element) => element.tagName === tagName.toUpperCase());

export const getAppElement = (): HTMLElement | null => {
  return document.querySelector(APP_TAG_NAME);
};

export const getNewFeature = (index: number): Feature => {
  return {
    id: `${new Date().getTime()}-${index}`, // TODO: unique id
    name: `Feature ${index}`,
    type: 'FEATURE',
    visible: true,
    focused: {},
    items: [],
  };
};

export const getContextMenuElement = (): HTMLElement | null | undefined => {
  return getAppElement()?.shadowRoot?.querySelector(CONTEXT_MENU_TAG_NAME);
};

export const createFeatureContainer = (feature: Feature) => {
  const element = document.createElement(CONTAINER_TAG_NAME);
  element.setAttribute('id', feature.id);
  updateFeatureContainer(element, feature);

  const featureRow = createFeatureRow(feature);
  element.appendChild(featureRow);
  return element;
};

export const createFeatureRow = (feature: Feature) => {
  const element = document.createElement(ROW_TAG_NAME);
  element.setAttribute('id', feature.id);
  element.setAttribute('name', feature.name);
  element.setAttribute('visible', feature.visible ? 'true' : 'false');
  element.setAttribute('editable', 'true');
  element.setAttribute('type', feature.type);
  return element;
};

export const createNodeRow = (node: Node) => {
  const element = document.createElement(ROW_TAG_NAME);
  element.setAttribute('id', node.id);
  element.setAttribute('name', node.name);
  element.setAttribute('visible', node.visible ? 'true' : 'false');
  element.setAttribute('editable', 'true');
  element.setAttribute('type', node.type);
  element.setAttribute('node-type', node.node);
  return element;
};

export const updateFeatureContainer = (
  element: HTMLElement,
  feature: Feature
) => {
  element?.setAttribute('items', JSON.stringify(feature.items));
  element?.setAttribute('name', feature.name);
  element?.setAttribute('visible', JSON.stringify(feature.visible));
  element?.setAttribute('focused', JSON.stringify(feature.focused || '{}'));
};
