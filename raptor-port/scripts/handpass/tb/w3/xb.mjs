/* xb — W3: X4 (no medical document), X5 (upchit question), T1 on both, O5 (upchit question's answer pair).   node xb.mjs desk|phone
   Fixture, filed by the screen's own controls: ATT C 13-15 Jul and ATT B 17-18 Jul for Ranger, both with "No document";
   then an Upchit on 14 Jul (the 17-18 entry is the one "still on file after it"). */
import { L, inputsCal, openAdd, fillForm, headOf, judgeHead, rowOut, part } from './lib.mjs'
import { tabRound, t1rows } from './lib2.mjs'
const size = process.argv[2] || 'desk'
console.log('xb.mjs - W3 X4 X5 T1 O5 - ' + size)
const w = await L.world(size)
const p = w.page
const S = `[${size}]`
const head = async (scope, id, name) => {
  await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(300)
  const h = await headOf(w, scope), j = judgeHead(h)
  rowOut(`${id} ${name} ${S}`, 'head', "the ✕ in the head's top-right corner (right edge within 20px of the head's), not following the title; nothing in the head overlaps", j.saw, j.ok)
}
const hideToast = on => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
/** file a medical entry for Ranger on the day window: start day opened, end picked on the form's calendar */
async function fileMed(type, from, to) {
  await openAdd(w, from)
  await fillForm(w, { type, person: 'bane', allday: true })
  if (to !== from) await p.locator(`#inpEdCal [data-cal="${to}"]`).click()
  await w.press('#inpEditSave')
  await p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 }); await L.sleep(400)
}
const closeDay = async () => { await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300) }
try {
  await inputsCal(w, '2026-07-13')
  await part(w, `X4 No medical document ${S}`, 'head', 'the ✕ in the corner', async () => {
    await fileMed('ATT C', '2026-07-13', '2026-07-15')
    await head('[data-testid="docconf"]', 'X4', 'No medical document')
    await hideToast(true); await L.pic(w, `x04-${size}-no-medical-document`); await hideToast(false)
    if (!w.phone) t1rows(`X4 No medical document ${S}`, await tabRound(w, '[data-testid="docconf"]'))
    await w.press('[data-testid="docconf-nodoc"]')
    await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300)
    await closeDay()
  })
  await part(w, `fixture ${S}`, 'ATT B 17-18', 'a second medical entry, later', async () => {
    await fileMed('ATT B', '2026-07-17', '2026-07-18')
    await w.press('[data-testid="docconf-nodoc"]')
    await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300)
    await closeDay()
  })
  await part(w, `X5 Upchit question ${S}`, 'head', 'the ✕ in the corner', async () => {
    await openAdd(w, '2026-07-14')
    await p.selectOption('#inpEditPop #inpEditType', 'Upchit'); await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
    await L.sleep(300)
    await w.press('#inpEditSave')
    await p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 }); await w.press('[data-testid="docconf-nodoc"]')
    await p.waitForSelector('[data-testid="upconf"]', { timeout: 8000 }); await L.sleep(500)
    await head('[data-testid="upconf"]', 'X5', 'Upchit question')
    console.log('   upchit question reads:', (await p.locator('[data-testid="upconf"]').innerText()).replace(/\s+/g, ' '))
    await hideToast(true); await L.pic(w, `x05-${size}-upchit-question`)
    /* O5 — the answer pair's wrapper, `.seg` */
    const seg = await p.evaluate(() => [...document.querySelectorAll('[data-testid="upconf"] .seg')].map(e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return { bg: c.backgroundColor, padding: c.padding, borderBottom: `${c.borderBottomWidth} ${c.borderBottomStyle} ${c.borderBottomColor}`, w: Math.round(r.width), h: Math.round(r.height), btns: [...e.querySelectorAll('button')].map(b => b.textContent) } }))
    console.log('   O5 upchit .seg', JSON.stringify(seg))
    L.row(`O5 upchit question answer buttons ${S}`, 'the .seg wrapper (record, no PASS/FAIL)', 'computed background-color, padding, border-bottom of the element wrapping each pair', JSON.stringify(seg), seg.length ? 'RECORD' : 'NOT WALKED')
    const sb = await p.locator('[data-testid="upconf"] .seg').first().boundingBox()
    if (sb) await L.pic(w, `o05-${size}-upchit-answer-buttons-close-up`, { clip: { x: Math.max(0, sb.x - 60), y: Math.max(0, sb.y - 40), width: Math.min(w.S.w - Math.max(0, sb.x - 60), sb.width + 120), height: sb.height + 80 } })
    await hideToast(false)
    if (!w.phone) t1rows(`X5 Upchit question ${S}`, await tabRound(w, '[data-testid="upconf"]'))
  })
} finally { await L.close(w) }
