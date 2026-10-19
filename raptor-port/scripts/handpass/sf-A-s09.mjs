import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, chips, summ, pressChip, waveShot, rec, roLook, dayBadge, login } from './sf-A-lib.mjs'
console.log('sf-A-s09 v1')
const b = await launch()
const DI = 5
const { ctx, p } = await ctxOpen(b, 's09')

const seatAll = async (di, gi) => {
  const w = await wave(p, di, gi)
  const spec = []
  w.f.forEach((f, li) => f.ac.forEach((a, ai) => spec.push([li, ai])))
  return seat(p, di, gi, spec)
}

/* the next week first: Monday Jul 20 gets an SC wave with AM R typed, so the peek has something to show */
await go(p, 'editsched')
await p.locator('#page-editsched [data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await sleep(1500)
const giN = await addStandby(p, 0, 'sc')
await seat(p, 0, giN, [[0, 0], [0, 1], [0, 2], [0, 3]])
await openBoard(p, 0)
await bType(p, bf(0, giN, 0, 'rl'), '0630')
await closeBoard(p)
console.log('next week set: R', await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].rl, [0, giN]))
await go(p, 'editsched')
await p.locator('#page-editsched [data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await sleep(1500)

/* Saturday: SC (AM R typed, PM one SPARE ticked by hand), AVALON standing by, BB standing by */
const gSC = await addStandby(p, DI, 'sc'); await seatAll(DI, gSC)
const gAV = await addStandby(p, DI, 'avalon'); const sAV = await seatAll(DI, gAV)
const gBB = await addStandby(p, DI, 'bb'); const sBB = await seatAll(DI, gBB)
console.log('waves', gSC, gAV, gBB, 'seated AV', JSON.stringify(sAV), 'BB', JSON.stringify(sBB))
const wAV = await wave(p, DI, gAV), wBB = await wave(p, DI, gBB)
console.log('AV', JSON.stringify(wAV).slice(0, 500)); console.log('BB', JSON.stringify(wBB).slice(0, 500))
await openBoard(p, DI)
await bType(p, bf(DI, gSC, 0, 'rl'), '0630')
await pressChip(p, `${DI}.${gSC}.1.2`)
const L = async (gi, li, root) => (await chips(p, DI, gi, li, root)).map(c => c.chips.length ? (c.chips.some(x => x.on) ? (c.chips.some(x => x.tag === 'BUTTON') ? 'L*' : 'L') : (c.chips.some(x => x.tag === 'BUTTON') ? 'd' : 'x')) : '-').join('')
const shape = async root => ({ scAM: await L(gSC, 0, root), scPM: await L(gSC, 1, root), av: await L(gAV, 0, root), bb: await L(gBB, 0, root) })
const board = await shape('#schedBoard')
console.log('board shape', JSON.stringify(board))
const pBoard = await waveShot(p, DI, gSC, 'A-9-1-board-SC')
await waveShot(p, DI, gAV, 'A-9-1-board-AVALON'); await waveShot(p, DI, gBB, 'A-9-1-board-BB')
rec('9', 'Scheduler Board (desktop, admin): SC AM R typed, SC PM one SPARE ticked, AVALON and BB standing by', 'L* = lit and pressable, L = lit not pressable, d = dashed button. AM: all four lit (not pressable); PM: only the ticked SPARE lit and pressable, the rest dashed; AVALON and BB all dashed', JSON.stringify(board), board.scAM === 'LLLL' && board.scPM === 'ddL*d' && /^d+$/.test(board.av) && /^d+$/.test(board.bb) ? 'PASS' : 'FAIL', pBoard)
/* duty desks never carry a chip */
const dutyChips = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .saflies')].filter(e => e.closest('.dsec, .duty, [data-dwave], .sb-duty')).length)
const allChipsN = await p.evaluate(() => document.querySelectorAll('#schedBoard .saflies').length)
console.log('duty chips', dutyChips, 'all chips', allChipsN)
await closeBoard(p)

/* Edit Schedule's week */
await go(p, 'editsched')
const week = await shape('#eWeek')
const weekBtn = await p.locator('#eWeek button.saflies:visible').count(), weekDash = await p.locator('#eWeek .saflies:not(.on):visible').count(), weekLit = await p.locator('#eWeek .saflies.on:visible').count()
const wl = p.locator('#eWeek .go.sa-sc', { has: p.locator(`[data-sarole="${DI}.${gSC}.0.0"]`) }).first()
await wl.scrollIntoViewIfNeeded(); await sleep(200)
const pw = await shot(p, 'A-9-2-week-SC', wl)
const wl2 = p.locator('#eWeek .go', { has: p.locator(`[data-sarole="${DI}.${gAV}.0.0"]`) }).first(); await wl2.scrollIntoViewIfNeeded(); await shot(p, 'A-9-2-week-AVALON', wl2)
const heads = await p.evaluate(di => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); return (d.querySelector('.badge') || {}).textContent }, DI)
rec('9', 'Edit Schedule week (Saturday)', 'lit chips only; no dashed chip anywhere; nothing pressable (no button)', `shape ${JSON.stringify(week)}; buttons ${weekBtn}; dashed ${weekDash}; lit ${weekLit}; day badge "${heads}"`, weekBtn === 0 && weekDash === 0 && weekLit === 5 ? 'PASS' : 'FAIL', pw)

