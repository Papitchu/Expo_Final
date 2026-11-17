// Loads settings from .env in the project root when that file exists. Import this first.
// On Vercel there is no .env file: settings come from Project Settings → Environment Variables.
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

/** Throws a clear message when a required setting is missing. */
export function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env in the project root and fill it in ` +
      '(on Vercel: Project Settings → Environment Variables). See SETUP.md.',
    );
  }
  return process.env[name];
}
