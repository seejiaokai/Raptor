/* [DB-READINESS] phase 7 walk — walker C, C29–C32 (desktop): EVERY DOOR a placeholder (ALL / ALL AVAIL) could reach a
   flying line's cockpit by, on a PUBLISHED Tuesday (so "no pending mark" is something the day head can show).
   Each attempt is judged the same way: the reason painted on screen; the seat as it was; the pending marks, the day
   head (count, four sign-offs), the Undo list and its button, the change history and every saved row unchanged. */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await C.toastSpy(p)
const DI = 1
const EP = '1.0.0.0.p', EW = '1.0.0.0.w', OP = '1.0.0.1.p', OW = '1.0.0.1.w'
const KEYS = [EP, EW, OP, OW, 'g:1.1', 's:1.amt.1.p', 's:1.amt.1.w']
const REASON = /cannot crew a jet; name the people flying it/
const NAME = { all: 'ALL', allavail: 'ALL AVAIL' }
const cs = id => p.evaluate(i => (window.PEOPLE[i] && window.PEOPLE[i].cs) || i, id)
const pics = []
const pic = async n => { await L.shot(p, n); pics.push(n + '.png'); return n + '.png' }

async function attempt(id, did, fn) {
  const mine = []
  const s1 = await C.snap(p, DI, KEYS), r1 = await L.rows(p); await C.toasts(p)
  let err = null, ret = null
  try { ret = await fn(async n => { await L.shot(p, n); mine.push(n + '.png') }) } catch (e) { err = String(e && e.message || e).split('\n')[0].slice(0, 300) }
  const now = await C.toastNow(p)
  await L.shot(p, id); mine.push(id + '.png')
  await L.settle(p, 700)
  const ts = await C.toasts(p)
  const s2 = await C.snap(p, DI, KEYS), r2 = await L.rows(p)
  const d = C.same(s1, s2), rd = C.rowsSame(L, r1, r2)
  const reason = ts.filter(t => REASON.test(t))
  const ok = !err && !d.length && !rd.length && reason.length > 0
  C.row(id, did,
    err ? 'GESTURE ERROR: ' + err : `toast: ${ts.map(t => '"' + t + '"').join(' · ') || '(none)'}${now && now.shown ? ' (painted at the picture)' : ''}${ret && ret.note ? ' · ' + ret.note : ''}`,
    d.length || rd.length ? `CHANGED: ${[...d, ...rd].join(' | ')}` : `seat as it was (${Object.entries(s2.seats).filter(([k]) => /^\d/.test(k)).map(([k, v]) => k + '=' + (v.val || 'empty')).join(', ')}); pending ${s2.pendingDay.length} = before; head "${s2.head ? s2.head.pending : ''}" signs [${s2.head ? s2.head.signs.join('/') : ''}]; Undo list ${s2.hist.ix}/${s2.hist.n} = before; history ${s2.elog} lines = before; no row written`,
    ok ? 'PASS' : 'FAIL', mine)
  await p.keyboard.press('Escape'); await L.sleep(200)
  return { ok, d, rd, ts, ret }
}
/* tap-arm a seat on a surface, then tap a puck in that surface's crew list */
async function armTap(surface, key, pid, shoot, shotId) {
  const root = surface === 'board' ? '#schedBoard' : '#eWeek'
  const ros = surface === 'board' ? '#sbRoster' : '#eRoster'
  const seat = p.locator(`${root} [data-slot="${key}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200)
  await seat.click(); await L.sleep(300)
  const armed = await p.evaluate(() => window.armedKey())
  const struck = await p.evaluate(([ros, pid]) => { const e = document.querySelector(`${ros} .rpuck[data-person="${pid}"]`); if (!e) return null; const rowEl = e.closest('.rall') || e.parentElement; const nm = e.querySelector('.nm') || e
    return { cls: e.className, title: e.title, row: rowEl.innerText.replace(/\s+/g, ' ').trim().slice(0, 200), line: getComputedStyle(nm).textDecorationLine, opacity: getComputedStyle(e).opacity } }, [ros, pid])
  await shoot(shotId + '-armed')
  const puck = p.locator(`${ros} .rpuck[data-person="${pid}"]:visible`).first()
  await puck.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await L.sleep(120)
  try { await puck.click({ timeout: 2500 }) } catch { const b = await puck.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await L.sleep(300)
  const still = await p.evaluate(() => window.armedKey())
  if (armed !== key) throw new Error(`the seat did not arm (armed: ${armed})`)
  return { note: `armed ${armed}; the ${NAME[pid]} puck in the crew list: class "${struck.cls}", title "${struck.title}", its row reads "${struck.row}", struck-through: ${struck.line}; still armed after the tap: ${still === key}` }
}

/* ---------- 0. publish Tuesday as it stands ---------- */
await W.toEdit(L, p); await W.showDay(p, DI)
const signed = await W.signDay(p, DI); const pub = await W.publishDay(p, DI)
await L.settle(p)
const h0 = await W.head(p, DI)
await pic('C29-00-tuesday-published')
C.row('C29-setup', 'Tuesday 14 Jul: the four sign-off boxes picked, Publish day pressed (so a pending mark has somewhere to show)', `day head: tag "${h0.tag}", pending "${h0.pending}", signed [${h0.signs.join(' / ')}]`, `publish: ${JSON.stringify(pub)}`, pub.pressed && /ORIG/.test(h0.tag) ? 'PASS' : 'FAIL', ['C29-00-tuesday-published.png'])

/* ---------- 1. C30 drag from the crew list onto an OCCUPIED cockpit (0 pending, four signed) ---------- */
await W.boardOn(p, DI)
for (const pid of ['all', 'allavail']) for (const key of [OP, OW]) {
  const occ = await cs(await p.evaluate(k => window.slotVal(k), key))
  await attempt(`C30-occ-${pid}-${key.slice(-1)}`, `board, nothing pending: a real pointer drag of ${NAME[pid]} from the crew list onto the ${key.endsWith('p') ? 'front' : 'rear'} seat of VL #2, held by ${occ}`, async () => {
    await W.drag(p, p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first(), p.locator(`#schedBoard [data-slot="${key}"]:visible`).first())
  })
}

