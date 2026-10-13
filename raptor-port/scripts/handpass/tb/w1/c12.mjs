import * as F from './fx.mjs'
const { L } = F
console.log('w1 c12 v1')
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
for (const size of ['phone', 'desk']) {
  const w = await L.world(size, { who: ['us', 'us'] })
  const p = w.page
  try {
    const me = await p.evaluate(() => window.CURROLE || window.ROLE || null)
    const crew = await F.publishSat(w, { crew: true })
    await F.toWar(w)
    const set1 = await p.evaluate(d => window.lwSetCell('plasma', d, 'LL'), F.SAT)
    const set2 = await p.evaluate(d => window.lwSetCell('bane', d, 'OL'), F.SAT)
    await L.sleep(900)
    await F.openMonth(w)
    const cells = await p.evaluate(d => ['plasma', 'bane'].map(id => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return [id, c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL'] }), F.SAT)
    const pubDay = await p.evaluate(() => { try { return !!window.signOf(5).appr || window.signOf(5).appr } catch (e) { return String(e) } })
    const member = await p.evaluate(() => ({ note: document.querySelectorAll('[data-testid="sync-clashes"]').length, line: document.querySelectorAll('[data-testid="clash-line"]').length, text: /clash(es)? with the schedule/.test(document.querySelector('#page-leavewar').innerText), viewing: (document.querySelector('[data-testid="lw-viewing"]') || {}).textContent }))
    console.log(size, 'role', me, 'set', set1, set2, 'cells', JSON.stringify(cells), 'pub', pubDay, 'member', JSON.stringify(member))
    await L.pic(w, `c12-${size}-member-no-note`)
    // positive control: the same fixture, seen as the admin in the same page
    await p.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await L.sleep(700)
    const adminSees = await p.evaluate(() => document.querySelectorAll('[data-testid="sync-clashes"]').length)
    await p.evaluate(() => window.lwSetRole && window.lwSetRole('member')); await L.sleep(500)
    const again = await p.evaluate(() => document.querySelectorAll('[data-testid="sync-clashes"]').length)
    console.log('control: admin sees', adminSees, 'member again', again)
    ok(`C12 ${size}`, 'a member sees no clash note at all', { fixtureCells: cells, noteElements: member.note, anyClashWords: member.text, controlSameFixtureAsAdmin: adminSees, memberAgain: again }, member.note === 0 && !member.text && cells.every(c => c[1] !== 'NO CELL' && c[1] !== '') && adminSees >= 1 && again === 0)
  } finally { await L.close(w) }
}
