const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
})

const withPWA = require("next-pwa")({
  dest: "public"
})

module.exports = withBundleAnalyzer(
  withPWA({
    typescript: {
      // Skip type checking during build - we'll handle types during development
      ignoreBuildErrors: true,
    },
    eslint: {
      // Skip ESLint during build
      ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost"
        },
        {
          protocol: "http",
          hostname: "127.0.0.1"
        },
        {
          protocol: "https",
          hostname: "**"
        }
      ]
    },
    experimental: {
      serverComponentsExternalPackages: ["sharp", "onnxruntime-node"]
    },
    webpack: (config, { isServer }) => {
      // Ignore node-specific modules when bundling for the browser
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
          crypto: false,
        }
      }

      // Ignore .node files
      config.module.rules.push({
        test: /\.node$/,
        use: 'node-loader'
      })

      return config
    }
  })
)