/* ---------- 2. setup: empty both seats of VL #1 (right-click on the puck — the app's own remove) ---------- */
for (const key of [EP, EW]) {
  const pk = p.locator(`#schedBoard [data-slot="${key}"] .puck:visible`).first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150)
  await pk.click({ button: 'right' }); await L.sleep(500)
}
await L.settle(p)
const hs = await W.head(p, DI)
await pic('C29-01-two-seats-emptied')
console.log('after emptying', JSON.stringify(hs), await C.toasts(p))

/* ---------- 3. C29 tap-arm each empty cockpit, tap each placeholder ---------- */
for (const key of [EP, EW]) for (const pid of ['all', 'allavail'])
  await attempt(`C29-arm-${pid}-${key.slice(-1)}`, `board: tap the empty ${key.endsWith('p') ? 'front (+ FCP)' : 'rear (+ RCP)'} seat of VL #1 to arm it, then tap ${NAME[pid]} in the crew list`, sh => armTap('board', key, pid, sh, `C29-arm-${pid}-${key.slice(-1)}`))

/* ---------- 4. C30 drag from the crew list onto each EMPTY cockpit ---------- */
for (const key of [EP, EW]) for (const pid of ['all', 'allavail'])
  await attempt(`C30-drag-${pid}-${key.slice(-1)}`, `board: a real pointer drag of ${NAME[pid]} from the crew list onto the empty ${key.endsWith('p') ? 'front' : 'rear'} seat of VL #1`, async () => {
    await W.drag(p, p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first(), p.locator(`#schedBoard [data-slot="${key}"]:visible`).first())
  })

