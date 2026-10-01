/* W4 probe (30 Sep 26) — read-only survey of the served build on HP_URL: storage keys after a first boot, the bridges
   the walk reads, the Leave War's periods and stages, the Inputs page's first rows. Writes nothing but pictures. */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const L = await import('./dbrA-lib.mjs')
const b = await L.launch()
const ctx = await L.context(b)
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.settle(p)
const r = await L.rows(p)
console.log('KEYS', Object.keys(r).sort().map(k => `${k} (${r[k].length})`).join('\n'))
console.log('BRIDGES', await p.evaluate(() => ({ histSnap: typeof window.histSnap, ELOG: !!window.ELOG, CURWEEK: window.CURWEEK, inputs: (window.INPUTS || []).length, people: Object.keys(window.PEOPLE || {}).length })))
await L.go(p, 'leavewar')
await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
await L.sleep(800)
console.log('LW', await p.evaluate(() => ({
  picker: [...document.querySelectorAll('select')].map(s => ({ id: s.id, tid: s.getAttribute('data-testid'), opts: [...s.options].map(o => o.value + ':' + o.text) })).slice(0, 6),
  stage: [...document.querySelectorAll('[data-testid*="stage"]')].map(e => e.getAttribute('data-testid') + '=' + (e.innerText || '').trim().slice(0, 40)),
  rows: [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 12).map(e => e.getAttribute('data-testid')),
  months: [...document.querySelectorAll('[data-testid^="month-"]')].map(e => e.getAttribute('data-testid')),
  heads: [...document.querySelectorAll('[data-testid^="head-"]')].slice(0, 3).map(e => e.getAttribute('data-testid')),
})))
await L.shot(p, '_probe-lw')
console.log('ERR', errors)
await b.close()
