/* The editable week and its aircrew palette. The week renders through the
   same per-day diff swap as the view page, with ed = the Edit-mode switch;
   the palette renders the verbatim paletteHTML and re-hangs on every store
   change (its scroll survives unchanged markup, as the reference's setHTML
   guarantee had it — the diff here is the innerHTML comparison). */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { dayHTML, dayPreviewHTML } from './html'
import { daySnapOf } from '../engine/publish'
import { paletteHTML, paletteDay } from './palette-html'
import { ARM, CARRYDAY, CURPAGE, DPREV, setCarryDay, scrollWeekToDay } from '../state/view'
import { refreshHighlights } from './highlights'
import { editingText } from './textedit'
import { useVersion } from './useStore'

export function EditWeek() {
  const version = useVersion()
  const ref = useRef<HTMLDivElement>(null)
  const prev = useRef<{ ed: boolean, html: string[] } | null>(null)

  useEffect(() => {
    /* only the page on screen is rendered (as the reference's renderSchedule
       gate has it). The week behind the open board still repaints for real
       mutations because safety flows deliberately address that mounted DOM;
       boardTab's narrow notification lane prevents day-only swipes from
       reaching this effect at all. */
    if (CURPAGE !== 'editsched') return
    const root = ref.current!
    /* never repaint under the caret — the deferred commit repaints once focus
       has left every text field (the reference's txtCommit guarantee) */
    if (editingText()) return
    const ed = HOOKS.editMode()
    const html = DAYS.map((_: any, di: number) => {
      /* lazy orphan prune: the previewed AL may have been unpublished or
         undone since the last paint — render the live day, not a ghost */
      if (DPREV.has(di) && !daySnapOf(di, DPREV.get(di))) DPREV.delete(di)
      return DPREV.has(di) ? dayPreviewHTML(di, DPREV.get(di), ed) : dayHTML(di, ed, true)
    })
    const p = prev.current
    const sl = root.scrollLeft
    const whole = !p || p.ed !== ed || p.html.length !== html.length || root.children.length !== html.length
    if (!whole) {
      const secs = [...root.children] as HTMLElement[]
      html.forEach((h, i) => { if (h !== p!.html[i]) secs[i].outerHTML = h })
    } else {
      root.innerHTML = html.join('')
    }
    root.scrollLeft = sl
    /* the carried day from a page switch — see ViewWeek for the reasoning;
       both weeks consume it the same way so the hop works in both directions */
    if (CARRYDAY != null) { scrollWeekToDay(root, CARRYDAY); setCarryDay(null) }
    prev.current = { ed, html }
    refreshHighlights()
  }, [version])

  return <div className="week" id="eWeek" ref={ref} />
}

export function EditRoster() {
  const version = useVersion()
  const ref = useRef<HTMLElement>(null)
  const prev = useRef<string>('')

  useEffect(() => {
    if (CURPAGE !== 'editsched') return
    const el = ref.current!
    const html = `<div class="ros-tab" id="rosTab" title="Aircrew palette"><b>${ARM ? 'PLAN' : 'AIRCREW'}</b></div>`
      + `<div class="ros-body">${paletteHTML(paletteDay())}</div>`
    if (html !== prev.current) { el.innerHTML = html; prev.current = html }
  }, [version])

  return <aside className="sb-roster eroster" id="eRoster" ref={ref} />
}
