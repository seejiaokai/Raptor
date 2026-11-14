/* rcf-w3 explore v1 — reads the demo week's shape (no changes made) */
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/w3/explore'
const L = await import('../lib.mjs')
console.log('rcf-w3-explore v1', L.BASE, L.SHOTS)
const { browser, page, errors } = await L.open({ width: 1536, height: 864 })
const info = await page.evaluate(() => {
  const cs = id => (window.PEOPLE[id] && window.PEOPLE[id].cs) || id || ''
  return {
    dates: window.DAYS.map(d => d.date || d.dt || d.label || Object.keys(d).join(',')).slice(0, 7),
    keys: Object.keys(window.DAYS[0]),
    people: Object.entries(window.PEOPLE).map(([k, p]) => k + ':' + p.cs + ':' + (p.role || p.grp || '')).slice(0, 60),
    VCONF: window.VCONF,
    days: window.DAYS.map((d, i) => ({ i, waves: d.waves.map(w => ({ label: w.label, kind: w.kind, intimes: w.intimes, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, rl: f.rl, ac: f.aircraft.map(a => cs(a.p) + '/' + cs(a.w)).join(' ') })) })), duty: d.dutywaves.map(b => b.label + ':' + b.rows.map(r => r.role + '|' + r.str + '-' + r.end + '|' + cs(r.id)).join(';')), ground: d.ground.map(g => g.prog + '|' + g.str + '-' + g.end + '|' + cs(g.who)).join(';') })),
  }
})
console.log(JSON.stringify(info, null, 1).slice(0, 9000))
await L.board(page, 4)
await L.shot(page, 'fri-board')
const attrs = await page.evaluate(() => {
  const s = new Set(); document.querySelectorAll('#schedBoard *').forEach(e => { for (const a of e.getAttributeNames()) if (a.startsWith('data-')) s.add(a) }); return [...s].sort().join(' ')
})
console.log(attrs)
console.log(errors)
await browser.close()
