/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Whimsical AI consent modal feature flag
    NEXT_PUBLIC_AI_CONSENT_ENABLED: process.env.NEXT_PUBLIC_AI_CONSENT_ENABLED || 'false',
  },
};

module.exports = nextConfig;