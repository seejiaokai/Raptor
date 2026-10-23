// Walker 3, section F (scenarios 52-61): D1227's bubble.  Runs on REAL storage (the plain address) so an admin's Required figures and
// amber point are read by the member signed in afterwards, in the same browser context.   node scripts/handpass/lw-m2-walk-3-f.mjs [numbers...]
import * as L from './lw-m2-walk-3-lib-r.mjs'
import { writeFileSync } from 'node:fs'
const { T, tap, vis, txt, rec, shot, undo } = L
const only = process.argv.slice(2).map(Number)
const want = n => !only.length || only.includes(n)
const all = []
const PLAIN = `http://localhost:${L.PORT}/`
async function signInPlain(w, who, today) {
  const { page } = w
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
const bubble = w => w.page.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble"]'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
const availOf = async (w, iso) => +(await txt(w.page, T(`avail-p-${iso}`)))
const classOf = (w, id) => w.page.locator(T(id)).first().evaluate(e => e.className).catch(() => null)
const pad = async (w, id, n) => { await tap(w, T(id)); await w.page.waitForTimeout(400); if (await vis(w.page, T('fly-edit-input'))) { await w.page.fill(T('fly-edit-input'), String(n)); await w.page.keyboard.press('Enter'); await w.page.waitForTimeout(500); return } for (const d of String(n)) await tap(w, T(`fly-pad-${d}`)); await tap(w, T('fly-pad-done')); await w.page.waitForTimeout(400) }
const DAYS = { A: '2026-01-12', B: '2026-01-13', C: '2026-01-14', D: '2026-01-15', E: '2026-01-16' }
let fix = null
async function fixture(w) {
  await signInPlain(w, 'admin')
  await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
  if (!(await manningOpen(w))) { await tap(w, T('counts-toggle')); await w.page.waitForTimeout(500) }
  const av = {}; for (const [k, d] of Object.entries(DAYS)) av[k] = await availOf(w, d)
  // A: ok -> amber on one bid ; B: already amber -> red ; C: ok (window-only scenarios) ; D, E: ok (drag block)
  await pad(w, `req-p-${DAYS.A}`, av.A - 1)
  await pad(w, `req-p-${DAYS.B}`, av.B)
  await pad(w, `req-p-${DAYS.C}`, av.C - 1)
  await pad(w, `req-p-${DAYS.D}`, av.D - 1)
  await pad(w, `req-p-${DAYS.E}`, av.E - 1)
  await tap(w, T('fly-name-avail-p')); await w.page.waitForSelector(T('cform-amber-pt'))
  await w.page.fill(T('cform-amber-pt'), '+1'); await tap(w, T('cform-save')); await w.page.waitForTimeout(700)
  const cls = {}; for (const [k, d] of Object.entries(DAYS)) cls[k] = `${await txt(w.page, T(`avail-p-${d}`))}:${await classOf(w, `avail-p-${d}`)}`
  await shot(w, 'f0-fixture-admin')
  fix = { av, cls }
  console.log('fixture', JSON.stringify(fix))
  await w.page.waitForTimeout(1800)
}
async function asMember(w) {
  await signInPlain(w, 'member', '2026-01-05')
  await tap(w, T('month-JAN')); await w.page.waitForTimeout(900)
}
// place a whole-day LL through the bid window; returns what the screen shows right after the window closes
async function bidLL(w, iso) {
  await tap(w, T(L.cellId('bane', iso))); await w.page.waitForSelector(T('bid-picker'))
  await tap(w, T('bid-LL')); await w.page.waitForTimeout(500)
  if (await vis(w.page, T('bid-picker'))) { await tap(w, T('bid-LL')); await w.page.waitForTimeout(500) }
  await w.page.waitForTimeout(400)
}
async function run(n, fn) { if (!want(n)) return; try { await fn() } catch (e) { rec(n, '?', 'NOT RUN', 'script error: ' + String(e).slice(0, 300)) } }

const w = await L.newWorld('phone')
let ok0 = true
try { await fixture(w) } catch (e) { ok0 = false; console.log('FIXTURE FAILED', String(e).slice(0, 300)) }
if (ok0) {
  await asMember(w)
  const foldedAtStart = !(await manningOpen(w))
  console.log('member starts folded:', foldedAtStart, 'avail A before', await availOf(w, DAYS.A).catch(() => null))

  await run(52, async () => {
    const before = fix.av.A
    await bidLL(w, DAYS.A)
    const open = await manningOpen(w); const b1 = await bubble(w)
    await shot(w, 's52-bubble-after-bid')
    const after = await availOf(w, DAYS.A).catch(() => null); const cls = await classOf(w, `avail-p-${DAYS.A}`)
    // the next tap anywhere removes it
    await w.page.mouse.click(5, 300).catch(() => {}); await w.page.waitForTimeout(500)
    let b2 = await bubble(w)
    if (b2) { await tap(w, T('month-JAN')); await w.page.waitForTimeout(400); b2 = await bubble(w) }
    await shot(w, 's52-after-next-tap')
    rec(52, 'phone390 member', foldedAtStart && open && b1 && /Available P amber/i.test(b1) && !b2 ? 'PASS' : 'FAIL', `Manning folded at start=${foldedAtStart}; Available P on ${DAYS.A} ${before} -> ${after} (class "${cls}"); after closing the window: Manning open=${open}, bubble "${b1}"; after the next tap bubble "${b2}"`, ['s52-bubble-after-bid.png', 's52-after-next-tap.png'])
  })

  await run(53, async () => {
    await asMember(w)
    const f0 = !(await manningOpen(w)); const before = await bubble(w)
    const res = []
    for (const how of ['x', 'escape', 'outside']) {
      await tap(w, T(L.cellId('bane', DAYS.C))); await w.page.waitForSelector(T('bid-picker'))
      if (how === 'x') await tap(w, T('bid-cancel'))
      else if (how === 'escape') await w.page.keyboard.press('Escape')
      else { const b = await L.boxOf(w.page, T('bid-picker')); await tap(w, T('sheet-scrim')).catch(async () => { await w.page.mouse.click(30, 30) }) }
      await w.page.waitForTimeout(500)
      if (await vis(w.page, T('bid-picker'))) { await tap(w, T('bid-cancel')); await w.page.waitForTimeout(300) }
      res.push(`${how}: window closed=${!(await vis(w.page, T('bid-picker')))}, bubble=${await bubble(w)}, Manning ${await manningOpen(w) ? 'OPEN' : 'folded'}`)
    }
    await shot(w, 's53-after-closes')
    const bad = res.some(r => !/bubble=null/.test(r) || !/folded/.test(r))
    rec(53, 'phone390 member', f0 && !bad ? 'PASS' : 'FAIL', `start folded=${f0}, bubble=${before}; ${res.join('; ')}`, ['s53-after-closes.png'])
  })

  await run(54, async () => {
    await asMember(w)
    const before = fix.av.B
    await bidLL(w, DAYS.B)
    const b1 = await bubble(w); const mid = await classOf(w, `avail-p-${DAYS.B}`)
    await shot(w, 's54-red-bid-bubble')
    await w.page.mouse.click(5, 300); await w.page.waitForTimeout(500)
    // delete the pending bid: the row goes red -> amber
    await tap(w, T(L.cellId('bane', DAYS.B))); await w.page.waitForSelector(T('bid-picker'))
    await tap(w, T('bid-clear')); await w.page.waitForTimeout(700)
    if (await vis(w.page, T('bid-picker'))) await tap(w, T('bid-cancel'))
    const b2 = await bubble(w); const cls = await classOf(w, `avail-p-${DAYS.B}`); const av2 = await availOf(w, DAYS.B).catch(() => null)
    await shot(w, 's54-after-delete')
    rec(54, 'phone390 member', /Available P red/i.test(b1 || '') && !b2 ? 'PASS' : 'FAIL', `${DAYS.B} Available P ${before} (already amber) -> bid: bubble "${b1}" (class "${mid}"); then Delete the pending bid: Available P ${av2}, class "${cls}", bubble "${b2}" (an improvement: expect none)`, ['s54-red-bid-bubble.png', 's54-after-delete.png'])
  })

  await run(55, async () => {
    await asMember(w)
    // earlier delete (a worsening when taken back): bid on B, delete it, then open a window elsewhere and press the top-bar Undo
    await bidLL(w, DAYS.B); await w.page.mouse.click(5, 300); await w.page.waitForTimeout(400)
    await tap(w, T(L.cellId('bane', DAYS.B))); await w.page.waitForSelector(T('bid-picker')); await tap(w, T('bid-clear')); await w.page.waitForTimeout(600)
    if (await vis(w.page, T('bid-picker'))) await tap(w, T('bid-cancel'))
    await w.page.mouse.click(5, 300); await w.page.waitForTimeout(400)
    const bb = await bubble(w)
    // open a window on C, press Undo in the top bar while it is open, then close it unchanged
    await tap(w, T(L.cellId('bane', DAYS.C))); await w.page.waitForSelector(T('bid-picker'))
    const undoReach = await w.page.evaluate(() => { const e = document.querySelector('#undoBtn'); if (!e) return 'no undo button'; const b = e.getBoundingClientRect(); const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return (e === top || e.contains(top)) ? 'reachable' : 'covered by ' + (top && (top.closest('[data-testid]')?.dataset.testid || top.className)) })
    const avBefore = await availOf(w, DAYS.B).catch(() => null)
    const pendBefore = await txt(w.page, T('my-leave-pending'))
    await tap(w, '#undoBtn'); await w.page.waitForTimeout(800)
    const sheetAfterUndo = await vis(w.page, T('bid-picker'))
    const firstAv = await availOf(w, DAYS.B).catch(() => null); const firstPend = await txt(w.page, T('my-leave-pending'))
    if (!sheetAfterUndo && firstAv === avBefore) { await tap(w, '#undoBtn'); await w.page.waitForTimeout(800) }
    const avAfterUndo = await availOf(w, DAYS.B).catch(() => null)
    const clsB = await classOf(w, `avail-p-${DAYS.B}`)
    const pendAfter = await txt(w.page, T('my-leave-pending'))
    const bAtUndo = await bubble(w)
    await shot(w, 's55-window-open-after-undo')
    if (sheetAfterUndo) { await tap(w, T('bid-cancel')); await w.page.waitForTimeout(600) }
    const b = await bubble(w)
    await shot(w, 's55-after-close')
    rec(55, 'phone390 member', avAfterUndo !== avBefore ? ((b || bAtUndo) ? 'FAIL' : 'PASS') : 'NOT RUN', `top-bar Undo while the window was open (window still open after the first Undo press=${sheetAfterUndo}; Available P and pending right after that first press: ${firstAv} / ${firstPend}; after a second press ${pendAfter}; bubble straight after the Undo "${bAtUndo}"): ${undoReach}; Available P on ${DAYS.B} ${avBefore} -> ${avAfterUndo} (class "${clsB}") — the undo ${avAfterUndo !== avBefore ? 'worsened the row' : 'changed nothing, so the premise did not hold'}; closing the window unchanged shows bubble "${b}" (expect none); bubble before the window was "${bb}"`, ['s55-window-open-after-undo.png', 's55-after-close.png'])
  })

  await run(60, async () => {
    await asMember(w)
    await tap(w, T('counts-toggle')).catch(() => {}); // make sure state is known
    await asMember(w)
    await bidLL(w, DAYS.C)
    const b1 = await bubble(w)
    await shot(w, 's60-bubble')
    // keyboard only: Tab / Escape, then wait
    await w.page.keyboard.press('Tab'); await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(1500)
    const b2 = await bubble(w)
    await w.page.waitForTimeout(8000)
    const b3 = await bubble(w)
    await shot(w, 's60-after-keys-and-9s')
    rec(60, 'phone390 member', b1 && !b3 ? 'PASS' : 'FAIL', `bubble "${b1}"; after Tab + Escape ${'"' + b2 + '"'}; after 9s with the keyboard only "${b3}" (a bubble that only a pointer tap can remove stays for a keyboard user)`, ['s60-bubble.png', 's60-after-keys-and-9s.png'])
  })

  await run(61, async () => {
    await asMember(w)
    // scroll far down the roster, open Ranger's own cell for day D from there
    await w.page.evaluate(() => window.scrollTo(0, 0))
    // open the window by the day's cell, then scroll the page far down behind the open window
    await tap(w, T(L.cellId('bane', DAYS.D))); await w.page.waitForSelector(T('bid-picker'), { timeout: 8000 })
    await w.page.evaluate(() => window.scrollTo(0, 1500)); await w.page.waitForTimeout(300)
    await tap(w, T('bid-LL')); await w.page.waitForTimeout(700)
    const sy = await w.page.evaluate(() => scrollY); const bb = await L.boxOf(w.page, T('manning-bubble'))
    await shot(w, 's61-scrolled-after-bid')
    rec(61, 'phone390 member', 'NOT RUN', `recorded only (no expected line): after the bid the page sits at scrollY=${sy}; bubble ${await bubble(w)} at ${bb ? JSON.stringify([Math.round(bb.x), Math.round(bb.y)]) : 'not in view'} — it is drawn under the Manning button at the top of the grid, ${bb && bb.y > 0 && bb.y < 844 ? 'in view' : 'out of view: he sees nothing change where he is looking'}`, ['s61-scrolled-after-bid.png'])
  })
}
w.errs.forEach(x => all.push('F phone: ' + x)); await w.ctx.close()

writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/w3-f.out.json', JSON.stringify({ results: L.results, errs: all, fix }, null, 1))
console.log('ERRORS', JSON.stringify(all))
await L.closeBrowser()
