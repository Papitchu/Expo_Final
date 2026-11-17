import { createInitialState } from './app/state.js';
import { handleAction, handleFormSubmit } from './app/actions.js';
import { refreshSpaces } from './app/data.js';
import { renderScreen } from './app/screens.js';

/** Connects app state, screen rendering, and user events. */
export function createApp(root) {
  const state = createInitialState();
  let busy = false;

  function render() {
    root.innerHTML = renderScreen(state.screen, state);
  }

  function navigate(screen) {
    state.screen = screen;
    render();
  }

  // Runs one async handler at a time and shows any error to the user.
  async function run(task) {
    if (busy) return;
    busy = true;
    state.error = '';
    try {
      await task();
    } catch (error) {
      console.error(error);
      state.error = error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      render();
    } finally {
      busy = false;
    }
  }

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) run(() => handleAction(action, state, navigate, render));
  });

  root.addEventListener('submit', (event) => {
    if (!event.target.matches('form[data-form]')) return;
    event.preventDefault();
    run(() => handleFormSubmit(event.target, state, navigate, render));
  });

  render();
  refreshSpaces(state).catch((error) => {
    console.error(error);
    state.error = 'โหลดข้อมูลพื้นที่ไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ';
    render();
  });
}
