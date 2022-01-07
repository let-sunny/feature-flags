/**
 * @jest-environment jsdom
 */
import fs from 'fs';
window.document.body.innerHTML = fs.readFileSync('dist/ui.html', 'utf8');

describe('ui', () => {
  it('should have defined', () => {
    expect(document.getElementById('ui')).toBeDefined;
  });
});
