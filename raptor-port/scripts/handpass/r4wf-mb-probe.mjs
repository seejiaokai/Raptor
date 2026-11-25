// r4wf-mb-probe — walker B's look at Wed 15 Jul's Board before writing the scenarios (25 Nov 26). Reads only.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-probe.mjs
import { L, J, sleep, world, openBoard, read, fixture, idOf, NAMES, pic } from './shr-a-lib.mjs'
console.log('r4wf-mb-probe v1')
const w = await world(); const p = w.page
const outlaw = await idOf(p, 'Outlaw'); console.log('outlaw id', outlaw)
const DI = +(process.env.DI || 2)
await openBoard(w)
const dump = () => p.evaluate(() => {
  const secs = [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => ({ key: s.getAttribute('data-secmove'), head: (s.querySelector('.sb-ph')?.innerText || '').replace(/\s+/g, ' ').slice(0, 80), bfld: [...new Set([...s.querySelectorAll('[data-bfld]')].map(e => e.getAttribute('data-bfld')))].slice(0, 40), ifld: [...s.querySelectorAll('[data-ifld]')].map(e => e.getAttribute('data-ifld')).slice(0, 20), people: [...s.querySelectorAll('[data-person]')].map(e => e.getAttribute('data-person') + ':' + (e.querySelector('.nm')?.textContent || e.textContent).trim().slice(0, 12)).slice(0, 60), grip: !!s.querySelector('.secgrip'), pitog: !!s.querySelector('[data-pitog]') }))
  const warn = [...document.querySelectorAll('#schedBoard [class*="warn"], #schedBoard [data-warn], #schedBoard [id*="warn" i]')].filter(e => e.offsetWidth).map(e => (e.id || e.className) + ' = ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)).slice(0, 20)
  const bar = [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetWidth && b.getBoundingClientRect().top < 140).map(b => (b.id || b.className) + ':' + b.textContent.trim().slice(0, 20))
  return { secs, warn, bar }
})
console.log('BEFORE', J(await dump(), null, 1))
console.log('ground', J(await p.evaluate(d => window.DAYS[d].ground, DI)).slice(0, 1500))
console.log('notes', J(await p.evaluate(d => Object.keys(window.DAYS[d]), DI)))
await pic(w, 'probe-before', ['#sbBoard'])
await L.go(p, 'inputs')
const iid = await fixture(w, [L.RANGER, L.HEX, outlaw], { from: '08:00', to: '17:00' })
console.log('fixture', iid)
await openBoard(w)
NAMES[outlaw] = 'Outlaw'
console.log('AFTER', J(await dump(), null, 1))
console.log(J(await read(p, 'filed', ['bane', 'rocky', outlaw])))
await pic(w, 'probe-after', ['#sbBoard'])
await L.finish()
