#!/usr/bin/env node
/* LEAN WORKING COPIES — his D2290 and D2292, [HELPER-COPIES-NO-PICTURES] (22 Nov 26).
 *
 * A NEW working copy made for a helper, a reviewer or a chat leaves out the old walk PICTURES (the picture files under
 * raptor-port/docs/img/handpass/, about 8 GB of the project's 8.6 GB), as GitHub's machines already do (D1091). Every
 * other file there — results, notes, scripts, and the drawing check's records whole — stays. No picture is deleted:
 * each stays in the main folder and on GitHub, and the copy shares the main folder's store, so `get` brings one walk's
 * back in seconds with no download. The main folder is never touched.
 *
 * How: a git sparse checkout that leaves out the picture files of each walk folder the copy's commit HOLDS, by name —
 * so a new walk's folder is inside the copy and its pictures commit with no step. A picture written INTO an old walk's
 * folder is not: a new one is refused by `git add` aloud, but one written over a picture the commit holds is skipped
 * by `git add -A` without a word (found by the three reads, 22 Nov 26). The commit guard (`pre-commit`, put in place
 * by `install`) stops that commit and names the fetch to run; it also stops a commit when it cannot check. No copy is
 * slimmed until the guard is in place on the PC.
 *
 * The ways in, because copies are made three ways (tested 22 Nov 26):
 *   - the app's helpers (`isolation: "worktree"`): its SubagentStart hook, `hook` below, on the helper's own copy (named
 *     agent-<its id>) — the app makes these copies without git's checkout hook, so only this catches them;
 *   - a chat started in a copy of its own (the desktop's worktree chats, `claude --worktree`): SessionStart;
 *   - a copy made by typing `git worktree add`, or Codex's: git's post-checkout hook, once `install` has run on the PC.
 * The app's own hooks act only on a copy made in the last 15 minutes and never on one set whole (`full`,
 * RAPTOR_FULL_COPY=1): a chat started in a copy another chat is using, or reused, leaves it as it is. The app's own
 * clean-up of an unchanged helper's copy is untouched: the copy is still the app's.
 *
 * Commands (run from inside the copy):
 *   node raptor-port/scripts/lean-copy.mjs status          lean or whole, which folders are fetched, git busy
 *   node raptor-port/scripts/lean-copy.mjs get <folder>…   fetch one walk's pictures (a folder under handpass/)
 *   node raptor-port/scripts/lean-copy.mjs slim            leave the old pictures out of this copy (never the main folder)
 *   node raptor-port/scripts/lean-copy.mjs full            put every picture back, and keep this copy whole
 *   node raptor-port/scripts/lean-copy.mjs install         git's two hooks in place, once per PC (from the main folder)
 *   node raptor-port/scripts/lean-copy.mjs uninstall       take them out again
 * Every hook path but the commit guard fails open: whatever goes wrong, it says so and exits 0. */
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, statSync, openSync, closeSync } from 'node:fs'
import { join, dirname, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PICS = process.env.LEAN_COPY_PICS || 'raptor-port/docs/img/handpass' // the override is for the tests only
export const MEDIA = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm']
const KEEP = ['drawcheck-records', 'drawcheck'] // the drawing check reads its records and their pictures from these
export const NULL_REF = '0'.repeat(40)
export const NEW_MS = 15 * 60 * 1000
// A hook's whole run, start to note, keeps inside this: the app cancels a hook at 300 s and throws its output away
const BUDGET_MS = () => Number(process.env.LEAN_COPY_BUDGET_MS) || 230_000
const RESERVE_MS = 15_000 // kept back at the end for the note
const MARK = 'lean-copy (his D2290)'
const SCRIPT = 'raptor-port/scripts/lean-copy.mjs'
let DEADLINE = Infinity // set by a hook at its start; a command typed by hand has none, and its long steps may take minutes
const left = () => DEADLINE - Date.now()

const cleanEnv = () => {
  // the variables git sets for its hooks are taken out, so a child git finds the copy by its folder
  const env = { ...process.env }
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX', 'GIT_COMMON_DIR']) delete env[k]
  return env
}
/** A git call in `cwd`. Inside a hook it is bounded by what is left of the hook's time (a minute at most); typed by
 *  hand it is not, since `full` and `get` on a real copy run past a minute (the fix-round read: a 60 s cap left a lock). */
export function git(cwd, args, input) {
  const timeout = Number.isFinite(DEADLINE) ? Math.max(1_000, Math.min(60_000, left() - RESERVE_MS)) : undefined
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8', env: cleanEnv(), input, timeout, maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
  })
}

