import { world, fileInput, pic, sleep, openBoard } from './aa-B-lib.mjs'
import { groundIdx, putExtra, rowPucks } from './aa-B-rows.mjs'
const w = await world('desk'); w.tag = 'p13'
const { page } = w
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p13', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
const slot = await groundIdx(page, 'p13')
const html = () => page.evaluate(() => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === 'p13')); return row.querySelector('.ppl').outerHTML.replace(/title="[^"]*"/g, '') })
console.log('0:', await html())
console.log(await putExtra(page, slot, 'dice')); console.log('1:', await html())
console.log(await putExtra(page, slot, 'torque')); console.log('2:', await html())
console.log(await putExtra(page, slot, 'glass')); console.log('3:', await html())
await w.browser.close()
