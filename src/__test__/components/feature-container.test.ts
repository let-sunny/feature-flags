/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import FeatureContainer, {
  CONTAINER_TAG_NAME,
} from '../../components/feature-container/FeatureContainer';

describe(CONTAINER_TAG_NAME, () => {
  customElements.define(CONTAINER_TAG_NAME, FeatureContainer);

  test('should have defined', () => {
    expect(customElements.get(CONTAINER_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(CONTAINER_TAG_NAME)).toBeDefined();
  });

  test('initial closed attribute is true', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    document.body.appendChild(element);

    expect(element.getAttribute('closed')).toBe('true');
  });
});
