// TODO: type
const sendFeatures = (features: any) => {
  figma.ui.postMessage({
    type: 'UPDATE_FEATURES',
    value: { features },
  });
};

const buildFeatureNode = (node: any) => ({
  id: node.id,
  name: node.name,
  type: 'NODE',
  visible: node.visible,
  node:
    node.type === 'FRAME' && node.layoutMode !== 'NONE'
      ? node.layoutMode
      : node.type,
});

figma.showUI(__html__);
figma.ui.resize(300, 425);

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'REQUEST_UPDATE_FEATURES': {
      figma.clientStorage.setAsync('features', msg.features);
      break;
    }
    case 'REQUEST_SYNC_FEATURES': {
      const features = await figma.clientStorage.getAsync('features');
      const updatedFeatures = features.map((feature: any) =>
        Object.assign(feature, {
          items: feature.items
            .map((node: any) => figma.getNodeById(node.id))
            .filter(Boolean)
            .map(buildFeatureNode),
        })
      );
      sendFeatures(updatedFeatures);
      break;
    }
    case 'REQUEST_CHANGE_NODE_VISIBLE': {
      const { nodes, visible } = msg;

      const changedNodes = nodes.map((node: any) => {
        const target = figma.getNodeById(node.id) as any;
        if (target && target.visible !== undefined) {
          target.visible = visible;
        }
        return target;
      });

      const currentPageNodes = figma.currentPage.findChildren((n) =>
        changedNodes.find((node: any) => node && node.id === n.id)
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
    .map((node) => {
      return figma.getNodeById(node.id);
    })
    .map(buildFeatureNode);

  figma.ui.postMessage({
    type: 'UPDATE_SELECTION',
    value: { nodes },
  });
});

(async () => {
  const features = (await figma.clientStorage.getAsync('features')) || [];
  sendFeatures(features);
})();
