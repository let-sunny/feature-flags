import './ui.css';

document.getElementById('create')?.addEventListener('click', () => {
  const textbox = document.getElementById('count') as HTMLInputElement;
  const count = parseInt(textbox.value, 10);
  parent.postMessage(
    { pluginMessage: { type: 'create-rectangles', count } },
    '*'
  );
});

document.getElementById('cancel')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
});
