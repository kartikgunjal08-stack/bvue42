/** @type {import('next').NextConfig} */
const nextConfig = {
  // This allows the dev server to accept connections from your local network
  devIndicators: {
    appIsrStatus: false,
  },
  // Ensure your host is trusted
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;