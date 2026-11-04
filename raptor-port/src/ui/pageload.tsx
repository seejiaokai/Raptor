/* A SLOW PAGE'S OWN DOWNLOAD, CAUGHT WHERE IT FAILS (owner D1631, 4 Nov 26 — [LAZY-PAGE-LOAD-FAIL]).
   The Leave War and the Tracker are each a separate download, fetched on their first open (Shell.tsx) — and, on a
   desktop, the Leave War in the background about 2 s after sign-in (Shell.tsx PRE-WARM). Nothing caught a download
   that failed (a weak signal; a tab left open across an update, when the old file names no longer exist): React then
   had nothing to show, and the WHOLE app went blank, top bar included — on a desktop with no tap at all, through the
   pre-warm (reproduced 4 Nov 26: the download refused in the test browser,
   docs/img/handpass/2026-11-04-lw-small-fixes-mock/).
   Now each page is caught on its own:
     · on screen, its area shows a card copied from the Tracker's "No course yet" card (its size, edge, fill, heading,
       line and button, read from the real one for the drawing he approved) — "Couldn't open the Leave War", "It didn't
       download. Check your signal, then retry.", Retry — and the top bar stays, every other page one tap away;
     · hidden (the pre-warm), it shows nothing; opening the page later tries the download again by itself, with the
       claw, and shows the card only if that fails too;
     · Retry downloads again — unless the app has been UPDATED since this tab opened, when the old file is gone and no
       retry can work: then it reloads the app, which keeps everything saved and starts the Undo list afresh (put to him
       on the drawing). Whether the app was updated is asked of the server: the app's own first file, named in a fresh
       index.html, differs from the one this tab runs. No answer (no signal) is not an update — the card stays.
   Only a failed DOWNLOAD is caught here: a fault inside the page itself is passed on to what catches it today. */
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { PageClaw } from './pageclaw'
import { isDownloadFailure, type PageDownload } from './pagedownload'

/* the app's own first file, as this tab runs it and as the server names it now */
const entryFiles = (root: ParentNode) =>
  [...root.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')].map(s => s.getAttribute('src')!.replace(/^\.?\//, ''))
async function appUpdated(): Promise<boolean> {
  try {
    const res = await fetch(new URL('./', window.location.href).href, { cache: 'no-store' })
    if (!res.ok) return false
    const now = entryFiles(new DOMParser().parseFromString(await res.text(), 'text/html'))
    const mine = new Set(entryFiles(document))
    return now.length > 0 && mine.size > 0 && now.some(f => !mine.has(f))
  } catch {
    return false
  }
}

/* The card, in the page's own area under the top bar. Read out the moment it shows. */
function PageLoadFail({ name, onRetry }: { name: string; onRetry: () => void }) {
  return (
    <div className="pgfail" role="alert" data-testid="page-load-fail">
      <h2>Couldn't open {name}</h2>
      <p>It didn't download. Check your signal, then retry.</p>
      <div className="pgfail-acts">
        <button type="button" className="pgfail-retry" data-testid="page-load-retry" onClick={onRetry}>Retry</button>
      </div>
    </div>
  )
}

/* An error boundary has to be a class: React has no hook for catching a child's render. */
class PageCatch extends Component<{ active: boolean; name: string; onRetry: () => void; onFail: () => void; children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }
  static getDerivedStateFromError(error: unknown) { return { error } }
  componentDidCatch(error: unknown) { if (isDownloadFailure(error)) this.props.onFail() }
  render() {
    const { error } = this.state
    if (error === null) return this.props.children
    /* a fault in the page itself is not a failed download: passed on, as before this catch existed */
    if (!isDownloadFailure(error)) throw error
    return this.props.active ? <PageLoadFail name={this.props.name} onRetry={this.props.onRetry} /> : null
  }
}

/** A separately downloaded page: the claw while it downloads (only while it is on screen), the card if it fails. */
export function DownloadedPage({ page, name, download, active, until }: {
  /** the page's own name in the app (CURPAGE), for the claw */
  page: string
  /** how the card names it: "the Leave War", "the Tracker" */
  name: string
  download: PageDownload
  /** the page is on screen; false while it is mounted hidden (the desktop's pre-warm, or left for another page) */
  active: boolean
  /** what the claw waits for once the page's code has arrived (PageClaw) */
  until?: string
}) {
  const [attempt, setAttempt] = useState(0)
  const failedHidden = useRef(false)
  const checking = useRef(false)
  const again = () => { download.renew(); setAttempt(a => a + 1) }
  const retry = async () => {
    if (checking.current) return
    checking.current = true
    try {
      if (await appUpdated()) { window.location.reload(); return }
      again()
    } finally { checking.current = false }
  }
  /* a download that failed while the page was hidden is tried again, by itself, when the page is opened */
  useEffect(() => {
    if (active && failedHidden.current) { failedHidden.current = false; again() }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the page coming on screen asks again
  }, [active])
  const Page = download.current
  return (
    <PageCatch key={attempt} active={active} name={name} onRetry={() => { void retry() }} onFail={() => { if (!active) failedHidden.current = true }}>
      <Suspense fallback={active ? <PageClaw page={page} until={until} /> : null}><Page active={active} /></Suspense>
    </PageCatch>
  )
}
