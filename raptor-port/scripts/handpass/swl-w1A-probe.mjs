// swl-w1A-probe — walker A's first probe on the c203 build: the bundle, the four unfiled SANS men, where the demo has
// them, the shape of the day's warning list on Edit Schedule, the board and the day popup (read only), then one plant.
// Run from raptor-port/: SWLA_RUN=probe SZ=d node scripts/handpass/swl-w1A-probe.mjs
import './swl-w1A-env.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const X = await import('./sss-w1A-lib.mjs')
const { L, W5, sleep, J, run, addLine, armAt, pickNow, holdsAt } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION swl-w1A-probe 1 · ${SZ} · ${process.env.W2_URL} · out ${X.OUT}`)
const dump = {}
await run('PR', SZ, async (p, W) => {
  dump.bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean))
  W.rec('bundle', 'the page serves index-ZgGJLqIy.js', dump.bundle.some(s => /index-ZgGJLqIy\.js$/.test(s)), J(dump.bundle))
  dump.men = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).filter(([, q]) => q.san || /cards|wrangler|yeti|badger|bane/.test(q.id || '')).map(([id, q]) => [id, { cs: q.cs, role: q.role || q.rank || '', pos: q.pos || q.seat || '', san: !!q.san, sanFrom: q.sanFrom || null }])))
  dump.days = await p.evaluate(() => window.DAYS.map(d => d.dt))
  dump.holds = {}
  for (const id of ['cards', 'wrangler', 'yeti', 'badger']) dump.holds[id] = await X.T.holds(p, id)
  await L.go(p, 'editsched')
  dump.dayHtml = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="4"]'); const b = d && d.querySelector('[data-dwbox]'); return { hasDay: !!d, box: b ? b.outerHTML.slice(0, 3000) : 'no dwbox', head: d ? d.innerText.slice(0, 600) : '' } })
  dump.week = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day]')].map(d => { const b = d.querySelector('.daywarn'); return d.dataset.day + ': ' + (b ? b.innerText.replace(/\s+/g, ' ').trim() + ' {' + b.className + '}' : 'no bar') }))
  await W.pic(p, 'editsched')
  // the board of Fri 17 and its panel
  await L.openBoard(p, W, 4)
  dump.sbWarn = await p.evaluate(() => { const w = document.querySelector('#sbWarn'); return w ? w.outerHTML.slice(0, 3000) : 'no #sbWarn' })
  await W.pic(p, 'board17')
  // a timed flight, Bolt (yeti) in its front seat by tap-to-plan
  const a = await addLine(p, W, 4, { cs: 'VL', to: '13:00', ld: '14:00' })
  dump.line = a
  const key = `4.${a.wi}.0.0.p`
  const r = await armAt(p, W, 4, `[data-slot="${key}"]`, 'pr-arm')
  dump.arm = { armed: r.armed, yeti: (r.c.pucks || []).filter(x => x.id === 'yeti') }
  const pk = await pickNow(p, W, 'yeti', 'pr-pick')
  dump.pick = { seen: pk.seen, note: pk.note, fits: pk.fits, holds: await holdsAt(p, key) }
  await W5.boardDrawer(p, W, false)
  dump.sbWarn2 = await p.evaluate(() => { const w = document.querySelector('#sbWarn'); return w ? w.outerHTML.slice(0, 5000) : 'no #sbWarn' })
  dump.puck = await p.evaluate(k => { const z = document.querySelector(`#schedBoard [data-slot="${k}"]`); return z ? z.outerHTML.slice(0, 1500) : 'none' }, key)
  dump.warnApp = await p.evaluate(() => ((window.WARN && window.WARN.byDay && window.WARN.byDay[4]) || {}).warns || 'no WARN')
  await W.pic(p, 'planted')
  await L.closeBoard(p, W)
  dump.dayHtml2 = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="4"]'); const b = d && d.querySelector('[data-dwbox]'); return b ? b.outerHTML.slice(0, 5000) : 'no dwbox' })
  dump.legend = await p.evaluate(() => { const b = document.querySelector('#legendBtn'); return b ? b.outerHTML.slice(0, 300) : 'no #legendBtn' })
  dump.dayinfo = await p.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="4"] [data-dayinfo]'); return b ? b.outerHTML.slice(0, 300) : 'no ⓘ' })
  await W.pic(p, 'editsched2')
})
mkdirSync('D:/raptor-work/c203-walk/A', { recursive: true })
writeFileSync(`D:/raptor-work/c203-walk/A/probe-${SZ}.json`, JSON.stringify({ dump, results: L.results }, null, 1))
console.log('DONE probe')
process.exit(0)
