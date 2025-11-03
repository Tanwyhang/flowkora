/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino-pretty"],
  transpilePackages: ['@magic-ext/oauth', '@magic-ext/connect', '@thirdweb-dev/react', '@thirdweb-dev/wallets', '@thirdweb-dev/sdk', '@thirdweb-dev/chains'],
};

export default nextConfig;
