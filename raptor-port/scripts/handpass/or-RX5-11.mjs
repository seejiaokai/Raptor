// RX4-11: the unanswered Sat 18 Jul Training of two (as RX2-2 made it); the desktop Inputs List's "OIL?" button; the question's heading.
import * as L from './or-RX5-lib.mjs'
const { j } = L
const out = {}
const ISO = '2026-07-18', DIS = 5
const { ctx, page: p } = await L.open('ad', 'a', { dsf: 1 })
async function drag2(from, to) {
  const fb = await from.boundingBox(); if (!fb) throw new Error('drag2: no source box')
  const tb = await to.boundingBox(); if (!tb) throw new Error('drag2: no target box')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2, tx = tb.x + tb.width / 2, ty = tb.y + tb.height / 2
  await p.mouse.move(fx, fy); await p.mouse.down(); await p.mouse.move(fx + 6, fy + 6, { steps: 3 }); await p.mouse.move(tx, ty, { steps: 16 })
  await p.waitForTimeout(150); await p.mouse.move(tx + 1, ty + 1); await p.waitForTimeout(150); await p.mouse.up(); await p.waitForTimeout(700)
}
async function cancelOil() {
  const s = p.locator('[data-testid="oilconf"]')
  if (!(await s.count())) return false
  const btns = await s.evaluate(e => [...e.querySelectorAll('button')].map(b => (b.dataset.testid || '') + '|' + (b.getAttribute('aria-label') || '') + '|' + b.textContent.trim().slice(0, 20)))
  console.log('   question buttons:', j(btns))
  const c = s.locator('button.x[aria-label="Close"], #oilConfirmClose, [data-testid="oil-close"], [data-testid="oilconf-cancel"], [data-testid="oilconf-close"]').first()
  if (await c.count()) await c.click(); else await p.keyboard.press('Escape')
  await p.waitForTimeout(500)
  return true
}
const made = await L.fileInput(p, { type: 'Training', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '12:00'], title: 'OIL ask', oil: 'yes' })
const iid = made[0]?.iid; console.log('filed', j(made))
await L.toBoard(p, DIS)
const ri = await L.rowIdx(p, DIS, iid)
let row = L.boardRowEl(p, DIS, ri); await L.centre(row); await p.waitForTimeout(300)
let m = await L.toastMark(p)
await drag2(await L.rosterPuckOf(p, '#sbRoster', 'Tally'), row.locator('.puck').first())
out.q1 = await L.oilSheet(p); out.q1toast = await L.toastsSince(p, m)
console.log('Tally onto Ranger: toasts', out.q1toast, '| question:', out.q1)
await L.shot(p, 'rx4-11-1-question-tally-replaces')
out.cancel1 = await cancelOil()
row = L.boardRowEl(p, DIS, ri); await L.centre(row); await p.waitForTimeout(300)
m = await L.toastMark(p)
await drag2(await L.rosterPuckOf(p, '#sbRoster', 'Ranger'), row.locator('.addz').first())
out.q2 = await L.oilSheet(p); out.q2toast = await L.toastsSince(p, m)
console.log('Ranger onto +add: toasts', out.q2toast, '| question:', out.q2)
await L.shot(p, 'rx4-11-2-question-ranger-joins')
out.cancel2 = await cancelOil()
out.rec = await L.inputOf(p, iid); console.log('INPUT now:', j(out.rec))
out.oilField = await p.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return { oil: r.oil ?? null, people: (r.people || []).map(e => ({ cs: window.PEOPLE[e.p]?.cs, oil: e.oil ?? null })) } }, iid)
console.log('oil fields:', j(out.oilField))
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
// the opened day's card and the List
await L.toMonth(p, ISO); await L.openDay(p, ISO)
out.dayCards = await L.dayCardText(p); console.log('DAY CARDS', j(out.dayCards))
await L.shot(p, 'rx4-11-3-day-card')
await L.closeDay(p)
await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').click()
await p.locator('#inRangeAll').click(); await p.waitForTimeout(500)
const row2 = p.locator(`tr[data-iid="${iid}"]`)
await row2.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
out.rowText = (await row2.innerText()).replace(/\s+/g, ' '); out.rowButtons = await row2.locator('td.inact button').allInnerTexts()
console.log('LIST ROW:', out.rowText, '| buttons:', j(out.rowButtons))
await L.shot(p, 'rx4-11-4-list-row')
// press the row's OIL? button
const ob = row2.locator('td.inact button', { hasText: 'OIL?' }).first()
out.btnCount = await ob.count(); console.log('OIL? buttons on the row:', out.btnCount)
if (out.btnCount) {
  await ob.click(); await p.waitForTimeout(800)
  out.after = await p.evaluate(() => ({ oilconf: !!document.querySelector('[data-testid="oilconf"]'), editWin: !!document.querySelector('#inpEditPop, [data-testid="win-inputedit"]') }))
  out.question = await L.oilSheet(p)
  out.heading = await p.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); if (!s) return null; const h = s.querySelector('h1,h2,h3,h4,.win-ttl,.airpop-head,.oc-head,.oc-ttl,[class*=head],[class*=ttl],[class*=title]'); return { firstEl: h ? h.tagName + '.' + h.className + ' :: ' + h.innerText.replace(/\s+/g, ' ') : null, firstLines: s.innerText.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 6), titleAttr: s.getAttribute('aria-label') || s.getAttribute('title') } })
  console.log('AFTER PRESS:', j(out.after)); console.log('QUESTION text:', out.question); console.log('HEADING:', j(out.heading))
  await L.shot(p, 'rx4-11-5-question-from-list')
  out.buttons = await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] button, [data-testid="oilconf"] [role=radio], [data-testid="oilconf"] label')].map(b => (b.dataset.testid || '') + '|' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)))
  console.log('question controls:', j(out.buttons))
  // for comparison: the input's own window heading
  await p.locator('[data-testid="oilconf"] button.x[aria-label="Close"], [data-testid="oilconf-cancel"], [data-testid="oilconf-close"]').first().click().catch(() => p.keyboard.press('Escape'))
  await p.waitForTimeout(500)
  await L.openFromList(p, iid)
  out.winHead = await L.winPeople(p); console.log('INPUT WINDOW head:', j(out.winHead))
  await L.shot(p, 'rx4-11-6-input-window-head')
}
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('11', out)
await ctx.close(); await L.browser.close()
