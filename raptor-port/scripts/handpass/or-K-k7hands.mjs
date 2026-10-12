// K7 hands check - on View-only Sched a right-click on a puck of the Meeting's row, a drag of it to empty space and a typed
// character on its time must write nothing (Saber, then Ranger).
import * as K from './or-K-lib.mjs'
const { fileInput, goView, shot, shotEl, inputsOf, reload, saveRes, errs, toast, toastMark, toastsSince } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const f = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], ph: ['allavail'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE })
const snapIn = () => p.evaluate(() => JSON.stringify(window.INPUTS.filter(r => /range brief/i.test(r.title || '')).map(r => [r.s, r.e, (r.people || []).map(e => e.p), r.remarks])))
const baseline = await snapIn()
async function hands(who) {
  await goView(p)
  if ((await p.evaluate(() => window.CURWEEK)) !== '13/07/2026') { await p.locator('button[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await p.waitForTimeout(900) }
  const row = p.locator('#vWeek .day:not(.peek) .sec-grnd .pl-row').filter({ hasText: /Range brief/i }).first()
  await row.scrollIntoViewIfNeeded()
  const puck = row.locator('.puck', { hasText: 'Hunter' }).first()
  const mk = await toastMark(p)
  await puck.click({ button: 'right' }); await p.waitForTimeout(500)
  const b = await puck.boundingBox()
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down(); await p.mouse.move(b.x + 40, b.y + 60, { steps: 4 }); await p.mouse.move(700, 800, { steps: 10 }); await p.waitForTimeout(150); await p.mouse.up(); await p.waitForTimeout(600)
  // a typed key on the time
  const t = row.locator('.t').first()
  await t.click().catch(() => {}); await p.keyboard.type('9').catch(() => {}); await p.keyboard.press('Tab'); await p.waitForTimeout(500)
  const now = await snapIn()
  const r = { who, toasts: await toastsSince(p, mk), unchanged: now === baseline, inputs: now, rowText: (await row.innerText()).replace(/\s+/g, ' ').trim() }
  console.log(who, JSON.stringify(r))
  await K.hideToast(p); await shot(p, `k7-hands-${who}`)
  return r
}
out.saber = await hands('saber')
await reload(p, 'us', 'us')
out.ranger = await hands('ranger')
out.errs = errs.slice(); saveRes('k7hands', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
