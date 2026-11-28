// Re-walk R2 — the Leave War's Approvals "New" is kept per squadron. Everything by the app's own controls:
//  1. Saber, 142 picked: Leave War → "Bidding closed" chip → December opened → Apply; Approvals opened once (his visit).
//     149 picked: the same for 149's war. Back to 142.
//  2. Ranger (member, 142): Leave War, his own 9 Dec pressed, LL pressed — a request waiting. Osprey (member, 149): the same.
//  3. Saber: 142 picked, Leave War → Approvals: Ranger's request "New". Then View-only Sched, 149 picked, Leave War →
//     Approvals: Osprey's request must still be "New". Then 142 picked again with Approvals open: 142's marks seen, cleared.
// The grid is moved to a day with the page's own scroll-into-view (as the Leave War walks do); every change is a press.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, toastText } from '../walk/w1-view.mjs'
import { step, as, press, pageOn, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const T = id => `[data-testid="${id}"]`
const DAY = '2026-12-09'
const ids = (s, root) => s.page.evaluate(r => [...document.querySelectorAll(r + ' [data-testid]')].map(e => e.dataset.testid), root)
async function closeAll(s) {
  for (const id of ['bid-cancel', 'sel-cancel', 'daylist-close', 'closed-note-close', 'open-dates-close']) if (await vis(s, T(id))) await press(s, T(id))
  await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(300)
}
async function cell(s, pid, d) {
  const l = s.page.locator(T(`cell-${pid}-${d}`)).first()
  if (!(await l.count())) { note(`[${s.sz}] no cell ${pid} ${d}`); return false }
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(350)
  const b = await l.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(600); return true
}
async function openDecember(s, P, tag) {
  await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
  facts[`${P}-${tag}-chip-before`] = await text(s, T('open-chip'))
  await press(s, T('open-chip'))
  facts[`${P}-${tag}-od-ids`] = (await ids(s, 'body')).filter(i => /^od-/.test(i)).slice(0, 30)
  const m = s.page.locator(T('od-month-2026-12')).first()
  if (await m.count()) await press(s, T('od-month-2026-12'))
  else note(`[${s.sz}] no December in the open-dates window`)
  await shot(s, `${P}-${tag}-open-december.png`)
  if (await vis(s, T('od-apply'))) await press(s, T('od-apply'))
  await closeAll(s)
  facts[`${P}-${tag}-chip-after`] = await text(s, T('open-chip'))
}
const apprState = s => s.page.evaluate(() => {
  const P = document.querySelector('[data-testid="approvals-page"]'); if (!P) return null
  const nw = document.querySelector('[data-testid="appr-new"]')
  const lines = [...P.querySelectorAll('[data-testid^="appr-line-"]')].filter(l => l.getBoundingClientRect().height > 0)
  return { newChip: nw ? nw.textContent.replace(/\s+/g, ' ').trim() : null, lines: lines.length, dotted: lines.filter(l => l.querySelector('.appr-dot[aria-label="New"]')).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 50)) }
})
const warRows = s => s.page.evaluate(() => { const r = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)); return { count: r.length, first: r.slice(0, 3) } })
async function approvals(s) { await press(s, T('lw-tab-approvals')); await s.page.waitForSelector(T('approvals-page'), { state: 'visible', timeout: 10000 }); await s.page.waitForTimeout(700) }
async function bid(s, P, who, pid) {
  await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
  facts[`${P}-${who}-chip`] = await text(s, T('open-chip'))
  await cell(s, pid, DAY)
  facts[`${P}-${who}-picker-ids`] = (await ids(s, T('bid-picker'))).slice(0, 40)
  await shot(s, `${P}-${who}-bid-window.png`)
  if (!(await press(s, T('bid-LL'), `${P}-${who}-ll`))) return
  await s.page.waitForTimeout(500)
  // with no leave left (149's demo people hold 0), the window asks "Tap the same leave again to go ahead." — tapped again
  const ask = await text(s, T('bid-picker'))
  if (ask && /Tap the same leave again/.test(ask)) {
    facts[`${P}-${who}-asked`] = ask.match(/That takes[^.]*\.[^.]*\./)?.[0] || ask.slice(0, 120)
    await shot(s, `${P}-${who}-asked-again.png`, [T('bid-picker')])
    await press(s, T('bid-LL'), `${P}-${who}-ll2`); await s.page.waitForTimeout(500)
  }
  facts[`${P}-${who}-toast`] = await toastText(s)
  facts[`${P}-${who}-picker-open-after`] = await vis(s, T('bid-picker'))
  await closeAll(s)
  facts[`${P}-${who}-cell-after`] = await s.page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? c.textContent.replace(/\s+/g, ' ').trim() + ' | ' + c.className : null }, [pid, DAY])
  await shot(s, `${P}-${who}-bid-placed.png`)
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r3-${sz}`
    await signIn(s, 'ad', 'a')
    await step('saber opens December in 142 and 149, visits Approvals', async () => {
      await openDecember(s, P, '142')
      await approvals(s); facts[`${P}-visit142`] = await apprState(s)
      await navTo(s, 'View-only Sched'); await pick(s, '149')
      await openDecember(s, P, '149')
      await approvals(s); facts[`${P}-visit149`] = await apprState(s)
      await navTo(s, 'View-only Sched'); await pick(s, '142')
    })
    await as(s, 'us', 'us')
    await step('ranger bids', () => bid(s, P, 'ranger', 'bane'))
    await as(s, 'us9', 'us9')
    await step('osprey bids', () => bid(s, P, 'osprey', 'osp9'))
    await as(s, 'ad', 'a')
    await step('saber: 142 Approvals', async () => {
      facts[`${P}-saber-mark`] = await text(s, '#sqnMenuBtn')
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1000); await approvals(s)
      facts[`${P}-a142`] = await apprState(s)
      await shot(s, `${P}-a1-142-new.png`)
    })
    await step('saber: 149 Approvals after 142 was seen', async () => {
      await navTo(s, 'View-only Sched'); await pick(s, '149')
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1000); await approvals(s)
      facts[`${P}-a149`] = await apprState(s)
      await shot(s, `${P}-a2-149-still-new.png`)
    })
    await step('saber: 142 again, picked with Approvals open', async () => {
      await pick(s, '142'); await s.page.waitForTimeout(800)
      facts[`${P}-a142-again-page`] = await pageOn(s)
      if (!(await vis(s, T('approvals-page')))) await approvals(s)
      facts[`${P}-a142-again`] = await apprState(s)
      facts[`${P}-a142-again-rows`] = await warRows(s)
      await shot(s, `${P}-a3-142-seen.png`)
      await s.page.waitForTimeout(3000)
      facts[`${P}-a142-again-3s`] = await apprState(s); facts[`${P}-a142-again-3s-rows`] = await warRows(s)
      await press(s, T('lw-tab-grid')); await s.page.waitForTimeout(1200)
      facts[`${P}-a142-again-grid-rows`] = await warRows(s)
      await shot(s, `${P}-a3b-142-grid.png`)
      await navTo(s, 'View-only Sched'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
      facts[`${P}-a142-away-back-rows`] = await warRows(s)
      await approvals(s); facts[`${P}-a142-away-back`] = await apprState(s)
      await shot(s, `${P}-a3c-142-away-back.png`)
      await pick(s, '149'); await s.page.waitForTimeout(800)
      if (!(await vis(s, T('approvals-page')))) await approvals(s)
      facts[`${P}-a149-again`] = await apprState(s)
      await shot(s, `${P}-a4-149-seen.png`)
      await pick(s, '142')
    })
    await s.ctx.close()
  }
} finally { save('r3'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
