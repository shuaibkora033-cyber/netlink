import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Checks whether a file exists under /public, server-side only (so proof
 * media — video, feedback screenshots — can gracefully fall back to a
 * placeholder instead of a broken <video>/<Image> when the asset hasn't
 * been added yet). `relativePath` is relative to the public/ directory,
 * e.g. "proof/netlink-proof-video.mp4".
 */
export function publicAssetExists(relativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", relativePath));
  } catch {
    return false;
  }
}
