// @vitest-environment jsdom
/* A SLOW PAGE'S OWN DOWNLOAD, CAUGHT WHERE IT FAILS (D1631, [LAZY-PAGE-LOAD-FAIL], 4 Nov 26). The Leave War and the
   Tracker are each a separate download. Before this, a failed download was caught by nothing, and the whole app went
   blank, top bar and all — on a desktop with no tap, through the hidden pre-warm (reproduced 4 Nov 26). Now only that
   page fails: its area shows "Couldn't open …" with Retry while it is on screen, and nothing while it is hidden. Retry
   reloads the app (D1633). How it looks in a real browser, with the download refused, is the walk's. */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, Component, type ReactNode } from 'react'
import { setPage } from '../state/view'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DownloadedPage } from './pageload'
import { isDownloadFailure, pageDownload, pageFiles, RELOAD_HELD_MS, REOPEN_KEY, RETRY_MIN_MS, takeReopen } from './pagedownload'
import { watchSaves } from '../storage/savewait'

const FAIL = () => new Error('Failed to fetch dynamically imported module: http://x/assets/LeaveWarPage-abc.js')
const Page = ({ active }: { active: boolean }) => <div data-testid="the-page">{active ? 'on' : 'dozing'}</div>
/* a loader that fails as many times as asked, then gives the page */
function loader(failures: number) {
  const calls = { n: 0 }
  const load = vi.fn(async () => { calls.n++; if (calls.n <= failures) throw FAIL(); return { default: Page } })
  return { load, calls }
}

let host: HTMLDivElement, root: Root
beforeEach(() => {
  document.head.innerHTML = '<script type="module" crossorigin src="./assets/index-OLD.js"></script>'
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  document.body.innerHTML = ''; document.head.innerHTML = ''; sessionStorage.clear()
  vi.restoreAllMocks(); vi.unstubAllGlobals()
  setPage('viewsched')
  watchSaves(null)
})
/* the save indicator's source, as the app's postman would give it */
const saves = (status: 'saved' | 'saving' | 'unsaved' | 'failed') => ({ status })
const flush = async () => { for (let i = 0; i < 6; i++) await act(async () => { await Promise.resolve() }) }
/* the frame around it: a top bar that must survive whatever the page does */
const frame = (body: ReactNode) => <><div data-testid="topbar">142 TALON</div>{body}</>
const q = (t: string) => document.querySelector(`[data-testid="${t}"]`)

describe('a failed download of a page', () => {
  it('shows the card on that page only, the top bar staying — never a blank app', async () => {
    const { load } = loader(1)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load, 'src/leavewar/LeaveWarPage.tsx')} active />)) })
    await flush()
    expect(q('topbar')).not.toBeNull()
    const card = q('page-load-fail')!
    expect(card.getAttribute('role')).toBe('alert')
    expect(card.querySelector('h2')!.textContent).toBe("Couldn't open the Leave War")
    expect(card.querySelector('p')!.textContent).toBe("It didn't download. Check your signal, then retry.")
    expect(q('page-load-retry')!.textContent).toBe('Retry')
    expect(q('the-page')).toBeNull()
  })
  it('names the Tracker for the Tracker', async () => {
    const { load } = loader(1)
    await act(async () => { root.render(frame(<DownloadedPage page="tracker" name="the Tracker" download={pageDownload(load, 'src/tracker/TrackerPage.tsx')} active />)) })
    await flush()
    expect(q('page-load-fail')!.querySelector('h2')!.textContent).toBe("Couldn't open the Tracker")
  })
  it('a failed HIDDEN download (the desktop pre-warm) shows nothing — then opening the page shows the card, not another try (D1633)', async () => {
    const { load } = loader(1)
    const d = pageDownload(load, 'src/leavewar/LeaveWarPage.tsx')
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active={false} />)) })
    await flush()
    expect(q('topbar')).not.toBeNull()
    expect(q('page-load-fail')).toBeNull()
    expect(load).toHaveBeenCalledTimes(1)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active />)) })
    await flush()
    /* a browser keeps a failed page file failed until a reload (the walk, 4 Nov 26): a second try in place cannot work */
    expect(load).toHaveBeenCalledTimes(1)
    expect(q('page-load-fail')!.querySelector('h2')!.textContent).toBe("Couldn't open the Leave War")
  })
})

