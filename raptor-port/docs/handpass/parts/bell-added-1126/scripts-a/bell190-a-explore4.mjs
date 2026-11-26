// bell190 walker A — exploration 4: the Board's Ground Programme and Unavailable sections; nav page names
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-explore4 v1')
const w = await L.newWorld(process.argv[2] || 'desk')
await L.signIn(w, 'ad')
const p = w.page
const nav = await p.evaluate(() => [...document.querySelectorAll('[data-page]')].map(e => e.getAttribute('data-page')))
console.log('nav', L.J([...new Set(nav)]))
const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [L.ID.Tally], from: '09:00', to: '11:00' })
const oth = await L.fileInput(w, L.WED, { type: 'Other', people: [L.ID.Hex], title: 'Dentist', before: async w => { if (await w.page.locator('[data-testid="inpEdit-goes-u"]').count()) await L.press(w, '[data-testid="inpEdit-goes-u"]'); else console.log('no goes-u') } })
console.log('other', oth, L.J(await L.rec(p, oth)))
await L.go(p, 'editsched')
const sbd = await p.evaluate(() => [...document.querySelectorAll('[data-sbday]')].map(e => `${e.tagName}.${String(e.className).slice(0, 30)} sbday=${e.getAttribute('data-sbday')} vis=${e.getBoundingClientRect().width > 3} t="${(e.textContent || '').trim().slice(0, 20)}"`))
console.log('sbday', sbd.join('\n'))
const wunav = await p.evaluate(oth => [...document.querySelectorAll(`#eWeek [data-inpseat^="${oth}"], #eWeek [data-inprow^="${oth}"]`)].map(e => `${e.tagName}.${String(e.className).slice(0, 30)} inpseat=${e.getAttribute('data-inpseat')} inprow=${e.getAttribute('data-inprow')} x=${Math.round(e.getBoundingClientRect().left)}`), oth)
console.log('week unav of the Other', wunav.join('\n'))
await L.press(w, '[data-sbday="2"]')
await L.sleep(900)
const board = await p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 3
  const secs = [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => s.getAttribute('data-secmove'))
  const g = [...document.querySelectorAll('#schedBoard [data-slot^="g:2."], #schedBoard [data-fill^="g:2."], #schedBoard [data-inpseat], #schedBoard [data-inprow], #schedBoard .inpedit')].filter(vis).map(e => `${e.tagName}.${String(e.className).slice(0, 34)} slot=${e.getAttribute('data-slot')} fill=${e.getAttribute('data-fill')} inpseat=${e.getAttribute('data-inpseat')} inprow=${e.getAttribute('data-inprow')} t="${(e.textContent || '').trim().slice(0, 40)}"`)
  const btns = [...document.querySelectorAll('#schedBoard button')].filter(vis).map(b => `${b.id || ''}.${String(b.className).slice(0, 25)} "${(b.textContent || '').trim().slice(0, 25)}" ${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ')}`)
  const ros = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(vis).length
  return { secs, g, btns, ros }
})
console.log(L.J(board, null, 1))
await L.shot(w, 'explore4-board-' + w.kind)
console.log('errs', w.errs)
await L.closeAll()
