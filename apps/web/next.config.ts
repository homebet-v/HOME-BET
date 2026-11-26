import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
    // Una página ya visitada se muestra al volver, sin la pantalla de carga.
    staleTimes: { dynamic: 1800 },
  },
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