/* D1633 (4 Nov 26): Retry reloads the app. The walk of 4 Nov 26 showed Chromium and WebKit keep a failed page file failed
   until a reload, so a download tried again in place never reached the server. And the re-walk showed WebKit keeps it
   failed ACROSS a reload too (a server that hung up on the file: no request at all after the reload), unless the file is
   first fetched afresh, skipping the cache. So Retry first fetches the page's files afresh — their names from the build's
   own list of them, fetched fresh, so an update since the tab opened is covered — with the claw up; once they have all
   come it reloads (everything saved kept, the sign-in asked again, the Undo list afresh; an unsent save still gets the
   browser's own "are you sure?", storage/boot.ts guardUnload). If they do not come the card comes back, still signed in:
   a reload with no signal would have left the browser's own "no connection" page. */
const LW_SRC = 'src/leavewar/LeaveWarPage.tsx'
const LIST = {
  'index.html': { file: 'assets/index-NEW.js', isEntry: true, imports: ['_store-1.js'] },
  'src/leavewar/LeaveWarPage.tsx': { file: 'assets/LeaveWarPage-NEW.js', isDynamicEntry: true, imports: ['_store-1.js', '_grid-2.js'], css: ['assets/LeaveWarPage-NEW.css'] },
  'src/tracker/TrackerPage.tsx': { file: 'assets/TrackerPage-NEW.js', isDynamicEntry: true, imports: ['_store-1.js', '_grid-2.js'] },
  '_store-1.js': { file: 'assets/store-1.js' },
  '_grid-2.js': { file: 'assets/grid-2.js', imports: ['_store-1.js'], css: ['assets/grid-2.css'] },
}
/* the server: the build's list, then each file — `down` names what does not come (a URL ending, or 'list'), `hang` holds
   every answer until released */
