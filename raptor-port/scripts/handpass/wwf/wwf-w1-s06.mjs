/* wwf w1 scenario 6 — the assumed hour still works everywhere else. */
import * as H from './wwf-w1-lib.mjs'
const X = await H.init(process.env.RUN || 's06')
const { say, sleep, row, pic } = X
const w = await X.open({})
const { page } = w
const S = 'S6', SZ = 'desktop'
const crewOf = ls => ls.filter(l => H.crew(l))
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const blocks = d => page.evaluate(d => JSON.stringify(window.DAYS[d].dutywaves.map(b => b.label + '/' + (b.sa || '-') + ':' + b.rows.slice(0, 1).map(r => r.role + ' ' + r.str + '-' + r.end + ' ' + (r.id || '') + (r.more ? '+' + JSON.stringify(r.more) : '')).join(' | '))), d)
const addGround = async (d, prog, str, end, ppl) => {
  const n = await page.evaluate(d => window.DAYS[d].ground.length, d)
  await X.press(w, `[data-gradd="${d}"]`, { scope: 'board' }); await sleep(400)
  await X.typeIn(w, `[data-bfld="gr:${d}.${n}.prog"]`, prog)
  await X.typeIn(w, `[data-bfld="gr:${d}.${n}.str"]`, str)
  await X.typeIn(w, `[data-bfld="gr:${d}.${n}.end"]`, end)
  const r = []
  for (const p of ppl) r.push(await X.seat(w, `[data-fill="g:${d}.${n}.+"]`, p))
  say('ground row', d, n, prog, str, end, r.join(','))
  return n
}
const strip = async (d, tag, root = '#eWeek') => { const ww = await X.weekWarn(w, root, d); say(tag + ' strip', ww.head, JSON.stringify(ww.items)); return ww }
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
// ---- V1 Tue (1): SC desk 20:00 blank, Ranger + Echo, meeting 20:30-20:45 with Ranger
const v1 = await H.makeDesk(X, w, 1, { tpl: 'sc', str: '20:00', end: '', people: ['bane', 'freak'] })
await addGround(1, 'MEETING', '20:30', '20:45', ['bane'])
await pic(w, '01-v1-board')
say('V1 blocks', await blocks(1))
let bw = await X.boardWarn(w); say('V1 board warnings', JSON.stringify(bw)); await pic(w, '02-v1-board-warn')
await X.closeBoard(w)
let ww = await strip(1, 'V1')
await pic(w, '03-v1-week-strip')
const v1conf = ww.items.filter(l => /Ranger/.test(l) && /conflict|double|clash|also|overlap/i.test(l))
row(S, SZ, 'Tue: SC desk START 20:00 END blank (Ranger + Echo); ground MEETING 20:30-20:45 with Ranger', 'the desk still occupies its assumed 20:00-21:00: a conflict line for Ranger with the meeting', ww.head + ' ' + JSON.stringify(ww.items.filter(l => !/OIL waiting/.test(l))), v1conf.length ? 'PASS' : 'FAIL', 'w1/s06/03-v1-week-strip.png')
// ---- V2 Wed (2): isolated desk + 08:00 task => long day
const v2 = await H.makeDesk(X, w, 2, { tpl: 'sc', str: '20:00', end: '', people: ['wrangler'] })
await addGround(2, 'TASK', '08:00', '08:30', ['wrangler'])
await X.closeBoard(w)
ww = await strip(2, 'V2')
await pic(w, '04-v2-week-strip')
const longl = ww.items.filter(l => /long day|13h|hours? on duty|day length/i.test(l))
row(S, SZ, 'Wed: Otter alone on an SC desk START 20:00 END blank, plus an 08:00-08:30 task', 'long-day warning: span 08:00 to 21:00 = 13h against 12h', ww.head + ' ' + JSON.stringify(ww.items.filter(l => !/OIL waiting/.test(l))), longl.length ? 'PASS' : 'FAIL', 'w1/s06/04-v2-week-strip.png')
const T = await import('./wwf-w1-s06-tail.mjs')
await T.run({ X, H, w, page, S, SZ, step, blocks, strip })
await X.fin(w)
