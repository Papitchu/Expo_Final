// Vercel entry point: every /api/* request is rewritten here (see vercel.json) and handled
// by the Express app. The React app in public/ is served by Vercel's CDN, not by this function.
export { default } from '../src/index.js';
