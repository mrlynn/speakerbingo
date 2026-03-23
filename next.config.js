/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Whimsical AI consent modal feature flag
    NEXT_PUBLIC_AI_CONSENT_ENABLED: process.env.NEXT_PUBLIC_AI_CONSENT_ENABLED || 'false',
    // Block all access when login/auth is broken
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE || 'false',
  },
};

module.exports = nextConfig;