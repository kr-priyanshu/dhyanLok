/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/projects/DhyanLok',
  // Next.js static export does not support Image optimization for external URLs by default,
  // but we aren't using next/image extensively with external sources.
  images: { unoptimized: true },
};

export default nextConfig;
