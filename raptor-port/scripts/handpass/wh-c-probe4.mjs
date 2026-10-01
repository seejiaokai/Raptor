/* walker C — probe 4: making Hex a second scheduler through Admin → Users (his row's own sheet). */
import * as C from './wh-c-lib.mjs'
const { H, W2 } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await W2.usersPane(p)
await W2.openPersonRow(p, 'rocky')
await H.pic(p, 'probe4-hex-row')
console.log('SHEET', JSON.stringify(await p.evaluate(() => { const r = document.querySelector('#accList [data-person="rocky"]'); const scope = document.querySelector('.acc-sheet, .acc-edit, [data-accedit], .sheet, .modal') || r; return { html: (r ? r.outerHTML.slice(0, 2500) : ''), ctrls: [...document.querySelectorAll('input, select, button')].filter(e => e.offsetParent !== null && (e.closest('[data-person="rocky"]') || e.closest('.sheet, .modal, [role=dialog]'))).map(e => `${e.tagName}#${e.id}|${e.name || ''}|${(e.innerText || e.value || '').trim().slice(0, 40)}|${[...(e.options || [])].map(o => o.value).join(',')}`) } }), null, 1))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
