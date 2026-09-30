/* W2 probe — a driver check, not a scenario: what the fresh world holds, and how the Inputs page is laid out. */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/236f9951-7075-4c81-a20c-6df6f75ba05d/scratchpad/dbrA-W2-probe.json'
const L = await import('./dbrA-lib.mjs')
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a')
await L.settle(p)
const r = await L.rows(p)
const byCol = {}
for (const k of Object.keys(r)) { const c = k.split('/')[0] + '/' + (k.split('/')[1] || '').split(/[:#]/)[0]; byCol[c] = (byCol[c] || 0) + 1 }
console.log('rows by collection', JSON.stringify(byCol))
const batches = Object.keys(r).filter(k => k.startsWith('changes/'))
console.log('batches', batches.map(k => { const b = JSON.parse(r[k]); return `${k} type=${b.type} n=${(b.items || []).length} actor=${b.actorId}` }))
console.log('settings keys', Object.keys(r).filter(k => k.startsWith('settings/')))
console.log('all other keys', Object.keys(localStorage_keys = await p.evaluate(() => { const o = []; for (let i = 0; i < localStorage.length; i++) o.push(localStorage.key(i)); return o })).length, localStorage_keys.filter(k => !k.startsWith('raptor:')).slice(0, 40), localStorage_keys.filter(k => k.startsWith('raptor:__')))
var localStorage_keys
await L.go(p, 'inputs')
const info = await p.evaluate(() => ({
  range: (document.querySelector('#inRangeBtn') || {}).innerText,
  rows: [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => t.dataset.iid + ' ' + t.innerText.replace(/\s+/g, ' ').slice(0, 80)).slice(0, 30),
  nInputs: window.INPUTS.length,
  first: window.INPUTS.slice(0, 5).map(x => ({ iid: x.iid, person: x.person, type: x.type, date: x.date, ord: x.ord })),
  types: [...document.querySelectorAll('#inType option')].map(o => o.value).slice(0, 40),
  persons: [...document.querySelectorAll('#inPerson option')].map(o => o.value + ':' + o.textContent).slice(0, 60),
}))
console.log(JSON.stringify(info, null, 1))
await L.shot(p, '_probe-inputs')
await p.locator('#inRangeBtn').click(); await L.sleep(300)
await p.locator('#inRangeAll').click(); await L.sleep(400)
const all = await p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => t.dataset.iid))
console.log('ALL rows', all.length, all.slice(0, 10), 'INPUTS', await p.evaluate(() => window.INPUTS.length))
const st = await L.state(p)
console.log('state keys', Object.keys(st), 'hist keys', Object.keys(st.hist), 'people', Object.keys(st.people).length, 'elog', st.elog.length)
console.log('errors', errors)
await browser.close()
