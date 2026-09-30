/* W4 probe 2 (30 Sep 26) — read-only: the edit week's doors the fold walk will press (day notes, take-off buttons,
   plans menus, publish buttons), the Inputs page, Admin → Users, Quals. Writes nothing but pictures. */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const L = await import('./dbrA-lib.mjs')
const b = await L.launch()
const ctx = await L.context(b)
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.go(p, 'editsched')
console.log('WEEK', JSON.stringify(await p.evaluate(() => ({
  dn: [...document.querySelectorAll('#eWeek [data-txt^="dn:"]')].map(e => e.getAttribute('data-txt') + ':' + e.tagName + ':' + (e.offsetWidth > 0)),
  accx: [...document.querySelectorAll('#eWeek [data-acc]')].map(e => `${e.dataset.acc}|d${e.dataset.accd}|${e.dataset.acck}|${(e.innerText || '').trim()}|${e.offsetWidth > 0}`).slice(0, 30),
  planmenu: [...document.querySelectorAll('#eWeek [data-planmenu]')].map(e => e.getAttribute('data-planmenu') + ':' + (e.innerText || '').trim()),
  beak: [...document.querySelectorAll('#eWeek [data-beak]')].map(e => e.getAttribute('data-beak') + ':' + (e.innerText || '').trim() + ':' + e.disabled),
  sbday: [...document.querySelectorAll('#eWeek [data-sbday]')].map(e => e.getAttribute('data-sbday')),
  hist: !!document.querySelector('#histBtn'),
  undo: !!document.querySelector('#undoBtn'),
})), null, 1))
await L.shot(p, '_probe2-week')
await L.go(p, 'inputs')
await L.sleep(500)
console.log('INPUTS', JSON.stringify(await p.evaluate(() => ({
  rows: [...document.querySelectorAll('#inBody tr[data-iid]')].slice(0, 8).map(r => r.getAttribute('data-iid') + ':' + (r.innerText || '').replace(/\s+/g, ' ').slice(0, 60)),
  n: document.querySelectorAll('#inBody tr[data-iid]').length,
  range: (document.querySelector('#inRangeBtn') || {}).innerText,
  btns: [...document.querySelectorAll('#page-inputs button, .inputs button')].slice(0, 20).map(e => (e.id || '') + ':' + (e.innerText || '').trim().slice(0, 20)),
})), null, 1))
await L.shot(p, '_probe2-inputs')
await L.go(p, 'quals')
console.log('QUALS', JSON.stringify(await p.evaluate(() => ({
  rows: [...document.querySelectorAll('#qtbl tbody tr:not(.grp)')].slice(0, 8).map(r => (r.querySelector('.qname') || {}).textContent),
  n: document.querySelectorAll('#qtbl tbody tr:not(.grp)').length,
  btns: [...document.querySelectorAll('button[id^="q"]')].map(e => e.id + ':' + (e.innerText || '').trim().slice(0, 20)),
})), null, 1))
await L.go(p, 'admin')
await L.sleep(400)
console.log('ADMIN', JSON.stringify(await p.evaluate(() => ({
  acc: (document.querySelector('#accList') || {}).innerText?.slice(0, 500),
  ids: [...document.querySelectorAll('[id^="acc"]')].map(e => e.id).slice(0, 40),
  cats: [...document.querySelectorAll('[data-admcat], .adm-cat')].map(e => (e.getAttribute('data-admcat') || '') + ':' + (e.innerText || '').trim().slice(0, 20)),
})), null, 1))
await L.shot(p, '_probe2-admin')
console.log('ERR', errors)
await b.close()
