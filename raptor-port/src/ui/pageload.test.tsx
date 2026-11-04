// @vitest-environment jsdom
/* A SLOW PAGE'S OWN DOWNLOAD, CAUGHT WHERE IT FAILS (D1631, [LAZY-PAGE-LOAD-FAIL], 4 Nov 26). The Leave War and the
   Tracker are each a separate download. Before this, a failed download was caught by nothing, and the whole app went
   blank, top bar and all — on a desktop with no tap, through the hidden pre-warm (reproduced 4 Nov 26). Now only that
   page fails: its area shows "Couldn't open …" with Retry while it is on screen, and nothing while it is hidden. Retry
   downloads again, or reloads the app when the app was updated since it opened (the old file is gone). How it looks in
   a real browser, with the download refused, is the walk's. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, Component, type ReactNode } from 'react'
import { setPage } from '../state/view'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DownloadedPage } from './pageload'
import { isDownloadFailure, pageDownload } from './pagedownload'

const FAIL = () => new Error('Failed to fetch dynamically imported module: http://x/assets/LeaveWarPage-abc.js')
const Page = ({ active }: { active: boolean }) => <div data-testid="the-page">{active ? 'on' : 'dozing'}</div>
/* a loader that fails as many times as asked, then gives the page */
function loader(failures: number) {
  const calls = { n: 0 }
  const load = vi.fn(async () => { calls.n++; if (calls.n <= failures) throw FAIL(); return { default: Page } })
  return { load, calls }
}
/* the index.html the server answers now: the same entry file as the page (no update), or another (an update) */
const indexWith = (entry: string) => `<!doctype html><html><head><script type="module" crossorigin src="./assets/${entry}"></script></head><body></body></html>`

let host: HTMLDivElement, root: Root
beforeEach(() => {
  document.head.innerHTML = '<script type="module" crossorigin src="./assets/index-OLD.js"></script>'
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  document.body.innerHTML = ''; document.head.innerHTML = ''
  vi.restoreAllMocks(); vi.unstubAllGlobals()
})
const flush = async () => { for (let i = 0; i < 6; i++) await act(async () => { await Promise.resolve() }) }
/* the frame around it: a top bar that must survive whatever the page does */
const frame = (body: ReactNode) => <><div data-testid="topbar">142 TALON</div>{body}</>
const q = (t: string) => document.querySelector(`[data-testid="${t}"]`)

describe('a failed download of a page', () => {
  it('shows the card on that page only, the top bar staying — never a blank app', async () => {
    const { load } = loader(1)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
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
    await act(async () => { root.render(frame(<DownloadedPage page="tracker" name="the Tracker" download={pageDownload(load)} active />)) })
    await flush()
    expect(q('page-load-fail')!.querySelector('h2')!.textContent).toBe("Couldn't open the Tracker")
  })
  it('a failed HIDDEN download (the desktop pre-warm) shows nothing — then opening the page tries again by itself', async () => {
    const { load } = loader(1)
    const d = pageDownload(load)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active={false} />)) })
    await flush()
    expect(q('topbar')).not.toBeNull()
    expect(q('page-load-fail')).toBeNull()
    expect(load).toHaveBeenCalledTimes(1)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active />)) })
    await flush()
    expect(load).toHaveBeenCalledTimes(2)
    expect(q('page-load-fail')).toBeNull()
    expect(q('the-page')!.textContent).toBe('on')
  })
  it('Retry downloads again, and the page appears', async () => {
    const { load } = loader(1)
    vi.stubGlobal('fetch', vi.fn(async () => new Response(indexWith('index-OLD.js'))))
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(load).toHaveBeenCalledTimes(2)
    expect(q('page-load-fail')).toBeNull()
    expect(q('the-page')!.textContent).toBe('on')
  })
  it('Retry that fails again keeps the card; no signal at all to ask whether the app changed is not an update', async () => {
    const { load } = loader(5)
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, href: 'http://localhost/', reload })
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(load).toHaveBeenCalledTimes(2)
    expect(reload).not.toHaveBeenCalled()
    expect(q('page-load-fail')).not.toBeNull()
  })
  it('Retry after the app was updated (the server names another entry file): the retry fails too, and the app reloads', async () => {
    const { load } = loader(5)
    vi.stubGlobal('fetch', vi.fn(async () => new Response(indexWith('index-NEW.js'))))
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, href: 'http://localhost/', reload })
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(load).toHaveBeenCalledTimes(2)
    expect(reload).toHaveBeenCalledTimes(1)
  })
  /* the fresh read's finding 4: the update check is a fetch that a weak signal can stall for tens of seconds. Retry never
     waits on it: it downloads again at once (the claw shows), and asks only when that fails too. */
  it('Retry downloads again AT ONCE, never waiting on the check for an update', async () => {
    const { load } = loader(1)
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}))   // a request that never answers
    vi.stubGlobal('fetch', fetchMock)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(load).toHaveBeenCalledTimes(2)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(q('the-page')!.textContent).toBe('on')
  })
})

/* the fresh read's finding 1: the page's code arrives but its stylesheet does not. The build's own loader remembers the
   stylesheet as asked for and never asks again, so a retry would draw the page with no look at all. Retry asks for the
   stylesheet afresh first, and opens the page only once it has come. */
describe('a page whose stylesheet failed to download', () => {
  const CSS = 'http://localhost/assets/LeaveWarPage-abc.css'
  const cssLoader = () => { let n = 0; return vi.fn(async () => { if (n++ === 0) throw new Error(`Unable to preload CSS for ${CSS}`); return { default: Page } }) }
  it('Retry puts a fresh request for the stylesheet in, and the page opens once it has come', async () => {
    const old = document.createElement('link'); old.rel = 'stylesheet'; old.href = CSS; document.head.appendChild(old)
    const load = cssLoader()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(indexWith('index-OLD.js'))))
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    expect(q('page-load-fail')).not.toBeNull()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter(l => l.href === CSS)
    expect(links).toHaveLength(1)
    expect(links[0]).not.toBe(old)
    expect(q('the-page')).toBeNull()                      // not before the stylesheet has come
    await act(async () => { links[0]!.dispatchEvent(new Event('load')) })
    await flush()
    expect(q('the-page')!.textContent).toBe('on')
    expect(q('page-load-fail')).toBeNull()
  })
  it('a stylesheet that fails again keeps the card', async () => {
    const load = cssLoader()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(indexWith('index-OLD.js'))))
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    const fresh = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].find(l => l.href === CSS)!
    await act(async () => { fresh.dispatchEvent(new Event('error')) })
    await flush()
    expect(q('page-load-fail')).not.toBeNull()
    expect(q('the-page')).toBeNull()
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
    await act(async () => { root2.render(<DownloadedPage page="tracker" name="the Tracker" download={pageDownload(load)} active until="#page-tracker #board *, #trk-nocourse" />) })
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
    const d = pageDownload(async () => ({ default: Broken as unknown as typeof Page }))
    await act(async () => { root.render(<Outer><DownloadedPage page="leavewar" name="the Leave War" download={d} active /></Outer>) })
    await flush()
    expect(q('page-load-fail')).toBeNull()
    expect(q('outer-caught')).not.toBeNull()
  })
})
