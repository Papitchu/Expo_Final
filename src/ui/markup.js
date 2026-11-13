export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

export function button(label, action, secondary = false) {
  const variant = secondary ? 'secondary' : '';
  return `<button type="button" data-action="${escapeHtml(action)}" class="${variant}">${escapeHtml(label)}</button>`;
}
