// @vitest-environment jsdom
/* A SLOW PAGE'S OWN DOWNLOAD, CAUGHT WHERE IT FAILS (D1631, [LAZY-PAGE-LOAD-FAIL], 4 Nov 26). The Leave War and the
   Tracker are each a separate download. Before this, a failed download was caught by nothing, and the whole app went
   blank, top bar and all — on a desktop with no tap, through the hidden pre-warm (reproduced 4 Nov 26). Now only that
   page fails: its area shows "Couldn't open …" with Retry while it is on screen, and nothing while it is hidden. Retry
   reloads the app (D1633). How it looks in a real browser, with the download refused, is the walk's. */
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
  it('a failed HIDDEN download (the desktop pre-warm) shows nothing — then opening the page shows the card, not another try (D1633)', async () => {
    const { load } = loader(1)
    const d = pageDownload(load)
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
   until a reload, so a download tried again in place never reached the server. A reload asks for every file afresh, its
   stylesheets too; everything saved is kept, the sign-in is asked again and the Undo list starts afresh. The browser's own
   "are you sure?" still guards a save that has not gone (storage/boot.ts guardUnload). */
describe('Retry (D1633)', () => {
  const stubReload = () => { const reload = vi.fn(); vi.stubGlobal('location', { ...window.location, href: 'http://localhost/', reload }); return reload }
  it('reloads the app, and never tries the download again in place or asks the server first', async () => {
    const { load } = loader(1)
    const reload = stubReload()
    const fetchMock = vi.fn(async () => new Response(''))
    vi.stubGlobal('fetch', fetchMock)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('reloads for the Tracker the same', async () => {
    const { load } = loader(1)
    const reload = stubReload()
    await act(async () => { root.render(frame(<DownloadedPage page="tracker" name="the Tracker" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(reload).toHaveBeenCalledTimes(1)
  })
  it('a page whose stylesheet did not come shows the card, and Retry reloads', async () => {
    const load = vi.fn(async (): Promise<{ default: typeof Page }> => { throw new Error('Unable to preload CSS for http://localhost/assets/LeaveWarPage-abc.css') })
    const reload = stubReload()
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    expect(q('page-load-fail')).not.toBeNull()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledTimes(1)
  })
  it('the card that came from a hidden failure reloads too', async () => {
    const { load } = loader(1)
    const reload = stubReload()
    const d = pageDownload(load)
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active={false} />)) })
    await flush()
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={d} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(reload).toHaveBeenCalledTimes(1)
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
