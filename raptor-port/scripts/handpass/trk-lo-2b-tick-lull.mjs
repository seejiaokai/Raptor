/* [TRK-LEFTOVERS] walker b — C6 and C7.
   C6: a press on ANOTHER student's red failure tick picks that student (as a
   press on his slice of the ball does) — it does not open grading for the one
   picked, and the view stays where it is; a press on the picked student's OWN
   tick opens his grading. The chart is zoomed in with its own + so the ticks
   are big enough to hit, and every press lands exactly on a tick (checked:
   the tick is what sits under the point).
   C7: "+ Set lull period" opens on THIS month (the squadron's), even after a
   period in another month was changed; a period's chip opens on its own month.

     node scripts/handpass/trk-lo-2b-tick-lull.mjs desk|phone

   A fresh browser (the demo world), admin. */
import { open, shot, save, log, reveal, PHONE, DESK } from './trk-lib.mjs'
import { sleep, pickFrom, popOpen, popTitle } from './trk-w2-lib.mjs'
import { PH, TAG, todayIso, addDays, short, press, pressSel, toInfo, toFlow, tapBall, stored } from './trk-lo-2b-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: PH ? PHONE : DESK, who: 'a', touch: PH })
const T = await todayIso(page)
let pic = 0
const snap = async (what, opts) => { const n = `lo-2b-${TAG}-t${++pic}-${what}`; await shot(page, n, opts); return n }
const crew = () => page.locator('#activeSel option:checked').innerText()
const closePop = async () => { if (await popOpen(page)) { await pressSel(page, '#pop .opts button:nth-child(6)'); await sleep(250) } }
L.note('0 today / roster / picked', `${T} · ${await crew()} · ${PH ? 'phone 390×844 touch' : 'desktop 1440×900'}`)

/* ===================== C6 ===================== */
/* one failure each on BFM-3: A's, then B's */
await tapBall(page, 'BFM-3'); await pressSel(page, '#popFailPlus'); await sleep(400); await closePop()
await pickFrom(page, '#activeSel', /STUDENT B/)
await tapBall(page, 'BFM-3'); await pressSel(page, '#popFailPlus'); await sleep(400); await closePop()
await pickFrom(page, '#activeSel', /STUDENT A/)
L.note('C6.0 one failure each on BFM-3', JSON.stringify({ A: (((await stored(page)).m || {})['BFM-3'] || {}).f }) + ' · crew ' + await crew())
/* zoom the chart in with its own + */
await toFlow(page)
for (let k = 0; k < (PH ? 20 : 15); k++) { await pressSel(page, '#fzIn'); await sleep(60) }
await sleep(400)
await reveal(page, 'BFM-3'); await sleep(300)
L.note('C6.1 chart zoom', await page.locator('#fzPct').innerText())
/** the screen point of wedge `wi`'s tick on BFM-3, and what a press there meets */
const tickAt = wi => page.evaluate(wi => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'BFM-3'); if (!g) return null
  const l = g.querySelector(`line.ftick[data-wi="${wi}"]`); if (!l) return null
  const r = l.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2
  const hit = document.elementFromPoint(x, y)
  return { x, y, w: +r.width.toFixed(1), h: +r.height.toFixed(1), hit: hit ? hit.tagName.toLowerCase() + '.' + (hit.getAttribute('class') || '') + '[wi=' + (hit.dataset ? hit.dataset.wi : '') + ']' : null }
}, wi)
const view = () => page.evaluate(() => {
  const b = document.getElementById('board'); const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'BFM-3')
  const c = g.querySelector(':scope > circle').getBoundingClientRect()
  return { top: Math.round(b.scrollTop), left: Math.round(b.scrollLeft), ball: [Math.round(c.left + c.width / 2), Math.round(c.top + c.height / 2)], zoom: (document.getElementById('fzPct') || {}).textContent }
})
const mineWi = () => page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'BFM-3'); const m = g && g.querySelector('path.mine'); return m ? m.dataset.wi : null })
{
  const tB = await tickAt(1), v0 = await view()
  const n0 = await snap('bfm3-zoomed-A-picked', { el: '#flowSvg .ball[data-id="BFM-3"]' })
  L.note(`C6.2 STUDENT A picked; B's tick on BFM-3 (${n0})`, JSON.stringify(tB) + ' · view ' + JSON.stringify(v0))
  L.ok('C6.3 the press point is ON B\'s tick (the tick is what sits there)', !!tB && /ftick/.test(tB.hit) && /wi=1/.test(tB.hit), JSON.stringify(tB))
  await press(page, tB.x, tB.y); await sleep(500)
  const opened = await popOpen(page), c1 = await crew(), v1 = await view(), m1 = await mineWi()
  const n1 = await snap('press-B-tick')
  L.ok(`C6.4 a press on B's tick picks STUDENT B — no grading opens (${n1})`, !opened && c1 === 'STUDENT B' && m1 === '1', `pop-up ${opened ? 'OPEN: "' + await popTitle(page) + '"' : 'none'} · crew ${c1} · cyan edge on wedge ${m1}`)
  L.ok('C6.5 … and the view stays where it was (no scroll, the ball where it was)', v1.top === v0.top && v1.left === v0.left && Math.abs(v1.ball[0] - v0.ball[0]) <= 1 && Math.abs(v1.ball[1] - v0.ball[1]) <= 1, `before ${JSON.stringify(v0)} · after ${JSON.stringify(v1)}`)
  if (opened) await closePop()
  /* B picked: a press on A's tick picks A back */
  const tA = await tickAt(0)
  L.ok('C6.6 the press point is ON A\'s tick', !!tA && /ftick/.test(tA.hit) && /wi=0/.test(tA.hit), JSON.stringify(tA))
  await press(page, tA.x, tA.y); await sleep(500)
  const opened2 = await popOpen(page), c2 = await crew(), v2 = await view()
  L.ok('C6.7 with B picked, a press on A\'s tick picks STUDENT A — no grading, view kept', !opened2 && c2 === 'STUDENT A' && v2.top === v0.top && v2.left === v0.left, `pop-up ${opened2} · crew ${c2} · view ${JSON.stringify(v2)}`)
  if (opened2) await closePop()
  /* A picked: a press on A's OWN tick opens A's grading */
  const tA2 = await tickAt(0)
  await press(page, tA2.x, tA2.y); await sleep(500)
  const opened3 = await popOpen(page), t3 = opened3 ? await popTitle(page) : '', v3 = await view()
  const n3 = await snap('press-own-tick')
  L.ok(`C6.8 a press on the picked student's OWN tick opens HIS grading ("BFM-3 · STUDENT A") (${n3})`, opened3 && /BFM-3\s*·\s*STUDENT A/.test(t3), `pop-up "${t3}" · crew ${await crew()} · view ${JSON.stringify(v3)}`)
  await closePop()
}

