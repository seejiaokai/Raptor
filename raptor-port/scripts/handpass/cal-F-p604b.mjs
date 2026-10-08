import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ranger, echo, cutter, saber] = await L.ids(p, ['Ranger', 'Echo', 'Cutter', 'Saber'])
const pic = n => L.pic(p, `${TAG}-p604b-${n}`)
const recs = () => p.evaluate(() => window.INPUTS.filter(r => r.remarks && /^p604b/.test(r.remarks)).map(r => ({ cs: window.PEOPLE[r.person].cs, oil: r.oil, remarks: r.remarks, mod: r.mod, modAt: r.modAt })))
await L.be(p, ranger, 'member')
await L.openNew(p, '2026-07-25', { phone: PHONE })
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ranger, echo], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p604b one' })
await P(p.locator('#inpEditSave')); await L.sleep(500)
await L.answerOil(p, 'yes', { phone: PHONE }); await L.sleep(500)
const s0 = await recs()
const bar = () => p.locator('#inpCal .ib-bar').filter({ hasText: '+1' }).first()
const out = {}
for (const [nm, id] of [['Cutter', cutter], ['Echo', echo]]) {
  await L.be(p, id, 'member')
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await P(p.locator('[data-testid="win-inputsday-x"]'))
  await P(bar()); await L.sleep(700)
  const rv = p.locator('[data-testid="oil-revise"]')
  const info = await rv.evaluate(e => ({ vis: e.offsetParent !== null, disabled: e.disabled || e.getAttribute('aria-disabled'), txt: e.innerText, parent: e.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 120) }))
  await rv.scrollIntoViewIfNeeded()
  await pic(nm + '-oil-row')
  const hit = await rv.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); let a = e, pe = []; while (a && a !== document.body) { const c = getComputedStyle(a); if (c.pointerEvents === 'none' || a.inert || a.getAttribute('aria-disabled') === 'true') pe.push((a.id || a.className || a.tagName).toString().slice(0, 40) + ':' + c.pointerEvents + (a.inert ? ' inert' : '')); a = a.parentElement } return { landsOnButton: !!h && (h === e || e.contains(h)), landsOn: h ? (h.id || h.className || h.tagName).toString().slice(0, 50) : null, noPointerAncestors: pe } })
  info.hit = hit
  await L.toasts(p)
  /* a real finger/click first (Playwright's own actionability check says what is on top); then the keyboard */
  await rv.focus(); await p.keyboard.press('Enter'); await L.sleep(500)
  const sheet = await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 120) : null })
  let tAfter = '', sAfter = null
  if (sheet) {
    await pic(nm + '-oil-sheet')
    await L.answerOil(p, 'no', { phone: PHONE }); await L.sleep(600)
    tAfter = (await L.toasts(p)).join(' | ')
    sAfter = await recs()
  } else tAfter = (await L.toasts(p)).join(' | ')
  out[nm] = { info, sheet, tAfter, sAfter: sAfter && sAfter.map(r => [r.cs, JSON.stringify(r.oil)]) }
  for (const s of ['#inpEditCancel', '#inpEditClose']) { if (await p.locator(s + ':visible').count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(300); break } }
}
console.log(JSON.stringify({ s0: s0.map(r => [r.cs, JSON.stringify(r.oil)]), out }, null, 1))
console.log('errors', JSON.stringify(L.errors))
L.savePart('p604b-' + TAG)
await b.close()
