// @vitest-environment jsdom
/* A SLOW PAGE'S OWN DOWNLOAD, CAUGHT WHERE IT FAILS (D1631, [LAZY-PAGE-LOAD-FAIL], 4 Nov 26). The Leave War and the
   Tracker are each a separate download. Before this, a failed download was caught by nothing, and the whole app went
   blank, top bar and all — on a desktop with no tap, through the hidden pre-warm (reproduced 4 Nov 26). Now only that
   page fails: its area shows "Couldn't open …" with Retry while it is on screen, and nothing while it is hidden. Retry
   downloads again, or reloads the app when the app was updated since it opened (the old file is gone). How it looks in
   a real browser, with the download refused, is the walk's. */
import { act, Component, type ReactNode } from 'react'
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
  it('Retry after the app was updated (the server names another entry file) reloads the app instead', async () => {
    const { load } = loader(5)
    vi.stubGlobal('fetch', vi.fn(async () => new Response(indexWith('index-NEW.js'))))
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, href: 'http://localhost/', reload })
    await act(async () => { root.render(frame(<DownloadedPage page="leavewar" name="the Leave War" download={pageDownload(load)} active />)) })
    await flush()
    await act(async () => { (q('page-load-retry') as HTMLButtonElement).click() })
    await flush()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledTimes(1)
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
