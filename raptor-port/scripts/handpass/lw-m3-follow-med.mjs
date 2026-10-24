// M3 follow-ups — [MED-ADD-RIGHT-FLASH] (his D1300): on a desktop (1440×900, and his PC's 1229×600 of page at 125%) the
// Medical tab's "+ Medical" and the window it opens; a press on a card behind the open window (the walk lessons' 4); a
// medical input filed through it, its card's mark; a phone filing the same; and the Inputs tab's "+ Input" pictured for the
// same suggestion. Written as the RIGHT behaviour. Usage: node lw-m3-follow-med.mjs <tag>
import * as L from './lw-m3-follow-lib.mjs'
const tag = process.argv[2] || 'after'
const r = (P, sel) => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom) } }, sel)
const ids = P => P.locator('.medcard').evaluateAll(els => els.map(e => e.dataset.medcard))

async function fileAttC(w, P) {
  const win = P.locator('[data-testid="win-inputedit"]')
  for (let i = 0; i < 24 && !(await P.locator('#inpEdCal [data-iso="2026-07-12"]').count()); i++) {
    const t = (await P.locator('#inpEdCal .dcal-title').first().textContent()) || ''
    await P.locator(`#inpEdCal button[aria-label="${/2027|Aug|Sep|Oct|Nov|Dec/.test(t) ? 'Previous' : 'Next'} month"]`).click()
  }
  await P.locator('#inpEdCal [data-iso="2026-07-12"]').click()
  await P.locator('#inpEdCal [data-iso="2026-07-15"]').click()
  await win.locator('.docfield input[type=file]').first().setInputFiles(L.pdfPath('med-walk.pdf'))
  await P.waitForTimeout(300)
  await P.locator('#inpEditSave').click()
}

for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['pc125', { width: 1229, height: 600 }], ['phone', null]]) {
  const w = await L.newCtx(vp ? 'desk' : 'phone')
  const P = w.page
  if (vp) await P.setViewportSize(vp)
  await L.signIn(w, 'admin')
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(700)
  await P.click('#inMedBtn'); await P.waitForTimeout(700)
  const btn = await r(P, '#medNew'), row = await r(P, '#medView .ic-head'), asof = await r(P, '#medCalBtn')
  const atRight = vp ? Math.abs(row.r - btn.r) <= 1 && btn.l > asof.r : Math.abs(btn.l - row.l) <= 1 && btn.r < asof.l
  L.rec(`M1 "+ Medical" ${vp ? 'at the right end of its row' : 'first in its row (a phone)'}`, name, atRight ? 'PASS' : 'FAIL', `button ${JSON.stringify(btn)} row ${JSON.stringify(row)}`, [`m1-${name}`])
  await L.shot(w, `m1-${name}`)
  const had = await ids(P)
  await L.press(w, '#medNew'); await P.waitForTimeout(700)
  const win = await r(P, '[data-testid="win-inputedit"]')
  const under = await P.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(); return [...document.querySelectorAll('.medcard')].filter(c => c.getBoundingClientRect().right > w.left - 4).length })
  if (vp) L.rec('M2 the window stands at the right, every card clear of it', name, win.r > vp.width - 40 && under === 0 ? 'PASS' : 'FAIL', `window ${JSON.stringify(win)}, cards under it ${under}`, [`m2-${name}`])
  await L.shot(w, `m2-${name}`)
  /* the walk lessons' 4: a press on the page behind the open window — a card — and what then shows */
  if (vp) {
    await P.locator('.medsec.med-down .medcard').first().click(); await P.waitForTimeout(600)
    const viewer = await L.vis(P, '.docviewbox, [data-testid="docview"]')
    const formUp = await L.vis(P, '[data-testid="win-inputedit"]')
    L.rec('M3 a card pressed behind the open window opens its document; the new input\'s window stays as it was', name, 'RECORD', `viewer up ${viewer}, input window still up ${formUp}`, [`m3-${name}`])
    await L.shot(w, `m3-${name}`)
    if (viewer) { await P.keyboard.press('Escape'); await P.waitForTimeout(300) }
    if (!(await L.vis(P, '[data-testid="win-inputedit"]'))) { await L.press(w, '#medNew'); await P.waitForTimeout(600) }
  }
  await fileAttC(w, P)
  await P.waitForTimeout(300)
  await L.shot(w, `m4-saved-${name}`)
  const now = await ids(P), fresh = now.filter(x => !had.includes(x))
  const card = fresh.length === 1 ? `.medcard[data-medcard="${fresh[0]}"]` : null
  const lit = card && await P.locator(card).evaluate(e => ({ cls: e.className, shadow: getComputedStyle(e).boxShadow, inView: (() => { const b = e.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight })() }))
  const note = await P.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { text: t.textContent, op: getComputedStyle(t).opacity } : null })
  await P.waitForTimeout(1500)
  const note2 = await P.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { text: t.textContent, op: getComputedStyle(t).opacity } : null })
  L.rec('M4 the card filed wears the just-added mark, in view, and no "Input added" note on screen', name,
    lit && /innew/.test(lit.cls) && lit.inView && /30, 134, 255/.test(lit.shadow) && (!note2 || note2.op === '0' || !/Input added/.test(note2.text)) ? 'PASS' : 'FAIL',
    `new cards ${fresh.length}; ${JSON.stringify(lit)}; note at once ${JSON.stringify(note)}, at 1.5s ${JSON.stringify(note2)}`, [`m4-saved-${name}`])
  if (vp && name === 'desk') {
    await P.click('#inMemberMode'); await P.waitForTimeout(400); await P.click('#inListBtn'); await P.waitForTimeout(500)
    await L.shot(w, 'm5-input-list-desk')
    await L.press(w, '#inNew'); await P.waitForTimeout(700)
    L.rec('M5 (for the suggestion) "+ Input" on the desktop list, and where its window opens', name, 'RECORD', `button ${JSON.stringify(await r(P, '#inNew'))}, window ${JSON.stringify(await r(P, '[data-testid="win-inputedit"]'))}`, ['m5-input-list-desk', 'm5-input-open-desk'])
    await L.shot(w, 'm5-input-open-desk')
  }
  console.log('ERRS', name, w.errs.length ? w.errs.join('\n') : 'none')
  await w.ctx.close()
}
await L.closeBrowser()
console.log(`\n${L.results.length} lines, ${L.results.filter(x => x.verdict === 'FAIL').length} FAIL`)
