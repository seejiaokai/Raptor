/* walker TO — probe (read only): what "Export as PDF (print)" puts in front of the printer, from View-only Sched;
   and what the next-week peek and View-only Sched show of a wave's reporting lines. Nothing is edited. */
import * as T from './stk-TO-lib.mjs'
const { W, L } = T
const w = await T.world()
const p = w.p
try {
  await T.toEdit(p)
  await p.evaluate(() => {
    window.__pr = []
    const grab = (how) => { window.__pr.push({ how, bodyCls: document.body.className, htmlCls: document.documentElement.className, frames: document.querySelectorAll('iframe').length, sheets: [...document.querySelectorAll('[id*=print i], [class*=print i]')].map(e => (e.id || e.className) + ':' + (e.innerText || '').length), text: document.body.innerText.length }) }
    const orig = window.print
    window.print = function () { grab('window.print'); }
    window.addEventListener('beforeprint', () => grab('beforeprint'))
    const d = document.createElement.bind(document)
    document.createElement = function (t, ...a) { const e = d(t, ...a); if (String(t).toLowerCase() === 'iframe') window.__pr.push({ how: 'iframe created' }); return e }
    const o = window.open; window.open = function (...a) { window.__pr.push({ how: 'window.open ' + a[0] }); return o.apply(window, a) }
  })
  await p.locator('#exportPdf:visible').first().click(); await L.sleep(1200)
  console.log('PRINT', JSON.stringify(await p.evaluate(() => window.__pr)))
  console.log('FRAMES', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('iframe')].map(f => ({ id: f.id, cls: f.className, len: (() => { try { return f.contentDocument.body.innerText.length } catch (e) { return 'x' } })() })))))
  console.log('pages', p.context().pages().length, 'toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).textContent))
  await T.toPage(p, 'viewsched')
  /* the view-only week: Monday's wave 1 reporting lines as a reader sees them */
  console.log('VIEW', JSON.stringify(await p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"]'); return { it: [...d.querySelectorAll('.intimes, [data-intimes], .itline')].map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 160)), fb: [...d.querySelectorAll('[data-reporting-feedback]')].map(e => getComputedStyle(e).display + ' :: ' + e.innerText) } })))
  const prev = p.locator('#page-viewsched [data-wk="06/07/2026"]:visible').first(); await prev.click(); await L.sleep(900)
  console.log('PEEK', JSON.stringify(await p.evaluate(() => { const d = document.querySelector('#vWeek [data-peek-day="0"]'); return { text: d.innerText.replace(/\s+/g, ' ').slice(0, 900), it: [...d.querySelectorAll('.intimes, .itline')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 160)), warn: [...d.querySelectorAll('.daywarn, .witem')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 100)) } })))
  await p.evaluate(() => { const d = document.querySelector('#vWeek [data-peek-day="0"]'); d.scrollIntoView({ block: 'start', inline: 'start' }) }); await L.sleep(400)
  await T.pic(p, 'probe-peek-monday')
} catch (e) { console.log('ERR', String(e && e.stack || e).slice(0, 800)) }
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