function server(down: string[] = [], cut: string[] = []) {
  const calls: { url: string; cache?: RequestCache }[] = []
  let release: () => void = () => {}
  const held = new Promise<void>(r => { release = r })
  let hang = false
  const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
    const u = String(url)
    calls.push({ url: u, cache: init?.cache })
    if (hang) await held
    if (down.some(d => (d === 'list' ? u.endsWith('page-files.json') : u.endsWith(d)))) throw new TypeError('Failed to fetch')
    if (u.endsWith('page-files.json')) return new Response(JSON.stringify(LIST), { headers: { 'content-type': 'application/json' } })
    /* a file whose answer starts and then dies part-way (a weak signal) */
    if (cut.some(d => u.endsWith(d))) return new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('x')); c.error(new TypeError('network error')) } }))
    return new Response('x')
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, fetchMock, holdAll: () => { hang = true }, release: () => release() }
}
describe('Retry (D1633)', () => {
  const stubReload = () => { const reload = vi.fn(); vi.stubGlobal('location', { ...window.location, href: 'http://localhost/', reload }); return reload }
  const failedOn = async (page: 'leavewar' | 'tracker' = 'leavewar') => {
    const { load } = loader(1)
    const src = page === 'leavewar' ? LW_SRC : 'src/tracker/TrackerPage.tsx'
    setPage(page)
    await act(async () => { root.render(frame(<DownloadedPage page={page} name={page === 'leavewar' ? 'the Leave War' : 'the Tracker'} download={pageDownload(load, src)} active />)) })
    await flush()
    return load
  }
  const press = async () => { await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() }); await flush() }
  it("fetches the page's files afresh from the build's own list, then reloads the app; never the download again in place", async () => {
    const reload = stubReload()
    const srv = server()
    const load = await failedOn()
    await press()
    expect(srv.calls[0]).toEqual({ url: 'http://localhost/page-files.json', cache: 'no-store' })
    const files = srv.calls.slice(1)
    expect(files.map(c => c.url).sort()).toEqual(['assets/LeaveWarPage-NEW.css', 'assets/LeaveWarPage-NEW.js', 'assets/grid-2.css', 'assets/grid-2.js'].map(f => 'http://localhost/' + f))
    expect(files.every(c => c.cache === 'reload')).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledTimes(1)
  })
  it('shows the claw while the files come, never the card or a second Retry', async () => {
    stubReload()
    const srv = server()
    srv.holdAll()
    const sec = document.createElement('section'); sec.id = 'page-leavewar'; document.body.appendChild(sec)
    await failedOn()
    await press()
    expect(q('page-load-fail')).toBeNull()
    expect(document.querySelector('.pgclaw')).not.toBeNull()
    srv.release(); await flush()
  })
  /* with no signal at all the fetch fails at once: the claw is held a moment, so the press reads as tried rather than as
     nothing (the re-walk, 4 Nov 26: it flashed and the card snapped back) */
  const pastMin = async () => { await act(async () => { await new Promise(r => setTimeout(r, RETRY_MIN_MS + 60)) }); await flush() }
  it('the list does not come (no signal): the claw held a moment, then the card back — no reload, still signed in', async () => {
    const reload = stubReload()
    server(['list'])
    await failedOn()
    await press()
    expect(q('page-load-fail')).toBeNull()
    await pastMin()
    expect(reload).not.toHaveBeenCalled()
    expect(q('page-load-fail')!.querySelector('h2')!.textContent).toBe("Couldn't open the Leave War")
  })
  it('one of its files does not come: no reload, the card back', async () => {
    const reload = stubReload()
    server(['assets/grid-2.css'])
    await failedOn()
    await press()
    await pastMin()
    expect(reload).not.toHaveBeenCalled()
    expect(q('page-load-fail')).not.toBeNull()
  })
  it('notes the page to reopen just before it reloads (D1635), and only then', async () => {
    const reload = stubReload()
    server()
    await failedOn()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
    await press()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(JSON.parse(sessionStorage.getItem(REOPEN_KEY)!)).toMatchObject({ page: 'leavewar', at: expect.any(Number) })
    sessionStorage.clear()
  })
  it('a Retry that did not bring the page: no note, the keyboard back on Retry (D1636)', async () => {
    stubReload()
    server(['list'])
    await failedOn()
    await press()
    await pastMin()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
    expect(document.activeElement).toBe(q('page-load-retry'))
  })
  it('the claw stands one full round of its three claws, about 1.3 s (D1636)', () => {
    /* three claws 0.42 s each, 0.16 s apart, held whole 0.55 s (D1605): 0.32 + 0.42 + 0.55 */
    expect(RETRY_MIN_MS).toBeGreaterThanOrEqual(1290)
  })
  it("Retry wears the app's own cyan focus ring, as the top bar's buttons do (D1636)", () => {
    const css = readFileSync(join(__dirname, 'scheduler/02-shell.css'), 'utf8')
    expect(css).toContain(':is(#page-leavewar,#page-tracker) .pgfail-retry:focus-visible{outline:2px solid var(--accent);outline-offset:2px}')
  })
  /* the fresh code read of 4 Nov 26 (evening), finding 1: a reload with a save still waiting would ask "Leave site?" (or,
     on an iPhone, lose it unasked) — Retry never reloads then; the save band already says why */
  it('a save still waiting: no reload, no note, the card back', async () => {
    const reload = stubReload()
    server()
    watchSaves(saves('unsaved'))
    await failedOn()
    await press()
    await pastMin()
    expect(reload).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
    expect(q('page-load-fail')).not.toBeNull()
  })
  /* the narrow read of 4 Nov 26: on a weak signal a reload can take seconds to replace the page — a short timer threw the
     note away and flashed the card. The note now stays (it carries its own age); only a reload still not done after
     RELOAD_HELD_MS brings the card back */
  it('a reload slow to happen keeps the note; one still not done after the hold brings the card back', async () => {
    const reload = stubReload()            // a reload that does nothing: the page lives on, as when held back
    server()
    await failedOn()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      await press()
      expect(reload).toHaveBeenCalledTimes(1)
      await act(async () => { vi.advanceTimersByTime(2000) }); await flush()
      expect(sessionStorage.getItem(REOPEN_KEY)).not.toBeNull()
      expect(q('page-load-fail')).toBeNull()
      await act(async () => { vi.advanceTimersByTime(RELOAD_HELD_MS) }); await flush()
      expect(q('page-load-fail')).not.toBeNull()
      expect(document.activeElement).toBe(q('page-load-retry'))
      expect(sessionStorage.getItem(REOPEN_KEY)).not.toBeNull()
    } finally { vi.useRealTimers() }
  })
  it('a save that failed blocks the reload too; a save already on its way does not', async () => {
    const reload = stubReload()
    server()
    watchSaves(saves('failed'))
    await failedOn()
    await press(); await pastMin()
    expect(reload).not.toHaveBeenCalled()
    watchSaves(saves('saving'))
    await press()
    expect(reload).toHaveBeenCalledTimes(1)
  })
  /* finding 3: he left the page while the files were coming — the reload would throw away what he was doing there */
  it('he left the page before the files came: no reload, the card waiting for his return', async () => {
    const reload = stubReload()
    const srv = server()
    srv.holdAll()
    await failedOn()
    await press()
    setPage('inputs')
    srv.release(); await flush(); await pastMin()
    expect(reload).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
  /* finding 2: an answer that starts is not a file that came — on a weak signal it can die part-way */
  it('a file cut off part-way: no reload, the card back', async () => {
    const reload = stubReload()
    server([], ['assets/LeaveWarPage-NEW.js'])
    await failedOn()
    await press()
    await pastMin()
    expect(reload).not.toHaveBeenCalled()
    expect(q('page-load-fail')).not.toBeNull()
  })
  it('the first card does not take the keyboard', async () => {
    await failedOn()
    expect(document.activeElement).not.toBe(q('page-load-retry'))
  })
  it('the Tracker fetches its own files', async () => {
    const reload = stubReload()
    const srv = server()
    await failedOn('tracker')
    await press()
    expect(srv.calls.slice(1).map(c => c.url).sort()).toEqual(['assets/TrackerPage-NEW.js', 'assets/grid-2.css', 'assets/grid-2.js'].map(f => 'http://localhost/' + f))
    expect(reload).toHaveBeenCalledTimes(1)
  })
  it('the card that came from a hidden failure does the same', async () => {
    const { load } = loader(1)
    const reload = stubReload()
    server()
    const d = pageDownload(load, LW_SRC)
    setPage('leavewar')
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active={false} />)) })
    await flush()
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active />)) })
    await flush()
    await press()
    expect(reload).toHaveBeenCalledTimes(1)
  })
})

