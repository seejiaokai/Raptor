// sa208-wB-probe2 — walker B's read of the demo week (read only): each day's flying lines (standby marked), duty desks,
// ground rows, the leave of the SANS men, and every puck wearing the "A" chip with its hover words.
// Run from raptor-port/:  SZ=d SA208B_RUN=probe node scripts/handpass/sa208-wB-probe2.mjs
import './sa208-wB-env.mjs'
const B = await import('./scc-w1B-lib.mjs')
const { Z, T, L, J } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wB-probe2 1 · size', SZ)
await T.run('probe2', SZ, Z.scene(async (p, W) => {
  for (let di = 0; di < 7; di++) {
    const d = await p.evaluate(i => {
      const D = window.DAYS[i]
      const waves = (D.waves || []).map((w, wi) => `${wi}:${w.kind || w.type || ''}${w.shift ? '[shift]' : ''} ` + (w.formations || []).map(f => `${f.cs || ''} ${f.msn || ''} ${f.to || ''}-${f.ld || ''} [${(f.aircraft || []).map(a => (a.p || '-') + '/' + (a.w || '-')).join(' ')}]`).join(' ; '))
      const duty = (D.dutywaves || []).map((b, bi) => `${bi}:` + (b.rows || []).map(r => `${r.label || r.name || ''}(${r.str || r.s || ''}-${r.end || r.e || ''}) ${r.id || ''}`).join(', '))
      const ground = (D.ground || []).map((g, gi) => `${gi}:${g.label || g.name || ''} ${g.str || ''}-${g.end || ''} ${JSON.stringify(g.people || g.ppl || g.ids || '').slice(0, 60)}`)
      return { dt: D.dt, waves, duty, ground }
    }, di)
    W.rec('d' + di, 'day ' + di, 'REC', J(d))
  }
  const lv = await p.evaluate(() => { const san = new Set(Object.entries(window.PEOPLE).filter(([, q]) => q.san || q.sanFrom).map(([id]) => id)); return (window.INPUTS || []).filter(r => !r.sans && (san.has(r.person) || (r.people || []).some(e => san.has(e.p)))).map(r => `${(window.PEOPLE[r.person] || {}).cs || (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs).join('+')} ${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''}${r.allday ? ' allday' : ' ' + r.s + '-' + r.e}`) })
  W.rec('leave', 'inputs of SANS men (not SANS filings)', 'REC', J(lv))
  await L.go(p, 'editsched')
  const a = await p.evaluate(() => [...document.querySelectorAll('#eWeek .puck')].filter(e => e.getBoundingClientRect().width > 0 && [...e.querySelectorAll('.lchip')].some(c => c.textContent.trim() === 'A')).map(e => { const d = e.closest('.day[data-day]'); const c = e.querySelector('.lchip'); return `${d ? d.dataset.day : '?'}:${e.dataset.person} title="${e.getAttribute('title')}" chip="${c.getAttribute('title')}"` }))
  W.rec('achips', 'every week puck with the A chip', 'REC', a.join(' || '))
  const ids = await p.evaluate(() => Object.entries(window.PEOPLE).map(([id, q]) => `${id}=${q.cs}/${q.q || ''}${q.san ? '/SANS' : ''}${q.pers ? '/pers' : ''}`).join(' '))
  W.rec('people', 'everyone', 'REC', ids)
}))
console.log('DONE')
process.exit(0)