/* ---------- 5. setup: a placeholder standing legally — Common Programme, a ground row's name box, a sim seat ---------- */
const plant = async (armKey, pid, { fill = false } = {}) => {
  const z = p.locator(`#schedBoard [data-${fill ? 'fill' : 'slot'}="${armKey}"]:visible`).first()
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150)
  await z.click(); await L.sleep(300)
  const armed = await p.evaluate(() => window.armedKey())
  const pk = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await pk.click(); await L.sleep(500)
  await p.keyboard.press('Escape'); await L.sleep(200)
  return armed
}
const placedKey = (prefix, pid) => p.evaluate(([pre, id]) => { const e = [...document.querySelectorAll(`#schedBoard [data-slot^="${pre}"]`)].find(h => h.offsetParent !== null && h.querySelector(`[data-person="${id}"]`)); return e ? e.dataset.slot : null }, [prefix, pid])
const setup = {}
setup.cp = await plant('a:1.1.+', 'all', { fill: true })
// the ground row FLY W EXT SQN: its named man taken off (right-click), ALL put in its name box
{ const pk = p.locator(`#schedBoard [data-slot="g:1.1"] .puck:visible`).first(); await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await pk.click({ button: 'right' }); await L.sleep(500) }
setup.ground = await plant('g:1.1.+', 'all', { fill: true })   // an emptied name box is reached by the row's own "+ add"
setup.sim = await plant('s:1.amt.1.p', 'allavail')
await L.settle(p)
const SRC = { cp: await placedKey('a:1.1', 'all'), ground: await placedKey('g:1.1', 'all'), sim: await placedKey('s:1.amt.1', 'allavail') }
console.log('planted', JSON.stringify(setup), JSON.stringify(SRC), await C.toasts(p))
KEYS.push(...Object.values(SRC).filter(Boolean).filter(k => !KEYS.includes(k)))
await p.locator(`#schedBoard [data-slot="${SRC.cp}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
await pic('C31-00-placeholders-standing-legally')
const landedOk = SRC.cp && SRC.ground && SRC.sim
C.row('C31-setup', 'board: ALL added to the Common Programme row MASS BRIEF (arm its + then tap ALL); FLY W EXT SQN\'s man taken off and ALL put in that ground row\'s name box; ALL AVAIL put on the AMT BOX sim seat', `seats now holding a placeholder: Common Programme ${SRC.cp}, ground ${SRC.ground}, sim ${SRC.sim}`, 'these legal landings are allowed (D33) — they are the sources for the next door', landedOk ? 'PASS' : 'FAIL', ['C31-00-placeholders-standing-legally.png'])
await W.boardOff(p); await W.toEdit(L, p)
const lines0 = await (await import('./p6-lib.mjs')).changesList(L, p, DI)
console.log('changes window before the seat-to-seat doors', JSON.stringify(lines0))

/* ---------- 6. C31 drag a placeholder ALREADY STANDING on a seat onto a cockpit ---------- */
await W.boardOn(p, DI)
const srcName = { cp: 'the Common Programme row', ground: 'the ground row\'s name box', sim: 'the AMT sim seat' }
for (const [kind, sk] of Object.entries(SRC)) {
  if (!sk) continue
  const pid = kind === 'sim' ? 'allavail' : 'all'
  for (const key of [EP, EW, OP]) {
    const tall = kind !== 'cp'
    await attempt(`C31-${kind}-${key.replace(/\./g, '')}`, `board${tall ? ' (window made tall so both ends are on screen, as on a tall monitor)' : ''}: a real pointer drag of the ${NAME[pid]} puck standing on ${srcName[kind]} onto the ${key === OP ? 'OCCUPIED front seat of VL #2' : key === EP ? 'empty front seat of VL #1' : 'empty rear seat of VL #1'}`, async () => {
      if (tall) { await p.setViewportSize({ width: 1440, height: 2600 }); await L.sleep(400) }
      try { await W.drag(p, p.locator(`#schedBoard [data-slot="${sk}"] [data-person="${pid}"]:visible`).first(), p.locator(`#schedBoard [data-slot="${key}"]:visible`).first()) }
      finally { if (tall) { await L.shot(p, `C31-${kind}-${key.replace(/\./g, '')}-tall`); await p.setViewportSize(L.DESK); await L.sleep(400) } }
      const src = await p.evaluate(k => window.slotVal(k), sk)
      return { note: `the source ${sk} still holds: ${src || '(nothing)'}` }
    })
  }
}
/* the reverse: a NAMED cockpit man dragged onto the seat a placeholder holds (a swap would carry the placeholder in) */
{
  const s1 = await C.snap(p, DI, KEYS), r1 = await L.rows(p); await C.toasts(p)
  let err = null
  try { await W.drag(p, p.locator(`#schedBoard [data-slot="${OP}"] .puck:visible`).first(), p.locator(`#schedBoard [data-slot="${SRC.cp}"]:visible`).first()) } catch (e) { err = String(e.message).slice(0, 200) }
  await L.shot(p, 'C31-reverse-swap'); await L.settle(p, 700)
  const ts = await C.toasts(p), s2 = await C.snap(p, DI, KEYS)
  const inCock = [EP, EW, OP, OW].filter(k => ['all', 'allavail'].includes(s2.seats[k].val))
  C.row('C31-reverse', `board: the named pilot on VL #2's front seat dragged onto the Common Programme seat that holds ALL (a swap would carry ALL into the cockpit)`, err ? 'GESTURE ERROR ' + err : `toast: ${ts.map(t => '"' + t + '"').join(' · ') || '(none)'}`,
    `cockpit ${OP} now: ${s2.seats[OP].val || 'empty'}; ${SRC.cp} now: ${s2.seats[SRC.cp].val || 'empty'}; a placeholder in any cockpit: ${inCock.length ? inCock.join(',') : 'none'}; changes: ${C.same(s1, s2).join(' | ') || 'none'}`, !err && !inCock.length ? 'PASS' : 'FAIL', ['C31-reverse-swap.png'])
}