/* ===================== C7 ===================== */
await toInfo(page)
const cal = () => page.evaluate(() => { const c = document.getElementById('lullCal'); if (!c) return null; return { head: c.querySelector('.lullhd b').textContent, month: c.querySelector('.cal .hd b').textContent } })
const thisMonth = await page.evaluate(t => new Date(Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }), T)
const monthOf = iso => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
async function goMonth(label) { for (let k = 0; k < 14 && (await cal()).month !== label; k++) { await pressSel(page, '#lullNext'); await sleep(150) } }
async function day(iso) { await pressSel(page, `#lullCal .day[data-iso="${iso}"]`); await sleep(350) }
{
  /* a period in November */
  const n1 = addDays(T, 45), n2 = addDays(T, 47)   // mid-November
  await pressSel(page, '#setLullBtn'); await sleep(350)
  const c0 = await cal()
  L.ok(`C7.1 the first "+ Set lull period" opens on this month (${thisMonth})`, c0 && c0.month === thisMonth, JSON.stringify(c0))
  await goMonth(monthOf(n1)); await day(n1); await day(n2)
  L.note('C7.2 a period set in ' + monthOf(n1), JSON.stringify(((await stored(page)).lulls || [])))
  /* its chip opens on its own month; change it to December */
  await pressSel(page, '#lullChips .lullchip'); await sleep(350)
  const c1 = await cal()
  L.ok(`C7.3 the chip opens the calendar on the period's own month (${monthOf(n1)})`, c1 && c1.month === monthOf(n1) && /Change lull period/.test(c1.head), JSON.stringify(c1))
  const d1 = addDays(T, 75), d2 = addDays(T, 77)
  await goMonth(monthOf(d1)); await day(d1); await day(d2)
  const lulls = ((await stored(page)).lulls || []).map(l => l.start + '→' + l.end)
  L.ok(`C7.4 the period changed to ${short(d1)}→${short(d2)} (${monthOf(d1)})`, JSON.stringify(lulls) === JSON.stringify([d1 + '→' + d2]), JSON.stringify(lulls))
  /* + Set lull period again: THIS month */
  await pressSel(page, '#setLullBtn'); await sleep(350)
  const c2 = await cal()
  const n = await snap('new-period-opens-this-month', { el: '#lullCal' })
  L.ok(`C7.5 "+ Set lull period" after changing a period in ${monthOf(d1)} opens on THIS month, ${thisMonth} (${n})`, c2 && c2.month === thisMonth && /Set lull period/.test(c2.head), JSON.stringify(c2))
  /* arrow away inside a new period's calendar, close with ✕, open a new one again */
  await pressSel(page, '#lullNext'); await sleep(150); await pressSel(page, '#lullNext'); await sleep(150)
  const away = (await cal()).month
  await pressSel(page, '#lullClose'); await sleep(300)
  await pressSel(page, '#setLullBtn'); await sleep(350)
  const c3 = await cal()
  L.ok(`C7.6 a new period's calendar arrowed to ${away}, closed with ✕, "+ Set lull period" again → ${thisMonth}`, c3 && c3.month === thisMonth, JSON.stringify(c3))
  await pressSel(page, '#lullClose'); await sleep(300)
  /* and the chip still opens on its own month afterwards */
  await pressSel(page, '#lullChips .lullchip'); await sleep(350)
  const c4 = await cal()
  L.ok(`C7.7 the period's chip still opens on its own month (${monthOf(d1)})`, c4 && c4.month === monthOf(d1), JSON.stringify(c4))
  await pressSel(page, '#lullClose'); await sleep(300)
}

L.ok('no console errors, page errors, failed requests or native dialogs', errors.length === 0, JSON.stringify(errors))
save(`lo-2b-tick-lull-${TAG}`, { rows: L.rows, errors })
await browser.close()
process.exit(L.rows.some(r => r.pass === false) ? 1 : 0)
