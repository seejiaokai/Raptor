// Walker d — probe 2: the week's Personal Inputs fold for Wed 15 Jul, and the Inputs list's rows. Reads only.
import { setup } from './wr4-d-common.mjs'
console.log('wr4-d-probe2 v1')
const { L, A } = await setup('probe2-r1')
const { newPage, signIn, fileInput, go, sleep, log, press, shot, RANGER, HEX, WED } = L
const w = await newPage('desk'); await signIn(w, 'ad')
const iid = await fileInput(w, 'P', WED, { type: 'Training', people: [RANGER, HEX], from: '08:00', to: '10:00', title: 'Range brief' })
await go(w.page, 'editsched'); await sleep(600)
const info = () => w.page.evaluate(i => ({
  pitog: [...document.querySelectorAll('#eWeek [data-pitog]')].map(e => ({ k: e.getAttribute('data-pitog'), w: Math.round(e.getBoundingClientRect().width), t: (e.textContent || '').trim().slice(0, 40), exp: e.getAttribute('aria-expanded') })),
  inp: [...document.querySelectorAll('#eWeek [data-inp]')].filter(e => e.getAttribute('data-inp').startsWith(i)).map(e => ({ k: e.getAttribute('data-inp'), w: Math.round(e.getBoundingClientRect().width) })),
  piText: [...document.querySelectorAll('#eWeek section.day[data-day="2"] *')].filter(e => /PERSONAL INPUTS/i.test([...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(''))).map(e => (e.closest('.dsec')?.textContent || '').replace(/\s+/g, ' ').slice(0, 300)),
}), iid)
log('P', 'before ' + JSON.stringify(await info()))
for (const e of await w.page.locator('#eWeek [data-pitog="2"]').all()) { await e.evaluate(x => x.click()); await sleep(400) }
log('P', 'after toggles ' + JSON.stringify(await info()))
await go(w.page, 'inputs')
log('P', 'inListBtn ' + await w.page.locator('#inListBtn').getAttribute('aria-pressed'))
if (await w.page.locator('#inListBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inListBtn')
await sleep(500)
log('P', 'list rows ' + JSON.stringify(await w.page.evaluate(i => [...document.querySelectorAll('[data-iid]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.tagName + ':' + e.getAttribute('data-iid') + ':' + (e.textContent || '').replace(/\s+/g, ' ').slice(0, 60)).slice(0, 12), iid)))
log('P', 'has mine ' + await w.page.evaluate(i => [...document.querySelectorAll(`[data-iid="${i}"]`)].map(e => e.tagName + ' w' + Math.round(e.getBoundingClientRect().width)), iid))
await shot(w.page, 'P', 'inputs-page', { x: 0, y: 0, width: 1440, height: 900 }, 'inputs page', 'desk')
await A.done('probe2-r1')
