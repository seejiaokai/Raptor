// sa208-wA-probe — walker A's first look at the chat 208 build: the served bundle, the demo week's lines and sims, the SANS
// men and their seed filings, and the borrowed helpers' first steps (open the board, arm a seat, read the crew list).
// window.* only READ. Run from raptor-port/: SZ=d|p node scripts/handpass/sa208-wA-probe.mjs
import './sa208-wA-env.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const Y = await import('./swl-w1A-lib.mjs')
const { L, W5, sleep, J, run, crewAll, armAt } = Y
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wA-probe 1 ·', SZ, '·', process.env.W2_URL, '·', Y.OUT)
mkdirSync('D:/raptor-work/c208/A', { recursive: true })
await run('probe', SZ, async (p, W) => {
  const bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(' '))
  W.rec('bundle', 'the served bundle', /index-CjChD3bM\.js/.test(bundle), bundle)
  const week = await p.evaluate(() => (window.DAYS || []).map((d, di) => ({ di, dt: d.dt, waves: (d.waves || []).map((w, wi) => ({ wi, label: w.label, kind: w.kind || '', standalone: !!w.standalone, f: (w.formations || []).map((f, fi) => ({ fi, cs: f.cs, msn: f.msn, to: f.to, ld: f.ld, ac: (f.aircraft || []).map((a, ai) => ({ ai, p: a.p || '', w: a.w || '' })) })) })), sims: Object.fromEntries(Object.entries(d.sims || {}).map(([k, v]) => [k, (v || []).map((x, ri) => ({ ri, label: x.label, str: x.str, end: x.end, p: x.p, w: x.w, more: x.more }))])), ground: (d.ground || []).map(g => ({ name: g.name || g.label, s: g.s || g.from, e: g.e || g.to, who: g.who || g.people })), duty: (d.dutywaves || []).length })))
  writeFileSync('D:/raptor-work/c208/A/probe-week.json', JSON.stringify(week, null, 1))
  const people = await p.evaluate(() => Object.entries(window.PEOPLE || {}).filter(([, q]) => q.san || q.sanFrom).map(([id, q]) => ({ id, cs: q.cs || q.callsign || q.name, role: q.role || q.pos, san: !!q.san, sanFrom: q.sanFrom || null })))
  W.rec('sans-men', 'the SANS men (id, callsign)', 'REC', J(people))
  const inputs = await p.evaluate(() => (window.INPUTS || []).filter(r => /SANS/i.test(String(r.type))).map(r => ({ iid: r.iid, people: r.people || r.person, date: r.date, to: r.to || r.end, sans: r.sans, allday: r.allday, half: r.half, s: r.s, e: r.e })))
  W.rec('sans-filings', 'the seed SANS filings', 'REC', J(inputs))
  const settings = await p.evaluate(() => { const s = window.SETTINGS || window.CFG || {}; return Object.fromEntries(Object.entries(s).filter(([k]) => /sim|dur|len/i.test(k))) })
  W.rec('settings', 'settings about the sim length', 'REC', J(settings))
  await L.openBoard(p, W, 0)
  W.rec('board', 'the board of Mon opened', null, await W.pic(p, 'board-mon'))
  const slots = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.slot + (e.querySelector('.puck') ? '=' + (e.querySelector('.puck').dataset.person || '?') : '')).slice(0, 80))
  W.rec('slots', 'the board of Mon: its seats', 'REC', J(slots))
  const empty = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-slot]')].find(e => e.getBoundingClientRect().width > 0 && !e.querySelector('.puck') && /^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(e.dataset.slot)); return e ? e.dataset.slot : null })
  if (empty) {
    const a = await armAt(p, W, 0, `[data-slot="${empty}"]`, 'probe-arm')
    const sans = (a.c.pucks || []).filter(x => x.where === 'SANS Avail').map(x => `${x.id}/${x.cs}${x.struck ? '(struck)' : ''} title "${x.title}" printed "${x.printed}"`)
    W.rec('arm', `seat ${empty} armed by the borrowed armAt; the crew list read by crewAll`, !!a.armed, `armed ${a.armed} · head ${a.c.head} · SANS: ${sans.join(' | ')}`, await W.pic(p, 'armed'))
  }
}, '2026-07-15T09:00:00')
writeFileSync('D:/raptor-work/c208/A/probe-' + SZ + '.json', JSON.stringify(L.results, null, 1))
process.exit(0)
