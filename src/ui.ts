import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';

import './ui.css';
import './components';

document.addEventListener('contextmenu', (e) => {
  const target = e
    .composedPath()
    .find(
      (elem) => (elem as HTMLElement).tagName === 'FEATURE-FLAGS-ROW'
    ) as HTMLElement;

  if (target) {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuElement = document.querySelector(
      'feature-flags-context-menu'
    );
    contextMenuElement?.setAttribute('x', e.clientX.toString());
    contextMenuElement?.setAttribute('y', e.clientY.toString());
    contextMenuElement?.setAttribute('for', target.getAttribute('key') || '');
  }
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target?.tagName !== 'FEATURE-FLAGS-CONTEXT-MENU') {
    const contextMenuElement = document.querySelector(
      'feature-flags-context-menu'
    );
    contextMenuElement?.removeAttribute('for');
  }
});

document.addEventListener('dragstart', (e) => {
  console.log('dragstart:', e.target);
});

// document.getElementById('create')?.addEventListener('click', () => {
//   const textbox = document.getElementById('count') as HTMLInputElement;
//   const count = parseInt(textbox.value, 10);
//   parent.postMessage(
//     { pluginMessage: { type: 'create-rectangles', count } },
//     '*'
//   );
// });

// document.getElementById('cancel')?.addEventListener('click', () => {
//   parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
// });
