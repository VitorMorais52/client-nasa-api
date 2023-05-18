/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apod.nasa.gov",
        port: "",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
