/* The Drafts manage modal (owner, 15 Aug 26) — opened from the drafts menu's
   pencils (board.ts's draftsMenu), on either surface, and SCOPED TO ONE DAY:
   drafts are per-day alternate blobs, so unlike DayTplModal's global library
   this modal manages exactly the day whose menu opened it. Same shape
   otherwise: pops.ts flag, hidden shell when closed, App.tsx mount, tabs
   across the entries, and no content editor — a draft's content is edited by
   selecting it and using the board / edit week themselves, which is the whole
   design (the live day IS the selected draft).
   The name commits on blur/Enter rather than per keystroke: draftRename
   REFUSES empty and duplicate names, and refusing mid-keystroke would make
   the box fight the typist — so the draft keeps its old name until a valid
   one is committed, and a refusal says why in a toast. */
import { useEffect, useState } from 'react'
import { notify } from '../state/store'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { dayDrafts, curDraftId, draftRename, draftDelete, MAX_DRAFT_NAME } from '../engine/drafts'
import { switchDraft } from './board'
import { DRAFTSEDIT, setDraftsEdit } from './pops'
import { useVersion } from './useStore'

export function DraftsModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  /* the typed-but-uncommitted name; null = mirror the model. Reset whenever
     the selection or the open-target changes, so a half-typed rename never
     bleeds onto another draft's box. */
  const [nm, setNm] = useState<string | null>(null)
  const open = DRAFTSEDIT
  useEffect(() => {
    if (open && open.id) setSel(open.id)
    setNm(null)
  }, [open && open.di, open && open.id])
  if (!open) return <div className="modal" id="draftsModal" hidden />

  const di = open.di
  const d: any = DAYS[di]
  const list = dayDrafts(di)
  const selId = curDraftId(di)
  const t = list.find((x: any) => x.id === sel) || list[0] || null
  const isLive = !!t && t.id === selId

  const close = () => { setDraftsEdit(null); notify() }
  const commitName = () => {
    if (!t || nm == null) return
    if (nm.trim() === t.name) { setNm(null); return }
    if (draftRename(di, t.id, nm)) {
      /* renaming is schedule bookkeeping the undo stack should carry — the
         blobs ride histSnap, so one push makes it one ordinary undo step */
      HOOKS.histPush()
    } else {
      HOOKS.toast(nm.trim() ? 'Another draft on this day already has that name' : 'A draft needs a name', 'warn')
    }
    setNm(null); notify()
  }

  return (
    <div className="modal" id="draftsModal" onClick={e => { if ((e.target as HTMLElement).id === 'draftsModal') close() }}>
      <div className="modal-box" style={{ width: 460 }}>
        <div className="modal-head"><b>Drafts — {d ? d.dow : ''}</b><button className="x" id="draftsClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          {list.length
            ? <>
                <div className="tpl-tabs">
                  {list.map((x: any) => (
                    <button key={x.id} className={'tpl-tab' + (t && x.id === t.id ? ' on' : '')}
                      onClick={() => { commitName(); setSel(x.id); setNm(null) }}>{x.name}{x.id === selId ? ' ●' : ''}</button>
                  ))}
                </div>
                <input className="tpl-name" value={nm ?? (t ? t.name : '')} maxLength={MAX_DRAFT_NAME}
                  aria-label="Draft name"
                  onChange={e => setNm(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={e => { if (e.key === 'Enter') commitName() }} />
                <div className="wm-note" style={{ padding: '6px 0' }}>
                  {isLive
                    ? `"${t!.name}" is the live ${d ? d.dow : 'day'} — publishing the day publishes it.`
                    : `A stored alternative — Select makes it the live ${d ? d.dow : 'day'}. The selected draft is what publishes.`}
                </div>
              </>
            : <div className="sb-empty" style={{ padding: '14px 0' }}>
                No drafts on this day yet — choose "Duplicate this day" in the Drafts
                menu to plan an alternative over a copy.
              </div>}
        </div>
        <div className="modal-foot">
          <button className="abtn danger" style={{ marginRight: 'auto' }} disabled={!t || isLive}
            title={isLive ? 'This draft is the live day — switch to another draft first' : 'Delete this draft'}
            onClick={() => {
              if (!t || !draftDelete(di, t.id)) return
              const name = t.name
              /* deletion rides the undo stack like the rename above; any frozen
                 preview of the deleted draft falls out through prunePreviews'
                 daySnapOf test on the next paint */
              HOOKS.histPush()
              setSel(dayDrafts(di)[0] ? dayDrafts(di)[0].id : null)
              setNm(null)
              notify()
              /* the menu's own create/select actions already toast (board.ts's
                 draftDup/switchDraft) — deleting was the one silent one left */
              HOOKS.toast(`"${name}" draft deleted`, 'ok')
            }}>Delete draft</button>
          <button className="abtn" disabled={!t || isLive}
            title={isLive ? 'Already the live day' : 'Make this draft the live day'}
            onClick={() => { if (t && switchDraft(di, t.id)) notify() }}>Select</button>
          <button className="abtn primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}
