// swl-w1B-probe — walker B's first look at the present screen (chat 203, 26 Nov 26): the served script, the demo week's warning
// lists as drawn on Edit Schedule, what the app holds (read only), and the shape of a line. Run from raptor-port/:
//   SWLB_RUN=probe SZ=d node scripts/handpass/swl-w1B-probe.mjs
import './swl-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const Z = await import('./sss-w1B-lib.mjs')
const { L, T, J, sleep, OUT, path } = Z
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B-probe 1 · size', SZ, '· out', OUT)
await T.run('probe', SZ, async (p, W) => {
  const scripts = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean))
  W.rec('script', 'the page serves the frozen build', scripts.some(s => /index-ZgGJLqIy\.js/.test(s)), J(scripts))
  await L.go(p, 'editsched'); await sleep(800)
  const people = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).filter(([, q]) => /^(Cards|Wrangler|Yeti|Badger|Ranger|Jester|Marlin)$/.test(q.cs)).map(([k, q]) => [q.cs, { id: k, san: !!q.san, sanFrom: q.sanFrom || null, seat: q.seat || q.crew || '' }])))
  W.rec('people', 'the SANS men (read only)', 'REC', J(people))
  const warn = await p.evaluate(() => (window.DAYS || []).map((d, i) => ({ i, dt: d.dt, w: (((window.WARN || {}).byDay || {})[i] || {}).warns ? window.WARN.byDay[i].warns.map(w => ({ sev: w.sev, code: w.code, who: w.who, off: !!w.off, msg: String(w.msg || '').slice(0, 140), key: w.key })) : 'no WARN' })))
  writeFileSync(path.join(OUT, 'probe-warn.json'), JSON.stringify(warn, null, 1))
  for (const d of warn) W.rec('warn' + d.i, `day ${d.i} ${d.dt}: what the app holds`, 'REC', Array.isArray(d.w) ? d.w.map(w => `${w.sev}/${w.code}${w.off ? '/OFF' : ''}: ${w.msg}`).join(' || ') : d.w)
  /* the week's day bars and lists as drawn */
  const dom = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day]')].map(d => {
    const i = d.dataset.day, box = d.querySelector(`[data-dwbox="${i}"]`), bar = box && box.querySelector('.daywarn')
    return { i, bar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : '(none)', barCls: bar ? bar.className : '', open: box ? box.className : '', lines: box ? [...box.querySelectorAll('.witem')].map(e => ({ cls: e.className, wix: e.dataset.wix, text: e.innerText.replace(/\s+/g, ' ').trim(), btn: (e.querySelector('button') || {}).outerHTML || '' })) : [], html: box ? box.outerHTML.slice(0, 600) : '' }
  }))
  writeFileSync(path.join(OUT, 'probe-dom.json'), JSON.stringify(dom, null, 1))
  for (const d of dom) W.rec('dom' + d.i, `day ${d.i}: bar as drawn`, 'REC', `${d.bar} [${d.barCls}] box[${d.open}] lines ${d.lines.length}`)
  await W.pic(p, 'week')
})
