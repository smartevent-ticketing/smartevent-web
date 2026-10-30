import { spawnSync } from "node:child_process"

// Production Docker/CI still uses the default standalone build.
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build", "--webpack"],
  {
    stdio: "inherit",
    env: { ...process.env, SMARTEVENT_LOCAL_BUILD: "1" },
  },
)
if (result.error) throw result.error
process.exit(result.status ?? 1)
