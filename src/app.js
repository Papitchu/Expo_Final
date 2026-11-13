import { createInitialState } from './app/state.js';
import { handleAction, handleFormSubmit } from './app/actions.js';
import { renderScreen } from './app/screens.js';

/** Connects app state, screen rendering, and user events. */
export function createApp(root) {
  const state = createInitialState();

  function render() {
    root.innerHTML = renderScreen(state.screen, state);
  }

  function navigate(screen) {
    state.screen = screen;
    render();
  }

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) handleAction(action, state, navigate, render);
  });

  root.addEventListener('submit', (event) => {
    if (!event.target.matches('form[data-form]')) return;
    event.preventDefault();
    handleFormSubmit(event.target, state, navigate);
  });

  render();
}
