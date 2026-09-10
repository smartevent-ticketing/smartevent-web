import { readFileSync, statSync } from "node:fs"
import { registerHooks } from "node:module"
import { extname } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const sourceRoot = new URL("../src/", import.meta.url)

function resolveSource(url) {
  const candidates = extname(url.pathname)
    ? [url]
    : [".ts", ".tsx", "/index.ts", "/index.tsx"].map((suffix) => new URL(url.href + suffix))
  return candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile()
    } catch {
      return false
    }
  })
}

// Use the application's aliases and JSX transform without bundling or replacing
// production dependencies. Type errors are checked separately by `typecheck`.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith("@/")
      ? new URL(specifier.slice(2), sourceRoot)
      : specifier.startsWith(".") && context.parentURL?.startsWith(sourceRoot.href)
        ? new URL(specifier, context.parentURL)
        : undefined
    const resolved = target && resolveSource(target)
    if (resolved) return { url: resolved.href, shortCircuit: true }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (!url.startsWith(sourceRoot.href) || !/\.tsx?$/.test(new URL(url).pathname)) {
      return nextLoad(url, context)
    }
    const { outputText } = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
      fileName: fileURLToPath(url),
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        inlineSourceMap: true,
        inlineSources: true,
      },
    })
    return { format: "module", source: outputText, shortCircuit: true }
  },
})
