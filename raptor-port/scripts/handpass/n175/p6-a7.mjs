// p6-a7 - P6 case A7 (the code read's row A7): the bell's list on another squadron's page - which lines carry the grey
// squadron mark, and what "Mark all read" marks. Desktop.
// SET-UP by presses, one desktop browser, each person signing in by the sign-in card and out by the top bar's Logout:
//   Saber (master admin): Admin → Users: Hunter's row → "Access to 149" Plan → Save.
//   Hunter (142 admin, Plan of 149), on 142: Inputs → + Input: Drifter, OL, Thu 10 Dec 2026, "n175 p6 A7 142" → Save;
//     picks 149: + Input: Gannet, OL, Fri 11 Dec 2026, "n175 p6 A7 149" → Save.
//   Kestrel (149's admin): + Input: Heron, OL, Mon 14 Dec 2026, "n175 p6 A7 149k" → Save.
// Then, fresh browsers with that saved data:
//   saber  - Saber signs in, picks 149, taps the bell: every line, unread or read, its grey mark; the Show row. "Mark all
//            read" pressed. Then picks 142 and taps the bell: which lines are read now.
//   hunter - Hunter the same (his bell holds 149's Kestrel line and his own lines).
//   node raptor-port/scripts/handpass/n175/p6-a7.mjs d     (ONLY=saber,hunter)
// Pictures: p6-a7-<who>-d-1-bell-on149, p6-a7-<who>-d-2-bell-on142-after-markall
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, give, fileInput, editRemarks, saveState, relog, tapBell, bellLit, bellLines, bellShow, bellFoot, closeBell, LIST, SEC } from './p6-lib.mjs'
const SZ = 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
/* (a line comes to a man when someone else changes an input he filed - found by the first run of this script: a plain
   new input lit nobody's bell) */
export async function setupA7() {
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    FACT('p6.a7.setup.hunterPlan149', await give(s, 'prowler', '149', 'plan'))
    FACT('p6.a7.setup.saber142input', { squadron: await barSq(s), ...(await fileInput(s, 'Ace', 'OL', 'Wed 9 Dec 2026', 'n175 p6 A7 s142')) })
    await reachPick(s, 149, 'bar')
    FACT('p6.a7.setup.saber149input', { squadron: await barSq(s), ...(await fileInput(s, 'Heron', 'OL', 'Mon 14 Dec 2026', 'n175 p6 A7 s149')) })
    await relog(s, 'ad2', 'a2')
    FACT('p6.a7.setup.hunter142input', { squadron: await barSq(s), ...(await fileInput(s, 'Drifter', 'OL', 'Thu 10 Dec 2026', 'n175 p6 A7 h142')) })
    FACT('p6.a7.setup.hunterEditsSaber142', { squadron: await barSq(s), ...(await editRemarks(s, /n175 p6 A7 s142/, 'n175 p6 A7 s142 changed by Hunter')) })
    await reachPick(s, 149, 'bar')
    FACT('p6.a7.setup.hunter149input', { squadron: await barSq(s), ...(await fileInput(s, 'Gannet', 'OL', 'Fri 11 Dec 2026', 'n175 p6 A7 h149')) })
    FACT('p6.a7.setup.hunterEditsSaber149', { squadron: await barSq(s), ...(await editRemarks(s, /n175 p6 A7 s149/, 'n175 p6 A7 s149 changed by Hunter')) })
    await relog(s, 'ad', 'a')
    FACT('p6.a7.setup.saberEditsHunter142', { squadron: await barSq(s), ...(await editRemarks(s, /n175 p6 A7 h142/, 'n175 p6 A7 h142 changed by Saber')) })
    await relog(s, 'ad9', 'a9')
    FACT('p6.a7.setup.kestrelEditsHunter149', { squadron: await barSq(s), ...(await editRemarks(s, /n175 p6 A7 h149/, 'n175 p6 A7 h149 changed by Kestrel')) })
    return await saveState(s, 'a7')
  } finally { await s.ctx.close().catch(() => {}) }
}
async function run(st, who) {
  const [user, pass] = who === 'saber' ? ['ad', 'a'] : ['ad2', 'a2']
  const k = `p6.a7.${who}.${SZ}`, P = `p6-a7-${who}-${SZ}`
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, user, pass)
    const p = await reachPick(s, 149, 'bar'); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, rows: p.listRows, squadron: await barSq(s), bellLit: await bellLit(s) })
    FACT(`${k}.2.bellTap`, await tapBell(s))
    FACT(`${k}.2.on149`, { squadron: await barSq(s), lines: await bellLines(s), show: await bellShow(s), foot: await bellFoot(s) })
    await shot(s, `${P}-1-bell-on149`, ['.bl-sqn', '#sqnMenuBtn'], [LIST, '#sqnMenuBtn'], 16)
    const ma = vis(s, '[data-testid="bell-markall"]').first()
    if (await ma.count()) {
      await hit(s, ma, 600)
      FACT(`${k}.3.afterMarkAll`, { squadron: await barSq(s), lines: await bellLines(s), bellLit: await bellLit(s) })
    } else FACT(`${k}.3.markAll`, 'not drawn')
    await closeBell(s)
    await reachPick(s, 142, 'bar')
    FACT(`${k}.4.pick142`, { squadron: await barSq(s), bellLit: await bellLit(s) })
    FACT(`${k}.4.bellTap`, await tapBell(s))
    FACT(`${k}.4.on142`, { squadron: await barSq(s), lines: await bellLines(s), show: await bellShow(s), foot: await bellFoot(s) })
    await shot(s, `${P}-2-bell-on142-after-markall`, [LIST, '#sqnMenuBtn'], [LIST, '#sqnMenuBtn'], 16)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
if (process.argv[1].endsWith('p6-a7.mjs')) try {
  console.log('p6-a7 v1', SZ)
  const st = await setupA7()
  for (const w of (ONLY.length ? ONLY : ['saber', 'hunter'])) await run(st, w)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
