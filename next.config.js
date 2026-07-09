/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so Turbopack doesn't pick a parent-dir lockfile.
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