/* View-only Sched */
await go(p, 'viewsched')
const vBtn = await p.locator('#page-viewsched button.saflies:visible').count(), vDash = await p.locator('#page-viewsched .saflies:not(.on):visible').count(), vLit = await p.locator('#page-viewsched .saflies.on:visible').count()
const vwl = p.locator('#page-viewsched .go', { has: p.locator('.saflies.on') }).first()
const vlSaturday = await p.evaluate(di => { const d = document.querySelectorAll('#page-viewsched .day')[di]; return { lit: d.querySelectorAll('.saflies.on').length, dash: d.querySelectorAll('.saflies:not(.on)').length, btn: d.querySelectorAll('button.saflies').length, badge: (d.querySelector('.badge') || {}).textContent } }, DI)
await p.evaluate(di => document.querySelectorAll('#page-viewsched .day')[di].scrollIntoView({ block: 'start' }), DI); await sleep(300)
const pv = await shot(p, 'A-9-3-viewonly-Saturday')
rec('9', 'View-only Sched (admin), Saturday', 'lit only: 5 lit (4 AM + 1 PM), no dashed, no button', JSON.stringify(vlSaturday), vlSaturday.lit === 5 && vlSaturday.dash === 0 && vlSaturday.btn === 0 ? 'PASS' : 'FAIL', pv)

/* the next-week peek, from the week before */
await go(p, 'editsched')
const peekRows = await p.evaluate(() => { const pk = [...document.querySelectorAll('#eWeek .day.peek')][0]; if (!pk) return null; return { badge: (pk.querySelector('.badge') || {}).textContent, text: [...pk.querySelectorAll('*')].filter(e => e.children.length === 0 && /FLIES/.test(e.textContent)).map(e => e.tagName + '.' + e.className + ':' + e.textContent.replace(/\s+/g, ' ')).slice(0, 12), btn: pk.querySelectorAll('button.saflies').length, rows: (pk.innerText || '').replace(/\s+/g, ' ').slice(0, 700) } })
console.log('peek', JSON.stringify(peekRows).slice(0, 1500))
await p.evaluate(() => { const pk = [...document.querySelectorAll('#eWeek .day.peek')][0]; pk.scrollIntoView({ block: 'start' }) }); await sleep(300)
const pPeek = await shot(p, 'A-9-4-peek-Monday')
rec('9', 'next-week peek (Monday Jul 20 with SC AM R typed), seen from the week before', '"✓ FLIES" text before the four SC AM rows\' words, no button', JSON.stringify(peekRows).slice(0, 600), peekRows && peekRows.btn === 0 && peekRows.text.length === 4 ? 'PASS' : 'FAIL', pPeek)

/* member: the read-only board */
await go(p, 'editsched')
await p.locator('button, a', { hasText: /Logout/ }).first().click(); await sleep(1000)
await p.fill('#luser', 'us'); await p.fill('#lpass', 'us'); await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(900)
await p.addStyleTag({ content: '#toastEl{display:none !important}' })
const who = await p.evaluate(() => document.body.innerText.match(/[A-Z]+ · (ADMIN|MEMBER)/)?.[0])
console.log('signed in as', who)
const memberDay = await p.evaluate(di => ({ lit: document.querySelectorAll(`#page-viewsched .day:nth-child(${di + 1}) .saflies.on`).length }), DI)
await go(p, 'viewsched')
const mv = await p.evaluate(di => { const d = document.querySelectorAll('#page-viewsched .day')[di]; return { lit: d.querySelectorAll('.saflies.on').length, dash: d.querySelectorAll('.saflies:not(.on)').length, btn: d.querySelectorAll('button.saflies').length } }, DI)
await p.evaluate(di => document.querySelectorAll('#page-viewsched .day')[di].scrollIntoView({ block: 'start' }), DI); await sleep(300)
const pm = await shot(p, 'A-9-5-member-viewonly')
rec('9', 'View-only Sched as member us/us, Saturday', 'lit only; no dashed chip; no button', `${who}; ${JSON.stringify(mv)}`, mv.lit === 5 && mv.dash === 0 && mv.btn === 0 ? 'PASS' : 'FAIL', pm)
const canBoard = await p.evaluate(di => { try { window.openScheduler(di); return !!document.querySelector('#schedBoard') } catch (e) { return 'err ' + e.message } }, DI)
await sleep(900)
if (await p.locator('#schedBoard').isVisible().catch(() => false)) {
  const ms = await shape('#schedBoard'); const mb = await p.locator('#schedBoard button.saflies:visible').count(), md = await p.locator('#schedBoard .saflies:not(.on):visible').count()
  const pmb = await waveShot(p, DI, gSC, 'A-9-6-member-board-SC').catch(() => shot(p, 'A-9-6-member-board'))
  rec('9', 'the read-only board for the member (Saturday)', 'lit only; no dashed chip that looks pressable; no button', `${JSON.stringify(ms)}; buttons ${mb}; dashed ${md}`, mb === 0 && md === 0 ? 'PASS' : 'FAIL', pmb)
} else rec('9', 'the read-only board for the member', 'lit only', `a member has no scheduler board: openScheduler(5) opens nothing visible (returned ${canBoard}); the member's read-only view is View-only Sched`, 'RECORD', await shot(p, 'A-9-6-member-noboard'))
console.log('errors', JSON.stringify(errors))
await ctx.close(); await b.close()
