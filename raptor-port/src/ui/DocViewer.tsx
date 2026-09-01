/* THE SUPPORTING-DOCUMENT VIEWER (owner, 27 Aug 26 — "if u click on the puck,
   all users can view the document uploaded"). One airpop modal over any page,
   showing the paperwork behind one medical input: an image inline, a PDF in a
   frame, and a plain statement when the entry carries no file.

   Deliberately UNGATED for viewing — every account sees every document; the
   gates sit on the ACTIONS in the footer (edit your own, admin edits all,
   the pending card's Upchit lands on ME for a member), at the write path as
   always. The object URL is minted here on open and revoked on close — the
   store (state/docs) never holds one, so nothing leaks per stored file. */
import { useEffect, useState } from 'react'
import { PEOPLE } from '../engine/people'
import { inpMeta, baseYear } from '../engine/inputs'
import { fmt } from './inputedit'
import { TODAY, keyToIso } from './weeknav'
import { docGet } from '../state/docs'
import { ME, canEditSched } from '../state/auth'
import { notify } from '../state/store'
import { DOCVIEW, setDocView, setInpEdit } from './pops'
import { useVersion } from './useStore'

export function DocViewer() {
  useVersion()
  const v = DOCVIEW
  /* one document or an episode. A single-row caller (a puck tap, a pending
     card) gives { row, up }; the Medical page gives { rows, idx } for a
     person's overlapping medical documents (owner, 1 Sep 26), paged in place.
     Either way `list` is the rows to step through, so the single-row path is
     just a list of one — nothing about it changes. */
  const list = v ? (v.rows && v.rows.length ? v.rows : (v.row ? [{ row: v.row, up: v.up }] : [])) : []
  const [i, setI] = useState(0)
  /* seat the page index when a NEW viewer opens — DOCVIEW is a fresh object on
     every setDocView, so its identity change is the "opened again" signal. Set
     in render (guarded), not an effect, so the first frame already shows the
     tapped document rather than flashing doc 0 and re-minting its URL. */
  const [seenV, setSeenV] = useState<any>(null)
  if (v !== seenV) { setSeenV(v); setI(v && v.idx ? v.idx : 0) }
  const idx = list.length ? Math.min(i, list.length - 1) : 0
  const cur = list.length ? list[idx] : null
  const r = cur && cur.row
  const up = !!(cur && cur.up)
  const doc = r ? docGet(r.docId) : null
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!doc) { setUrl(''); return }
    const u = URL.createObjectURL(doc.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [doc])
  useEffect(() => {
    if (!r) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [r])

  const close = () => { setDocView(null); notify() }
  const mine = r && (canEditSched() || r.person === ME)
  const edit = () => { setDocView(null); setInpEdit(r); notify() }
  /* the pending card's own Upchit path (owner, 27 Aug 26 — "the user can
     click on their own puck and upload their document to upchit"): a seed
     row for the shared editor in its upchit context, person fixed */
  const upchit = () => {
    setDocView(null)
    /* the date defaults to TODAY (the app's notional today) and stays
       editable in the dialog — a certificate is sometimes signed a day or
       two before it is filed (owner, 27 Aug 26) */
    setInpEdit({ _new: true, _ctx: 'up', person: r.person, type: 'Upchit', allday: true, date: fmt(keyToIso(TODAY)), yr: baseYear(), remarks: '' })
    notify()
  }

  const who = r && PEOPLE[r.person] ? PEOPLE[r.person].cs : (r ? String(r.person) : '')
  const when = !r ? '' : r.date + (r.endDate ? ' → ' + r.endDate : '')
  const m = r ? inpMeta(r.type) : null

  return (
    <div className="airpop" id="docViewPop" hidden={!r}
      onClick={e => { if ((e.target as HTMLElement).id === 'docViewPop') close() }}>
      <div className="airpop-box docviewbox">
        <div className="airpop-head">
          <b id="docViewTitle">{who}{r ? ` · ${r.type} · ${when}` : ''}</b>
          <button className="x" id="docViewClose" aria-label="Close" onClick={close}>✕</button>
        </div>
        {r && <div className="airpop-body docview-body">
          {m && <div className="docview-sub">{m.name}{r.remarks ? ` — ${r.remarks}` : ''}</div>}
          {/* the episode pager (owner, 1 Sep 26) — only when a person's
              overlapping documents are shown together; a lone document has no
              nav bar, so the single-doc view is unchanged */}
          {list.length > 1 && <div className="docview-nav">
            <button type="button" className="abtn" id="docViewPrev" aria-label="Previous document"
              disabled={idx === 0} onClick={() => setI(idx - 1)}>‹</button>
            <span className="docview-count">{idx + 1} of {list.length}</span>
            <button type="button" className="abtn" id="docViewNext" aria-label="Next document"
              disabled={idx === list.length - 1} onClick={() => setI(idx + 1)}>›</button>
          </div>}
          {doc && url
            ? (doc.mime === 'application/pdf'
              ? <iframe className="docview-frame" title={doc.name} src={url} />
              : <img className="docview-img" alt={doc.name} src={url} />)
            : <div className="docview-none">No document on file for this entry</div>}
        </div>}
        <div className="airpop-foot">
          {mine && up && <button className="abtn" id="docViewUpchit" onClick={upchit}>Upchit</button>}
          {mine && <button className="abtn ghost" id="docViewEdit" onClick={edit}>Edit input</button>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn" id="docViewDone" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  )
}
