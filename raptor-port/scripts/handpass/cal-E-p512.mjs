// P5-12 — settings validate before changing either cut-off or filing permission.
import { launch, world, toInputs, shot, press, saveRows } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p512-${size}-${n}`
await toInputs(p)
const vc = () => p.evaluate(() => ({ lead: window.VCONF.inputLead, mode: window.VCONF.inputCutMode, wd: window.VCONF.inputCutWd, wk: window.VCONF.inputCutWeeks }))
const win = () => p.evaluate(() => { const e = document.querySelector('[data-testid="win-inputsset"]'); if (!e) return null; return { mode: e.querySelector('[data-testid="iset-mode-days"]')?.getAttribute('aria-pressed') ?? e.querySelector('[data-testid="iset-mode-days"]')?.className, lead: e.querySelector('[data-testid="iset-lead"]')?.value, file: e.querySelector('[data-testid="iset-memberfile"]')?.checked, example: e.querySelector('[data-testid="iset-example"]')?.innerText } })
const logicRows = async () => { await p.evaluate(() => window.go('logic')); await p.waitForTimeout(600); return p.evaluate(() => { const t = document.body.innerText; const m = t.match(/Members may file duties and commitments for other people: (on|off)/); const d = t.match(/A member's input is due ([^—]*?) before the week starts|A member's input is due ([^.—]*)/); return { switch: m ? m[1] : null, cut: d ? (d[0]).slice(0, 80) : null } }) }
const back = async () => { await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(600) }
res.start = { vc: await vc(), logic: await logicRows() }
L('start', JSON.stringify(res.start)); await back()
await p.locator('[data-testid="in-gear"]').click(); await p.waitForSelector('[data-testid="win-inputsset"]'); await p.waitForTimeout(300)
L('window opened:', JSON.stringify(await win()))
await shot(p, N('1-gear-window'))
// make BOTH changes, the cut-off invalid
await p.locator('[data-testid="iset-memberfile"]').click()          // switch off
await p.locator('[data-testid="iset-lead"]').fill('abc')
await p.waitForTimeout(200)
L('before Save (invalid):', JSON.stringify(await win()))
await shot(p, N('2-invalid-typed'))
await p.locator('[data-testid="iset-save"]').click(); await p.waitForTimeout(500)
const afterBad = { vc: await vc(), win: await win(), open: await p.locator('[data-testid="win-inputsset"]').count(), toast: await p.evaluate(() => [...document.querySelectorAll('[class*="toast"]')].map(e => e.innerText).join(' / ')), msg: await p.locator('[data-testid="win-inputsset"]').innerText().then(t => t.replace(/\n/g, ' | ').slice(0, 500)) }
L('after invalid Save:', JSON.stringify(afterBad)); res.afterBad = afterBad
await shot(p, N('3-invalid-saved'))
// is the filing permission really unchanged? read the Logic row (window stays up: close it with Cancel first and look)
await p.locator('[data-testid="iset-cancel"]').click(); await p.waitForTimeout(300)
const lg1 = await logicRows(); L('Logic rows after the failed Save + Cancel:', JSON.stringify(lg1), JSON.stringify(await vc())); res.logicAfterBad = lg1
await shot(p, N('3b-logic-after-bad'))
await back()
// correct it: lead 10, switch OFF, Save
await p.locator('[data-testid="in-gear"]').click(); await p.waitForSelector('[data-testid="win-inputsset"]'); await p.waitForTimeout(300)
L('window re-opened:', JSON.stringify(await win()))
await p.locator('[data-testid="iset-memberfile"]').click()
await p.locator('[data-testid="iset-lead"]').fill('10')
await p.locator('[data-testid="iset-save"]').click(); await p.waitForTimeout(500)
const afterGood = { vc: await vc(), open: await p.locator('[data-testid="win-inputsset"]').count() }
L('after valid Save:', JSON.stringify(afterGood)); res.afterGood = afterGood
await shot(p, N('4-valid-saved'))
const lg2 = await logicRows(); L('Logic rows after the valid Save:', JSON.stringify(lg2)); res.logicAfterGood = lg2
await shot(p, N('5-logic-after-good'))
// open the same window through each Logic row's button
const btns = p.locator('.lgopen', { hasText: 'Inputs calendar settings' })
const nb = await btns.count(); L('Logic "Inputs calendar settings…" buttons:', nb)
const doors = []
for (let i = 0; i < nb; i++) {
  await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click(); await p.waitForSelector('[data-testid="win-inputsset"]'); await p.waitForTimeout(300)
  const st = await win(); doors.push(st); L('door', i, JSON.stringify(st))
  await shot(p, N('6-logic-door-' + i))
  await p.locator('[data-testid="iset-cancel"]').click(); await p.waitForTimeout(300)
}
res.doors = doors
// separate Undo steps
await back()
const u0 = await vc()
const lgU = []
for (let i = 1; i <= 3; i++) {
  const can = await p.evaluate(() => !document.getElementById('undoBtn').disabled)
  if (!can) { L('Undo not available at step', i); break }
  await p.locator('#undoBtn').click(); await p.waitForTimeout(500)
  const l = await logicRows(); const v = await vc(); lgU.push({ i, v, l }); L('Undo #' + i, JSON.stringify(v), JSON.stringify(l))
  await shot(p, N('7-undo-' + i)); await back()
}
res.undo = lgU
L('errors', JSON.stringify(w.errors))
saveRows('p512-' + size, [{ log, res, errors: w.errors }])
await b.close()
