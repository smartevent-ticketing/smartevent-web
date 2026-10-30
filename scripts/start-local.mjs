import { spawnSync } from "node:child_process"

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { ...process.env, SMARTEVENT_LOCAL_BUILD: "1" },
  },
)
if (result.error) throw result.error
process.exit(result.status ?? 1)
