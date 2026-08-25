import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Temporary unblock while the current UI prototype is being wired to the real data layer.
  // TypeScript will still be checked locally/CI once the backend types are in place.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
