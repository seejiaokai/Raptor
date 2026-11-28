// p6-a10 - P6 case A10 (the code read's row A10): a fault reported on 149 - where it appears for 149's and 142's admins.
// Desktop. (The first run of this script found that a report lives only in the open page: the saved data copied into a
// fresh browser carried none. So each variant runs in ONE browser, people changing by the top bar's Logout.)
//   member - Osprey (a member of 149, us9) signs in, Help → "What happened": "n175 p6 A10 report from 149" → Send report;
//            Logout; Hunter (142's admin, no rights in 149) signs in: the bell lit? tapped: what it says; Help's "Bug
//            reports": is 149's report there? Then Logout; Kestrel (149's admin) signs in: the same.
//   admin  - Saber (master admin, home 142) signs in, picks 149, Help → the report typed → Send report; the bell lit?
//            Help's "Bug reports" on 149; then picks 142: the bell, Help's "Bug reports" on 142 - is 149's report there?
//   node raptor-port/scripts/handpass/n175/p6-a10.mjs d     (ONLY=member,admin)
// Pictures: p6-a10-member-d-1-hunter-help, p6-a10-admin-d-1-help-on142
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, relog, tapBell, bellLit, toastNow, SEC } from './p6-lib.mjs'
const SZ = 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const WORDS = 'n175 p6 A10 report from 149'
const helpRead = s => s.page.evaluate(w => {
  const a = document.querySelector('#bugAdmin'); if (!a) return 'no Bug reports section'
  const rows = [...a.querySelectorAll('#bugList > *')].filter(e => e.getBoundingClientRect().height > 0)
  const r = rows.find(e => e.innerText.includes(w))
  if (r) r.setAttribute('data-n175ring', '1')
  return { lead: a.querySelector('.help-lead')?.textContent.trim(), count: rows.length, ours: r ? r.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : 'not listed', oursClass: r ? r.className : null }
}, WORDS)
async function file(s) {
  await go(s, 'help'); await wait(s, 600)
  await vis(s, '#bugText').first().fill(WORDS)
  await hit(s, '#bugSend', 800)
  return { squadron: await barSq(s), toast: await toastNow(s) }
}
async function look(s, k, who) {
  FACT(`${k}.${who}.0`, { squadron: await barSq(s), bellLit: await bellLit(s) })
  FACT(`${k}.${who}.1.bellTap`, await tapBell(s))
  FACT(`${k}.${who}.1.after`, { squadron: await barSq(s), page: await pageOn(s), toast: await toastNow(s) })
  if ((await pageOn(s)) !== 'page-help') { await go(s, 'help'); await wait(s, 600) }
  FACT(`${k}.${who}.2.help`, await helpRead(s))
}
async function run(v) {
  const k = `p6.a10.${v}.${SZ}`, P = `p6-a10-${v}-${SZ}`
  const s = await mk(SZ)
  try {
    if (v === 'member') {
      await signIn(s, 'us9', 'us9'); FACT(`${k}.osprey.filed`, await file(s))
      await relog(s, 'ad2', 'a2'); await look(s, k, 'hunter')
      await shot(s, `${P}-1-hunter-help`, ['#bugAdmin', '.topbar .mark'], null, 24)
      await relog(s, 'ad9', 'a9'); await look(s, k, 'kestrel'); await scratch(s, SEC, `${P}-2-kestrel-help`)
    } else {
      await signIn(s, 'ad', 'a')
      await reachPick(s, 149, 'bar'); FACT(`${k}.saber.filed`, await file(s))
      FACT(`${k}.on149`, { squadron: await barSq(s), bellLit: await bellLit(s), help: await helpRead(s) })
      await scratch(s, SEC, `${P}-0-help-on149`)
      await reachPick(s, 142, 'bar'); await look(s, k, 'on142')
      await shot(s, `${P}-1-help-on142`, ['[data-n175ring]', '#sqnMenuBtn'], null, 24)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-a10 v2', SZ)
  for (const v of (ONLY.length ? ONLY : ['member', 'admin'])) await run(v)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
