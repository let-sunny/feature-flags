import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements/custom-elements.min';

import './components';
import './ui.css';

document.getElementById('button')?.addEventListener('click', (e) => {
  const row = document.getElementById('test-row') as HTMLElement;
  row.setAttribute('name', 'test2222');
});

document.addEventListener('contextmenu', (e) => {
  console.log('contextmenu: ', e.target);
});

document.addEventListener('click', (e) => {
  console.log('click:', e.target);
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
