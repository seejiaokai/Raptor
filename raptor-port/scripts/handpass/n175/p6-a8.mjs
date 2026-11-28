// p6-a8 - P6 case A8 (the code read's row A8): does the bell light for 142's things while 149 is picked and 142 is
// switched off under the bell's Show? Desktop. Hunter (142 admin, Plan of 149) is the bell's owner.
//   lines - SET-UP: p6-a7.mjs's (lines of both squadrons in Hunter's bell, all unread). Hunter signs in, picks 149, taps
//           the bell, presses Show's "142" (off): the lines listed; "Mark all read" pressed (what it marks with 142 off);
//           the bell closed: lit or dark? Then "142" pressed back on: are 142's lines still unread? the bell lit?
//   oil   - SET-UP by presses (desktop, one browser): Saber gives Hunter Plan of 149 and files Hunter's Duty Tue 8 Dec
//           2026 (a weekday, nothing asked); Hunter signs in, taps the bell (no question yet), presses Show's "142" off,
//           logs out; Saber suspends Hunter, makes 8 Dec "N175 A8 Day" a holiday (its OIL list left with "Later"), enables
//           Hunter (p6-a4's way - he gets no holiday line). Then, in a fresh browser: Hunter signs in, picks 149: the bell
//           lit? tapped: what opens?
//   node raptor-port/scripts/handpass/n175/p6-a8.mjs d     (ONLY=lines,oil)
// Pictures: p6-a8-lines-d-1-142-off-closed (the dark or lit bell, the bar), p6-a8-oil-d-1-on149 (the bell), -2-after-tap
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, give, fileInput, saveState, relog, tapBell, bellLit, bellLines, bellShow, bellFoot, closeBell, toastNow, winFacts, LIST, SEC } from './p6-lib.mjs'
import { setupA7 } from './p6-a7.mjs'
import { suspendToggle, addHoliday } from './p6-a4.mjs'
const SZ = 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const showBtn = (s, n) => vis(s, '[data-testid="bell-show"] button').filter({ hasText: new RegExp(`^${n}$`) }).first()
async function lines() {
  const k = `p6.a8.lines.${SZ}`, P = `p6-a8-lines-${SZ}`
  const st = await setupA7()
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, 'ad2', 'a2')
    await reachPick(s, 149, 'bar'); FACT(`${k}.1.on149`, { squadron: await barSq(s), bellLit: await bellLit(s) })
    await tapBell(s); FACT(`${k}.2.list`, { lines: await bellLines(s), show: await bellShow(s) })
    await hit(s, showBtn(s, 142), 600)
    FACT(`${k}.3.142off`, { lines: await bellLines(s), show: await bellShow(s), foot: await bellFoot(s) })
    const ma = vis(s, '[data-testid="bell-markall"]').first()
    if (await ma.count()) { await hit(s, ma, 600); FACT(`${k}.4.afterMarkAll`, { lines: await bellLines(s), bellLit: await bellLit(s) }) } else FACT(`${k}.4.markAll`, 'not drawn')
    await closeBell(s)
    FACT(`${k}.5.closed`, { squadron: await barSq(s), bellLit: await bellLit(s) })
    await shot(s, `${P}-1-142-off-closed`, ['#notifyBell, .bellbtn', '#sqnMenuBtn'], ['.topbar'], 8)
    await tapBell(s); await hit(s, showBtn(s, 142), 600)
    FACT(`${k}.6.142on`, { lines: await bellLines(s), show: await bellShow(s) })
    await closeBell(s); FACT(`${k}.6.closed`, { bellLit: await bellLit(s) })
    await scratch(s, SEC, `${P}-2-142-on`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
async function oil() {
  const k = `p6.a8.oil.${SZ}`, P = `p6-a8-oil-${SZ}`
  let st
  { const s = await mk('d')
    try {
      await signIn(s, 'ad', 'a')
      FACT(`${k}.setup.hunterPlan149`, await give(s, 'prowler', '149', 'plan'))
      FACT(`${k}.setup.hunterDuty8Dec`, await fileInput(s, 'Hunter', 'Duty', 'Tue 8 Dec 2026', 'n175 p6 A8'))
      await relog(s, 'ad2', 'a2')
      await tapBell(s); FACT(`${k}.setup.hunterBell`, { lines: await bellLines(s), show: await bellShow(s) })
      await hit(s, showBtn(s, 142), 500); FACT(`${k}.setup.hunter142off`, await bellShow(s))
      /* every line read first, so a lit bell later is the OIL question's alone */
      const ma = vis(s, '[data-testid="bell-markall"]').first(); if (await ma.count()) await hit(s, ma, 500)
      await closeBell(s); FACT(`${k}.setup.hunterBellAfterMarkAll`, { bellLit: await bellLit(s) })
      await relog(s, 'ad', 'a')
      FACT(`${k}.setup.suspend`, await suspendToggle(s, 'prowler'))
      FACT(`${k}.setup.holiday`, await addHoliday(s, 'N175 A8 Day'))
      FACT(`${k}.setup.enable`, await suspendToggle(s, 'prowler'))
      st = await saveState(s, 'a8-oil')
    } finally { await s.ctx.close().catch(() => {}) } }
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, 'ad2', 'a2')
    await reachPick(s, 149, 'bar'); FACT(`${k}.1.on149`, { squadron: await barSq(s), bellLit: await bellLit(s) })
    await shot(s, `${P}-1-on149`, ['#notifyBell, .bellbtn', '#sqnMenuBtn'], ['.topbar'], 8)
    FACT(`${k}.2.bellTap`, await tapBell(s))
    FACT(`${k}.2.after`, { squadron: await barSq(s), page: await pageOn(s), toast: await toastNow(s), lines: await bellLines(s), show: await bellShow(s), windows: (await winFacts(s)).map(w => w.slice(0, 200)) })
    await shot(s, `${P}-2-after-tap`, ['#sqnMenuBtn', '.upconf-pop', '#toastEl', LIST], null, 16)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-a8 v1', SZ)
  if (!ONLY.length || ONLY.includes('lines')) await lines()
  if (!ONLY.length || ONLY.includes('oil')) await oil()
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
