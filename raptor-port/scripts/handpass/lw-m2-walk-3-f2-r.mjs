// Walker 3, section F part 2 (scenarios 56-59): the drag-fill bubble with two rows, a Move, the desktop, two tabs.  Real storage (plain address).
import * as L from './lw-m2-walk-3-lib-r.mjs'
import { writeFileSync } from 'node:fs'
const { T, tap, vis, txt, rec, shot } = L
const only = process.argv.slice(2).map(Number)
const want = n => !only.length || only.includes(n)
const all = []
const PLAIN = `http://localhost:${L.PORT}/`
async function signInPlain(w, who, today, page = w.page) {
  await page.goto(PLAIN); await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(who === 'admin' ? T('row-stiff') : T('row-bane'))
  await page.waitForTimeout(900)
}
const manningOpen = w => w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
const bubble = (w, page = w.page) => page.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble"]'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
const availOf = async (w, iso) => +(await txt(w.page, T(`avail-p-${iso}`)))
const classOf = (w, id) => w.page.locator(T(id)).first().evaluate(e => e.className).catch(() => null)
const pad = async (w, id, n) => { await tap(w, T(id)); await w.page.waitForTimeout(400); if (await vis(w.page, T('fly-edit-input'))) { await w.page.fill(T('fly-edit-input'), String(n)); await w.page.keyboard.press('Enter'); await w.page.waitForTimeout(500); return } for (const d of String(n)) await tap(w, T(`fly-pad-${d}`)); await tap(w, T('fly-pad-done')); await w.page.waitForTimeout(400) }
const DAYS = { A: '2026-01-12', B: '2026-01-13', C: '2026-01-14', D: '2026-01-15', E: '2026-01-16', F: '2026-01-19' }
async function run(n, fn) { if (!want(n)) return; try { await fn() } catch (e) { rec(n, '?', 'NOT RUN', 'script error: ' + String(e).slice(0, 300)) } }
async function fixture(w, withCounter) {
  await signInPlain(w, 'admin')
  await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
  const av = {}; for (const [k, d] of Object.entries(DAYS)) av[k] = await availOf(w, d)
  await pad(w, `req-p-${DAYS.A}`, av.A - 1); await pad(w, `req-p-${DAYS.B}`, av.B)
  await pad(w, `req-p-${DAYS.C}`, av.C - 1); await pad(w, `req-p-${DAYS.D}`, av.D - 1); await pad(w, `req-p-${DAYS.E}`, av.E - 1)
  await tap(w, T('fly-name-avail-p')); await w.page.waitForSelector(T('cform-amber-pt'))
  await w.page.fill(T('cform-amber-pt'), '+1'); await tap(w, T('cform-save')); await w.page.waitForTimeout(700)
  let counter = null
  if (withCounter) {
    await tap(w, T('settings-open')); await w.page.waitForSelector(T('counter-add')); await tap(w, T('counter-add')); await w.page.waitForSelector(T('cform-name'))
    await w.page.fill(T('cform-name'), 'WalkIP'); await tap(w, T('cf-seat-pilot')); await tap(w, T('cf-cat-IP'))
    await w.page.fill(T('cform-amber'), '1'); await w.page.fill(T('cform-red'), '1')
    await tap(w, T('cform-save')); await w.page.waitForTimeout(800)
    if (await vis(w.page, T('settings-close'))) { await tap(w, T('settings-close')); await w.page.waitForTimeout(300) }
    if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(400) }
    const info = await w.page.evaluate(([d, e]) => { const rows = [...document.querySelectorAll('[data-testid^="count-"]')].filter(r => r.tagName === 'TR'); const r = rows.find(x => /WalkIP/i.test(x.innerText)); if (!r) return null; const id = r.dataset.testid.slice(6); const c = iso => document.querySelector(`[data-testid="count-${id}-${iso}"]`)?.innerText.trim(); return { id, d: c(d), e: c(e) } }, [DAYS.D, DAYS.E])
    counter = info
    console.log('counter', JSON.stringify(info))
    if (info) {
      const hi = Math.max(+info.d, +info.e)
      await tap(w, T(`manning-info-${info.id}`)); await w.page.waitForTimeout(500)
      await tap(w, T('counter-edit-open')); await w.page.waitForSelector(T('cform-amber'))
      await w.page.fill(T('cform-amber'), String(hi)); await w.page.fill(T('cform-red'), String(hi))
      await tap(w, T('cform-save')); await w.page.waitForTimeout(800)
      for (const t of ['manning-info-close', 'counter-cancel']) if (await vis(w.page, T(t))) { await tap(w, T(t)); await w.page.waitForTimeout(300) }
      counter.hi = hi
    }
  }
  await shot(w, `f2-fixture-${withCounter ? 'counter' : 'plain'}`)
  console.log('fixture', JSON.stringify({ av }))
  await w.page.waitForTimeout(1800)
  return { av, counter }
}
const all2 = []

