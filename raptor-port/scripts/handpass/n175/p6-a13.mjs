// p6-a13 - P6 case A13 (the code read's row A13): a View holder of 149, 149 picked - the role badge's words.
// SET-UP by presses (Saber, desktop): Admin → Users: Hunter's row → "Access to 149" View → Save; Ranger's row → "Access
// to 149" View → Save. Then, fresh browsers: each signs in, his badge read on 142; picks 149 (top-bar picker; ☰ list on a
// phone): the badge's words (desktop: the top bar's name badge; phone: ☰ opened, its role line), the Schedules menu's row.
//   hunter - Hunter, an admin of 142 holding View of 149 (the code read's worked example)
//   ranger - Ranger, a member of 142 holding View of 149 (the brief's name)
//   node raptor-port/scripts/handpass/n175/p6-a13.mjs <d|p>     (ONLY=hunter,ranger)
// Pictures: p6-a13-<who>-<d|p>-1-on149 (the badge, or ☰'s role line, ringed; the bar)
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, give, saveState, roleNow, shut, SEC, via } from './p6-lib.mjs'
const SZ = process.argv[2] || 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
async function setup() {
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    FACT('p6.a13.setup.hunterView149', await give(s, 'prowler', '149', 'view'))
    FACT('p6.a13.setup.rangerView149', await give(s, 'bane', '149', 'view'))
    return await saveState(s, 'a13')
  } finally { await s.ctx.close().catch(() => {}) }
}
const menuRole = async s => {
  if (s.desk) return null
  await hit(s, '#burger', 500)
  const r = await s.page.evaluate(() => ({ role: document.querySelector('#drawerRole')?.innerText.replace(/\s+/g, ' ').trim() ?? null, squadronLine: document.querySelector('#drawerSqnBtn')?.innerText.replace(/\s+/g, ' ').trim() ?? null, menuWords: (document.querySelector('#drawer')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) }))
  return r
}
async function run(st, who) {
  const [user, pass] = who === 'hunter' ? ['ad2', 'a2'] : ['us', 'us']
  const k = `p6.a13.${who}.${SZ}`, P = `p6-a13-${who}-${SZ}`
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, user, pass)
    FACT(`${k}.0.on142`, { squadron: await barSq(s), role: await roleNow(s), menu: await menuRole(s) }); if (!s.desk) await shut(s)
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, rows: p.listRows, squadron: await barSq(s), page: await pageOn(s) })
    FACT(`${k}.2.on149`, { squadron: await barSq(s), role: await roleNow(s) })
    if (s.desk) await shot(s, `${P}-1-on149`, ['#roleBadge', '#sqnMenuBtn'], ['.topbar'], 8)
    else { FACT(`${k}.2.menu`, await menuRole(s)); await shot(s, `${P}-1-on149`, ['#drawerRole', '.topbar .mark, #drawerSqnBtn'], null, 20); await shut(s) }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-a13 v1', SZ)
  const st = await setup()
  for (const w of (ONLY.length ? ONLY : ['hunter', 'ranger'])) await run(st, w)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
