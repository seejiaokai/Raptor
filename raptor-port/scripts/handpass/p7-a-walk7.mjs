/* [DB-READINESS] phase 7 — WALKER A, part 7: the member's View-only Sched, a DRAFT day with a Personal row carrying
   ALL AVAIL that is "new to him": is the count chip readable beside the "new" mark? (Seen small in R4-1: a glyph sat
   over the chip.) A close picture at 3× and what is drawn there. */
import { boot, fileTimed, TODAY } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const browser = await L.launch()
const ctx = await browser.newContext({ viewport: L.DESK, deviceScaleFactor: 3 })
await ctx.clock.setFixedTime(TODAY)
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await W.toastSpy(p)
const SUN = A.SUN
A.scen('R4b', 'Sunday (a draft): timed Personal (Ranger) with ALL AVAIL, put there by the admin; sign out; the member (Ranger) opens View-only Sched — the chip beside the placeholder, close up; the same seat as the admin sees it')
try {
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[SUN], from: '10:00', to: '11:00', remarks: 'P7 R4b' })
  await W.boardOn(p, SUN)
  A.ok('ALL AVAIL placed', (await A.place(S, p, SUN, await A.rowIdx(p, SUN, iid), 'extras', 'allavail')).took)
  await W.boardOff(p)
  const close = async (who) => {
    await L.go(p, 'viewsched'); await A.showWeekChip(p, '#vWeek', SUN, iid)
    const info = await p.evaluate(([d, i]) => {
      const c = document.querySelector(`#vWeek .day[data-day="${d}"] .oilcount[data-oilsent="i:${i}"]`); if (!c) return null
      const seat = c.closest('.seat'); const r = c.getBoundingClientRect(), sr = seat.getBoundingClientRect()
      const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      const over = [...seat.querySelectorAll('*')].filter(e => e !== c && !c.contains(e)).map(e => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { cls: e.className.toString().slice(0, 40), tag: e.tagName, txt: (e.textContent || '').slice(0, 12), overlap: !(b.right <= r.left || b.left >= r.right || b.bottom <= r.top || b.top >= r.bottom), pos: cs.position, before: getComputedStyle(e, '::before').content, after: getComputedStyle(e, '::after').content } }).filter(x => x.overlap)
      const cs = getComputedStyle(c)
      return { chip: { txt: c.innerText.trim(), cls: c.className, box: `${Math.round(r.width)}x${Math.round(r.height)}`, font: cs.fontSize, before: getComputedStyle(c, '::before').content, after: getComputedStyle(c, '::after').content },
        seat: { cls: seat.className, html: seat.outerHTML.slice(0, 500), before: getComputedStyle(seat, '::before').content, after: getComputedStyle(seat, '::after').content },
        hit: at ? (at === c || c.contains(at)) : false, hitBy: at ? at.className.toString().slice(0, 40) : null, over,
        clip: { x: Math.max(0, sr.left - 150), y: Math.max(0, sr.top - 40), width: 420, height: 100 } }
    }, [SUN, iid])
    if (!info) { A.ok(`${who}: the chip is drawn on Sunday`, false, 'no chip'); return null }
    await p.screenshot({ path: `${L.SHOTS}/R4b-${who}-sunday-chip-closeup.png`, clip: info.clip })
    ROWPICS.push(`R4b-${who}-sunday-chip-closeup.png`)
    A.said(`${who}: chip "${info.chip.txt}" [${info.chip.cls}] ${info.chip.box} font ${info.chip.font}; chip ::before ${info.chip.before} ::after ${info.chip.after}; seat [${info.seat.cls}] ::before ${info.seat.before} ::after ${info.seat.after}; a press on the chip's middle lands on the chip: ${info.hit}${info.hit ? '' : ' (on ' + info.hitBy + ')'}; things drawn over it: ${JSON.stringify(info.over)}`)
    A.data(`${who}: the seat: ${info.seat.html}`)
    return info
  }
  const ROWPICS = A.ROWS[A.ROWS.length - 1].pics
  const a = await close('admin')
  await W2.signOut(p); await L.signIn(p, 'm', { goto: false })
  const m = await close('member')
  A.ok('MEMBER: the chip\'s number is readable — nothing is drawn over it', !!m && m.over.length === 0 && /none|normal|^""$/.test(m.chip.before + m.chip.after) , m && { over: m.over, before: m.chip.before, after: m.chip.after })
  const w = await A.openChip(p, `#vWeek .day[data-day="${SUN}"]`, iid)
  A.ok('MEMBER: the chip still opens its window', w.open, w.open)
  await A.closeWin(p)
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)) }
A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk7.json'), { errors })
await browser.close()
