/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';

import RootUI from '../ui.html';
import { UIEventHandler } from '../ui';
import { TAG_NAMES } from './../components';
import emitter from '../event/emitter';

window.document.body.innerHTML = RootUI;

describe('ui', () => {
  test('should have defined', () => {
    expect(document.getElementById('ui')).not.toBeNull();
  });
});

describe('document event handlers', () => {
  window.onmessage = jest.fn();

  new UIEventHandler();

  beforeEach(() => {
    parent.postMessage = jest.fn();
  });

  test('onDropFromFigma', () => {
    const mock = jest.fn();
    emitter.on('addSelectedNodesToFeature', mock);

    // nothing happens
    fireEvent.mouseDown(document);
    fireEvent.mouseUp(document);
    expect(mock).not.toBeCalled();

    // leave plugin ui
    fireEvent.mouseLeave(document);
    expect(mock).not.toBeCalled();

    // drop in feature container
    const featureContainer = document.createElement(TAG_NAMES.CONTAINER);
    featureContainer.setAttribute('id', 'feature-container');
    document.body.appendChild(featureContainer);
    fireEvent(
      featureContainer,
      new MouseEvent('mouseup', { bubbles: true, composed: true })
    );

    expect(mock).toBeCalled();
    emitter.off('addSelectedNodesToFeature', mock);
  });

  test('onContextMenu', () => {
    const contextMenu = document.createElement(TAG_NAMES.CONTEXT_MENU);
    const mock = jest.fn();
    emitter.on('closeContextMenu', mock);

    // if click on outside of context menu, close context menu
    // close context menu
    fireEvent.click(document);
    expect(mock).toBeCalledTimes(1);

    // if click on context menu, do nothing
    document.body.appendChild(contextMenu);
    fireEvent(
      contextMenu,
      new MouseEvent('click', { bubbles: true, composed: true })
    );
    expect(mock).toBeCalledTimes(1);
    emitter.off('closeContextMenu', mock);
  });

  test('onKeyPressed', () => {
    // delete
    let mock = jest.fn();
    emitter.on('deleteFocusedItem', mock);
    fireEvent.keyDown(document, { key: 'Delete' });
    expect(mock).toBeCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Backspace' });
    expect(mock).toBeCalledTimes(2);
    emitter.off('deleteFocusedItem', mock);

    // rename
    mock = jest.fn();
    emitter.on('editFocusedFeatureName', mock);
    fireEvent.keyDown(document, { key: 'r' });
    expect(mock).toBeCalled();
    emitter.off('editFocusedFeatureName', mock);
  });

  test('onDoubleClick', () => {
    const mock = jest.fn();
    emitter.on('editFocusedFeatureName', mock);
    fireEvent.dblClick(document);
    expect(mock).toBeCalled();
    emitter.off('editFocusedFeatureName', mock);
  });

  test('onRequestChangeNodeVisible', () => {
    const detail = {
      nodes: [],
      visible: true,
    };
    emitter.emit('changeNodeVisible', detail);

    expect(parent.postMessage).toBeCalledTimes(1);
    expect((parent.postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      pluginMessage: {
        type: 'CHANGE_NODE_VISIBLE',
        nodes: detail.nodes,
        visible: detail.visible,
      },
    });
  });

  test('onRequestUpdatedFeatures', () => {
    const detail = {
      features: [],
    };
    emitter.emit('updateFeatures', detail);

    expect(parent.postMessage).toBeCalledTimes(1);
    expect((parent.postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      pluginMessage: {
        type: 'UPDATE_FEATURES',
        features: detail.features,
      },
    });
  });

  test('onRequestSync', () => {
    emitter.emit('syncFeatures');

    expect(parent.postMessage).toBeCalledTimes(1);
    expect((parent.postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      pluginMessage: {
        type: 'SYNC_FEATURES',
      },
    });
  });
});
