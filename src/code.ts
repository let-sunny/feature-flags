// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

figma.showUI(__html__);
figma.ui.resize(300, 425);

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'UPDATE_FEATURES': {
      figma.clientStorage.setAsync('features', msg.features);
      break;
    }
    case 'CHANGE_NODE_VISIBLE': {
      const { nodes, visible } = msg;
      const changedNodes = nodes.map((node: any) => {
        const target = figma.getNodeById(node.id) as any;
        if (target && target.visible !== undefined) {
          target.visible = visible;
        }
        return target;
      });

      const currentPageNodes = figma.currentPage.findChildren((n) =>
        changedNodes.find((node: any) => node.id == n.id)
      );
      figma.currentPage.selection = currentPageNodes;
      figma.viewport.scrollAndZoomIntoView(changedNodes);
      break;
    }
    default:
      throw new Error('Unknown message type');
  }
};

figma.on('selectionchange', () => {
  const nodes = figma.currentPage.selection
    .map((node: any) => {
      return figma.getNodeById(node.id);
    })
    .map((node: any) => ({
      id: node.id,
      name: node.name,
      type: 'NODE',
      visible: node.visible,
      node:
        node.type === 'FRAME' && node.layoutMode !== 'NONE'
          ? node.layoutMode
          : node.type,
    }));

  figma.ui.postMessage({
    type: 'UPDATE_SELECTION',
    value: { nodes },
  });
});

(async () => {
  const features = (await figma.clientStorage.getAsync('features')) || [];
  figma.ui.postMessage({
    type: 'INIT_FEATURES',
    value: { features },
  });
})();