/* 57 admin phone: drag-select two days and fill LL; two rows turn */
await run(57, async () => {
  const w = await L.newWorld('phone')
  const fx = await fixture(w, true)
  await signInPlain(w, 'admin'); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  const f0 = !(await manningOpen(w))
  const a = await L.centre(w, T(L.cellId('stiff', DAYS.D)))
  const bb = await w.page.locator(T(L.cellId('stiff', DAYS.E))).first().boundingBox()
  const pts = [{ x: a.x, y: a.y }]; for (let i = 1; i <= 6; i++) pts.push({ x: a.x + (bb.x + bb.width / 2 - a.x) * i / 6, y: a.y })
  await L.holdDrag(w, pts, 350); await w.page.waitForTimeout(500)
  const sheet = await vis(w.page, T('select-sheet'))
  await tap(w, T('sel-LL')); await w.page.waitForTimeout(700)
  if (await vis(w.page, T('select-sheet'))) { await tap(w, T('sel-LL')); await w.page.waitForTimeout(700) }
  const b = await bubble(w); const open = await manningOpen(w)
  await shot(w, 's57-drag-fill-bubble')
  const names = (b || '').match(/WalkIP|Available P/g) || []
  rec(57, 'phone390 admin', sheet && f0 && open && b && /WalkIP/.test(b) && /Available P/.test(b) ? 'PASS' : 'FAIL', `counter fixture ${JSON.stringify(fx.counter)}; Manning folded at start=${f0}; drag-select sheet opened=${sheet}; after the fill: Manning open=${open}, bubble "${b}" (needs one bubble naming both rows)`, ['s57-drag-fill-bubble.png'])
  w.errs.forEach(x => all.push('57: ' + x)); await w.ctx.close()
})

/* 58 member: Move a pending bid onto a day where it turns a row red */
await run(58, async () => {
  const w = await L.newWorld('phone')
  await fixture(w, false)
  await signInPlain(w, 'member', '2026-01-05'); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  // a harmless bid on day F, then move it onto B (already amber -> red)
  await tap(w, T(L.cellId('bane', DAYS.F))); await w.page.waitForSelector(T('bid-picker')); await tap(w, T('bid-LL')); await w.page.waitForTimeout(600)
  if (await vis(w.page, T('bid-picker'))) await tap(w, T('bid-LL'))
  await w.page.waitForTimeout(500)
  const b0 = await bubble(w)
  await w.page.mouse.click(5, 300); await w.page.waitForTimeout(300)
  await tap(w, T(L.cellId('bane', DAYS.F))); await w.page.waitForSelector(T('bid-picker'))
  const hasMove = await L.has(w.page, T('decide-shift'))
  if (hasMove) {
    await tap(w, T('decide-shift')); await w.page.waitForTimeout(700)
    await shot(w, 's58-move-mode')
    await tap(w, T(L.cellId('bane', DAYS.B))); await w.page.waitForTimeout(700)
    await shot(w, 's58-after-target-tap')
    if (await vis(w.page, T('move-confirm'))) { await tap(w, T('move-confirm')); await w.page.waitForTimeout(800) }
  }
  const moved = await L.has(w.page, `${T(L.cellId('bane', DAYS.B))} .c`)
  const bb = await bubble(w); const mo = await manningOpen(w); if (!mo) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
  const cls = await classOf(w, `avail-p-${DAYS.B}`)
  await shot(w, 's58-after-move')
  rec(58, 'phone390 member', 'NOT RUN', `recorded only (no expected line; his call, M7): a pending bid placed on ${DAYS.F} (bubble then "${b0}"), moved with the window's Move onto ${DAYS.B} where it turns Available P red (class now "${cls}"): Move offered=${hasMove}, bid now on ${DAYS.B}=${moved}; bubble after the move "${bb}", Manning was ${mo ? 'OPEN' : 'folded'} straight after the move`, ['s58-move-mode.png', 's58-after-target-tap.png', 's58-after-move.png'])
  w.errs.forEach(x => all.push('58: ' + x)); await w.ctx.close()
})

