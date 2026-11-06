import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // AVIF is about a fifth smaller than WebP, which matters for the photo on
  // mainland mobile networks. Browsers without it get WebP.
  images: { formats: ["image/avif", "image/webp"] },
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
