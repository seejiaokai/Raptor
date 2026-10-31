/* THE GRADES WINDOW — THE SQUADRON'S OWN LIST OF LEAVE GRADES (the Leave War overhaul's M5a — D1234, D1486, D1229, D1233,
   D1490, D890, D641, D997; the build spec §2.2; reading 11; drawn `full/m5a/m5c-c1-grades`, its markup round 14's own —
   `full-r14-bal.mjs`, read by `full-m5a-balances.mjs`).

   An admin's window opened from the Balances page's "Grades…": each grade a grip, its name in a box, how many hold it, its
   "+36" box, a ✕; "+ Grade" at the foot. The app's own window (Sheet.tsx) in its non-blocking form, as the war's other
   windows (D641): dragged by its title, the page behind it still working; on a phone in the middle of the screen (D997).
   - A NAME saves on Enter or on leaving its box; two grades on the list cannot share one (the store's `gradeNameProblem`,
     its words at the box).
   - "+ DAYS" counts from the next 1 Jan (D1490 — `setGradeDays`): the days a 1 Jan already added stay as they were.
   - A DRAG by the grip shows ONE landing line a gap (D890 — the grid's rule: over the lower half of a row, the line on the
     top of the row below); the grip's ↑ / ↓ keys move it one place.
   - DELETE of a grade people hold asks first, naming how many; they become "No grade" from today, the 1 Jans before keep
     what it added (reading 11), and Undo brings it back (`deleteGrade`). One nobody holds goes at once.
   Every change is one command the top bar's Undo takes back (`lw.grades`). */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { addGrade, deleteGrade, gradeDaysNow, gradeHolders, gradeNameProblem, liveGrades, moveGrade, renameGrade, setGradeDays } from '../state/store'
import { FigBox } from './BalancesPage'
import { Sheet } from './Sheet'
import { usePhone } from './phone'
import { useVersion } from './useStore'

const people = (n: number) => (n === 1 ? '1 person' : `${n} people`)
/** what Delete asks first ("3 people hold Junior WSO: they become No grade") */
export const deleteAsk = (n: number, name: string) => `${n === 1 ? '1 person holds' : `${n} people hold`} ${name}: ${n === 1 ? 'he becomes' : 'they become'} No grade`
const daysProblem = (n: number) => (Number.isFinite(n) && n >= 0 && Number.isInteger(n * 2) ? null : 'Type the days added each 1 Jan, like 36')

/** A GRADE'S NAME BOX: saved on Enter or on leaving it; Escape puts the old name back (the window's own Escape waits for it). */
function NameBox({ id, name, testid, onSave }: { id: string; name: string; testid: string; onSave: (v: string) => string | null }) {
  const [text, setText] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const ref = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const revert = () => { setText(null); setErr(null) }
    el.addEventListener('lw-revert', revert)
    return () => el.removeEventListener('lw-revert', revert)
  }, [])
  const commit = () => {
    const t = text
    if (t === null || t.trim() === name) { setText(null); return }
    const why = onSave(t)
    setErr(why)
    if (!why) setText(null)
  }
  return (
    <span className={`gw-nmw${err ? ' bad' : ''}`}>
      <input
        ref={ref}
        className="gw-nm"
        data-testid={testid}
        data-dirty={text !== null ? '1' : undefined}
        type="text"
        aria-label={`Grade name: ${name}`}
        aria-invalid={err ? true : undefined}
        value={text ?? name}
        maxLength={30}
        onChange={e => { setText(e.target.value); if (err) setErr(null) }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
        onBlur={() => { if (err) { setText(null); setErr(null); return } commit() }}
      />
      {err && <span className="bp-err" role="alert" data-testid={`${testid}-err`} id={`gw-err-${id}`}>{err}</span>}
    </span>
  )
}

