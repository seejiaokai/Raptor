#!/usr/bin/env node
/* LEAN WORKING COPIES — his D2290, [HELPER-COPIES-NO-PICTURES] (22 Nov 26).
 *
 * A working copy made for a helper, a reviewer or a side chat leaves out the old walk pictures
 * (raptor-port/docs/img/handpass/, about 7.8 GB of the project's 8.6 GB), as GitHub's machines already do (D1091).
 * No picture is deleted: each stays in the main folder and on GitHub, and the copy shares the main folder's store, so
 * getting one walk's pictures back takes seconds and no download.
 *
 * How: a git sparse checkout that leaves out each picture folder the copy's commit HOLDS, by name — so a walk's NEW
 * folder is inside the copy from the start and its pictures save and commit with no extra step. Adding pictures to an
 * OLD walk's folder is refused by git, loudly, until that folder is fetched (`get`).
 *
 * Three ways in, because the copies are made three ways (tested 22 Nov 26):
 *   - the app's helpers (`isolation: "worktree"`): the SubagentStart hook, `hook` below, slims the helper's own copy
 *     before the helper begins — the app makes these copies without git's checkout hook, so only this catches them;
 *   - the app's chats in a copy of their own (the desktop's worktree sessions, `claude --worktree`): SessionStart;
 *   - any copy made by typing `git worktree add`, or by Codex: git's post-checkout hook, `git-hook` below, once
 *     `install` has put it in place on the PC.
 * The app's own clean-up of an unchanged helper's copy is untouched: the copy is still the app's.
 *
 * Commands (run from inside the copy):
 *   node raptor-port/scripts/lean-copy.mjs status          is this copy lean, and which picture folders it holds
 *   node raptor-port/scripts/lean-copy.mjs get <folder>…   fetch one walk's pictures (a folder name under handpass/)
 *   node raptor-port/scripts/lean-copy.mjs slim            leave the old pictures out of this copy (never the main folder)
 *   node raptor-port/scripts/lean-copy.mjs full            put every picture back in this copy
 *   node raptor-port/scripts/lean-copy.mjs install         put git's post-checkout hook in place (once per PC)
 *   node raptor-port/scripts/lean-copy.mjs uninstall       take it out again
 * RAPTOR_FULL_COPY=1 in the environment makes the hooks leave a new copy whole.
 * Every hook path fails open: whatever goes wrong, the copy is left as it was and the hook exits 0. */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs'
import { join, dirname, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PICS = process.env.LEAN_COPY_PICS || 'raptor-port/docs/img/handpass' // the override is for the tests only
export const NULL_REF = '0'.repeat(40)
const MARK = 'lean-copy (his D2290)'

/** git in `cwd`, with the variables git sets for its hooks taken out, so a child git finds the copy by its folder. */
export function git(cwd, args, input) {
  const env = { ...process.env }
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX', 'GIT_COMMON_DIR']) delete env[k]
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8', env, input, maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
  })
}

/** The copy holding `cwd`: its top folder, whether it is a linked copy (not the main folder), and the main folder. */
export function where(cwd) {
  const [top, gitDir, common] = git(cwd, ['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-dir', '--git-common-dir'])
    .trim().split(/\r?\n/).map((p) => resolve(p))
  return { top, linked: gitDir !== common, common, main: dirname(common) }
}

export function isLean(top) {
  try { return git(top, ['config', '--worktree', '--get', 'core.sparseCheckout']).trim() === 'true' } catch { return false }
}

