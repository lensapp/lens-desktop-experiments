import type { Plugin } from "esbuild";
import glob from "fast-glob";
import { randomUUID } from "node:crypto";
import { resolve as resolvePath } from "node:path";

export const globImportPlugin = (): Plugin => ({
  name: "glob-import-plugin",

  setup: (build) => {
    const uniquenessCache = new Map<string, string>();

    build.onResolve({ filter: /\*/ }, async (args) => {
      const { resolveDir, path } = args;

      if (resolveDir === "") {
        return; // Ignore unresolvable paths
      }

      const cacheKey = resolvePath(resolveDir, path);
      const uniqueId = getOrInsertWith(uniquenessCache, cacheKey, getRandomUniqueId);

      return {
        path: `${path}/proof-of-uniqueness/${uniqueId}`,
        namespace: "import-glob",
        pluginData: { resolveDir },
      };
    });

    build.onLoad({ filter: /.*/, namespace: "import-glob" }, async (args) => {
      const {
        path,
        pluginData: { resolveDir },
      } = args;
      const [globImportString] = path.split("/proof-of-uniqueness/");
      const files = (await glob(globImportString, { cwd: resolveDir })).sort();

      const contents = [
        files.map((module, index) => `import * as module${index} from './${module}'`).join(";"),
        "",
        `const modules = [${files.map((_, index) => `module${index}`).join(",")}];`,
        "",
        "export default modules;",
        `export const filenames = [${files.map((module) => `'${module}'`).join(",")}]`,
        "",
      ].join("\n");

      return { contents, resolveDir };
    });
  },
});

const getRandomUniqueId = () => randomUUID();
const getOrInsertWith = <K, V>(map: Map<K, V>, key: K, builder: () => V) => {
  if (map.has(key)) {
    return map.get(key) as V;
  }

  const value = builder();

  map.set(key, value);

  return value;
};
