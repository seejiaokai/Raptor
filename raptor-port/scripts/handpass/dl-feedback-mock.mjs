/* DRAWINGS FOR THE DESIGN GUIDE'S POINT ON FEEDBACK (owner D850, D851, D853 — 14 Oct 26): "Input added" as built, and
   the same moment DRAWN with no note and the Scheduler Board's just-added mark on the new card (an injected style —
   never built); and three more notes that only say what the screen shows, each outlined in red where it stands.
   Pictures to decide from, not gates and not assertions.
     usage: DL_SHOTS=docs/mock/2026-10-14-feedback node scripts/handpass/dl-feedback-mock.mjs */
import { L, inputsCal, openAdd, fillForm } from './tb/w3/lib.mjs'

const w = await L.world('phone'), p = w.page
const noteUp = async () => { for (let i = 0; i < 80; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.textContent ? +getComputedStyle(t).opacity : 0 }); if (o >= 0.99) return true; await L.sleep(40) } return false }
const noteGone = async () => { for (let i = 0; i < 60; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.textContent ? +getComputedStyle(t).opacity : 0 }); if (o < 0.05) break; await L.sleep(120) } await L.sleep(120) }
const RED = 'outline:3px solid #f04646;outline-offset:5px;'
const outlineNote = on => p.evaluate(([on, css]) => { const t = document.getElementById('toastEl'); if (!t) return; if (on) t.style.cssText += ';' + css; else { t.style.outline = ''; t.style.outlineOffset = '' } }, [on, RED])
const noteText = () => p.evaluate(() => (document.getElementById('toastEl') || {}).textContent || '')
try {
  await inputsCal(w, '2026-07-13')

  /* 1 — "Input added": as built, the note outlined; then drawn with no note and the board's mark on the new card */
  await openAdd(w, '2026-07-21')
  await fillForm(w, { type: 'Meeting', person: 'bane', start: '09:00', end: '10:00', title: 'Safety meeting' })
  await w.press('#inpEditSave')
  await noteUp(); await L.sleep(260); await outlineNote(true)
  console.log('1 note:', await noteText())
  await L.pic(w, 'f1-input-added-before')
  await outlineNote(false)
  await p.evaluate(() => {
    const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'
    const card = document.querySelector('[data-testid="win-inputsday"] [data-testid^="idy-open"]')
    const box = card && (card.closest('.icard') || card)
    if (box) { box.style.boxShadow = 'inset 0 0 0 2px #1E86FF'; box.style.borderRadius = '10px' }
  })
  await L.sleep(120)
  await L.pic(w, 'f1-input-added-after')
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = ''; document.querySelectorAll('[data-testid="win-inputsday"] .icard, [data-testid="win-inputsday"] [data-testid^="idy-open"]').forEach(e => { e.style.boxShadow = '' }) })
  await noteGone()

  /* 2 — "Input updated": the card opened, its remark changed, saved */
  await w.press('[data-testid="win-inputsday"] [data-testid^="idy-open"]')
  await p.waitForSelector('#inpEditPop #inpEditRmk', { timeout: 6000 })
  const rm = p.locator('#inpEditPop #inpEditRmk').first()
  await rm.fill('Bring the new checklist')
  await w.press('#inpEditSave')
  await noteUp(); await L.sleep(260); await outlineNote(true)
  console.log('2 note:', await noteText())
  await L.pic(w, 'f2-input-updated')
  await outlineNote(false); await noteGone()
  await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)

  /* 3 — "Schedule updated": the Scheduler Board's ✓ Done */
  await L.go(w, 'editsched')
  await p.locator('#eWeek [data-sbday="1"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.waitForSelector('#schedBoard .sb-sec', { state: 'attached' }); await L.sleep(600)
  await p.evaluate(() => (document.querySelector('#sbDone') || document.querySelector('#sbClose')).click())
  await noteUp(); await L.sleep(260); await outlineNote(true)
  console.log('3 note:', await noteText())
  await L.pic(w, 'f3-schedule-updated')
  await outlineNote(false)
} finally {
  await L.close(w)
}