/** A path written as a sparse-checkout pattern, its special characters taken literally. */
export function esc(p) {
  let s = p.replace(/[\\*?[\]]/g, (c) => `\\${c}`)
  if (/^[#!]/.test(s)) s = `\\${s}`
  return s.replace(/ +$/, (m) => m.replace(/ /g, '\\ '))
}

/** The patterns that keep everything but each picture folder and file the commit holds, or null when it holds none. */
export function patterns(top, rev = 'HEAD') {
  let out
  try { out = git(top, ['ls-tree', '-z', rev, '--', `${PICS}/`]) } catch { return null }
  const lines = ['/*']
  for (const entry of out.split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t')
    const type = entry.slice(0, tab).split(' ')[1]
    const path = entry.slice(tab + 1)
    lines.push(type === 'tree' ? `!/${esc(path)}/` : `!/${esc(path)}`)
  }
  return lines.length > 1 ? lines : null
}

/** Leave the old pictures out of the copy at `cwd`. Returns what happened, in one short line; never throws. */
export function slim(cwd) {
  try {
    if (process.env.RAPTOR_FULL_COPY === '1') return 'left whole: RAPTOR_FULL_COPY=1'
    const w = where(cwd)
    if (!w.linked) return 'left whole: this is the main folder, which keeps every picture'
    if (isLean(w.top)) return 'already lean'
    const pats = patterns(w.top)
    if (!pats) return 'left whole: its commit holds no walk pictures'
    // a copy already in use with picture work of its own is never touched (a new copy has none)
    if (git(w.top, ['status', '--porcelain', '-z', '--untracked-files=all', '--', PICS]).length)
      return 'left whole: it has picture changes of its own'
    git(w.top, ['sparse-checkout', 'set', '--no-cone', '--stdin'], `${pats.join('\n')}\n`)
    return 'slimmed'
  } catch (e) {
    return `left whole: ${String(e.message || e).split('\n')[0]}`
  }
}

/** The note a helper or chat is handed: how to reach an old picture. */
export function note(main) {
  return [
    `This working copy leaves out the old walk pictures (${PICS}/), his D2290; none is deleted.`,
    `To look at an old picture, open it in the main folder: ${join(main, PICS).replace(/\\/g, '/')}/<walk>/…`,
    `To work with one walk's pictures here, fetch only its folder: node raptor-port/scripts/lean-copy.mjs get <walk folder>`,
    `A new walk's pictures save and commit as usual in a new folder; adding to an OLD walk's folder needs that folder fetched first.`,
  ].join('\n')
}

/** The app's hook: SessionStart (a new chat) or SubagentStart (a helper). Prints the note when the copy is lean. */
export function onAppHook(input) {
  const cwd = input.cwd || process.cwd()
  const event = input.hook_event_name
  if (event === 'SubagentStart') {
    // only the helper's OWN copy, which the app names after the helper — never the copy of the chat that started it
    if (!input.agent_id) return null
    let top
    try { top = where(cwd).top } catch { return null }
    if (basename(top) !== `agent-${input.agent_id}`) return null
  } else if (event !== 'SessionStart') return null
  const result = slim(cwd)
  if (result !== 'slimmed' && result !== 'already lean') return null
  return { hookSpecificOutput: { hookEventName: event, additionalContext: note(where(cwd).main) } }
}

/** git's post-checkout hook: a NEW copy (git passes the null commit as the old one) is slimmed. */
export function onGitHook([prev, , flag], cwd = process.cwd()) {
  if (prev !== NULL_REF || flag !== '1') return null
  return slim(cwd)
}

/** Fetch picture folders into a lean copy. Each name is a folder under handpass/, or a whole path in the project. */
export function get(cwd, names) {
  const w = where(cwd)
  if (!isLean(w.top)) return 'This copy already holds every picture.'
  const lines = []
  for (const raw of names) {
    const rel = raw.replace(/\\/g, '/').replace(/\/+$/, '')
    const path = rel.startsWith(`${PICS}/`) ? rel : `${PICS}/${rel}`
    let type
    try { type = git(w.top, ['cat-file', '-t', `HEAD:${path}`]).trim() } catch {
      throw new Error(`no folder ${path} in this copy's commit — the names are the folders under ${PICS}/`)
    }
    lines.push(type === 'tree' ? `/${esc(path)}/` : `/${esc(path)}`)
  }
  git(w.top, ['sparse-checkout', 'add', '--stdin'], `${lines.join('\n')}\n`)
  return `Fetched: ${names.join(', ')}`
}

const HOOK = (script) => `#!/bin/sh
# ${MARK}: a new working copy leaves out the old walk pictures. Put here by
# \`node raptor-port/scripts/lean-copy.mjs install\`; \`… uninstall\` takes it out. It always exits 0.
S="$(git rev-parse --show-toplevel 2>/dev/null)/${script}"
[ -f "$S" ] && command -v node >/dev/null 2>&1 && node "$S" git-hook "$@" >/dev/null 2>&1
exit 0
`

export function install(cwd) {
  const w = where(cwd)
  const file = join(w.common, 'hooks', 'post-checkout')
  if (existsSync(file) && !readFileSync(file, 'utf8').includes(MARK))
    throw new Error(`${file} already holds another hook; not replaced`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, HOOK('raptor-port/scripts/lean-copy.mjs'), { mode: 0o755 })
  return `Installed: ${file}`
}

export function uninstall(cwd) {
  const file = join(where(cwd).common, 'hooks', 'post-checkout')
  if (!existsSync(file)) return 'Nothing to take out.'
  if (!readFileSync(file, 'utf8').includes(MARK)) throw new Error(`${file} is another hook; left in place`)
  unlinkSync(file)
  return `Taken out: ${file}`
}

export function status(cwd) {
  const w = where(cwd)
  if (!w.linked) return 'The main folder: it keeps every picture.'
  if (!isLean(w.top)) return 'This copy holds every picture.'
  const fetched = readFileSync(git(w.top, ['rev-parse', '--path-format=absolute', '--git-path', 'info/sparse-checkout']).trim(), 'utf8')
    .split(/\r?\n/).filter((l) => l.startsWith(`/${PICS}/`))
  return `This copy is lean.${fetched.length ? ` Fetched: ${fetched.join(' ')}` : ' No picture folder fetched.'}`
}

const readStdin = () => new Promise((ok) => {
  let s = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (d) => { s += d })
  process.stdin.on('end', () => ok(s))
  process.stdin.on('error', () => ok(s))
})

async function main([cmd, ...rest]) {
  if (cmd === 'hook') {
    try {
      const out = onAppHook(JSON.parse((await readStdin()) || '{}'))
      if (out) process.stdout.write(JSON.stringify(out))
    } catch (e) { process.stderr.write(`lean-copy: ${e.message}\n`) }
    return 0
  }
  if (cmd === 'git-hook') { onGitHook(rest); return 0 }
  const cwd = process.cwd()
  const run = { status: () => status(cwd), slim: () => slim(cwd), install: () => install(cwd), uninstall: () => uninstall(cwd),
    full: () => { git(where(cwd).top, ['sparse-checkout', 'disable']); return 'Every picture is back in this copy.' },
    get: () => { if (!rest.length) throw new Error('name at least one folder'); return get(cwd, rest) } }[cmd]
  if (!run) { process.stderr.write('usage: lean-copy.mjs status | get <folder>… | slim | full | install | uninstall\n'); return 2 }
  try { console.log(run()); return 0 } catch (e) { process.stderr.write(`lean-copy: ${e.message}\n`); return 1 }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main(process.argv.slice(2)).then((code) => { process.exitCode = code })
