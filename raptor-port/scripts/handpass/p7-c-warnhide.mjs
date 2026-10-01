/* [DB-READINESS] phase 7 walk — walker C, C37 (v): HIDDEN WARNINGS — OBSERVE AND RECORD ONLY (an open question for the
   owner, OUTSTANDING.md [WARN-HIDE-KEPT]). On Edit Schedule: hide one warning on the week the app opens on (13 Jul) and
   one on the next week (20 Jul); then (a) reload and sign in again, (b) sign out and sign in as the same admin, (c) sign
   in as the member — and say, each time, which of the two is still hidden. */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p, errors } = await world(L)
await C.toastSpy(p)
const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
const V2 = process.env.P7_WH === '2'
const WK1 = '13/07/2026', WK2 = '20/07/2026'
const toWeek = async wk => {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
  if ((await p.evaluate(() => window.CURWEEK)) !== wk) { await p.locator(`[data-wk="${wk}"]:visible`).first().click(); await L.sleep(900) }
  return p.evaluate(() => window.CURWEEK)
}
/* a day's warning list, opened through its own bar: every line as it is painted */
const lines = async di => {
  await W.showDay(p, di)
  const box = p.locator(`#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`).first()
  if (!(await box.count())) return { head: '(no warning bar on the day)', items: [] }
  if (!(await box.evaluate(e => e.classList.contains('open')))) { await p.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await L.sleep(400) }
  return p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); if (!b) return { head: '(gone)', items: [] }
    return { head: (b.querySelector('.daywarn') || {}).innerText.replace(/\s+/g, ' ').trim(), items: [...b.querySelectorAll('.witem')].map(e => { const t = e.querySelector('.wtx') || e; const cs = getComputedStyle(t); return { text: t.innerText.replace(/\s+/g, ' ').trim(), cls: e.className, struck: cs.textDecorationLine, opacity: getComputedStyle(e).opacity, button: (e.querySelector('button') || {}).title || '' } }),
      other: [...b.querySelectorAll('.dwlist > :not(.witem)')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) } }, di)
}
const firstDayWithWarnings = async () => { for (let di = 0; di < 7; di++) { if (await p.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).count()) return di } return -1 }
const hide = async (di, ix) => { const b = p.locator(`#eWeek .day[data-day="${di}"] [data-woff="${di}.${ix}"]`).first(); if (!(await b.count())) return 'no ✕ on that line'; await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150); await b.click(); await L.sleep(500); return 'pressed' }
/* is THIS warning's sentence still in the day's list as a live line? (hidden = not listed, or listed struck / muted) */
const stateOf = (ls, text) => { const it = ls.items.find(x => x.text === text); if (!it) return 'NOT LISTED (hidden)'; return /mut|off|hid/.test(it.cls) || /line-through/.test(it.struck) ? `listed STRUCK OUT (hidden) — class "${it.cls}"` : `LISTED as a live warning (not hidden) — class "${it.cls}"` }

