import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    cache: {
      tasks: false,
    },
    tasks: {
      "release:version": {
        command: "pnpm version",
      },
      "release:build": {
        command: "vp pack",
      },
      "release:check": {
        command: "vp check && vp test --passWithNoTests && vp pack && npm pack --dry-run",
      },
      "release:publish": {
        command: "vp run release:check && pnpm publish",
      },
      release: {
        command: "vp run release:version patch && vp run release:publish",
      },
      "release:patch": {
        command: "vp run release:version patch && vp run release:publish",
      },
      "release:minor": {
        command: "vp run release:version minor && vp run release:publish",
      },
      "release:major": {
        command: "vp run release:version major && vp run release:publish",
      },
      "release:prepatch": {
        command: "vp run release:version prepatch && vp run release:publish",
      },
      "release:preminor": {
        command: "vp run release:version preminor && vp run release:publish",
      },
      "release:premajor": {
        command: "vp run release:version premajor && vp run release:publish",
      },
      "release:prerelease": {
        command: "vp run release:version prerelease && vp run release:publish",
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: {
      tsgo: true,
    },
    exports: true,
    platform: "neutral",
    target: false,
    minify: true,
    deps: {
      neverBundle: ["svelte", /^svelte\//],
      skipNodeModulesBundle: true,
    },
    report: { brotli: true },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
