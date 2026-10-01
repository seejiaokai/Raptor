/* W1 probe — a driver check, not a scenario: what the fresh world holds, and where the edit week's controls are. */
process.env.HP_URL ||= 'http://localhost:4201'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W1'
process.env.HP_OUT ||= 'C:/Users/User/AppData/Local/Temp/claude/dbrA-W1-probe.json'
const L = await import('./dbrA-lib.mjs')
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a')
await L.settle(p)
const r = await L.rows(p)
const byCol = {}
for (const k of Object.keys(r)) { const c = k.split('/')[0]; byCol[c] = (byCol[c] || 0) + 1 }
console.log('rows by collection', JSON.stringify(byCol))
const batches = Object.keys(r).filter(k => k.startsWith('changes/'))
console.log('batches', batches.map(k => { const b = JSON.parse(r[k]); return `${k} type=${b.type} n=${(b.items || []).length} actor=${b.actorId}` }))
console.log('week keys', Object.keys(r).filter(k => k.startsWith('weeks/')))
console.log('settings keys', Object.keys(r).filter(k => k.startsWith('settings/')).slice(0, 60))
console.log('CURPAGE', await p.evaluate(() => window.CURPAGE), 'CURWEEK', await p.evaluate(() => window.CURWEEK))
await L.go(p, 'editsched')
const info = await p.evaluate(() => {
  const d0 = document.querySelector('#eWeek .day[data-day="0"]')
  return {
    txt: [...d0.querySelectorAll('[data-txt]')].map(e => e.dataset.txt).slice(0, 40),
    slots: [...d0.querySelectorAll('[data-slot]')].map(e => e.dataset.slot + (e.querySelector('[data-person]') ? '=' + e.querySelector('[data-person]').dataset.person : '')).slice(0, 60),
    fills: [...d0.querySelectorAll('[data-fill]')].map(e => e.dataset.fill).slice(0, 30),
    eRoster: [...document.querySelectorAll('#eRoster .rpuck[data-person]')].map(e => e.dataset.person).slice(0, 50),
    eRosterVis: !!document.querySelector('#eRoster') && document.querySelector('#eRoster').offsetWidth,
    heads: [...document.querySelectorAll('#eWeek .day')].map(d => d.dataset.day + ':' + (d.querySelector('.day-head') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 80)),
    dayOK: Object.keys(window.SCHED.dayOK || {}),
    orig: Object.keys(window.SCHED.orig || {}),
    undo: (document.querySelector('#undoBtn') || {}).title, sbday: [...document.querySelectorAll('#eWeek [data-sbday]')].map(e => e.dataset.sbday).slice(0, 10),
    notes0: window.DAYS[0].notes, waves0: window.DAYS[0].waves.map(w => w.label + ':' + w.formations.map(f => f.aircraft.map(a => (a.p || '-') + '/' + (a.w || '-')).join(',')).join(';')),
  }
})
console.log(JSON.stringify(info, null, 1))
await L.shot(p, '_probe-editweek')
console.log('errors', errors)
await browser.close()
