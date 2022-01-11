/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import { EVENTS, TAG_NAMES } from '../../components';
import { Feature, Node } from './../../components/types';

describe(TAG_NAMES.APP, () => {
  test('should have defined', () => {
    expect(customElements.get(TAG_NAMES.APP)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(TAG_NAMES.APP);
    document.body.appendChild(element);
    expect(document.body.querySelector(TAG_NAMES.APP)).toBeDefined();
  });
});

describe(`${TAG_NAMES.APP} event handlers`, () => {
  let features: Feature[] = [];
  let selection: Node[] = [];
  beforeEach(() => {
    features = [
      {
        id: '1',
        name: 'feature 1',
        type: 'FEATURE',
        visible: true,
        focused: {},
        items: [],
      },
      {
        id: '2',
        name: 'feature 2',
        type: 'FEATURE',
        visible: true,
        focused: {},
        items: [
          {
            id: '2.1',
            name: 'Node 2.1',
            type: 'NODE',
            visible: true,
            node: 'GROUP',
            focused: {},
          },
        ],
      },
    ];
    selection = [
      {
        id: '3.1',
        name: 'Node 3.1',
        type: 'NODE',
        visible: true,
        node: 'GROUP',
        focused: {},
      },
    ];
  });

  test('onSetSelectionNodes ', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    document.body.appendChild(element);

    const nodes = [
      {
        id: '1',
        name: 'node 1',
        type: 'NODE',
        nodeType: 'GROUP',
      },
      {
        id: '2',
        name: 'node 2',
        type: 'NODE',
        nodeType: 'GROUP',
      },
    ];

    fireEvent(
      element,
      new CustomEvent(EVENTS.SET_SELECTION_NODES, {
        detail: {
          nodes,
        },
      })
    );

    expect(JSON.parse(element.getAttribute('selection') || '{}')).toEqual(
      nodes
    );
  });

  test('onFocus', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    document.body.appendChild(element);

    const detail = {
      id: '1',
      parentId: '123',
      type: 'NODE',
    };
    fireEvent(element, new CustomEvent(EVENTS.FOCUS, { detail }));

    expect(JSON.parse(element.getAttribute('focused') || '{}')).toEqual(detail);
  });

  test('onDeleteNode', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    const detail = features[1].items[0];
    fireEvent(element, new CustomEvent(EVENTS.DELETE_NODE, { detail }));

    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
      {
        ...features[1],
        items: [],
      },
    ]);
  });

  test('onAddNodes', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    element.setAttribute('selection', JSON.stringify(selection));

    document.body.appendChild(element);

    const detail = {
      featureId: '2',
    };
    fireEvent(element, new CustomEvent(EVENTS.ADD_NODES, { detail }));

    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
      {
        ...features[1],
        items: [
          ...features[1].items,
          ...JSON.parse(element.getAttribute('selection') || '{}'),
        ],
      },
    ]);
  });

  test('onCreateFeature', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    const button = element.shadowRoot?.querySelector(
      '#add-feature'
    ) as HTMLElement;
    fireEvent.click(button);
    expect(JSON.parse(element.getAttribute('features') || '{}').length).toBe(
      features.length + 1
    );
  });

  test('onDeleteFeature', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    const detail = {
      id: '2',
    };
    fireEvent(element, new CustomEvent(EVENTS.DELETE_FEATURE, { detail }));

    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
    ]);
  });

  test('onRenameFeature', () => {
    const element = document.createElement(TAG_NAMES.APP);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    const detail = {
      id: '2',
      name: 'feature 2 renamed',
    };
    fireEvent(element, new CustomEvent(EVENTS.RENAME_FEATURE, { detail }));

    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
      {
        ...features[1],
        name: 'feature 2 renamed',
      },
    ]);
  });
});