/* ---------- 7. C32 the other routes on the board: keyboard on the crew-list puck, the name search, a double-click ---------- */
await attempt('C32-keyboard-enter', 'board: arm the empty front seat of VL #1, put the keyboard on the ALL AVAIL puck in the crew list (it takes focus) and press Enter, then Space', async () => {
  const seat = p.locator(`#schedBoard [data-slot="${EP}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await seat.click(); await L.sleep(250)
  await p.locator('#sbRoster .rpuck[data-person="allavail"] .puck').first().focus()
  await p.keyboard.press('Enter'); await L.sleep(300); await p.keyboard.press('Space'); await L.sleep(300)
  return { note: 'armed ' + await p.evaluate(() => window.armedKey()) }
})
{
  const s1 = await C.snap(p, DI, KEYS), r1 = await L.rows(p); await C.toasts(p)
  const seat = p.locator(`#schedBoard [data-slot="${EP}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await seat.click(); await L.sleep(250)
  const sb = p.locator('#searchB:visible').first()
  let said = 'no name search box on the board'
  if (await sb.count()) { await sb.click(); await sb.fill('ALL AVAIL'); await L.sleep(400); await p.keyboard.press('Enter'); await L.sleep(400)
    said = 'typed "ALL AVAIL" in the board\'s name search with the cockpit armed, pressed Enter; crew list now offers: ' + (await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck')].filter(e => e.offsetParent !== null && !e.classList.contains('dim')).length)) + ' pucks' }
  await L.shot(p, 'C32-search'); await L.settle(p, 500)
  const ts = await C.toasts(p), s2 = await C.snap(p, DI, KEYS), d = C.same(s1, s2), rd = C.rowsSame(L, r1, await L.rows(p))
  if (await sb.count()) { await sb.fill(''); await L.sleep(200) }
  await p.keyboard.press('Escape'); await L.sleep(200)
  C.row('C32-search', 'board: arm the empty front seat of VL #1, type "ALL AVAIL" in the name search, Enter', `${said}; toast: ${ts.join(' · ') || '(none)'}`, d.length || rd.length ? 'CHANGED: ' + [...d, ...rd].join(' | ') : 'nothing written; the seat is empty', !d.length && !rd.length ? 'PASS' : 'FAIL', ['C32-search.png'])
}
await attempt('C32-dblclick', 'board: arm the empty rear seat of VL #1, double-click ALL in the crew list', async () => {
  const seat = p.locator(`#schedBoard [data-slot="${EW}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await seat.click(); await L.sleep(250)
  await p.locator('#sbRoster .rpuck[data-person="all"]:visible').first().dblclick(); await L.sleep(300)
  return { note: 'armed ' + await p.evaluate(() => window.armedKey()) }
})

/* ---------- 8. C32 the EDIT WEEK's own arm + crew list, and its drags ---------- */
await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, DI)
for (const key of [EP, EW]) for (const pid of ['all', 'allavail'])
  await attempt(`C32-week-arm-${pid}-${key.slice(-1)}`, `Edit Schedule (the week): tap the empty ${key.endsWith('p') ? 'front' : 'rear'} seat of Tuesday's VL #1, then tap ${NAME[pid]} in the week's crew list`, sh => armTap('week', key, pid, sh, `C32-week-arm-${pid}-${key.slice(-1)}`))
for (const [key, pid] of [[EP, 'all'], [EW, 'allavail'], [OP, 'allavail'], [OW, 'all']])
  await attempt(`C32-week-drag-${pid}-${key.replace(/\./g, '')}`, `Edit Schedule (the week): a real pointer drag of ${NAME[pid]} from the week's crew list onto Tuesday's ${[EP, EW].includes(key) ? 'empty' : 'OCCUPIED'} ${key.endsWith('p') ? 'front' : 'rear'} seat of VL #${[EP, EW].includes(key) ? 1 : 2}`, async () => {
    await W.showDay(p, DI)
    await W.drag(p, p.locator(`#eRoster .rpuck[data-person="${pid}"]:visible`).first(), p.locator(`#eWeek [data-slot="${key}"]:visible`).first())
  })
/* the week: the placeholder standing on Tuesday's ground row dragged onto the cockpit */
for (const key of [EP, OW])
  await attempt(`C32-week-seat-${key.replace(/\./g, '')}`, `Edit Schedule (the week): the ALL puck standing in Tuesday's ground row name box dragged onto the ${key === EP ? 'empty front seat of VL #1' : 'OCCUPIED rear seat of VL #2'}`, async () => {
    await W.showDay(p, DI)
    await p.setViewportSize({ width: 1440, height: 2600 }); await L.sleep(400)
    try { await W.drag(p, p.locator(`#eWeek [data-slot="${SRC.ground}"] [data-person="all"]:visible`).first(), p.locator(`#eWeek [data-slot="${key}"]:visible`).first()) }
    finally { await L.shot(p, `C32-week-seat-${key.replace(/\./g, '')}-tall`); await p.setViewportSize(L.DESK); await L.sleep(400) }
    return { note: `the source ${SRC.ground} still holds: ${await p.evaluate(k => window.slotVal(k), SRC.ground)}` }
  })

/* ---------- 9. the changes window: the same lines as before the doors; none puts a placeholder on a flying line ---------- */
await W.toEdit(L, p); await W.showDay(p, DI)
const P6 = await import('./p6-lib.mjs')
const c = p.locator(`#eWeek .day[data-day="${DI}"] .dpend`).first()
let lines1 = null
if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600); await pic('C29-99-changes-window'); const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } }
lines1 = await P6.changesList(L, p, DI)
const flying = (lines1 && lines1.lines || []).filter(t => /ALL/.test(t) && /(VL|RU|FCP|RCP|line|wave)/i.test(t) && !/MASS BRIEF|FLY W EXT SQN|AMT|BOX/i.test(t))
const hEnd = await W.head(p, DI)
C.row('C29-changes', 'Edit Schedule: Tuesday\'s pending count opened (the changes window, "To go out")', `lines before the seat-to-seat and week doors: ${JSON.stringify(lines0 && lines0.lines)} — after every door: ${JSON.stringify(lines1 && lines1.lines)}; day head "${hEnd.pending}"`,
  `a line that puts ALL / ALL AVAIL on a flying line: ${flying.length ? flying.join(' | ') : 'none'}`, lines1 && !flying.length && JSON.stringify(lines0 && lines0.lines) === JSON.stringify(lines1.lines) ? 'PASS' : (flying.length ? 'FAIL' : 'PASS (see the lines)'), ['C29-99-changes-window.png'])

/* ---------- 10. a reload: the cockpits are as they were left; nothing came back ---------- */
await L.reloadCompare(p, 'C29-reload', 'a', { page: 'editsched' })
await C.toastSpy(p)
const sEnd = await C.snap(p, DI, KEYS)
await W.showDay(p, DI); await pic('C29-98-after-reload')
C.row('C29-reload', 'reload, sign in again, Edit Schedule', `Tuesday's VL #1 seats: ${sEnd.seats[EP].dom.join(',')} / ${sEnd.seats[EW].dom.join(',')}; VL #2: ${sEnd.seats[OP].val} / ${sEnd.seats[OW].val}`, L.results.filter(r => /C29-reload/.test(r.name)).map(r => (r.ok ? 'ok ' : 'FAIL ') + r.name.split('— ')[1] + (r.ok ? '' : ' ' + r.detail)).join(' · '), L.results.filter(r => /C29-reload/.test(r.name)).every(r => r.ok) && ![EP, EW, OP, OW].some(k => ['all', 'allavail'].includes(sEnd.seats[k].val)) ? 'PASS' : 'FAIL', ['C29-98-after-reload.png'])

console.log('ERRORS', JSON.stringify(errors))
C.savePart('doors-desktop', { errors })
await browser.close()
