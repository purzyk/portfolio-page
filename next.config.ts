import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  // No Node server on a static host, so Next's built-in image optimization
  // (which runs at request time) isn't available. Images are pre-sized
  // screenshots served as-is instead.
  images: { unoptimized: true },
  // /about/index.html instead of /about.html — plain web servers serve a
  // directory's index.html automatically, with no rewrite rules needed.
  // Flat .html files would need server config most static hosts don't have.
  trailingSlash: true,
}

export default nextConfig
