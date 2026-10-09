// Scenario 24 (extra look): the 40-character title on the Personal Inputs cards, week and Board, desktop and phone.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin } from './it-A-lib.mjs'
import { calDoor, boardDoor, closeBoardAny, T40 } from './it-A-doors.mjs'
const browser = await launch()
const out = []
for (const size of ['desk', 'phone']) {
  const { ctx, page } = await open(browser, size)
  const P = await people(page); const c = calDoor()
  const mk = async (who, title, st, en) => { const b = new Set((await allRecs(page)).map(r => r.iid)); await c.openNew(page, { iso: '2026-07-15', person: P[who], type: 'Event', st, en, rmk: 'Bring boots please' }); if (title) await page.fill('#inpEditTitle', title); await c.submit(page); await closeAnyWin(page); return (await allRecs(page)).find(r => !b.has(r.iid)) }
  const l1 = await mk('Basher', T40, '09:00', '10:00'), l0 = await mk('Cinch', '', '09:00', '10:00')
  for (const S of [{ n: 'week', pre: async () => { await page.evaluate(() => window.go('editsched')); await sleep(page, 600) }, root: '#eWeek .day[data-day="2"]' }, { n: 'Board', pre: async () => { await boardDoor(2).openBoard(page) }, root: '#schedBoard' }]) {
    await closeBoardAny(page); await S.pre()
    const vis0 = async () => page.locator(`${S.root} [data-inprow="${l1.iid}"]`).first().isVisible().catch(() => false)
    if (!(await vis0())) for (const f of await page.locator(`${S.root} .pl-fold, ${S.root} [data-pitog]`).all()) { const t = (await f.innerText().catch(() => '')).replace(/\s+/g, ' '); console.log('fold text', JSON.stringify(t)); if (/personal inputs/i.test(t) && /show/.test(t)) { await f.scrollIntoViewIfNeeded(); await f.evaluate(e => e.click()); await sleep(page, 300) } }
    console.log('folds', JSON.stringify(await page.locator(`${S.root} .pl-fold, ${S.root} [data-pitog]`).evaluateAll(a => a.map(e => e.textContent.replace(/\s+/g, ' ')))))
    const sel = `${S.root} [data-inprow="${l1.iid}"]`
    await page.locator(sel).first().scrollIntoViewIfNeeded(); await sleep(page, 300)
    const d = await page.locator(sel).first().evaluate(r => { const ty = r.querySelector('.sbi-ty') || r.querySelector('.nm .ntx'), k = r.querySelector('.nm-kind'), late = r.querySelector('.latechip'); const b = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)] }; const cell = r.querySelector('.itemcell') || r.querySelector('.nm'); return { name: ty.textContent.trim().length, nameBox: b(ty), clip: ty.scrollWidth - ty.clientWidth, kind: k && k.textContent, kindBox: b(k), lateBox: b(late), cellBox: b(cell), cellClip: cell ? cell.scrollWidth - cell.clientWidth : null, vw: innerWidth } })
    console.log(size, S.n, JSON.stringify(d))
    out.push({ size, S: S.n, d })
    await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(page, 200)
    await shot(page, `s24b-${size}-${S.n}-card`)
  }
  await ctx.close()
}
await browser.close()
