import * as H from './wh-b-lib.mjs'
const { L, W } = H
const { browser, p, errors } = await H.world()
try {
  await H.toEdit(p)
  const d = await p.evaluate(() => JSON.stringify(window.DAYS[1].waves.map(w => ({ label: w.label, intimes: w.intimes, formations: w.formations.map(f => ({ cs: f.cs, msn: f.msn, to: f.to, ldg: f.ldg, br: f.br, ac: f.aircraft.map(a => [a.p, a.w, a.cx]) })) }))))
  console.log('TUE', d)
  const d0 = await p.evaluate(() => JSON.stringify(window.DAYS[0].waves.map(w => ({ label: w.label, intimes: w.intimes, formations: w.formations.map(f => ({ cs: f.cs, msn: f.msn, to: f.to, ldg: f.ldg, br: f.br })) }))))
  console.log('MON', d0)
  const d5 = await p.evaluate(() => JSON.stringify(window.DAYS[5].waves.map(w => ({ label: w.label, intimes: w.intimes, formations: w.formations.map(f => ({ cs: f.cs, msn: f.msn, to: f.to, ldg: f.ldg, br: f.br })) }))))
  console.log('SAT', d5)
  await L.go(p, 'logic')
  const keys = await p.evaluate(() => [...document.querySelectorAll('[data-lgset]')].map(e => e.dataset.lgset + '=' + e.value))
  console.log('LOGIC (view)', keys)
  await p.locator('#lgEdit').click(); await L.sleep(500)
  const keys2 = await p.evaluate(() => [...document.querySelectorAll('[data-lgset],[data-lgkind],#lgMissionMix')].map(e => (e.dataset.lgset || e.dataset.lgkind || e.id) + '=' + (e.value ?? '') + (e.type === 'checkbox' ? ' checked=' + e.checked : '')))
  console.log('LOGIC (edit)', keys2.join('\n'))
  await W.boardOn(p, 1)
  const btns = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].map(b => b.id || b.dataset.itadd || b.innerText).filter(Boolean).slice(0, 60))
  console.log('BOARD buttons', btns.join(' | '))
  console.log('errors', errors)
} finally { await browser.close() }
