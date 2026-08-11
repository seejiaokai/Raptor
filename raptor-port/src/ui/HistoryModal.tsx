import { DAYS } from '../engine/data'
import { elogRows, elogGroups, elogWhen, ELOG } from '../engine/editlog'
import type { ELogRow } from '../engine/editlog'
import { esc, SBDAY } from '../state/view'
import { notify } from '../state/store'
import { HISTLIST, setHistList, HISTGROUP, setHistGroup, HISTOPEN, toggleHistOpen } from './pops'
import { jumpToChange } from './interactions'
import { histJumpable } from './histbubble'
import { useVersion } from './useStore'

/* THE LISTED VIEW (owner, 11 Aug 26) — every edit in time order, newest
   first, each line saying which day of the schedule it landed on, with a
   filter for the day the board is open on.

   String-built like every other dense list here (ALPanel, the insights
   tiles): the log caps at 400 rows and each one is four short strings, so
   this is the one surface in the feature that can get long. It sits in a
   body-level modal, which keeps all of it outside the board's DOM ceiling —
   that ceiling counts nodes under #sbBoard, and a 400-row list hung inside
   the board would blow it on its own.

   TWO VIEWS OF THE SAME ROWS (owner, 11 Aug 26). By time is the default and
   answers "what just happened". Grouped answers "how did this detail end up
   like this" — one row per detail, newest-touched first, unfolding to every
   change to it oldest-first. It is a VIEW, not a filter, so it sits beside
   the day buttons rather than inside them, and both reset when the list
   closes: a view set ten minutes ago should not be waiting for you.

   EVERY ROW THAT NAMES A DETAIL IS A BUTTON, and clicking it closes the list,
   puts that day on the board, scrolls the detail into view and pins its
   bubble open (interactions.ts's jumpToChange). Structural entries — a line
   removed, a day rolled back — carry no key and no cell, so they render as
   plain rows rather than as buttons that would do nothing. */

function chg(r: ELogRow) {
  return r.from === '—'
    ? `set to <b>${esc(r.to)}</b>`
    : `<b>${esc(r.from)}</b> <i class="hbar">→</i> <b>${esc(r.to)}</b>`
}
const dow = (di: any) => di == null ? '' : `<span class="hl-day">${esc((DAYS[di] || {}).dow || '')}</span>`
const meta = (r: ELogRow) => `<span class="hl-meta">${esc(r.who)} · ${esc(elogWhen(r.t))}</span>`

/* one clickable change. `hit` carries the address the jump needs. A row is a
   button only where the board can actually SHOW that detail: no key at all (a
   structural entry), or one of the four families the board never draws, and it
   stays a plain row — see histJumpable. A button that could only ever answer
   with an error is worse than no button, and the error it used to give was
   untrue as well ("no longer on this day" for a detail sitting safely on the
   week). */
function rowHTML(r: ELogRow, cls = 'hl-row') {
  const hit = histJumpable(r.key)
  const body = r.key
    ? `<span class="hl-what">${esc(r.lbl)}</span><span class="hl-chg">${chg(r)}</span>`
    : `<span class="hl-what struct">${esc(r.lbl)}</span>`
  return hit
    ? `<button class="${cls} hit" data-hkey="${esc(r.key)}" data-hdi="${r.di == null ? '' : r.di}"
         title="Go to this detail on the board">${dow(r.di)}${body}${meta(r)}</button>`
    : `<div class="${cls}">${dow(r.di)}${body}${meta(r)}</div>`
}

function emptyHTML(di: any) {
  /* two different empty states, because they mean different things: an
     empty log is "nothing has been changed yet", an empty FILTER is
     "nothing on this day" and the fix is to widen it */
  return `<div class="hl-empty">${di == null
    ? 'No changes yet. Every edit you make from now on lands here.'
    : `No changes on ${esc((DAYS[di] || {}).dow || 'this day')}. Switch to <b>All days</b> to see the rest.`}</div>`
}

function flatHTML(di: any) {
  const rows = elogRows(di)
  if (!rows.length) return emptyHTML(di)
  return `<ol class="hl-list">` + rows.map(r => `<li>${rowHTML(r)}</li>`).join('') + `</ol>`
}

