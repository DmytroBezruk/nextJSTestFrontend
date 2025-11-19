import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const isDev = process.env.NODE_ENV !== "production";

const remotePatterns: RemotePattern[] = [];

if (!isDev && apiUrl) {
  try {
    const u = new URL(apiUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      port: u.port || undefined,
      pathname: "/**",
    });
  } catch {}
}

const nextConfig: NextConfig = {
  images: isDev
    ? { unoptimized: true }
    : { remotePatterns },
};

export default nextConfig;
