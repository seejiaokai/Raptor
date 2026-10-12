// RX2-7: a refused time on one man's Unavailable row changes nothing.
import { open, shot, errs, browser, saveRes, fileInput, toWeek, toast, toastMark, toastsSince, unavailRows, calRead, inputsOf, sleep, become, bellRead, csId } from './or-RX2-lib.mjs'
const R = {}
const DI = 2
const { ctx, page: p } = await open('ad', 'a', { fresh: false })
R.filed = await fileInput(p, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: '2026-07-15', to: '2026-07-15', timed: ['08:00', '12:00'] })
const undoState = () => p.evaluate(() => { const b = document.getElementById('undoBtn'); const r = document.getElementById('redoBtn'); return { undo: b ? { title: b.getAttribute('title'), disabled: b.disabled, label: b.getAttribute('aria-label') } : null, redo: r ? { title: r.getAttribute('title'), disabled: r.disabled } : null } })
const bells = async tag => { const o = {}; for (const [cs, role] of [['Drifter', 'member'], ['Hex', 'member'], ['Hunter', 'member'], ['Saber', 'admin']]) { await become(p, cs, role); const b = await bellRead(p, null); o[cs] = { lit: b.state?.lit, lines: (b.list?.lines || []).map(l => `${l.name} ${l.day} — ${l.what} (${l.unread ? 'new' : 'read'})`), empty: b.list?.empty } } return o }
const readAll = async tag => {
  const o = {}
  o.inputs = await inputsOf(p)
  o.inputs = o.inputs.filter(r => r.type === 'LL' && /Jul 15/.test(r.date))
  await toWeek(p)
  o.unav = (await unavailRows(p, '#eWeek', DI)).filter(t => /Drifter|Hex|Hunter/.test(t))
  await p.locator('#eWeek .day:not(.peek)').nth(DI).locator('.sec-unav').scrollIntoViewIfNeeded()
  await p.locator('#eWeek .day:not(.peek)').nth(DI).locator('.sec-unav').screenshot({ path: `docs/img/handpass/2026-10-12-one-rule/RX2/rx2-7-${tag}-unav.png` })
  const c = await calRead(p, '2026-07-15', `rx2-7-${tag}-cal`)
  o.calCards = c.cards.filter(t => /LL/.test(t))
  await toWeek(p)
  o.undo = await undoState()
  return o
}
R.before = await readAll('0-before')
R.bellsBefore = await bells('before')
await become(p, 'Saber', 'admin')
await toWeek(p)
const hunter = await csId(p, 'Hunter')
const box = p.locator('#eWeek .day:not(.peek)').nth(DI).locator(`[data-inp$="~${hunter}.str"]`).first()
R.boxCount = await box.count()
await box.scrollIntoViewIfNeeded()
R.boxValueBefore = await box.evaluate(e => e.value ?? e.textContent)
await shot(p, 'rx2-7-1-before-typing')
const m = await toastMark(p)
await box.click(); await sleep(150)
await p.keyboard.press('Control+A'); await p.keyboard.type('12:00'); await p.keyboard.press('Tab')
await sleep(900)
R.toasts = await toastsSince(p, m)
R.toastNow = await toast(p)
R.boxValueAfter = await box.evaluate(e => e.value ?? e.textContent).catch(() => 'gone')
await shot(p, 'rx2-7-2-after-typing')
R.after = await readAll('3-after')
R.bellsAfter = await bells('after')
R.errs = errs.slice()
saveRes('RX2-7', R)
console.log(JSON.stringify(R, null, 1))
await ctx.close(); await browser.close()
