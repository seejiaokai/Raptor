// swl-w1B-probe2 — walker B (chat 203): who the SANS men are, the demo's SANS lines' people, Wednesday's list opened by its bar
// and read as drawn, the line's markup, the board's panel and the ⓘ popup of the same day. Run from raptor-port/:
//   SWLB_RUN=probe2 SZ=d node scripts/handpass/swl-w1B-probe2.mjs
import './swl-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const B = await import('./swl-w1B-lib.mjs')
const { L, T, J, sleep, OUT, path } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B-probe2 2 · size', SZ, '· out', OUT)
await T.run('probe2', SZ, async (p, W) => {
  await L.go(p, 'editsched'); await sleep(800)
  const sans = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([, q]) => q.san).map(([k, q]) => `${k}=${q.cs}${q.sanFrom ? ' from ' + q.sanFrom : ''}`))
  W.rec('sans', 'every SANS man (id=callsign, read only)', 'REC', sans.join(', '))
  const who = await p.evaluate(() => (window.DAYS || []).map((d, i) => (((window.WARN || {}).byDay || {})[i] || { warns: [] }).warns.filter(w => w.code === 'SANS_AVAIL').map(w => `${d.dt}: ${(w.who || []).map(x => (window.PEOPLE[x] || {}).cs + '(' + x + ')').join('+')} :: ${w.msg} :: key ${w.key}`)).flat())
  W.rec('who', "the demo's SANS lines and whose (read only)", 'REC', who.join(' || '))
  for (const di of [2]) {
    const ok = await B.openList(p, W, '#eWeek', di)
    const l = await B.readList(p, '#eWeek', di)
    writeFileSync(path.join(OUT, `probe2-list-${di}.json`), JSON.stringify(l, null, 1))
    W.rec('list' + di, `day ${di} list opened by its bar (${ok})`, 'REC', B.listSay(l))
    const html = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); const s = b && [...b.querySelectorAll('.witem')].find(e => /SANS/.test(e.innerText)); return s ? s.outerHTML : 'none' }, di)
    W.rec('html' + di, 'the first SANS line as marked up', 'REC', html.slice(0, 900))
    await B.listPic(p, W, '#eWeek', di, 'l' + di)
    const inf = await B.dayInfo(p, W, '#eWeek', di, 'i' + di)
    W.rec('info' + di, 'the ⓘ popup', 'REC', B.infoSay(inf) + ' closed ' + inf.closed, inf.pic)
    const bl = await B.boardList(p, W, di)
    W.rec('board' + di, `day ${di} board panel`, 'REC', B.boardSay(bl))
    const bhtml = await p.evaluate(() => { const w = document.querySelector('#schedBoard .sb-warn'); const s = w && [...w.querySelectorAll('.wln')].find(e => /SANS/.test(e.innerText)); return s ? s.outerHTML.slice(0, 900) : (w ? w.outerHTML.slice(0, 900) : 'none') })
    W.rec('bhtml' + di, 'the board panel SANS line markup', 'REC', bhtml)
    await W.pic(p, `board${di}`)
    await L.closeBoard(p, W)
    /* View-only Sched */
    await L.go(p, 'viewsched').catch(async e => W.rec('vgo', 'go viewsched', 'REC', String(e.message).slice(0, 200)))
    const cur = await p.evaluate(() => window.CURPAGE)
    const vo = await B.openList(p, W, '#vWeek', di)
    const vl = await B.readList(p, '#vWeek', di)
    W.rec('view' + di, `View-only Sched (page ${cur}, list ${vo})`, 'REC', B.listSay(vl))
    await B.listPic(p, W, '#vWeek', di, 'v' + di)
  }
})