/** The copy holding `cwd`: its top folder, its own git folder, whether it is a linked copy, and the main folder. */
export function where(cwd) {
  const [top, gitDir, common] = git(cwd, ['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-dir', '--git-common-dir'])
    .trim().split(/\r?\n/).map((p) => resolve(p))
  return { top, gitDir, linked: gitDir !== common, common, main: dirname(common) }
}

/** A copy's own setting: its value, '' when it is not set (git's exit 1) — and an error when it cannot be read, so the
 *  commit guard never takes "could not read" for "not lean" (Astra, the fix round). */
function cfgStrict(top, key) {
  try { return git(top, ['config', '--worktree', '--get', key]).trim() } catch (e) {
    if (e.status === 1) return ''
    throw e
  }
}
const cfg = (top, key) => { try { return cfgStrict(top, key) } catch { return '' } }
export const isLean = (top) => cfg(top, 'core.sparseCheckout') === 'true'
/** Mark a copy whole, so the hooks leave it so. Git's per-copy settings are switched on FIRST: with them off, git
 *  writes a "per-copy" setting into the shared settings, and every copy would then be kept whole (Astra, the fix round). */
function setWhole(top) {
  try {
    git(top, ['config', 'extensions.worktreeConfig', 'true'])
    git(top, ['config', '--worktree', 'raptor.leanCopy', 'whole'])
    return true
  } catch { return false }
}
const isWhole = (top) => cfg(top, 'raptor.leanCopy') === 'whole'
/** The commit guard, put in place by `install` — no copy is slimmed without it, since without it a picture re-written
 *  into an old walk's folder leaves a commit unseen (the fix-round read: helpers were told of a guard not yet there). */
export function guarded(w) {
  const f = join(w.common, 'hooks', 'pre-commit')
  try { return readFileSync(f, 'utf8').includes(MARK) } catch { return false }
}
/** A repo that holds no walk pictures at all — an exported read-copy, or a commit before them. */
function noPictures(top) {
  // by .png only: the export recipe leaves some other kinds in (27 .webp in one real walk folder — the third read)
  try { return !git(top, ['ls-tree', '-r', '-z', '--name-only', 'HEAD', '--', `${PICS}/`]).split('\0').some((f) => f.toLowerCase().endsWith('.png')) } catch { return true }
}
/** A copy git made in the last 15 minutes: its `commondir` file is written when the copy is made, and never after. */
export function isNew(gitDir, now = Date.now()) {
  try { return now - statSync(join(gitDir, 'commondir')).mtimeMs < NEW_MS } catch { return false }
}
const busy = (gitDir) => existsSync(join(gitDir, 'index.lock'))

