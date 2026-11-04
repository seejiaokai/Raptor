/* The two helpers of ui/pageload.tsx that are not components (D1631, [LAZY-PAGE-LOAD-FAIL]) — kept apart so the
   component file exports components only. Why a page's download is made through `pageDownload` and what counts as a
   failed download: ui/pageload.tsx's head. */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type PageComp = ComponentType<{ active: boolean }>

/** A page's own download. Made once, at module level (Shell.tsx), never inside a render. It is never asked for again in
 *  place: a browser keeps a failed page file failed until a reload (the walk, 4 Nov 26), so Retry reloads the app
 *  (D1633) — and the reload asks for every file afresh, a page's stylesheet included. */
export type PageDownload = LazyExoticComponent<PageComp>
export function pageDownload(load: () => Promise<{ default: PageComp }>): PageDownload {
  return lazy(load)
}

/** The words each browser gives a module that did not come — Chrome and Edge, Safari, Firefox — and the build's own for
 *  a page's stylesheet that did not (Vite's preload helper). */
export function isDownloadFailure(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /dynamically imported module|importing a module script failed|unable to preload css/i.test(m)
}
