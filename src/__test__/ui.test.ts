/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';

import RootUI from '../ui.html';
import { UIEventHandler } from '../ui';
import { TAG_NAMES, EVENTS } from './../components';

window.document.body.innerHTML = RootUI;

describe('ui', () => {
  test('should have defined', () => {
    expect(document.getElementById('ui')).not.toBeNull();
    expect(document.getElementsByTagName(TAG_NAMES.APP)).not.toBeNull();
  });
});

describe('document event handlers', () => {
  const app = document.createElement(TAG_NAMES.APP);
  const contextMenu = document.createElement(TAG_NAMES.CONTEXT_MENU);
  window.onmessage = jest.fn();

  new UIEventHandler(app, contextMenu);

  beforeEach(() => {
    app.dispatchEvent = jest.fn();
    contextMenu.dispatchEvent = jest.fn();
    parent.postMessage = jest.fn();
  });

  test('onDropFromFigma', () => {
    const appEvent = app.dispatchEvent as jest.Mock;
    // nothing happens
    fireEvent.mouseDown(document);
    fireEvent.mouseUp(document);
    expect(appEvent).not.toBeCalled();

    // leave plugin ui
    fireEvent.mouseLeave(document);
    expect(appEvent).not.toBeCalled();

    // drop in feature container
    const featureContainer = document.createElement(TAG_NAMES.CONTAINER);
    featureContainer.setAttribute('id', 'feature-container');
    document.body.appendChild(featureContainer);
    fireEvent(
      featureContainer,
      new MouseEvent('mouseup', { bubbles: true, composed: true })
    );
    expect(appEvent).toBeCalled();
    expect(appEvent.mock.calls[0][0].type).toBe(EVENTS.ADD_NODES);
    expect(appEvent.mock.calls[0][0].detail).toEqual({
      featureId: featureContainer.id,
    });
  });

  test('onContextMenu', () => {
    const contextMenuEvent = contextMenu.dispatchEvent as jest.Mock;

    // open context menu
    fireEvent.contextMenu(document);
    expect(contextMenuEvent).toBeCalledTimes(1);
    expect(contextMenuEvent.mock.calls[0][0].type).toBe(
      EVENTS.OPEN_CONTEXT_MENU
    );

    // if click on outside of context menu, close context menu
    // close context menu
    fireEvent.click(document);
    expect(contextMenuEvent).toBeCalledTimes(2);
    expect(contextMenuEvent.mock.calls[1][0].type).toBe(
      EVENTS.CLOSE_CONTEXT_MENU
    );
    // if click on context menu, do nothing
    document.body.appendChild(contextMenu);
    fireEvent(
      contextMenu,
      new MouseEvent('click', { bubbles: true, composed: true })
    );
    expect(contextMenuEvent.mock.calls[2][0].type).toBe('click');
    expect(contextMenuEvent.mock.calls.length).toBe(3);
  });

  test('onKeyPressed', () => {
    const appEvent = app.dispatchEvent as jest.Mock;
    // delete
    fireEvent.keyDown(document, { key: 'Delete' });
    expect(appEvent).toBeCalledTimes(1);
    expect(appEvent.mock.calls[0][0].type).toBe(EVENTS.DELETE_ITEM);
    fireEvent.keyDown(document, { key: 'Backspace' });
    expect(appEvent).toBeCalledTimes(2);
    expect(appEvent.mock.calls[1][0].type).toBe(EVENTS.DELETE_ITEM);

    // rename
    fireEvent.keyDown(document, { key: 'r' });
    expect(appEvent).toBeCalledTimes(3);
    expect(appEvent.mock.calls[2][0].type).toBe(EVENTS.REQUEST_RENAME_FEATURE);
  });

  test('onDoubleClick', () => {
    const appEvent = app.dispatchEvent as jest.Mock;
    fireEvent.dblClick(document);
    expect(appEvent).toBeCalledTimes(1);
    expect(appEvent.mock.calls[0][0].type).toBe(EVENTS.REQUEST_RENAME_FEATURE);
  });

  test('onRequestChangeNodeVisible', () => {
    const detail = {
      nodes: 'nodes-test',
      visible: 'visible-test',
    };
    fireEvent(
      document,
      new CustomEvent(EVENTS.REQUEST_CHANGE_NODE_VISIBLE, {
        detail,
      })
    );

    expect(parent.postMessage).toBeCalledTimes(1);
    expect((parent.postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      pluginMessage: {
        type: EVENTS.REQUEST_CHANGE_NODE_VISIBLE,
        nodes: detail.nodes,
        visible: detail.visible,
      },
    });
  });

  test('onRequestUpdatedFeatures', () => {
    const detail = {
      features: 'features-test',
    };
    fireEvent(
      document,
      new CustomEvent(EVENTS.REQUEST_UPDATE_FEATURES, {
        detail,
      })
    );

    expect(parent.postMessage).toBeCalledTimes(1);
    expect((parent.postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      pluginMessage: {
        type: EVENTS.REQUEST_UPDATE_FEATURES,
        features: detail.features,
      },
    });
  });

  test('onRequestSync', () => {
    fireEvent(document, new CustomEvent(EVENTS.REQUEST_SYNC_FEATURES));

    expect(parent.postMessage).toBeCalledTimes(1);
    expect((parent.postMessage as jest.Mock).mock.calls[0][0]).toEqual({
      pluginMessage: {
        type: EVENTS.REQUEST_SYNC_FEATURES,
      },
    });
  });
});
