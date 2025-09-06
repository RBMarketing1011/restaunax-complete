import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  experimental: {
    optimizePackageImports: [ '@mui/material', '@mui/icons-material' ],
  },
}

export default nextConfig
