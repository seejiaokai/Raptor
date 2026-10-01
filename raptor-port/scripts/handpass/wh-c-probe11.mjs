/* walker C — probe 11b: what the PDF (print) button does — a print frame? a print-only stylesheet? Reads only. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, ctx, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
await p.evaluate(() => {
  window.__cap = { added: [], events: [], prints: 0 }
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes || []) if (n.nodeType === 1 && (m.target === document.body || m.target === document.head || m.target === document.documentElement)) window.__cap.added.push(n.tagName + '#' + n.id + '.' + n.className + ' len ' + (n.innerText || n.textContent || '').length) }).observe(document.documentElement, { childList: true, subtree: true })
  for (const ev of ['beforeprint', 'afterprint']) window.addEventListener(ev, () => window.__cap.events.push(ev + ' bodyCls=' + document.body.className + ' htmlCls=' + document.documentElement.className))
  const pr = window.print
  window.print = function () { window.__cap.prints++; window.__cap.atPrint = { bodyCls: document.body.className, htmlCls: document.documentElement.className, title: document.title, printRoot: [...document.querySelectorAll('[id*=print i], [class*=print i]')].map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40) + ' len ' + (e.innerText || '').length).slice(0, 10) } }
})
const btn = await p.evaluate(() => { const b = document.querySelector('#exportPdf'); return b ? b.outerHTML.slice(0, 300) : null })
console.log('BTN', btn)
await p.locator('#exportPdf').click(); await L.sleep(2000)
console.log('CAP', JSON.stringify(await p.evaluate(() => ({ ...window.__cap, iframes: [...document.querySelectorAll('iframe')].map(f => f.id + '.' + f.className + ' ' + (f.contentDocument ? f.contentDocument.body.innerText.length : 'x')), bodyCls: document.body.className, toast: (document.getElementById('toastEl') || {}).textContent })), null, 1).slice(0, 3000))
console.log('PAGES', ctx.pages().length)
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
