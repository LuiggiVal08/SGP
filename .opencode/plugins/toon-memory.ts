import * as fs from "fs"

export const ToonMemory = async ({ $, directory, worktree }) => {
  const root = worktree || directory
  const INS = root + "/.opencode/instructions"
  const OUT = INS + "/memory-autoload.md"
  const dump = async () => {
    return await $`npx -y toon-memory dump`.cwd(root).text()
  }
  const write = (text) => {
    fs.mkdirSync(INS, { recursive: true })
    fs.writeFileSync(OUT, text)
  }
  return {
    "session.created": async () => {
      try {
        const out = await dump()
        write(out)
      } catch {}
    },
    "experimental.session.compacting": async ({ output }) => {
      try {
        const out = await dump()
        if (Array.isArray(output?.context)) output.context.push(out)
      } catch {}
    },
    "tool.execute.after": async (input) => {
      if (!process.env.TOON_MEMORY_CAPTURE) return
      const cap = directory + "/bin/cli/capture.js"
      try {
        const payload = JSON.stringify({
          session_id: input?.session?.id ?? "",
          tool_name: input?.tool ?? "",
          tool_input: input?.args ?? {},
        })
        await $`node ${cap} opencode`.stdin(payload).quiet()
      } catch {}
    },
  }
}
