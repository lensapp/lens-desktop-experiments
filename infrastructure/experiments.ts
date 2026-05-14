import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

export const KNOWN_CHANNELS = ["prod", "dev"] as const;
export type Channel = (typeof KNOWN_CHANNELS)[number];

export interface ExperimentEntry {
  name: string;
  dir: string;
  pkg: { experiment: { id: string; channels: Channel[]; [key: string]: unknown }; [key: string]: unknown };
  channels: Channel[];
}

export const experimentsRoot = path.resolve(__dirname, "..", "experiments");

export async function loadExperiments(): Promise<ExperimentEntry[]> {
  const packageJsonPaths = await glob("*/package.json", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  return packageJsonPaths.map((p) => {
    const fullPath = path.join(experimentsRoot, p);
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));

    if (!pkg.experiment) {
      throw new Error(`${p}: missing "experiment" block`);
    }

    const channels = pkg.experiment.channels;
    if (!Array.isArray(channels) || channels.length === 0) {
      throw new Error(
        `${p}: "experiment.channels" must be a non-empty array (allowed values: ${KNOWN_CHANNELS.join(", ")})`,
      );
    }
    for (const c of channels) {
      if (!KNOWN_CHANNELS.includes(c)) {
        throw new Error(`${p}: unknown channel "${c}". Allowed: ${KNOWN_CHANNELS.join(", ")}`);
      }
    }

    return {
      name: path.dirname(p),
      dir: path.dirname(fullPath),
      pkg,
      channels,
    };
  });
}

export function requireChannel(value: string | undefined, source = "CHANNEL"): Channel {
  if (!value) {
    throw new Error(`${source} must be set to one of: ${KNOWN_CHANNELS.join(", ")}`);
  }
  if (!KNOWN_CHANNELS.includes(value as Channel)) {
    throw new Error(`${source}="${value}" is not allowed. Allowed: ${KNOWN_CHANNELS.join(", ")}`);
  }
  return value as Channel;
}
