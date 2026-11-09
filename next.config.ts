import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static: no server routes, no server rendering at request time.
  // Case data lives in the URL hash and renter input stays in React state.
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
