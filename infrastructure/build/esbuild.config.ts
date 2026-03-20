import { build, type BuildOptions } from "esbuild";
import { globImportPlugin } from "./glob-import-plugin";
import path from "node:path";
import module from "node:module";

const nodeBuiltins = module.builtinModules.flatMap((m) => [m, `node:${m}`]);

const external = [
  ...nodeBuiltins,
  "@lensapp/*",
  "mobx",
  "zod",
  "electron",
  "react",
  "react-dom",
];

export interface BuildExperimentOptions {
  experimentDir: string;
}

export async function buildExperiment({ experimentDir }: BuildExperimentOptions) {
  const sharedOptions: BuildOptions = {
    bundle: true,
    format: "cjs",
    platform: "node",
    sourcemap: true,
    minify: false,
    keepNames: true,
    logLevel: "info",
    plugins: [globImportPlugin()],
    external,
  };

  const mainEntry = path.join(experimentDir, "main-entry.ts");
  const rendererEntry = path.join(experimentDir, "renderer-entry.ts");
  const combinedEntry = path.join(experimentDir, "index.ts");

  await Promise.all([
    build({
      ...sharedOptions,
      entryPoints: [mainEntry],
      outfile: path.join(experimentDir, "dist", "main.js"),
    }),
    build({
      ...sharedOptions,
      entryPoints: [rendererEntry],
      outfile: path.join(experimentDir, "dist", "renderer.js"),
    }),
    build({
      ...sharedOptions,
      entryPoints: [combinedEntry],
      outfile: path.join(experimentDir, "dist", "index.js"),
    }),
  ]);
}

export async function watchExperiment({ experimentDir }: BuildExperimentOptions) {
  const sharedOptions: BuildOptions = {
    bundle: true,
    format: "cjs",
    platform: "node",
    sourcemap: true,
    minify: false,
    keepNames: true,
    logLevel: "info",
    plugins: [globImportPlugin()],
    external,
  };

  const combinedEntry = path.join(experimentDir, "index.ts");

  const ctx = await require("esbuild").context({
    ...sharedOptions,
    entryPoints: [combinedEntry],
    outfile: path.join(experimentDir, "dist", "index.js"),
  });

  await ctx.watch();
  console.log(`Watching ${path.basename(experimentDir)} for changes...`);

  return ctx;
}
