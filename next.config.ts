import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  // eslint and typescript ignore options are now part of the experimental or standard config depending on version, 
  // but let's stick to the ones that don't cause diagnostic errors.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