/** A path written as a sparse-checkout pattern, its special characters taken literally. */
export function esc(p) {
  let s = p.replace(/[\\*?[\]]/g, (c) => `\\${c}`)
  if (/^[#!]/.test(s)) s = `\\${s}`
  return s.replace(/ +$/, (m) => m.replace(/ /g, '\\ '))
}
const isMedia = (p) => MEDIA.some((x) => p.toLowerCase().endsWith(`.${x}`))

/** The patterns: everything, but the pictures of each walk folder and loose picture the commit holds; the drawing
 *  check's record folders back in. Null when the commit holds no pictures folder. */
export function patterns(top, rev = 'HEAD') {
  let out
  try { out = git(top, ['ls-tree', '-z', rev, '--', `${PICS}/`]) } catch { return null }
  const lines = ['/*']
  for (const entry of out.split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t')
    const type = entry.slice(0, tab).split(' ')[1]
    const path = entry.slice(tab + 1)
    if (type === 'tree') for (const x of MEDIA) lines.push(`!/${esc(path)}/**/*.${x}`)
    else if (isMedia(path)) lines.push(`!/${esc(path)}`)
  }
  if (lines.length === 1) return null
  // a pattern bringing files back names the files (`/**`): one naming only their folder loses to the picture
  // patterns above, which name files (found by the tests, 22 Nov 26)
  for (const k of KEEP) lines.push(`/${esc(PICS)}/**/${k}/**`)
  return lines
}

/** The folders a copy has fetched back (`get`), read from its sparse-checkout file. */
function sparseFile(top) { return git(top, ['rev-parse', '--path-format=absolute', '--git-path', 'info/sparse-checkout']).trim() }
function fetched(top) {
  try { return readFileSync(sparseFile(top), 'utf8').split(/\r?\n/).filter((l) => l.startsWith(`/${PICS}/`) && !l.includes('/**/')) } catch { return [] }
}

/** Run the long step — git laying down the new set, which removes thousands of files — as a child the hook does not own,
 *  waiting up to the budget. If it is still going, it is left to finish on its own and the caller is told so. */
function setSparse(w, lines) {
  const pat = join(w.gitDir, 'lean-copy-patterns.txt')
  writeFileSync(pat, `${lines.join('\n')}\n`)
  const log = join(w.gitDir, 'lean-copy.log')
  const once = () => new Promise((ok) => {
    const inFd = openSync(pat, 'r'), logFd = openSync(log, 'w')
    const child = spawn('git', ['-C', w.top, 'sparse-checkout', 'set', '--no-cone', '--stdin'],
      { env: cleanEnv(), detached: true, windowsHide: true, stdio: [inFd, 'ignore', logFd] })
    closeSync(inFd); closeSync(logFd)
    // waited on only for what is left of the hook's one deadline (a command typed by hand waits to the end)
    const wait = Number.isFinite(DEADLINE) ? Math.max(0, left() - RESERVE_MS) : 2 ** 31 - 1
    const timer = setTimeout(() => { child.unref(); ok('running') }, wait)
    child.on('exit', (code) => { clearTimeout(timer); ok(code === 0 ? 'done' : 'failed') })
    child.on('error', () => { clearTimeout(timer); ok('failed') })
  })
  return once().then(async (r) => {
    // two copies made at the same moment can trip over one shared settings file: wait a moment and try once more,
    // only if the deadline leaves room for it
    if (r === 'failed' && /lock/i.test(readFileSync(log, 'utf8')) && left() > RESERVE_MS + 30_000) {
      await new Promise((ok) => setTimeout(ok, 1500)); return once()
    }
    return r
  })
}

/** Leave the old pictures out of the copy at `cwd`. `auto` is the hooks' way: only a new copy, never one set whole.
 *  Resolves to one short line saying what happened; never throws. */
export async function slim(cwd, { auto = false } = {}) {
  let w
  try { w = where(cwd) } catch (e) { return `left whole: ${String(e.message || e).split('\n')[0]}` }
  try {
    if (!w.linked) return noPictures(w.top) ? 'left whole: this copy holds no walk pictures at all (an exported read-copy?)'
      : 'left whole: this is the main folder, which keeps every picture'
    if (process.env.RAPTOR_FULL_COPY === '1') {
      return setWhole(w.top) ? 'left whole: RAPTOR_FULL_COPY=1' : 'left whole: RAPTOR_FULL_COPY=1 (the mark to keep it whole could not be saved)'
    }
    // busy first: a slim still running, or one stopped part-way, sets "lean" before it ends (the fix-round reads)
    if (busy(w.gitDir)) return isLean(w.top) ? `still slimming, or stopped part-way: ${join(w.gitDir, 'index.lock')} exists` : 'left whole: git is busy in it (index.lock)'
    if (auto && isWhole(w.top)) return 'left whole: this copy was set whole (lean-copy.mjs full)'
    if (auto && isLean(w.top)) return 'already lean'
    if (auto && !isNew(w.gitDir)) return 'left whole: not a new copy (lean-copy.mjs slim does it by hand)'
    if (!guarded(w)) return `left whole: the commit guard is not in place on this PC — run node ${SCRIPT} install in the main folder`
    const pats = patterns(w.top)
    if (!pats) return 'left whole: its commit holds no walk pictures'
    // a copy with picture work of its own is never touched (a new copy has none)
    if (git(w.top, ['status', '--porcelain', '-z', '--untracked-files=all', '--', PICS]).length)
      return 'left whole: it has picture changes of its own'
    const keep = isLean(w.top) ? fetched(w.top) : [] // slim by hand again keeps what was fetched
    if (!auto) { try { git(w.top, ['config', '--worktree', '--unset', 'raptor.leanCopy']) } catch { /* not set */ } }
    const r = await setSparse(w, [...pats, ...keep])
    if (r === 'done') return 'slimmed'
    if (r === 'running') return 'still slimming: git is still removing the old pictures — wait until it ends (lean-copy.mjs status)'
    return `may be half-done: git stopped part-way (${join(w.gitDir, 'lean-copy.log')}) — lean-copy.mjs full puts everything back`
  } catch (e) {
    return `left whole: ${String(e.message || e).split('\n')[0]}`
  }
}

/** The note a helper or chat is handed: how to reach an old picture. */
export function note(main, result = 'slimmed') {
  const lines = [
    `This working copy leaves out the old walk pictures (${PICS}/), his D2290 and D2292; none is deleted, and every other file there stays.`,
    `To work with one walk's pictures here, fetch its folder, from the project's top folder: node ${SCRIPT} get <walk folder> (seconds, no download).`,
    `To only look at one, open it in the main folder (${join(main, PICS).replace(/\\/g, '/')}/) — that is the main folder's own version; for a walk of this branch's own, fetch it.`,
    `A new walk's pictures save and commit as usual in a NEW folder. Writing into an OLD walk's folder (a re-walk, a re-drawn picture): fetch that folder first — git skips a re-written picture there without a word, and the commit guard then stops the commit.`,
  ]
  if (result.startsWith('still slimming')) lines.unshift(`It is still being slimmed, or a slim stopped part-way: wait until \`node ${SCRIPT} status\` says lean before using git here; if it says git is busy and no git is running, run \`node ${SCRIPT} full\`.`)
  if (result.startsWith('may be half-done')) lines.unshift(`Slimming this copy stopped part-way (${result.slice(17)}): run \`node ${SCRIPT} full\` before using git here.`)
  return lines.join('\n')
}

/** The app's hook: SessionStart (a new chat) or SubagentStart (a helper). Hands over the note when the copy is lean. */
export async function onAppHook(input) {
  DEADLINE = Date.now() + BUDGET_MS() // one deadline for the whole hook, every step within it (Astra, the fix round)
  try { return await appHook(input) } finally { DEADLINE = Infinity }
}
async function appHook(input) {
  const cwd = input.cwd || process.cwd()
  const event = input.hook_event_name
  let w
  try { w = where(cwd) } catch { return null }
  if (event === 'SubagentStart') {
    // only the helper's OWN copy, which the app names after the helper — never the copy of the chat that started it
    if (!input.agent_id || basename(w.top) !== `agent-${input.agent_id}`) return null
  } else if (event !== 'SessionStart') return null
  const result = await slim(cwd, { auto: true })
  if (!['slimmed', 'already lean'].includes(result) && !/^(still slimming|may be half-done)/.test(result)) return null
  return { hookSpecificOutput: { hookEventName: event, additionalContext: note(w.main, result) } }
}

/** git's post-checkout hook: a NEW copy (git passes the null commit as the old one) is slimmed, and told so. */
export async function onGitHook([prev, , flag], cwd = process.cwd()) {
  if (prev !== NULL_REF || flag !== '1') return null
  const result = await slim(cwd)
  if (result === 'slimmed' || /^(still slimming|may be half-done)/.test(result)) process.stderr.write(`${note(where(cwd).main, result)}\n`)
  return result
}

/** The tracked pictures of a lean copy that sit in a left-out place yet are written on disk — what `git add -A` skips
 *  without a word (a re-written one) or refuses (a new one). Throws when it cannot tell, so the guard stops. */
export function stranded(top) {
  if (cfgStrict(top, 'core.sparseCheckout') !== 'true') return []
  const unesc = (p) => p.replace(/\\(.)/g, '$1')
  const pats = readFileSync(sparseFile(top), 'utf8').split(/\r?\n/)
  const outFolders = pats.map((l) => /^!\/(.+)\/\*\*\/\*\.[a-z0-9]+$/.exec(l)?.[1]).filter(Boolean).map(unesc)
  // a loose picture straight under the pictures folder is left out by its own name (both fix-round reads)
  const outFiles = new Set(pats.filter((l) => l.startsWith('!/') && !l.includes('/**/')).map((l) => unesc(l.slice(2))))
  const back = fetched(top).map((l) => unesc(l.slice(1).replace(/\/\*\*$/, '/')))
  const leftOut = (f) => isMedia(f) && (outFiles.has(f) || outFolders.some((d) => f.startsWith(`${d}/`))) &&
    !back.some((b) => f.startsWith(b.endsWith('/') ? b : `${b}/`) || f === b) && !KEEP.some((k) => f.includes(`/${k}/`))
  const changed = git(top, ['diff', '--name-only', '-z', '--', PICS]).split('\0')
  const added = git(top, ['ls-files', '-z', '--others', '--exclude-standard', '--', PICS]).split('\0')
  return [...changed, ...added].filter(Boolean).filter(leftOut)
}

/** git's pre-commit hook: a lean copy's commit stops while pictures sit unadded in a left-out place; their folders are
 *  fetched, so adding again takes them. Exit 1 stops the commit; a whole copy and the main folder pass at once. */
export function onPreCommit(cwd = process.cwd()) {
  let top
  try { top = where(cwd).top } catch { return 0 }
  if (process.env.LEAN_COPY_GUARD === 'off') return 0
  let files
  try { files = stranded(top) } catch (e) {
    // a guard that cannot look never waves a commit through (Astra, the fix round)
    process.stderr.write(`lean-copy: commit stopped — the commit guard could not check this copy's pictures (${String(e.message || e).split('\n')[0]}). Commit again; if it keeps failing, run node ${SCRIPT} status from the project's top folder (a slim stopped part-way is put right by node ${SCRIPT} full), and to commit without the check set LEAN_COPY_GUARD=off for that one commit.\n`)
    return 1
  }
  if (!files.length) return 0
  // the folders cannot be fetched from here: git holds the copy's lock for the commit under way (found by the tests)
  const folders = [...new Set(files.map((f) => f.slice(PICS.length + 1).split('/')[0]))]
  process.stderr.write([
    `lean-copy: commit stopped — ${files.length} picture(s) written into an old walk's folder this copy leaves out, which git would leave behind:`,
    ...files.slice(0, 8).map((f) => `  ${f}`), ...(files.length > 8 ? [`  … and ${files.length - 8} more`] : []),
    `To keep them, from the project's top folder: node ${SCRIPT} get ${folders.join(' ')}   then: git add -- ':/${PICS}'   and commit again (fetching keeps the new pictures).`,
    `If they were not meant to change (a test re-draws them): fetch the same way, then git restore -- <the files>, and commit again.`,
  ].join('\n') + '\n')
  return 1
}

/** Fetch picture folders into a lean copy. Each name is a folder under handpass/, or a whole path in the project. */
export function get(cwd, names) {
  const w = where(cwd)
  const EXPORTED = 'an exported read-copy is made without pictures: open them in the main folder only if it is on the version under review, or ask the host to export that folder from the reviewed commit (git archive <commit> -- <folder>)'
  if (!w.linked && noPictures(w.top)) throw new Error(`this copy holds no walk pictures at all — ${EXPORTED}`)
  const lines = []
  for (const raw of names) {
    // a folder name, or a path written from the project's top, from raptor-port/, whole, or with ./ (the fix-round read)
    let rel = raw.replace(/\\/g, '/').replace(/\/+$/, '').replace(/^(\.\/)+/, '')
    const tail = `${PICS.split('/').pop()}/`
    if (rel.includes(`${PICS}/`)) rel = rel.slice(rel.indexOf(`${PICS}/`))
    else if (rel.includes(tail)) rel = `${PICS}/${rel.slice(rel.lastIndexOf(tail) + tail.length)}`
    const path = rel.startsWith(`${PICS}/`) ? rel : `${PICS}/${rel}`
    let type
    try { type = git(w.top, ['cat-file', '-t', `HEAD:${path}`]).trim() } catch {
      throw new Error(`no folder ${path} in this copy's commit — the names are the folders under ${PICS}/` +
        (w.linked ? '' : `; if this is an exported read-copy: ${EXPORTED}`))
    }
    lines.push(type === 'tree' ? `/${esc(path)}/**` : `/${esc(path)}`)
    if (!isLean(w.top) && !git(w.top, ['ls-tree', '-r', '-z', '--name-only', 'HEAD', '--', path]).split('\0').some(isMedia))
      throw new Error(`${path} holds no pictures in this copy's commit — ${EXPORTED}`)
  }
  if (!isLean(w.top)) return 'This copy already holds every picture.'
  git(w.top, ['sparse-checkout', 'add', '--stdin'], `${lines.join('\n')}\n`)
  return `Fetched: ${names.join(', ')}`
}

export function full(cwd) {
  const w = where(cwd)
  if (!w.linked) throw new Error(noPictures(w.top) ? 'this copy holds no walk pictures at all (an exported read-copy?) — nothing to put back' : 'this is the main folder, which already keeps every picture')
  const kept = setWhole(w.top)
  if (isLean(w.top)) git(w.top, ['sparse-checkout', 'disable'])
  return `Every picture is back in this copy${kept ? ', and the hooks leave it whole from now on' : ' (the mark keeping it whole could not be saved: a hook may slim it again)'}.`
}

const POST = `#!/bin/sh
# ${MARK}: a new working copy leaves out the old walk pictures. Put here by
# \`node ${SCRIPT} install\`; \`… uninstall\` takes it out. It always exits 0; its note goes to the screen.
S="$(git rev-parse --show-toplevel 2>/dev/null)/${SCRIPT}"
[ -f "$S" ] || S="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)/hooks/lean-copy.mjs"
[ -f "$S" ] && command -v node >/dev/null 2>&1 && node "$S" git-hook "$@" >/dev/null
exit 0
`
const PRE = `#!/bin/sh
# ${MARK}: in a lean copy, stops a commit that would leave behind pictures written into an old walk's folder.
# Put here by \`node ${SCRIPT} install\`. A whole copy and the main folder pass at once. A copy on a branch without
# the script uses the one kept beside this hook; a lean copy with no script or no node at all is stopped, never waved on.
S="$(git rev-parse --show-toplevel 2>/dev/null)/${SCRIPT}"
[ -f "$S" ] || S="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)/hooks/lean-copy.mjs"
if [ -f "$S" ] && command -v node >/dev/null 2>&1; then node "$S" pre-commit; exit $?; fi
if [ "$(git config --worktree --get core.sparseCheckout 2>/dev/null)" = "true" ]; then
  echo "lean-copy: commit stopped — this lean copy's commit guard cannot run (no script or no node). Set LEAN_COPY_GUARD=off for one commit only if no picture of an old walk changed." >&2
  [ "$LEAN_COPY_GUARD" = "off" ] && exit 0
  exit 1
fi
exit 0
`
const HOOKS = { 'post-checkout': POST, 'pre-commit': PRE }

export function install(cwd) {
  const w = where(cwd)
  const files = Object.keys(HOOKS).map((h) => join(w.common, 'hooks', h))
  for (const f of files) if (existsSync(f) && !readFileSync(f, 'utf8').includes(MARK)) throw new Error(`${f} already holds another hook; nothing replaced`)
  mkdirSync(join(w.common, 'hooks'), { recursive: true })
  for (const [h, text] of Object.entries(HOOKS)) writeFileSync(join(w.common, 'hooks', h), text, { mode: 0o755 })
  // a copy of this script beside the hooks, for a copy switched to a branch cut before it existed (the third read)
  writeFileSync(join(w.common, 'hooks', 'lean-copy.mjs'), readFileSync(fileURLToPath(import.meta.url), 'utf8'))
  // set once here, so copies made together never race to set it in the one shared settings file (Fable, 22 Nov 26)
  git(w.main, ['config', 'extensions.worktreeConfig', 'true'])
  return `Installed: ${files.join(', ')}`
}

export function uninstall(cwd) {
  const w = where(cwd)
  const out = []
  for (const h of Object.keys(HOOKS)) {
    const f = join(w.common, 'hooks', h)
    if (!existsSync(f)) continue
    if (!readFileSync(f, 'utf8').includes(MARK)) { out.push(`${f} is another hook; left in place`); continue }
    unlinkSync(f); out.push(`Taken out: ${f}`)
  }
  const kept = join(w.common, 'hooks', 'lean-copy.mjs')
  if (existsSync(kept) && !Object.keys(HOOKS).some((h) => existsSync(join(w.common, 'hooks', h)) && readFileSync(join(w.common, 'hooks', h), 'utf8').includes(MARK))) {
    unlinkSync(kept); out.push(`Taken out: ${kept}`)
  }
  return out.length ? out.join('\n') : 'Nothing to take out.'
}

export function status(cwd) {
  const w = where(cwd)
  if (!w.linked) return noPictures(w.top) ? 'This copy holds no walk pictures at all — an exported read-copy, made without them: a picture missing here is not missing from the project; ask the host for the version under review.'
    : 'The main folder: it keeps every picture.'
  if (busy(w.gitDir)) return `git is busy in this copy (or a slim stopped part-way): ${join(w.gitDir, 'index.lock')} exists — wait; if no git is running, see ${join(w.gitDir, 'lean-copy.log')} and run node ${SCRIPT} full`
  if (!guarded(w) && isLean(w.top)) return `This copy is lean, but the commit guard is not in place on this PC — run node ${SCRIPT} install in the main folder.`
  if (!isLean(w.top)) return `This copy holds every picture${isWhole(w.top) ? ', and is kept whole' : ''}.`
  if (!existsSync(sparseFile(w.top))) return `This copy is marked lean but its list of what to leave out is missing — a slim stopped part-way: run node ${SCRIPT} full from the project's top folder.`
  const f = fetched(w.top)
  return `This copy is lean.${f.length ? ` Fetched: ${f.join(' ')}` : ' No picture folder fetched.'}`
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
      const out = await onAppHook(JSON.parse((await readStdin()) || '{}'))
      if (out) process.stdout.write(JSON.stringify(out))
    } catch (e) { process.stderr.write(`lean-copy: ${e.message}\n`) }
    return 0
  }
  if (cmd === 'git-hook') { try { await onGitHook(rest) } catch { /* fails open */ } return 0 }
  if (cmd === 'pre-commit') return onPreCommit()
  const cwd = process.cwd()
  const run = { status: () => status(cwd), slim: () => slim(cwd), install: () => install(cwd), uninstall: () => uninstall(cwd),
    full: () => full(cwd), get: () => { if (!rest.length) throw new Error('name at least one folder'); return get(cwd, rest) } }[cmd]
  if (!run) { process.stderr.write('usage: lean-copy.mjs status | get <folder>… | slim | full | install | uninstall\n'); return 2 }
  try { console.log(await run()); return 0 } catch (e) { process.stderr.write(`lean-copy: ${e.message}\n`); return 1 }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main(process.argv.slice(2)).then((code) => { process.exitCode = code })
