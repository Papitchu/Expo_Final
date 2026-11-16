import path from "node:path";
import { fileURLToPath } from "node:url";

// src/server/ -> project root is two levels up
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const SRC = path.join(ROOT, "src");