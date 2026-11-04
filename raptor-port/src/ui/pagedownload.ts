/* The two helpers of ui/pageload.tsx that are not components (D1631, [LAZY-PAGE-LOAD-FAIL]) — kept apart so the
   component file exports components only. Why a page's download is made through `pageDownload` and what counts as a
   failed download: ui/pageload.tsx's head. */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type PageComp = ComponentType<{ active: boolean }>
type Loader = () => Promise<{ default: PageComp }>

/** A page's download that can be asked for again: React keeps a failed `lazy` failed, so a retry is a new one. Made once,
 *  at module level (Shell.tsx), never inside a render. */
export interface PageDownload { current: LazyExoticComponent<PageComp>; renew: () => void }
export function pageDownload(load: Loader): PageDownload {
  const d: PageDownload = { current: lazy(load), renew: () => { d.current = lazy(load) } }
  return d
}

/** The words each browser gives a module that did not come — Chrome and Edge, Safari, Firefox — and the build's own for
 *  a page's stylesheet that did not (Vite's preload helper). */
export function isDownloadFailure(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /dynamically imported module|importing a module script failed|unable to preload css/i.test(m)
}