export function GradesSheet({ anchor, onClose }: { anchor: HTMLElement | null; onClose: () => void }) {
  useVersion()
  const phone = usePhone()
  const list = liveGrades()
  const [asking, setAsking] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ name: string; days: string; err: string | null } | null>(null)
  const [drag, setDrag] = useState<{ id: string; over: string | null; after: boolean } | null>(null)
  const focusGrip = useRef<string | null>(null)
  const addBtn = useRef<HTMLButtonElement | null>(null)
  const panel = () => document.querySelector<HTMLElement>('[data-testid="grades-sheet"]')

  /* WHERE IT OPENS: on a desktop under "Grades…", its right edge on the button's (the drawing); on a phone in the middle of
     the screen (balances.css — D997). The keyboard goes to its first grip. */
  useLayoutEffect(() => {
    const p = panel()
    if (!p) return
    if (!phone && anchor) {
      const r = anchor.getBoundingClientRect()
      p.style.left = `${Math.max(8, r.right - 470)}px`
      p.style.top = `${r.bottom + 8}px`
    } else { p.style.left = ''; p.style.top = '' }
    p.querySelector<HTMLElement>('.gw-grip')?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- placed and focused as it opens and when the screen changes size class; re-run on a new anchor it would take the keyboard back to the first grip mid-edit
  }, [phone])

  /* ESCAPE IN A BOX PUTS ITS OLD VALUE BACK FIRST, and only the next closes the window (the design guide §3: Escape closes
     what opened last). Heard before the window's own Escape (Sheet.tsx, on the document's capture), at the window's. */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const a = document.activeElement
      if (!(a instanceof HTMLInputElement) || !panel()?.contains(a)) return
      if (a.dataset.dirty) { e.stopPropagation(); e.preventDefault(); a.dispatchEvent(new Event('lw-revert')); return }
      if (a.closest('.gw-draft')) { e.stopPropagation(); e.preventDefault(); setDraft(null); addBtn.current?.focus() }
    }
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  }, [])

  /* after a move by the keys, the keyboard stays on the grip it moved */
  useEffect(() => {
    const id = focusGrip.current
    if (!id) return
    focusGrip.current = null
    panel()?.querySelector<HTMLElement>(`[data-gid="${id}"] .gw-grip`)?.focus()
  })

  const ids = list.map(g => g.id)
  const moveBy = (id: string, by: number) => {
    const i = ids.indexOf(id)
    if (i < 0 || i + by < 0 || i + by >= ids.length) return
    focusGrip.current = id
    moveGrade(id, i + by)
  }
  const gripKey = (e: ReactKeyboardEvent, id: string) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); moveBy(id, -1) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveBy(id, 1) }
  }

  /* THE DRAG (D890 — one landing line a gap; the grid's own reading, Matrix.tsx startRowDrag): the row under the pointer;
     over its lower half the line is drawn on the top of the row below, so a gap is one place; only under the last row is it
     drawn on a row's foot. The drop resolves "before X" in the order on screen. */
  const startDrag = useCallback((e: ReactPointerEvent, id: string) => {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    let cur: { over: string | null; after: boolean } = { over: null, after: false }
    setDrag({ id, ...cur })
    const hover = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y)
      let row = hit && (hit as Element).closest ? (hit as Element).closest<HTMLElement>('.gw-row[data-gid]') : null
      let over = row?.dataset.gid ?? null
      let after = false
      if (row) { const r = row.getBoundingClientRect(); after = r.height > 0 && y > r.top + r.height / 2 }
      if (row && after && over !== id) {
        let next = row.nextElementSibling
        while (next && !(next as HTMLElement).matches('.gw-row[data-gid]')) next = next.nextElementSibling
        if (next) { row = next as HTMLElement; over = row.dataset.gid ?? null; after = false }
      }
      if (over === id) { over = null; after = false }
      if (over !== cur.over || after !== cur.after) { cur = { over, after }; setDrag({ id, ...cur }) }
    }
    const move = (ev: PointerEvent) => hover(ev.clientX, ev.clientY)
    const end = (commit: boolean) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      setDrag(null)
      if (!commit || !cur.over) return
      const order = liveGrades().map(g => g.id)
      const from = order.indexOf(id), at = order.indexOf(cur.over)
      if (from < 0 || at < 0) return
      const to = cur.after ? order.length - 1 : from < at ? at - 1 : at
      if (to !== from) moveGrade(id, to)
    }
    const up = () => end(true)
    const cancel = () => end(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  }, [])

  const del = (id: string) => {
    if (gradeHolders(id) > 0) { setAsking(id); return }
    const i = ids.indexOf(id)
    deleteGrade(id)
    focusGrip.current = ids[i + 1] ?? ids[i - 1] ?? null
    if (!focusGrip.current) addBtn.current?.focus()
  }
  const sure = (id: string) => {
    const i = ids.indexOf(id)
    setAsking(null)
    deleteGrade(id)
    focusGrip.current = ids[i + 1] ?? ids[i - 1] ?? null
    if (!focusGrip.current) addBtn.current?.focus()
  }

  /* "+ Grade": a new row with its name box ready; it is added once it has a name (Enter, or the keyboard leaving the row) —
     a row left with no name goes again, nothing added */
  const addDraft = () => {
    const days = draft ? Number(draft.days.replace(/^\+/, '')) : 0
    const name = draft?.name ?? ''
    if (!name.trim()) { setDraft(null); return }
    const why = gradeNameProblem(name) ?? daysProblem(days)
    if (why) { setDraft(d => (d ? { ...d, err: why } : d)); return }
    if (addGrade(name, days)) setDraft(null)
    else setDraft(d => (d ? { ...d, err: 'Not saved' } : d))
  }

  return (
    <Sheet testid="grades-sheet" label="Grades" onClose={onClose} modal={false}>
      <div className="bidsheet-hd gw-hd">
        <b>Grades</b>
        <button type="button" className="x" data-testid="grades-close" aria-label="Close Grades" onClick={onClose}>✕</button>
      </div>
      <div className="gw-r h" aria-hidden="true">
        <span className="gp" /><span className="gw-nmh">GRADE</span><span className="n">HOLDS</span><span className="dh">AUTO + LVE ON 1 JAN</span><span className="xx" />
      </div>
      {list.map(g => {
        const n = gradeHolders(g.id)
        const over = drag && drag.over === g.id
        return (
          <div key={g.id}>
            <div className={`gw-r gw-row${drag?.id === g.id ? ' dragging' : ''}${over ? (drag!.after ? ' dragover after' : ' dragover') : ''}`} data-gid={g.id} data-testid={`grade-row-${g.id}`}>
              <button
                type="button"
                className="gp gw-grip"
                data-testid={`grade-grip-${g.id}`}
                aria-label={`Move ${g.name}: drag, or the up and down arrow keys`}
                style={{ touchAction: 'none' }}
                onPointerDown={e => startDrag(e, g.id)}
                onKeyDown={e => gripKey(e, g.id)}
              >⠿</button>
              <NameBox id={g.id} name={g.name} testid={`grade-name-${g.id}`} onSave={v => gradeNameProblem(v, g.id) ?? (renameGrade(g.id, v) ? null : 'Not saved')} />
              <span className="n" data-testid={`grade-holds-${g.id}`}>{people(n)}</span>
              <span className="gw-days">
                <FigBox value={gradeDaysNow(g)} plus label={`${g.name}: days added each 1 Jan`} testid={`grade-days-${g.id}`} save={v => daysProblem(v) ?? (setGradeDays(g.id, v) ? null : 'Not saved')} />
              </span>
              <button type="button" className="xx" data-testid={`grade-del-${g.id}`} aria-label={`Delete ${g.name}`} onClick={() => del(g.id)}>✕</button>
            </div>
            {asking === g.id && (
              <div className="gw-ask" role="alert" data-testid="grade-ask">
                <span>{deleteAsk(n, g.name)}</span>
                <button type="button" className="gw-yes" data-testid="grade-del-sure" autoFocus onClick={() => sure(g.id)}>Delete</button>
                <button type="button" className="gw-no" data-testid="grade-del-keep" onClick={() => { setAsking(null); panel()?.querySelector<HTMLElement>(`[data-testid="grade-del-${g.id}"]`)?.focus() }}>Keep</button>
              </div>
            )}
          </div>
        )
      })}
      {draft && (
        <div
          className="gw-r gw-draft"
          data-testid="grade-draft"
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) addDraft() }}
        >
          <span className="gp" />
          <span className={`gw-nmw${draft.err ? ' bad' : ''}`}>
            <input
              className="gw-nm"
              data-testid="grade-draft-name"
              type="text"
              aria-label="New grade's name"
              placeholder="Name"
              autoFocus
              maxLength={30}
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value, err: null })}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDraft() } }}
            />
            {draft.err && <span className="bp-err" role="alert" data-testid="grade-draft-err">{draft.err}</span>}
          </span>
          <span className="n" />
          <span className="gw-days">
            <input
              className="mth-in bp-bx gw-dd"
              data-testid="grade-draft-days"
              type="text"
              inputMode="text"
              aria-label="New grade: days added each 1 Jan"
              value={draft.days}
              onChange={e => setDraft({ ...draft, days: e.target.value, err: null })}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDraft() } }}
            />
          </span>
          <span className="xx" />
        </div>
      )}
      <div className="gw-add">
        <button type="button" ref={addBtn} className="gw-ad" data-testid="grade-add" onClick={() => { if (draft) addDraft(); else setDraft({ name: '', days: '+0', err: null }) }}>+ Grade</button>
      </div>
    </Sheet>
  )
}
