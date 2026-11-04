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
     · hidden (the pre-warm), it shows nothing; opening the page later shows the card (D1633);
     · Retry RELOADS THE APP (owner D1633, 4 Nov 26, narrowing D1631's "downloads again"). The walk of 4 Nov 26 showed
       Chromium and WebKit keep a failed page file failed: a download asked for again in place never reached the server.
       The re-walk showed WebKit keeps it failed even across a reload, unless the file is first fetched afresh. So Retry
       puts the claw up, fetches the page's files afresh (pagedownload.ts freshPageFiles — their names from the build's
       own list, fetched fresh, so an update since the tab opened is covered too), and once they have all come reloads.
       Everything saved is kept; the sign-in is asked again (it lives in the open page until the database step) and the
       Undo list starts afresh; a save still unsent gets the browser's own "are you sure?" first (storage/boot.ts
       guardUnload). If they do not come, the card comes back, still signed in: a reload with no signal would leave the
       browser's own "no connection" page — then the claw stands one full round first and the keyboard is back on Retry
       (D1636). After the reload the page reopens by itself once signed in (D1635: pagedownload.ts noteReopen, read by
       Login.tsx). The move plan's platform flag covers how Power Apps hosts a reload.
   Only a failed DOWNLOAD is caught here: a fault inside the page itself is passed on to what catches it today. */
import { Component, Suspense, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { PageClaw } from './pageclaw'
import { freshPageFiles, isDownloadFailure, noteReopen, RETRY_MIN_MS, type PageDownload } from './pagedownload'

/* The card, in the page's own area under the top bar. Read out the moment it shows. */
function PageLoadFail({ name, onRetry, refocus }: { name: string; onRetry: () => void; refocus: boolean }) {
  const retryRef = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => { if (refocus) retryRef.current?.focus() }, [refocus])
  return (
    <div className="pgfail" role="alert" data-testid="page-load-fail">
      <h2>Couldn't open {name}</h2>
      <p>It didn't download. Check your signal, then retry.</p>
      <div className="pgfail-acts">
        <button type="button" className="pgfail-retry" ref={retryRef} data-testid="page-load-retry" onClick={onRetry}>Retry</button>
      </div>
    </div>
  )
}

/* An error boundary has to be a class: React has no hook for catching a child's render. While Retry fetches the page's
   files (`trying`), the claw stands where the card was; it goes as the card comes back, if they did not come. */
class PageCatch extends Component<{ active: boolean; name: string; page: string; trying: boolean; refocus: boolean; onRetry: () => void; children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }
  static getDerivedStateFromError(error: unknown) { return { error } }
  render() {
    const { error } = this.state
    const { active, name, page, trying, refocus, onRetry } = this.props
    if (error === null) return this.props.children
    /* a fault in the page itself is not a failed download: passed on, as before this catch existed */
    if (!isDownloadFailure(error)) throw error
    if (!active) return null
    return trying ? <PageClaw page={page} until={`#page-${page} [data-testid="page-load-fail"]`} /> : <PageLoadFail name={name} onRetry={onRetry} refocus={refocus} />
  }
}

/** A separately downloaded page: the claw while it downloads (only while it is on screen), the card if it fails. */
export function DownloadedPage({ page, name, download: { Page, src }, active, until }: {
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
  /* where the claw waits for the page's own drawing (the Tracker's chart), the card is that page's drawing too: the claw
     goes as it shows, not at its 3 s cap (the fresh code read's finding 3) */
  const waitFor = until ? `${until}, #page-${page} [data-testid="page-load-fail"]` : undefined
  const [trying, setTrying] = useState(false)
  /* after a Retry that did not bring the page, the keyboard goes back to Retry (D1636): the button was taken away while
     the claw stood, so the keyboard had fallen to the page */
  const [refocus, setRefocus] = useState(false)
  const retry = () => {
    setTrying(true)
    const t0 = Date.now()
    void freshPageFiles(src).then(came => {
      if (came) { noteReopen(page); window.location.reload() }
      else window.setTimeout(() => { setRefocus(true); setTrying(false) }, Math.max(0, RETRY_MIN_MS - (Date.now() - t0)))
    })
  }
  return (
    <PageCatch active={active} name={name} page={page} trying={trying} refocus={refocus} onRetry={retry}>
      <Suspense fallback={active ? <PageClaw page={page} until={waitFor} /> : null}><Page active={active} /></Suspense>
    </PageCatch>
  )
}
