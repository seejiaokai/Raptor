// swl-w1A-probe2 — walker A's second probe: the line's boxes, two unfiled SANS men on one timed jet on Sat 18, the four
// places read by swl-w1A-lib, the Legend's door, and what a press of a line lights. Read and pictured; nothing judged.
// Run from raptor-port/: SWLA_RUN=probe2<d|p> SZ=d|p node scripts/handpass/swl-w1A-probe2.mjs
import './swl-w1A-env.mjs'
import { writeFileSync } from 'node:fs'
const Y = await import('./swl-w1A-lib.mjs')
const { L, W5, X, sleep, J, run, addLine, armAt, pickNow, holdsAt, BOLT, OTTER, RAW } = Y
const SZ = process.env.SZ || 'd'
console.log(`VERSION swl-w1A-probe2 1 · ${SZ} · ${process.env.W2_URL} · out ${Y.OUT}`)
const dump = {}
await run('PR2', SZ, async (p, W) => {
  dump.bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean))
  W.rec('bundle', 'the page serves index-ZgGJLqIy.js', dump.bundle.some(s => /index-ZgGJLqIy\.js$/.test(s)), J(dump.bundle))
  await L.go(p, 'editsched')
  dump.sat0 = await Y.dayList(p, W, '#eWeek', 5)
  dump.buttons = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id ? '#' + e.id : '') + ':' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)).slice(0, 80))
  const a = await addLine(p, W, 5, { cs: 'VL', to: '13:00', ld: '14:00' })
  dump.line = a
  dump.boxes = await p.evaluate(([di, wi]) => [...document.querySelectorAll(`#schedBoard [data-bfld^="ff:${di}.${wi}.0."]`)].map(e => e.dataset.bfld + '=' + (e.value || '') + (e.getBoundingClientRect().width > 0 ? '' : ' (hidden)') + ' ph:' + (e.getAttribute('placeholder') || '')), [5, a.wi])
  const msn = dump.boxes.find(x => /\.msn=|\.mission=|\.m=/.test(x))
  if (msn) await L.typeBox(p, W, `[data-bfld="${msn.split('=')[0]}"]`, 'BFM')
  dump.f = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return JSON.parse(JSON.stringify({ ...x, aircraft: undefined })) }, [5, a.wi])
  const kp = `5.${a.wi}.0.0.p`, kw = `5.${a.wi}.0.0.w`
  let r = await armAt(p, W, 5, `[data-slot="${kp}"]`, 'p2-armp')
  let pk = await pickNow(p, W, BOLT, 'p2-pickp')
  dump.p1 = { armed: r.armed, seen: pk.seen, holds: await holdsAt(p, kp) }
  r = await armAt(p, W, 5, `[data-slot="${kw}"]`, 'p2-armw')
  pk = await pickNow(p, W, OTTER, 'p2-pickw')
  dump.p2 = { armed: r.armed, seen: pk.seen, holds: await holdsAt(p, kw) }
  await W5.boardDrawer(p, W, false)
  dump.pucks = { bolt: await Y.pucksOf(p, '#schedBoard', BOLT), otter: await Y.pucksOf(p, '#schedBoard', OTTER) }
  const all = await Y.allPlaces(p, W, 5, 'Bolt', 'p2-all')
  dump.all = all
  W.rec('all', 'the four places', 'REC', Y.allSay(all), all.pics.join(', '))
  // what a press on Bolt's SANS line lights on the board
  await Y.boardList(p, W, 5)
  const ix = (all.board.lines.find(x => /Bolt — SANS/.test(x.text)) || {}).ix
  const before = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className).reduce((m, c) => { for (const k of c.split(' ')) m[k] = (m[k] || 0) + 1; return m }, {}))
  if (ix != null) {
    const l = p.locator(`#schedBoard .wln[data-wix="${ix}"] .wln-t`).first()
    await l.scrollIntoViewIfNeeded(); if (W.isPhone) await l.tap(); else await l.click()
    await sleep(500)
  }
  const after = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className).reduce((m, c) => { for (const k of c.split(' ')) m[k] = (m[k] || 0) + 1; return m }, {}))
  dump.press = { ix, before, after, bolt: await Y.pucksOf(p, '#schedBoard', BOLT), bodyCls: await p.evaluate(() => document.querySelector('#schedBoard').className) }
  await W.pic(p, 'p2-pressed')
  await L.closeBoard(p, W)
  // Edit Schedule: the same press on its list line
  await Y.dayList(p, W, '#eWeek', 5)
  const eix = (dump.all.es.lines.find(x => /Bolt — SANS/.test(x.text)) || {}).ix
  if (eix != null) { const l = p.locator(`#eWeek .day[data-day="5"] .witem[data-wix="${eix}"] .wtx`).first(); if (await l.count()) { if (W.isPhone) await l.tap(); else await l.click(); await sleep(600) } }
  dump.epress = { eix, page: await p.evaluate(() => window.CURPAGE), board: await p.locator('#schedBoard').count(), bolt: await Y.pucksOf(p, '#eWeek', BOLT) }
  await W.pic(p, 'p2-epressed')
  await L.closeBoard(p, W)
  await L.go(p, 'editsched')
  dump.legend = await p.evaluate(() => [...document.querySelectorAll('button, [role="button"], a')].filter(e => /legend/i.test((e.textContent || '') + (e.title || '') + (e.id || ''))).map(e => (e.id || '') + '|' + (e.className || '') + '|' + (e.textContent || '').trim().slice(0, 30) + '|' + (e.getBoundingClientRect().width > 0 ? 'shown' : 'hidden')))
})
writeFileSync(`${RAW}/probe2-${SZ}.json`, JSON.stringify({ dump, results: L.results }, null, 1))
console.log('DONE probe2')
process.exit(0)
