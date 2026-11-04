/* The helpers of ui/pageload.tsx that are not components (D1631, D1633, [LAZY-PAGE-LOAD-FAIL]) — kept apart so the
   component file exports components only. Why a page's download is made through `pageDownload`, what counts as a failed
   download and what Retry does: ui/pageload.tsx's head. */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type PageComp = ComponentType<{ active: boolean }>

/** A page's own download, and its name in the build's list of files (`src`, the page's source path, which the build
 *  writes into page-files.json — vite.config.ts). Made once, at module level (Shell.tsx), never inside a render. It is
 *  never asked for again in place: a browser keeps a failed page file failed (the walk, 4 Nov 26), so Retry fetches the
 *  page's files afresh and reloads the app (D1633). */
export interface PageDownload {
  Page: LazyExoticComponent<PageComp>
  src: string
}
export function pageDownload(load: () => Promise<{ default: PageComp }>, src: string): PageDownload {
  return { Page: lazy(load), src }
}

/** The words each browser gives a module that did not come — Chrome and Edge, Safari, Firefox — and the build's own for
 *  a page's stylesheet that did not (Vite's preload helper). */
export function isDownloadFailure(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /dynamically imported module|importing a module script failed|unable to preload css/i.test(m)
}

/* The build's list of its files (Vite's manifest, written as page-files.json beside index.html): for each page, its own
   file, its stylesheets and the shared files it imports, each named by its key in the same list. */
type ListEntry = { file: string; imports?: string[]; css?: string[] }
export type PageFileList = Record<string, ListEntry>
export const PAGE_FILE_LIST = 'page-files.json'

/* every file a key needs: its own, its stylesheets, and every file it imports, followed through the shared files, once */
function filesOf(list: PageFileList, key0: string): Set<string> {
  const out = new Set<string>(), seen = new Set<string>(), todo = [key0]
  while (todo.length) {
    const key = todo.pop()!
    const e = list[key]
    if (seen.has(key) || !e) continue
    seen.add(key)
    out.add(e.file)
    for (const c of e.css || []) out.add(c)
    todo.push(...(e.imports || []))
  }
  return out
}
/** The files a page needs that the app's own start did not already load (`index.html`'s, which came, or the app would not
 *  be running): its own file and stylesheet, and any shared file only the slow pages use — about 120 KB over the wire for
 *  either page (measured 4 Nov 26), what opening it downloads anyway, never the whole app again. */
export function pageFiles(list: PageFileList, src: string): string[] {
  const start = filesOf(list, 'index.html')
  return [...filesOf(list, src)].filter(f => !start.has(f))
}

/* how long Retry waits for the files, all told, before the card comes back */
export const FRESH_FILES_MAX_MS = 20000
/* the least time the claw stands after Retry before the card comes back: with no signal at all the fetch fails at once,
   and the claw flashed and the card snapped back, so the press read as doing nothing (the re-walk, 4 Nov 26). One full
   round of the claw (D1636): three claws 0.42 s each, 0.16 s apart, held whole 0.55 s (D1605) — 0.32 + 0.42 + 0.55. */
export const RETRY_MIN_MS = 1300

/* THE PAGE TO REOPEN AFTER RETRY'S RELOAD (D1635, 4 Nov 26). A reload starts the app on its first page, and the address
   cannot carry the page (a code app's address never changes — the SWiFT kit), so Retry leaves a note of it in this tab
   only, just before it reloads; the sign-in reads it once and throws it away (Login.tsx). Only the two pages that download
   apart are ever named; a browser that refuses storage simply opens the first page, as before. */
export const REOPEN_KEY = 'talon:reopen-page'
/* how long after asking for the reload the page may still be standing before Retry takes it as held back (a "Leave
   site?" answered Stay — the Tracker's own, for an unsaved chart edit) and brings the card back. Long, because on the weak
   signal Retry is for a reload can take seconds to replace the page; 1.5 s first, which fired on a merely slow reload and
   threw the note away (the narrow read, 4 Nov 26). The note is never thrown away here: its own age bounds it. */
export const RELOAD_HELD_MS = 10_000
/* a note older than this is not used: one left by a held-back reload must not fire at a later, unrelated sign-in */
export const REOPEN_MAX_AGE_MS = 60_000
const REOPENABLE = new Set(['leavewar', 'tracker'])
export function noteReopen(page: string): void {
  try { sessionStorage.setItem(REOPEN_KEY, JSON.stringify({ page, at: Date.now() })) } catch { /* storage refused: the first page opens, as before */ }
}
/** The page Retry asked to reopen, once, within a minute of asking: read and thrown away. */
export function takeReopen(): string | null {
  try {
    const raw = sessionStorage.getItem(REOPEN_KEY)
    sessionStorage.removeItem(REOPEN_KEY)
    const n = raw ? JSON.parse(raw) as { page?: unknown; at?: unknown } : null
    if (!n || typeof n.page !== 'string' || typeof n.at !== 'number') return null
    return REOPENABLE.has(n.page) && Date.now() - n.at < REOPEN_MAX_AGE_MS ? n.page : null
  } catch { return null }
}

/** Fetch a page's files afresh, skipping the browser's cache: true once every one has come. The re-walk of 4 Nov 26 found
 *  WebKit keeps a failed page file failed even across a reload, until the file is fetched again like this; Chromium needs
 *  only the reload, and loses nothing by it. The list itself is fetched fresh, so a tab left open across an update fetches
 *  the NEW files, which the reload then runs. No list, a file that does not come, or no answer within 20 s: false. */
export async function freshPageFiles(src: string): Promise<boolean> {
  const stop = typeof AbortController === 'function' ? new AbortController() : null
  const timer = window.setTimeout(() => stop?.abort(), FRESH_FILES_MAX_MS)
  const at = (f: string) => new URL(f, window.location.href).href
  try {
    const res = await fetch(at(PAGE_FILE_LIST), { cache: 'no-store', signal: stop?.signal })
    if (!res.ok) return false
    const files = pageFiles(await res.json() as PageFileList, src)
    if (!files.length) return false
    /* a file has come once its whole body has arrived, not when its answer starts: on a weak signal an answer can die
       part-way, and a reload then would land on the browser's own "no connection" page (the fresh code read, 4 Nov 26) */
    const came = await Promise.all(files.map(f => fetch(at(f), { cache: 'reload', signal: stop?.signal })
      .then(r => (r.ok ? r.arrayBuffer().then(() => true, () => false) : false), () => false)))
    return came.every(Boolean)
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}
