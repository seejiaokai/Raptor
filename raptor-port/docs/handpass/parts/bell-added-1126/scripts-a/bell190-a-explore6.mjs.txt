// bell190 walker A — exploration 6: input kinds, the Saturday OIL question, the range picker, the Board's input labels,
// the Publish day button
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-explore6 v1')
const w = await L.newWorld('desk')
await L.signIn(w, 'ad')
const p = w.page
console.log('types', L.J(await p.evaluate(() => (window.INPUT_TYPES || []).map(t => typeof t === 'string' ? t : (t.type || t.name || t.code || L.J(t))))))
/* Saturday: a Training for Tally, the OIL question — what it offers */
await L.openDay(w, L.SAT)
await L.press(w, '#icPopAdd')
await p.selectOption('#inpEditPop #inpEditType', 'Training'); await L.sleep(200)
await p.selectOption('#inpEditPop #inpEditPerson', L.ID.Tally)
await L.press(w, '#inpEditSave'); await L.sleep(600)
const oq = await p.evaluate(() => { const o = document.querySelector('[data-testid="oilconf"]'); if (!o) return null; return { text: o.innerText.slice(0, 500), btns: [...o.querySelectorAll('button,[data-testid]')].map(b => `${b.getAttribute('data-testid')}|${(b.textContent || '').trim().slice(0, 30)}`) } })
console.log('oil question', L.J(oq, null, 1))
await L.shot(w, 'explore6-oil')
/* the input window's date picker: what a day box is */
const cal = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-iso]')].slice(0, 4).map(e => `${e.tagName} ${e.getAttribute('data-iso')} ${e.closest('[id]')?.id}`))
console.log('date boxes', L.J(cal))
console.log('window text', (await p.evaluate(() => document.querySelector('#inpEditPop')?.innerText || '')).slice(0, 600).replace(/\n/g, ' | '))
await L.closeAll()