describe("the page's files, read from the build's list", () => {
  it("its own file, its stylesheets and the shared files only the slow pages use, each once, never what the app's start loaded", () => {
    expect(pageFiles(LIST, LW_SRC).sort()).toEqual(['assets/LeaveWarPage-NEW.css', 'assets/LeaveWarPage-NEW.js', 'assets/grid-2.css', 'assets/grid-2.js'])
  })
  /* the fresh read's finding 4: the list names each page by its source path; a page file moved or renamed would leave
     Retry fetching nothing, every time, with no other test going red */
  it("Shell.tsx names each page by a source file that exists, as the build's list keys it", () => {
    const shell = readFileSync(join(__dirname, 'Shell.tsx'), 'utf8')
    const srcs = [...shell.matchAll(/pageDownload\([^\n]*?,\s*'([^']+)'\)/g)].map(m => m[1]!)
    expect(srcs.sort()).toEqual(['src/leavewar/LeaveWarPage.tsx', 'src/tracker/TrackerPage.tsx'])
    for (const s of srcs) expect(existsSync(join(__dirname, '../..', s)), s).toBe(true)
  })
  it('a page the list does not name gives nothing', () => {
    expect(pageFiles(LIST, 'src/nowhere.tsx')).toEqual([])
  })
})

/* the fresh read's finding 3: a page whose claw waits for its own drawing (the Tracker's chart) must not keep the claw over
   the card for its 3 s cap. The card is that page's drawing too. */
describe('the claw over a failed page', () => {
  it("goes as the card shows, even where it waits for the page's own drawing; the page is no longer marked busy", async () => {
    const sec = document.createElement('section'); sec.id = 'page-tracker'; document.body.appendChild(sec)
    const host2 = document.createElement('div'); sec.appendChild(host2)
    const root2 = createRoot(host2)
    const { load } = loader(1)
    setPage('tracker')
    await act(async () => { root2.render(<DownloadedPage page="tracker" name="the Tracker" download={pageDownload(load, 'src/tracker/TrackerPage.tsx')} active until="#page-tracker #board *, #trk-nocourse" />) })
    await flush()
    expect(q('page-load-fail')).not.toBeNull()
    const claw = document.querySelector('.pgclaw')
    expect(claw === null || claw.classList.contains('gone'), 'the claw stands over the card').toBe(true)
    expect(sec.hasAttribute('aria-busy')).toBe(false)
    await act(async () => { root2.unmount() })
    setPage('viewsched')
  })
})

/* the fresh read's finding 6: the Tracker's own stylesheet styles every bare button on its page. The card's look holds
   inside either page. */
describe("the card's look", () => {
  it("is drawn by rules that win inside the Leave War's and the Tracker's own pages", () => {
    const css = readFileSync(join(__dirname, 'scheduler/02-shell.css'), 'utf8')
    for (const sel of ['.pgfail{', '.pgfail h2{', '.pgfail p{', '.pgfail-retry{']) expect(css).toContain(`:is(#page-leavewar,#page-tracker) ${sel}`)
  })
})

describe('what is a failed download', () => {
  it('the words each browser uses for a module that did not come, and the build\'s own for a stylesheet', () => {
    expect(isDownloadFailure(FAIL())).toBe(true)                                                         // Chrome, Edge
    expect(isDownloadFailure(new TypeError('Importing a module script failed.'))).toBe(true)             // Safari
    expect(isDownloadFailure(new TypeError('error loading dynamically imported module: x'))).toBe(true)  // Firefox
    expect(isDownloadFailure(new Error('Unable to preload CSS for /assets/LeaveWarPage-abc.css'))).toBe(true) // the build
    expect(isDownloadFailure(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false)
  })
  it('a fault inside the page itself is NOT shown as a failed download — it is left to what catches it today', async () => {
    class Outer extends Component<{ children: ReactNode }, { e: unknown }> {
      state = { e: null as unknown }
      static getDerivedStateFromError(e: unknown) { return { e } }
      render() { return this.state.e ? <div data-testid="outer-caught" /> : this.props.children }
    }
    const Broken = (): ReactNode => { throw new TypeError('a fault in the page') }
    const d = pageDownload(async () => ({ default: Broken as unknown as typeof Page }), 'src/leavewar/LeaveWarPage.tsx')
    await act(async () => { root.render(<Outer><DownloadedPage page="leavewar" name="the Leave War" download={d} active /></Outer>) })
    await flush()
    expect(q('page-load-fail')).toBeNull()
    expect(q('outer-caught')).not.toBeNull()
  })
})
