import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    PDFJS_DISABLE_WORKER: "true",
  },
  
};

export default nextConfig;
