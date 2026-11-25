// r4wf-mb-probe3 — walker B: the flying section's controls and fill zones on Wed 15 Jul; then its "+" pressed once (reads, one press)
import { L, J, sleep, world, openBoard } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-probe3 v1')
const w = await world(); const p = w.page
await openBoard(w)
const dump = () => p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".waves"]'); return { btns: [...s.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => [...b.attributes].filter(a => a.name.startsWith('data-') || a.name === 'title').map(a => a.name + '=' + a.value).join(' ') + ' "' + b.textContent.trim() + '"').slice(0, 30), fills: [...s.querySelectorAll('[data-fill]')].map(e => e.getAttribute('data-fill') + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 30)).slice(0, 40) } })
console.log(J(await dump(), null, 1))
const plus = p.locator('#sbBoard > [data-secmove$=".waves"] button', { hasText: /^\+$/ }).first()
await plus.click(); await sleep(800)
console.log('AFTER +', J(await dump(), null, 1))
await L.finish()
