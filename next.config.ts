import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return []

    return {
      beforeFiles: [
        {
          source: "/_dev/crew-preview",
          destination: "/dashboard?crewPreview=1",
        },
      ],
    }
  },
}

export default nextConfig
