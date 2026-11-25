import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@homebet/proveedores"],
  allowedDevOrigins: ["*.localhost"],
  turbopack: {
    rules: {
      "*.css": {
        // CSS Modules must keep their filename so Turbopack exports the local class names.
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
