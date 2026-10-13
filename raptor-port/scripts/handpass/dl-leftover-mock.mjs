/* DRAWINGS FOR HIS THREE LEFTOVER QUESTIONS ([BATCH-14OCT-LEFTOVERS], 14 Oct 26) — before as built, after DRAWN INTO THE
   RUNNING APP by an injected style (never built): pictures to choose from, not gates and not assertions.
     Q1  on a phone a note raised while a window is open lies over the window's title and ✕ — drawn just under the head;
     Q3  the upchit and medical-clash questions' answers on the stray strip — drawn flat, as the OIL question's now are.
   (Q2, the cancelled input's CX tag beside its title, is drawn from the walker's picture — see the page's own note.)
     usage: DL_SHOTS=docs/mock/2026-10-14-leftovers node scripts/handpass/dl-leftover-mock.mjs */
import { L, inputsCal, openAdd, fillForm } from './tb/w3/lib.mjs'

const w = await L.world('phone'), p = w.page
const closeDay = async () => { await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300) }
const noteUp = async () => { for (let i = 0; i < 80; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.textContent ? +getComputedStyle(t).opacity : 0 }); if (o >= 0.99) return true; await L.sleep(40) } return false }
const hideNote = on => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
async function fileMed(type, from, to) {
  await openAdd(w, from)
  await fillForm(w, { type, person: 'bane', allday: true })
  if (to !== from) await p.locator(`#inpEdCal [data-cal="${to}"]`).click()
  await w.press('#inpEditSave')
}
const noDoc = async () => { await p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 }); await L.sleep(300); await w.press('[data-testid="docconf-nodoc"]') }
/* the answers flat: no patch, no line, no side room — what L1 did for the OIL question */
const FLAT = `
  [data-testid="upconf"] .seg, [data-testid="medclash"] .seg { background: none !important; border-bottom: 0 !important; padding: 0 !important; }
  [data-testid="medclash"] .upconf-left.medclash-row { flex-wrap: wrap !important; row-gap: 10px !important; }
  [data-testid="medclash"] .upconf-left.medclash-row .seg { margin-left: 0 !important; flex: 1 0 100% !important; gap: 6px !important; }
`
try {
  await inputsCal(w, '2026-07-13')

  /* Q1 — a note with a window open */
  await openAdd(w, '2026-07-21')
  await fillForm(w, { type: 'Meeting', person: 'bane', start: '09:00', end: '10:00', title: 'Safety meeting' })
  await w.press('#inpEditSave')
  await noteUp(); await L.sleep(260)
  await L.pic(w, 'q1-before')
  const y = await p.evaluate(() => { const x = document.querySelector('[data-testid="win-inputsday-x"]'); const head = x.closest('[class*="head"]') || x.parentElement; return Math.round(head.getBoundingClientRect().bottom) })
  await p.evaluate(y => { const t = document.getElementById('toastEl'); t.style.top = (y + 8) + 'px'; t.style.opacity = '1' }, y)
  await L.sleep(60)
  await L.pic(w, 'q1-after')
  console.log('q1 drawn; the window head ends at', y)
  await L.sleep(3200); await closeDay()

  /* Q3 — the medical-clash question, then the upchit question */
  await fileMed('ATT C', '2026-07-13', '2026-07-15'); await noDoc()
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300); await closeDay()
  await fileMed('ATT B', '2026-07-14', '2026-07-16')
  await Promise.race([p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }), p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 })])
  if (await p.locator('[data-testid="docconf"]').count()) { await w.press('[data-testid="docconf-nodoc"]'); await p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }) }
  await L.sleep(450); await hideNote(true)
  await L.pic(w, 'q3-medclash-before', { around: '[data-testid="medclash"] .airpop-box', pad: 30 })
  const st = await p.addStyleTag({ content: FLAT }); await L.sleep(200)
  await L.pic(w, 'q3-medclash-after', { around: '[data-testid="medclash"] .airpop-box', pad: 30 })
  await st.evaluate(e => e.remove())
  await p.locator('[data-testid="medclash"] .airpop-foot .abtn.ghost').click(); await L.sleep(300); await hideNote(false)
  await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {}); await L.sleep(300)
  const sw = p.locator('[data-testid="inped-swap-go"], [data-testid="inped-leave-go"]'); if (await sw.count()) await sw.first().click().catch(() => {})
  await closeDay()
  await fileMed('ATT B', '2026-07-17', '2026-07-18'); await noDoc()
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300); await closeDay()
  await openAdd(w, '2026-07-14')
  await p.selectOption('#inpEditPop #inpEditType', 'Upchit'); await p.selectOption('#inpEditPop #inpEditPerson', 'bane'); await L.sleep(300)
  await w.press('#inpEditSave'); await noDoc()
  await p.waitForSelector('[data-testid="upconf"]', { timeout: 8000 }); await L.sleep(450); await hideNote(true)
  await L.pic(w, 'q3-upchit-before', { around: '[data-testid="upconf"] .airpop-box', pad: 30 })
  await p.addStyleTag({ content: FLAT }); await L.sleep(200)
  await L.pic(w, 'q3-upchit-after', { around: '[data-testid="upconf"] .airpop-box', pad: 30 })
  console.log('q3 drawn')
} finally {
  await L.close(w)
}
