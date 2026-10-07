/* walker TO — probe (phone): the ⋯ menus' markup, the board at phone width (its "+ Wave", the crew drawer), read only */
import { writeFileSync } from 'node:fs'
import * as T from './stk-TO-lib.mjs'
const { W, L } = T
const out = {}
const w = await T.world({ phone: true })
const p = w.p
try {
  out.page0 = await p.evaluate(() => window.CURPAGE)
  for (const m of ['#viewSchedMore', '#editSchedMore']) {
    if (m === '#editSchedMore') await T.toEdit(p)
    const b = p.locator(m + ':visible').first()
    out[m] = { n: await b.count() }
    if (out[m].n) { await b.click(); await L.sleep(400); out[m].menu = await p.evaluate(s => { const e = document.querySelector(s + 'Menu'); return e ? e.outerHTML.slice(0, 1500) : null }, m); await T.pic(p, 'probe-menu-' + m.slice(1)); await p.keyboard.press('Escape'); await L.sleep(200) }
  }
  out.insBody = await p.evaluate(() => { const b = document.querySelector('#insightBody'); const m = document.querySelector('#insightModal'); return { body: !!b, modal: m ? m.outerHTML.slice(0, 300) : null } })
  await W.boardOn(p, 0)
  out.board = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return { cls: b.className, wv: [...b.querySelectorAll('[data-wvadd]')].map(e => ({ vis: e.offsetParent !== null, r: JSON.stringify(e.getBoundingClientRect()) })), more: !!document.querySelector('#sbMore'), tabs: [...b.querySelectorAll('.ros-tab, [data-sbtab]')].map(e => ({ t: e.innerText, cls: e.className, vis: e.offsetParent !== null })) } })
  await T.pic(p, 'probe-phone-board')
  const b = p.locator('#sbMore:visible').first(); if (await b.count()) { await b.click(); await L.sleep(400); out.sbMore = await p.evaluate(() => [...document.querySelectorAll('[id^="sbMore"]')].map(e => ({ id: e.id, t: (e.innerText || '').slice(0, 60), vis: e.offsetParent !== null }))); await T.pic(p, 'probe-phone-board-more'); await p.keyboard.press('Escape') }
} catch (e) { out.err = String(e && e.stack || e) }
out.errors = w.errors
writeFileSync(process.env.STK_DUMP, JSON.stringify(out, null, 1))
await w.browser.close()
console.log(JSON.stringify(out, null, 1).slice(0, 6000))
