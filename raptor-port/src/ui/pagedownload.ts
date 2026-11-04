/* The two helpers of ui/pageload.tsx that are not components (D1631, [LAZY-PAGE-LOAD-FAIL]) — kept apart so the
   component file exports components only. Why a page's download is made through `pageDownload` and what counts as a
   failed download: ui/pageload.tsx's head. */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type PageComp = ComponentType<{ active: boolean }>
type Loader = () => Promise<{ default: PageComp }>

/** A page's download that can be asked for again: React keeps a failed `lazy` failed, so a retry is a new one. Made once,
 *  at module level (Shell.tsx), never inside a render. */
export interface PageDownload {
  current: LazyExoticComponent<PageComp>
  renew: () => void
  /** tell it why the last try failed: a stylesheet that did not come is asked for afresh by the next try */
  noteFailure: (e: unknown) => void
}

const CSS_FAILED = /unable to preload css for (\S+)/i

/* A PAGE'S STYLESHEET THAT DID NOT COME (the fresh code read of 4 Nov 26, finding 1). The build's own loader (Vite's
   preload helper) remembers every stylesheet it has asked for, and on a second try neither asks again nor waits: the page
   would open with no look at all, until a reload. So the next try puts in a fresh request for each stylesheet that
   failed, and goes on only once it has come; one that fails again fails the try with the same words, and the card stays. */
function fetchCss(href: string): Promise<void> {
  for (const old of document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) if (old.href === href) old.remove()
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  const came = new Promise<void>((ok, fail) => {
    link.addEventListener('load', () => ok(), { once: true })
    link.addEventListener('error', () => fail(new Error(`Unable to preload CSS for ${href}`)), { once: true })
  })
  document.head.appendChild(link)
  return came
}

export function pageDownload(load: Loader): PageDownload {
  const failedCss = new Set<string>()
  const attempt = async () => {
    for (const href of [...failedCss]) { await fetchCss(href); failedCss.delete(href) }
    return load()
  }
  const d: PageDownload = {
    current: lazy(attempt),
    renew: () => { d.current = lazy(attempt) },
    noteFailure: e => {
      const m = CSS_FAILED.exec(e instanceof Error ? e.message : String(e))
      if (m) failedCss.add(new URL(m[1]!, window.location.href).href)
    },
  }
  return d
}

/** The words each browser gives a module that did not come — Chrome and Edge, Safari, Firefox — and the build's own for
 *  a page's stylesheet that did not (Vite's preload helper). */
export function isDownloadFailure(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /dynamically imported module|importing a module script failed|unable to preload css/i.test(m)
}
