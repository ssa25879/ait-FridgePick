import react from '@vitejs/plugin-react'
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { getReleaseBannerAdGroupId } from "./src/ads/bannerAdConfig.ts";

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const configDir = fileURLToPath(new URL("../local-config/ait-fridgepick", import.meta.url));
  const configuredId = mode === "release"
    ? loadEnv(mode, configDir, "FRIDGEPICK_").FRIDGEPICK_BANNER_AD_GROUP_ID
    : undefined;
  if (mode === "release") getReleaseBannerAdGroupId(configuredId);

  return {
    define: {
      "import.meta.env.FRIDGEPICK_BANNER_AD_GROUP_ID": JSON.stringify(configuredId ?? ""),
    },
    plugins: [aitDevtools.vite(), react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
