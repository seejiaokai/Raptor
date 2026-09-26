/* The schedule side of an absence (26 Sep 26) — publish a day through the board's own sign-off selects and Publish,
   then read what every surface says about it: the pending count on the week head, the board, both ⓘ panels and the
   Amendments panel; the four sign-offs; the day's Unavailable block on the published face (View-only Sched) and on the
   working copy (Edit Schedule). Lifted from the [LEAVE-LATE-PUBLISHED] walk (../am/late-pub-leavewar-walk.mjs), where
   they were local, so the absence walk reads the same numbers the same way. */
import { editWeek, board, closeBoard, signDay, publishDay, head, go, dayInfo, closeDayInfo, panel, norm, readUnav, frame } from './ab-lib.mjs'
import { shot } from './ab-lib.mjs'

const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']

/** Sign the four on the board and press Publish day. */
export async function pubOnBoard(page, di) {
  await board(page, di)
  const sg = await signDay(page, di, 0)
  const p = await publishDay(page, di)
  return { sg, p, h: await head(page, di) }
}
/** Publish, then sign the four AGAIN (nothing waiting) — the signed state a late change must take down (D103). */
export async function pubAndSign(page, di) {
  const pub = await pubOnBoard(page, di)
  await signDay(page, di, 0)
  return { pub, signs: await signVals(page, di) }
}
export const signVals = (page, di) => page.evaluate(di => [...document.querySelectorAll(`#schedBoard select[data-signday="${di}"]`)]
  .filter(s => s.offsetWidth || s.offsetHeight).map(s => (s.options[s.selectedIndex] || {}).text || ''), di)

/** Every count a person can read for day di (week head, board, both ⓘ, the Amendments panel) and the sign-offs. */
export async function counts(page, di) {
  const c = {}
  await editWeek(page)
  const hw = await head(page, di); c.week = norm(hw.pending); c.nys = hw.nys
  const iw = await dayInfo(page, di, 'week'); c.infoWeek = iw.pend || '(none)'; await closeDayInfo(page)
  const P = await panel(page)
  c.panel = P.visible ? ((P.days.find(d => (d.text || '').startsWith(DOW[di])) || {}).text || '(not listed)') : '(no panel at this width)'
  await board(page, di)
  const hb = await head(page, di); c.board = norm(hb.pending); c.signLine = norm(hb.signState)
  const ib = await dayInfo(page, di, 'board'); c.infoBoard = ib.pend || '(none)'; await closeDayInfo(page)
  c.signs = await signVals(page, di)
  c.n = { week: num(c.week), board: num(c.board), infoWeek: num(c.infoWeek), infoBoard: num(c.infoBoard) }
  const pm = /· (\d+) change/.exec(c.panel || ''); if (!/no panel/.test(c.panel)) c.n.panel = pm ? +pm[1] : 0
  c.fell = c.signs.every(x => !x || /—|sign/i.test(x))
  await closeBoard(page)   // the board is a full-screen layer — leave it closed for whatever the walk does next
  return c
}
/** Do all the counts agree on `want`? Returns [ok, disagreements]. */
export function agree(c, want) {
  const bad = Object.entries(c.n).filter(([, v]) => v !== want)
  return [!bad.length, bad.map(([k, v]) => k + '=' + v).join(', ')]
}

/** The day's Unavailable block on the published face ('face' — View-only Sched) or the working copy ('work'). */
export async function unavOn(page, where, di) {
  if (where === 'face') { await go(page, 'viewsched'); await page.waitForTimeout(350) } else await editWeek(page)
  return readUnav(page, `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"]`)
}
/** Picture a day card's Unavailable block where it sits (face or working copy). */
export async function shotUnav(page, where, di, name) {
  if (where === 'face') { await go(page, 'viewsched'); await page.waitForTimeout(350) } else await editWeek(page)
  const sel = `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"] .sec-unav`
  if (await page.locator(sel).count()) { await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250) }
  else await frame(page, `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"]`)
  return shot(page, name)
}

/** Aircrew with nothing on day di: on no seat, desk, sim, ground or programme row, no input covering it, drawn on the
    war (READ only — for choosing whom to walk with). */
export async function freeMen(page, dis) {
  return page.evaluate(dis => {
    const busy = new Set()
    for (const di of dis) {
      const d = window.DAYS[di]
      d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) busy.add(a.p); if (a.w) busy.add(a.w) })))
      ;(d.dutywaves || []).forEach(b => b.rows.forEach(r => { if (r.id) busy.add(r.id); (r.more || []).forEach(m => m && busy.add(m)) }))
      ;['oft', 'amt'].forEach(k => ((d.sims || {})[k] || []).forEach(x => { if (x.p) busy.add(x.p); if (x.w) busy.add(x.w); (x.pax || []).forEach(p => busy.add(p)) }))
      ;(d.ground || []).forEach(g => g.who && busy.add(g.who))
      ;(d.allhands || []).forEach(a => (Array.isArray(a.who) ? a.who : [a.who]).forEach(v => v && busy.add(v)))
    }
    for (const x of window.INPUTS) if (/Jul 1[0-9]/.test(`${x.date} ${x.endDate || ''}`)) busy.add(x.person)
    return Object.entries(window.PEOPLE)
      .filter(([k, p]) => (p.seat === 'FCP' || p.seat === 'RCP') && !p.sans && k !== 'allavail' && k !== 'all' && !busy.has(k))
      .map(([k]) => k)
  }, dis)
}
