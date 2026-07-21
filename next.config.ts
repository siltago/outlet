import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    // Next.js 16: só permite quality=75 por padrão; a galeria de produto usa
    // quality=90 para fotos maiores exibidas por inteiro (object-contain).
    qualities: [75, 90],
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
          // Stack local do Supabase (Docker) roda em http://127.0.0.1.
          {
            protocol: "http",
            hostname: "127.0.0.1",
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
