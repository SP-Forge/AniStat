import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://127.0.0.1:3333/api/:path*",
            },
        ];
    },
};

export default nextConfig;
