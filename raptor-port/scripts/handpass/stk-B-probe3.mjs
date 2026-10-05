import * as H from './wh-b-lib.mjs'
const { L, W } = H
const { browser, p, errors } = await H.world()
try {
  await H.toEdit(p)
  const o = await p.evaluate(() => {
    const out = { days: [], people: {} }
    for (let i = 0; i < 7; i++) {
      const d = window.DAYS[i]
      out.days.push({ i, waves: d.waves.map(w => ({ label: w.label, sa: !!w.standalone, intimes: w.intimes, f: w.formations.map(f => `${f.cs}/${f.msn}/${f.to}/${f.ld}/br:${f.br || ''}:${f.aircraft.map(a => (a.p || '-') + '+' + (a.w || '-')).join(',')}`) })), duty: (d.duty || []).length, sims: Object.keys(d.sims || {}).length, ground: (d.ground || []).length })
    }
    for (const [k, v] of Object.entries(window.PEOPLE)) out.people[k] = v.cs
    return out
  })
  console.log(JSON.stringify(o.days, null, 0))
  console.log(JSON.stringify(o.people))
  // topbar buttons and menus
  console.log('TOPBAR', await p.evaluate(() => [...document.querySelectorAll('.topbar button, .nav button, #drawerNav button')].map(b => (b.id || '') + ':' + (b.innerText || b.title || '').trim().slice(0, 25)).join(' | ')))
  console.log('EDIT PAGE buttons', await p.evaluate(() => [...document.querySelectorAll('#page-editsched button, #page-editsched [id]')].filter(b => b.tagName === 'BUTTON').map(b => (b.id || b.dataset.act || '') + ':' + (b.innerText || b.title || '').trim().slice(0, 25)).slice(0, 80).join(' | ')))
  console.log('errors', errors)
} finally { await browser.close() }