function groupedHTML(di: any) {
  const groups = elogGroups(di)
  if (!groups.length) return emptyHTML(di)
  return `<ol class="hl-list">` + groups.map(g => {
    /* a group of ONE is just a row — a fold that opens to reveal the line
       already on screen is a tap for nothing */
    if (g.rows.length < 2) return `<li>${rowHTML(g.rows[0]!)}</li>`
    const open = HISTOPEN.has(g.key)
    const newest = g.rows[g.rows.length - 1]!
    return `<li class="hl-grp${open ? ' open' : ''}">`
      + `<button class="hl-row hl-ghead" data-hgrp="${esc(g.key)}" aria-expanded="${open}"
           title="${open ? 'Fold this detail up' : 'Show every change to this detail'}">`
      + dow(g.di)
      + `<span class="hl-what">${esc(g.lbl)}</span>`
      + `<span class="hl-chg">${chg(newest)}</span>`
      + `<span class="hl-n">${g.rows.length} changes</span>`
      + `<span class="hl-meta">${esc(elogWhen(newest.t))}</span>`
      + `<span class="hl-caret" aria-hidden="true">⌄</span></button>`
      /* oldest first inside a group — the story, ending at what it says now */
      + (open ? `<ol class="hl-sub">` + g.rows.map(r =>
          `<li>${rowHTML(r, 'hl-row hl-subrow')}</li>`).join('') + `</ol>` : '')
      + `</li>`
  }).join('') + `</ol>`
}

export function HistoryModal() {
  useVersion()
  if (HISTLIST === false) return <div className="modal" id="histModal" hidden />
  const di = HISTLIST === 'all' ? null : HISTLIST
  const close = () => { setHistList(false); setHistGroup(false); HISTOPEN.clear(); notify() }
  const day = SBDAY == null ? null : DAYS[SBDAY]
  const shown = HISTGROUP ? elogGroups(di).length : elogRows(di).length
  /* the body is delegated rather than per-row: it is injected as a string, so
     there is nothing to hang a React handler on — the same idiom the board's
     panels use */
  const onBody = (e: any) => {
    const t = e.target as HTMLElement
    const g = t.closest('[data-hgrp]') as HTMLElement | null
    if (g) { toggleHistOpen(g.dataset.hgrp!); notify(); return }
    const h = t.closest('[data-hkey]') as HTMLElement | null
    if (h) jumpToChange(h.dataset.hkey!, h.dataset.hdi === '' ? null : +h.dataset.hdi!)
  }
  return (
    <div className="modal" id="histModal" onClick={e => { if ((e.target as HTMLElement).id === 'histModal') close() }}>
      <div className="modal-box" style={{ width: 560 }}>
        <div className="modal-head">
          <b>Changes · {HISTGROUP ? 'by detail' : 'newest first'}</b>
          <button className="x" id="histClose" aria-label="Close" onClick={close}>✕</button>
        </div>
        <div className="hl-filter" role="group" aria-label="Which days to list, and how to group them">
          <button className={'hl-fb' + (di == null ? ' on' : '')} id="histAll"
            onClick={() => { setHistList('all'); notify() }}>All days</button>
          {day && <button className={'hl-fb' + (di != null ? ' on' : '')} id="histDay"
            onClick={() => { setHistList(SBDAY); notify() }}>{day.dow} only</button>}
          <span className="hl-sep" aria-hidden="true" />
          <button className={'hl-fb' + (!HISTGROUP ? ' on' : '')} id="histByTime"
            title="Every change in the order it happened, newest first"
            onClick={() => { setHistGroup(false); notify() }}>By time</button>
          <button className={'hl-fb' + (HISTGROUP ? ' on' : '')} id="histGrouped"
            title="One row per detail — unfold it to see every change to that detail"
            onClick={() => { setHistGroup(true); notify() }}>Grouped</button>
          <span className="hl-count">{shown} of {ELOG.rows.length}</span>
        </div>
        <div className="modal-body" id="histBody" onClick={onBody}
          dangerouslySetInnerHTML={{ __html: HISTGROUP ? groupedHTML(di) : flatHTML(di) }} />
        {/* The honest footnote, on the surface rather than in a doc nobody
            opens. The owner was told this before it was built; a scheduler
            reading the list a month from now was not. */}
        <div className="hl-foot">This browser, this sitting. It clears when you reload or log out — the schedule does the same.</div>
      </div>
    </div>
  )
}