const r0 = await L.rows(p)
/* ---- week 13 Jul: Tuesday, its last line ---- */
await toWeek(WK1)
const D1 = 1
const a0 = await lines(D1)
const T1 = a0.items[a0.items.length - 1].text
await pic((V2 ? 'C37v2-0' : 'C37v-0') + '1-week13-tuesday-before')
const h1 = await hide(D1, a0.items.length - 1)
const t1 = await C.toasts(p)
const a1 = await lines(D1)
await pic((V2 ? 'C37v2-0' : 'C37v-0') + '2-week13-tuesday-one-hidden')
/* ---- week 20 Jul: the first day with a warning, its first line ---- */
await toWeek(WK2)
const D2 = await firstDayWithWarnings()
let T2 = null, b0 = null, b1 = null, h2 = 'no day of the week of 20 Jul shows a warning', t2 = []
if (D2 >= 0) {
  b0 = await lines(D2); T2 = b0.items[0].text
  await pic((V2 ? 'C37v2-0' : 'C37v-0') + '3-week20-before')
  h2 = await hide(D2, 0); t2 = await C.toasts(p)
  b1 = await lines(D2)
  await pic((V2 ? 'C37v2-0' : 'C37v-0') + '4-week20-one-hidden')
}
await L.settle(p)
const r1 = await L.rows(p); const d = L.diff(r0, r1)
const wrote = [...d.put, ...d.del.map(k => 'DEL ' + k)]
const muteRows = wrote.filter(k => !/^(settings\/elog|changes)/.test(k)).map(k => k + (r1[k] && /mute|woff|hid/i.test(r1[k]) ? ' (carries a mute)' : ''))
console.log('rows written by the two hides', wrote)
const read = async label => {
  await toWeek(WK1); const x = await lines(D1); await pic(`C37v-${label}-week13`)
  let y = null; if (D2 >= 0) { await toWeek(WK2); y = await lines(D2); await pic(`C37v-${label}-week20`) }
  return { wk13: `${x.head} → "${T1.slice(0, 50)}…": ${stateOf(x, T1)}`, wk20: y ? `${y.head} → "${T2.slice(0, 50)}…": ${stateOf(y, T2)}` : '(none hidden there)' }
}
const now = { wk13: `${a1.head} → ${stateOf(a1, T1)}`, wk20: b1 ? `${b1.head} → ${stateOf(b1, T2)}` : h2 }
let afterReload, afterSignIn, order
if (!V2) {
  order = 'a reload + sign-in (the app opens on 13 Jul), THEN sign out and in while the week of 20 Jul is on screen'
  /* (a) reload, sign in again */
  await p.reload(); await L.signIn(p, 'a', { goto: false }); await C.toastSpy(p)
  afterReload = await read('05-after-reload')
  /* (b) sign out, sign in as the same admin (the week of 20 Jul is the one on screen) */
  await W2.signOut(p); await L.signIn(p, 'a', { goto: false }); await C.toastSpy(p)
  afterSignIn = await read('06-after-sign-out-and-in')
} else {
  order = 'the OTHER order: back to the week of 13 Jul, sign out and in with NO reload, THEN a reload + sign-in'
  await toWeek(WK1)
  await W2.signOut(p); await L.signIn(p, 'a', { goto: false }); await C.toastSpy(p)
  afterSignIn = await read('05b-after-sign-out-and-in-on-week13')
  await toWeek(WK1)
  await p.reload(); await L.signIn(p, 'a', { goto: false }); await C.toastSpy(p)
  afterReload = await read('06b-then-a-reload')
}
/* (c) the member signs in on the same browser: what does HIS Edit Schedule / View-only Sched say? (he has no Edit page) */
await W2.signOut(p); await L.signIn(p, 'm', { goto: false })
const memberSees = await p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="1"]'); if (!d) return 'no Tuesday on View-only Sched'; const b = d.querySelector('.daywarn'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : 'no warning bar on the member\'s Tuesday' })
await pic(V2 ? 'C37v-07b-member-view' : 'C37v-07-member-view')

C.row(V2 ? 'C37-v (second order)' : 'C37-v', `(${order}) Edit Schedule: week of 13 Jul, Tuesday's warning list opened, ✕ on its last line ("${T1.slice(0, 70)}…") — ${h1}; week of 20 Jul (its ${D2 >= 0 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][D2] : '—'}), ✕ on the first line ("${T2 ? T2.slice(0, 70) : ''}…") — ${h2}; then a reload + sign-in; then sign out and in as the same admin; then the member`,
  `before: 13 Jul "${a0.head}", 20 Jul "${b0 ? b0.head : ''}". RIGHT AFTER HIDING — 13 Jul: ${now.wk13}; 20 Jul: ${now.wk20}; toasts ${JSON.stringify([...t1, ...t2])}. AFTER A RELOAD — 13 Jul: ${afterReload.wk13}; 20 Jul: ${afterReload.wk20}. AFTER SIGN OUT AND IN (same admin) — 13 Jul: ${afterSignIn.wk13}; 20 Jul: ${afterSignIn.wk20}. The member's View-only Sched Tuesday: ${memberSees}`,
  `rows the two hides wrote: ${muteRows.join(', ') || '(none besides the change history)'}`, 'RECORDED (observe only — not judged)', pics)
console.log('ERRORS', JSON.stringify(errors))
C.savePart(V2 ? 'warnhide-2' : 'warnhide', { errors, detail: { T1, T2, a0, a1, b0, b1, wrote } })
await browser.close()
