/* THE UPCHIT QUESTION AND THE MEDICAL-CLASH QUESTION WITHOUT THEIR HINTS (owner D848, 14 Oct 26 — "Delete all three but for
   this one is there a way to make it known that each day holds 1 status"; the rule: D846, the design guide's §1).
   Asserted on the built screen, each sheet reached by the screen's own controls (the walker W3's fixture — its helpers
   are borrowed): the foot holds its two buttons and no hint, the medical clash has no small print, and its heading
   carries the one fact he asked to keep.
     usage: DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/dl-sheets.mjs [phone|desk] */
import { L, inputsCal, openAdd, fillForm } from './tb/w3/lib.mjs'

const K = process.argv[2] === 'desk' ? 'desk' : 'phone'
const w = await L.world(K), p = w.page
const errs = []; p.on('pageerror', e => errs.push(String(e)))
const ok = (surface, key, expected, saw, pass) => { const s = typeof saw === 'string' ? saw : JSON.stringify(saw); L.row(`${surface} [${K}]`, key, expected, s, pass ? 'works' : 'FAIL'); console.log(pass ? 'works' : 'FAIL', '—', surface, '—', key, '—', s) }
const hideNote = on => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
const closeDay = async () => { await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300) }
/** what a question sheet says: its heading(s), every line of plain text under them, its foot */
const facts = sel => p.evaluate(sel => {
  const s = document.querySelector(sel); if (!s) return null
  const foot = s.querySelector('.airpop-foot')
  return {
    heads: [...s.querySelectorAll('.upconf-h')].map(e => e.textContent.trim()),
    hint: (s.querySelector('.upconf-need') || {}).textContent || '',
    smallPrint: [...s.querySelectorAll('.upconf-none')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
    foot: [...foot.children].filter(e => e.getBoundingClientRect().width > 1 && e.textContent.trim()).map(e => e.textContent.trim()),
    mainDisabled: !!(foot.querySelector('.abtn.primary') || {}).disabled,
    all: s.textContent.replace(/\s+/g, ' '),
  }
}, sel)
async function fileMed(type, from, to) {
  await openAdd(w, from)
  await fillForm(w, { type, person: 'bane', allday: true })
  if (to !== from) await p.locator(`#inpEdCal [data-cal="${to}"]`).click()
  await w.press('#inpEditSave')
}
const noDoc = async () => { await p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 }); await L.sleep(300); await w.press('[data-testid="docconf-nodoc"]') }

try {
  await inputsCal(w, '2026-07-13')
  /* the fixture: ATT C 13–15 Jul for Ranger, filed with "No document" */
  await fileMed('ATT C', '2026-07-13', '2026-07-15'); await noDoc()
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300); await closeDay()

  /* THE MEDICAL-CLASH QUESTION: ATT B 14–16 Jul over it */
  await fileMed('ATT B', '2026-07-14', '2026-07-16')
  await Promise.race([p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }), p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 })])
  if (await p.locator('[data-testid="docconf"]').count()) { await w.press('[data-testid="docconf-nodoc"]'); await p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }) }
  await L.sleep(450); await hideNote(true)
  const m = await facts('[data-testid="medclash"]')
  await L.pic(w, `sheet-${K}-1-medical-clash`, { around: '[data-testid="medclash"] .airpop-box', pad: 30 })
  ok('Medical-clash question', 'D848 — its heading carries the fact he kept', 'A day holds one status: choose who holds these days', m.heads.join(' | '), m.heads[0] === 'A day holds one status: choose who holds these days')
  ok('Medical-clash question', 'D848 — no hint in the foot, no small print', 'the foot is Cancel and Save; nothing under the answers; Save still waits', { foot: m.foot, hint: m.hint, smallPrint: m.smallPrint, saveWaits: m.mainDisabled },
    m.foot.join('/') === 'Cancel/Save' && !m.hint && !m.smallPrint.length && m.mainDisabled && !/Choose for each clash above|stay exactly as chosen/.test(m.all))
  await p.locator('[data-testid="medclash"] .airpop-foot .abtn.ghost').click(); await L.sleep(300)
  await hideNote(false)
  /* leave the unsaved form behind */
  await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {}); await L.sleep(300)
  const sw = p.locator('[data-testid="inped-swap-go"], [data-testid="inped-leave-go"]'); if (await sw.count()) await sw.first().click().catch(() => {})
  await closeDay()

  /* THE UPCHIT QUESTION: a later ATT B 17–18 on file, then an Upchit on 14 Jul */
  await fileMed('ATT B', '2026-07-17', '2026-07-18'); await noDoc()
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300); await closeDay()
  await openAdd(w, '2026-07-14')
  await p.selectOption('#inpEditPop #inpEditType', 'Upchit'); await p.selectOption('#inpEditPop #inpEditPerson', 'bane'); await L.sleep(300)
  await w.press('#inpEditSave'); await noDoc()
  await p.waitForSelector('[data-testid="upconf"]', { timeout: 8000 }); await L.sleep(450); await hideNote(true)
  const u = await facts('[data-testid="upconf"]')
  await L.pic(w, `sheet-${K}-2-upchit`, { around: '[data-testid="upconf"] .airpop-box', pad: 30 })
  ok('Upchit question', 'D848 — no hint in the foot', 'the foot is Cancel and Save upchit; Save upchit still waits; the heading over the entries still says to choose for each', { foot: u.foot, hint: u.hint, saveWaits: u.mainDisabled, heads: u.heads },
    u.foot.join('/') === 'Cancel/Save upchit' && !u.hint && u.mainDisabled && !/Choose Keep or Remove for each entry above/.test(u.all) && u.heads.some(h => /choose for each/i.test(h)))
  ok('The two sheets', 'no page error', 'none', errs.length ? errs.join(' | ') : 'none', !errs.length)
} finally {
  await L.close(w)
}
