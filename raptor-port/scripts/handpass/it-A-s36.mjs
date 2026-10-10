// Scenario 36 — the next-week peek (admin, desktop; the peek is drawn only above 820px wide).
import { launch, open, table, errs, people, shot, elShot, sleep, press, allRecs, closeAnyWin, gotoInputs, norm, recs } from './it-A-lib.mjs'
import { calDoor } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s36')
const { ctx, page } = await open(browser, 'desk')
const P = await people(page)
const say = []; let ok = true; const pics = []
const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
const d = calDoor()
const mk = async (iso, who, type, title, st, en, rmk) => {
  const before = new Set((await allRecs(page)).map(r => r.iid))
  await d.openNew(page, { iso, person: P[who], type, st, en, rmk }); if (title) await page.fill('#inpEditTitle', title); await d.submit(page); await closeAnyWin(page)
  return (await allRecs(page)).find(r => !before.has(r.iid))
}
const peekText = di => page.evaluate(di => { const p = document.querySelector(`#eWeek .day.peek[data-peek-day="${di}"]`); if (!p) return null; p.scrollIntoView({ inline: 'center', block: 'nearest' }); return p.innerText.replace(/\s+/g, ' ').trim() }, di)
const exposePeek = async () => {
  await page.evaluate(() => window.go('editsched')); await sleep(page, 700)
  for (let i = 0; i < 12; i++) {
    const vis = await page.evaluate(() => { const p = document.querySelector('#eWeek .day.peek'); if (!p) return false; const r = p.getBoundingClientRect(); return r.left < innerWidth - 40 })
    if (vis) break
    await press(page, page.locator('#weekNext')); await sleep(page, 350)
  }
  await sleep(page, 300)
}
try {
  const e1 = await mk('2026-07-22', 'Ranger', 'Event', 'Sports day', '14:00', '15:00', 'Bring boots')
  const e0 = await mk('2026-07-22', 'Anvil', 'Event', '', '16:00', '17:00', 'Bring boots')
  const o1 = await mk('2026-07-23', 'Ranger', 'OD', 'Overseas visit', null, null, 'Detachment')
  const o0 = await mk('2026-07-23', 'Anvil', 'OD', '', null, null, 'Detachment')
  // the demo week is 13-19 Jul; its next-week peek shows 20-26 Jul
  await exposePeek()
  const cw = await page.evaluate(() => window.CURWEEK)
  const nPeek = await page.locator('#eWeek .day.peek').count()
  need(nPeek >= 3, `the preceding week (${JSON.stringify(cw)}) shows ${nPeek} next-week peek days after its Sunday`)
  const w2 = await peekText(2), w3 = await peekText(3)
  say.push(`peek Wednesday mentions: ${JSON.stringify((w2 || '').match(/(SPORTS DAY|SPORTS AFTERNOON|EVENT|OVERSEAS VISIT|OD)/g))}; peek Thursday mentions: ${JSON.stringify((w3 || '').match(/(OVERSEAS VISIT|Overseas visit|OD)/g))}`)
  const pk0 = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day.peek[data-peek-day="2"] .pl-row.gr-frominput')].map(x => ({ n: (x.querySelector('.nm .ntx') || {}).textContent, k: (x.querySelector('.nm .nm-kind') || {}).textContent || null })))
  say.push(`the peek's Wednesday request rows (nothing published yet): ${JSON.stringify(pk0)}`)
  need(pk0.some(r => r.n === 'SPORTS DAY'), 'the peek names the titled Event SPORTS DAY')
  need(pk0.some(r => r.n === 'SPORTS DAY' && r.k === 'Event'), 'the peek keeps the small kind label (Event) under the titled name, as the week does')
  need(/Sports day|SPORTS DAY/.test(w2 || ''), 'the titled name is drawn')
  await page.locator('#eWeek .day.peek[data-peek-day="2"]').scrollIntoViewIfNeeded().catch(() => {})
  pics.push(await shot(page, 's36-1-peek-unpublished'))
  // cross into next week, publish Wednesday, retitle, go back
  await page.locator('#eWeek .day.peek[data-peek-day="2"]').click({ position: { x: 20, y: 20 } }); await sleep(page, 900)
  const cw2 = await page.evaluate(() => window.CURWEEK)
  say.push(`crossed into the week ${JSON.stringify(cw2)}`)
  const { signDay, publishDay, head } = await import('./dbrA-W1-lib.mjs')
  const signs = await signDay(page, 2); say.push(`sign-offs ${JSON.stringify(signs)}`)
  const pub = await publishDay(page, 2); say.push(`publish: ${JSON.stringify(pub)}`)
  const h1 = await head(page, 2); say.push(`Wednesday's head after publishing: ${JSON.stringify({ tag: h1.tag, pending: h1.pending, signed: h1.signed })}`)
  pics.push(await shot(page, 's36-2-published-next-week'))
  need(!!pub.pressed, 'the next week\'s Wednesday was signed and published through its own controls')
  await d.openSaved(page, e1)
  await page.fill('#inpEditTitle', 'Games afternoon'); await press(page, page.locator('#inpEditSave')); await sleep(page, 700)
  const h2 = await head(page, 2); say.push(`after the retitle, Wednesday's head: ${JSON.stringify({ tag: h2.tag, pending: h2.pending })}`)
  await closeAnyWin(page)
  // what the ISSUED face of that day says (View-only Sched) - and the edit week's working copy
  await page.evaluate(() => window.go('viewsched')); await sleep(page, 700)
  const issued = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="2"] .pl-row.gr-frominput')].map(x => ({ n: (x.querySelector('.nm .ntx') || {}).textContent, k: (x.querySelector('.nm .nm-kind') || {}).textContent })))
  say.push(`View-only Sched, Wednesday's request rows: ${JSON.stringify(issued)}`)
  need(issued.some(r => r.n === 'SPORTS DAY') && !issued.some(r => r.n === 'GAMES AFTERNOON'), 'the issued face of the published Wednesday still reads SPORTS DAY')
  pics.push(await shot(page, 's36-2b-issued-face'))
  // back to the preceding week and look at the peek
  await page.evaluate(w => window.loadWeek(w), cw); await sleep(page, 700)
  await exposePeek()
  const cw3 = await page.evaluate(() => window.CURWEEK)
  const q2 = await peekText(2)
  const pk = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day.peek[data-peek-day="2"] .pl-row.gr-frominput')].map(x => ({ n: (x.querySelector('.nm .ntx') || {}).textContent, k: (x.querySelector('.nm .nm-kind') || {}).textContent || null })))
  say.push(`the peek's Wednesday request rows: ${JSON.stringify(pk)}`)
  say.push(`back on week ${JSON.stringify(cw3)}; peek Wednesday mentions: ${JSON.stringify((q2 || '').match(/(SPORTS DAY|GAMES AFTERNOON|SPORTS AFTERNOON|EVENT|Sports day|Games afternoon)/gi))}`)
  need(/SPORTS DAY/i.test(q2 || '') && !/GAMES AFTERNOON/i.test(q2 || ''), 'the peek of the PUBLISHED Wednesday shows the issued name SPORTS DAY, not the live title GAMES AFTERNOON')
  await page.evaluate(() => { const p = document.querySelector('#eWeek .day.peek[data-peek-day="2"]'); if (p) p.scrollIntoView({ inline: 'center', block: 'nearest' }) }); await sleep(page, 400)
  pics.push(await shot(page, 's36-3-peek-published-retitled'))
  // cross and compare
  await page.locator('#eWeek .day.peek[data-peek-day="2"]').click({ position: { x: 20, y: 20 } }); await sleep(page, 900)
  const wk = await page.evaluate(() => { const r = [...document.querySelectorAll('#eWeek .day[data-day="2"] .pl-row.gr-frominput')].map(x => ({ n: (x.querySelector('.nm .ntx') || {}).textContent, k: (x.querySelector('.nm .nm-kind') || {}).textContent })); return r })
  say.push(`inside that week, Wednesday's request rows: ${JSON.stringify(wk)}`)
  need(wk.some(r => r.n === 'GAMES AFTERNOON'), 'inside the week the working copy shows GAMES AFTERNOON (with its pending change)')
  pics.push(await shot(page, 's36-4-inside-week'))
  // titled/untitled OD, and the untitled Event, in the peek (before publishing they were checked at step 1)
  say.push(`peek Thursday (OD days) before publishing: "${(w3 || '').slice(0, 260)}"`)
} catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's36-err').catch(() => {}) }
T.add({ n: 36, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
T.save()
await ctx.close()
// the phone: no peek is drawn at or below 820px
{
  const { ctx: c2, page: p2 } = await open(browser, 'phone')
  await p2.evaluate(() => window.go('editsched')); await sleep(p2, 700)
  const n = await p2.locator('#eWeek .day.peek').count()
  console.log('phone peek nodes:', n)
  const rows = new (await import('./it-A-lib.mjs')).table ? null : null
  await c2.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
