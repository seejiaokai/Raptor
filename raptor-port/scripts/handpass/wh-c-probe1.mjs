/* walker C — probe 1: Admin → Users (the guest switch, the accounts), the role badge, what a guest sees. One write: the
   guest switch through its own control. */
import * as C from './wh-c-lib.mjs'
const { H, W2 } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await W2.usersPane(p)
console.log('USERS PANE CONTROLS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-admin input, #page-admin select, #page-admin button')].filter(e => e.offsetParent !== null).map(e => `${e.tagName}#${e.id}|${e.type || ''}|${(e.innerText || e.value || '').trim().slice(0, 30)}|${(e.getAttribute('aria-label') || e.title || '').slice(0, 40)}|${e.closest('label') ? e.closest('label').innerText.trim().slice(0, 50) : ''}`).slice(0, 80)), null, 0))
await H.pic(p, 'probe1-users')
const guestText = await p.evaluate(() => { const all = [...document.querySelectorAll('#page-admin *')].filter(e => /guest/i.test(e.innerText || '') && e.children.length < 6 && e.offsetParent !== null); return all.slice(0, 8).map(e => e.tagName + '.' + e.className + '#' + e.id + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 200) + ' :: ' + e.outerHTML.slice(0, 400)) })
console.log('GUEST BITS', JSON.stringify(guestText, null, 1))
console.log('ACCOUNTS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#accList [data-person]')].map(r => r.dataset.person + ':' + r.innerText.replace(/\s+/g, ' ').slice(0, 60)).slice(0, 60))))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
