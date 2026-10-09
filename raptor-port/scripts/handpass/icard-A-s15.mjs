import { launch, openDay, press, shot, cardFacts, toList, judge, saveRows, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const BASE = process.env.LOOK_URL || 'http://localhost:4231/'
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
p.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 300)))
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)) })
p.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`) })
// the browser's own clock, through Playwright's clock API only: Mon 1 Jun 2026, noon - before the cut-off (due by the end of Mon 29 Jun for the week of 13 Jul)
let clockOk = true
try { await ctx.clock.install({ time: new Date('2026-06-01T12:00:00') }) } catch (e) { clockOk = false; console.log('clock install failed', String(e).slice(0, 200)) }
if (!clockOk) { judge(15, 'phone 390', 'admin', 'NOT RUN', 'the Playwright clock API could not be installed: ' ); process.exit(0) }
await p.goto(BASE + '?fresh=1')
await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day')
const now1 = await p.evaluate(() => new Date().toISOString().slice(0, 16))
console.log('browser clock now:', now1)
const probs = []; const pics = []; const logs = [`clock at filing ${now1}`]
// 1. a shared Meeting for Anvil + Basher on Tue 14 Jul, filed before the cut-off
await openDay(p, '2026-07-14', T)
await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'Meeting')
await press(T, p.locator(`${WIN} [data-testid="pp-several"]`))
for (const cs of ['Anvil', 'Basher']) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(T, b) }
const sab = p.locator(`${WIN} [data-pp="${await csId(p, 'Saber')}"]`); if ((await sab.getAttribute('aria-pressed')) === 'true') await press(T, sab)
await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:00'); await p.fill('#inpEditOwnTitle', 'ZC shared')
await saveWin(p, T, 'no')
const before = await recAll(p, { title: 'ZC shared' })
logs.push(`filed: ${before.length} records`)
await openDay(p, '2026-07-14', T); await p.waitForTimeout(300)
let cards = (await cardFacts(p, DAYWIN, 'idy')).filter(c => c.title === 'ZC shared')
logs.push(`before the cut-off: day card ${JSON.stringify(cards.map(c => [c.who, c.late]))}`)
pics.push(await shot(p, '15-phone-day-before-cutoff'))
if (cards.length !== 1 || cards[0].late) probs.push('the card filed before the cut-off already shows LATE or is not one card: ' + JSON.stringify(cards.map(c => [c.who, c.late])))
await p.keyboard.press('Escape'); await p.waitForTimeout(250)
// 2. move the browser clock past the cut-off (Playwright clock API only): to Wed 1 Jul
await ctx.clock.setSystemTime(new Date('2026-07-01T12:00:00'))
const now2 = await p.evaluate(() => new Date().toISOString().slice(0, 16))
logs.push(`clock after fastForward ${now2}`)
console.log('browser clock now:', now2)
if (!/^2026-07-01/.test(now2)) probs.push('the clock did not move as asked: ' + now2)
// 3. add Cinch through the saved window, touching nothing else
await openDay(p, '2026-07-14', T)
const card = p.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'ZC shared' }).first()
await card.locator('[data-testid="idy-title"]').tap(); await p.locator(WIN).waitFor()
const ci = p.locator(`${WIN} [data-pp="${await csId(p, 'Cinch')}"]`); await ci.scrollIntoViewIfNeeded(); await ci.tap()
await saveWin(p, T, 'no')
await p.waitForTimeout(500)
const after = await recAll(p, { title: 'ZC shared' })
logs.push(`after adding Cinch: ${after.length} records`)
if (after.length !== 3) probs.push(`adding Cinch left ${after.length} records (3 expected)`)
// 4. the cards
async function check(label, root, tid, go) {
  await go()
  const c = (await cardFacts(p, root, tid)).filter(x => x.title === 'ZC shared')
  const sel = `${root} [data-testid="${tid}-row-${c[0] && c[0].iid}"]`
  if (c.length !== 1) { probs.push(`${label}: ${c.length} cards`); return }
  const lates = await p.locator(`${sel} [data-testid="${tid}-late"]`).count()
  logs.push(`${label}: who "${c[0].who}", LATE buttons ${lates}`)
  if (lates !== 1) probs.push(`${label}: ${lates} LATE buttons (one expected)`)
  else {
    await p.locator(sel).scrollIntoViewIfNeeded()
    await press(T, p.locator(`${sel} [data-testid="${tid}-late"]`)); await p.waitForTimeout(300)
    const note = await p.locator(`${sel} [data-testid="${tid}-latenote"]`).innerText().catch(() => null)
    pics.push(await shot(p, `15-phone-${label}-late-pressed`))
    logs.push(`${label} LATE explanation: "${note}"`)
    if (!note) probs.push(`${label}: no explanation`)
    else {
      if (!/Cinch/.test(note)) probs.push(`${label}: the explanation does not name Cinch: "${note}"`)
      if (/Anvil|Basher/.test(note)) probs.push(`${label}: the explanation names a person who was on time: "${note}"`)
      if (/everyone|everybody|all /i.test(note)) probs.push(`${label}: the explanation says everybody: "${note}"`)
    }
  }
}
await check('day', DAYWIN, 'idy', async () => { await openDay(p, '2026-07-14', T); await p.waitForTimeout(300) })
await p.keyboard.press('Escape'); await p.waitForTimeout(250)
await check('list', '#inList', 'inl', async () => { await toList(p, T) })
// undo / redo of the main save (adding Cinch)
await press(T, p.locator('#undoBtn')); await p.waitForTimeout(500)
const u = (await recAll(p, { title: 'ZC shared' })).length
await press(T, p.locator('#redoBtn')); await p.waitForTimeout(500)
const r = (await recAll(p, { title: 'ZC shared' })).length
logs.push(`Undo -> ${u}, Redo -> ${r}`)
if (u !== 2 || r !== 3) probs.push(`Undo/Redo of adding Cinch: ${u} then ${r} records (2 then 3 expected)`)
console.log(logs.join('\n'))
judge(15, 'phone 390', 'admin (Playwright clock moved: 1 Jun -> 1 Jul 2026)', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || logs.join(' ## '), pics)
await ctx.close()
await browser.close()
saveRows('s15')
console.log('ERRS', JSON.stringify(errs))
