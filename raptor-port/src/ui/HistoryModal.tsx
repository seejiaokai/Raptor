import { DAYS } from '../engine/data'
import { elogRows, elogWhen, ELOG } from '../engine/editlog'
import { esc, SBDAY } from '../state/view'
import { notify } from '../state/store'
import { HISTLIST, setHistList } from './pops'
import { useVersion } from './useStore'

/* THE LISTED VIEW (owner, 11 Aug 26) — every edit in time order, newest
   first, each line saying which day of the schedule it landed on, with a
   filter for the day the board is open on.

   String-built like every other dense list here (ALPanel, the insights
   tiles): the log caps at 400 rows and each one is four short strings, so
   this is the one surface in the feature that can get long. It sits in a
   body-level modal, which keeps all of it outside the board's DOM ceiling —
   that ceiling counts nodes under #sbBoard, and a 400-row list hung inside
   the board would blow it on its own. */

function rowsHTML(di: any) {
  const rows = elogRows(di)
  if (!rows.length) {
    /* two different empty states, because they mean different things: an
       empty log is "nothing has been changed yet", an empty FILTER is
       "nothing on this day" and the fix is to widen it */
    return `<div class="hl-empty">${di == null
      ? 'No changes yet. Every edit you make from now on lands here.'
      : `No changes on ${esc((DAYS[di] || {}).dow || 'this day')}. Switch to <b>All days</b> to see the rest.`}</div>`
  }
  return `<ol class="hl-list">` + rows.map(r => {
    const day = r.di == null ? '' : `<span class="hl-day">${esc((DAYS[r.di] || {}).dow || '')}</span>`
    /* a structural entry — a line or row added or removed — carries no key
       and no values, so it prints as the action it was and nothing else */
    const what = r.key
      ? `<span class="hl-what">${esc(r.lbl)}</span>`
        + `<span class="hl-chg">${r.from === '—'
          ? `set to <b>${esc(r.to)}</b>`
          : `<b>${esc(r.from)}</b> <i class="hbar">→</i> <b>${esc(r.to)}</b>`}</span>`
      : `<span class="hl-what struct">${esc(r.lbl)}</span>`
    return `<li class="hl-row">${day}${what}`
      + `<span class="hl-meta">${esc(r.who)} · ${esc(elogWhen(r.t))}</span></li>`
  }).join('') + `</ol>`
}

export function HistoryModal() {
  useVersion()
  if (HISTLIST === false) return <div className="modal" id="histModal" hidden />
  const di = HISTLIST === 'all' ? null : HISTLIST
  const close = () => { setHistList(false); notify() }
  const day = SBDAY == null ? null : DAYS[SBDAY]
  return (
    <div className="modal" id="histModal" onClick={e => { if ((e.target as HTMLElement).id === 'histModal') close() }}>
      <div className="modal-box" style={{ width: 560 }}>
        <div className="modal-head">
          <b>Changes · newest first</b>
          <button className="x" id="histClose" aria-label="Close" onClick={close}>✕</button>
        </div>
        <div className="hl-filter" role="group" aria-label="Which days to list">
          <button className={'hl-fb' + (di == null ? ' on' : '')} id="histAll"
            onClick={() => { setHistList('all'); notify() }}>All days</button>
          {day && <button className={'hl-fb' + (di != null ? ' on' : '')} id="histDay"
            onClick={() => { setHistList(SBDAY); notify() }}>{day.dow} only</button>}
          <span className="hl-count">{elogRows(di).length} of {ELOG.rows.length}</span>
        </div>
        <div className="modal-body" id="histBody" dangerouslySetInnerHTML={{ __html: rowsHTML(di) }} />
        {/* The honest footnote, on the surface rather than in a doc nobody
            opens. The owner was told this before it was built; a scheduler
            reading the list a month from now was not. */}
        <div className="hl-foot">This browser, this sitting. It clears when you reload or log out — the schedule does the same.</div>
      </div>
    </div>
  )
}