/* 59 desktop */
await run(59, async () => {
  const w = await L.newWorld('desk')
  await fixture(w, false)
  await signInPlain(w, 'member', '2026-01-05'); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  const open0 = await manningOpen(w)
  await tap(w, T(L.cellId('bane', DAYS.A))); await w.page.waitForSelector(T('bid-picker')); await tap(w, T('bid-LL')); await w.page.waitForTimeout(600)
  if (await vis(w.page, T('bid-picker'))) await tap(w, T('bid-LL'))
  await w.page.waitForTimeout(500)
  const b = await bubble(w); const cls = await classOf(w, `avail-p-${DAYS.A}`)
  await shot(w, 's59-desktop-bid')
  rec(59, 'desk1536 member', 'NOT RUN', `recorded only (M8, ruled neither way): Manning open at start=${open0} (a desktop opens it); a bid turning Available P amber on ${DAYS.A} (class "${cls}"): bubble on a desktop "${b}"`, ['s59-desktop-bid.png'])
  w.errs.forEach(x => all.push('59: ' + x)); await w.ctx.close()
})

/* 56 two tabs */
await run(56, async () => {
  const w = await L.newWorld('phone')
  await fixture(w, false)
  await signInPlain(w, 'member', '2026-01-05'); await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  const pageB = await w.ctx.newPage(); pageB.on('pageerror', e => all.push('56 B: ' + String(e).slice(0, 150)))
  await signInPlain(w, 'member', '2026-01-05', pageB)
  await pageB.click(T('month-JAN')); await pageB.waitForTimeout(900)
  // tab A opens a window on C (changes nothing yet)
  await tap(w, T(L.cellId('bane', DAYS.C))); await w.page.waitForSelector(T('bid-picker'))
  // tab B places a bid on day C (turns Available P amber there)
  await pageB.click(T(L.cellId('bane', DAYS.C))); await pageB.waitForSelector(T('bid-picker')); await pageB.click(T('bid-LL')); await pageB.waitForTimeout(800)
  if (await pageB.locator(T('bid-picker')).count()) await pageB.click(T('bid-LL'))
  await pageB.waitForTimeout(1500); await w.page.waitForTimeout(1500)
  const bB = await bubble(w, pageB)
  const clsA = await classOf(w, `avail-p-${DAYS.C}`)
  await shot(w, 's56-tab-a-window-open')
  await tap(w, T('bid-cancel')).catch(() => {}); await w.page.waitForTimeout(700)
  const bA = await bubble(w)
  await shot(w, 's56-tab-a-closed')
  rec(56, 'phone390 member', bA ? 'FAIL' : 'PASS', `tab B placed the bid (its own bubble "${bB}"); tab A, which had only opened a window, sees Available P ${DAYS.C} class "${clsA}" (did it hear of B's change=${/amb|under/.test(clsA || '')}); closing A's window unchanged: bubble "${bA}" (expect none)`, ['s56-tab-a-window-open.png', 's56-tab-a-closed.png'])
  w.errs.forEach(x => all.push('56: ' + x)); await w.ctx.close()
})

writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/w3-f2.out.json', JSON.stringify({ results: L.results, errs: all }, null, 1))
console.log('ERRORS', JSON.stringify(all))
await L.closeBrowser()
