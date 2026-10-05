/* walker TO — probe (throw-away world): does Monday publish with its reporting warnings showing; where Print / CSV /
   the next-week peek live; what a tapped warning line lights. Nothing here is evidence. */
import { writeFileSync } from 'node:fs'
import * as T from './stk-TO-lib.mjs'
const { W, L } = T
const out = {}
const w = await T.world()
const p = w.p
const btns = (sel = 'body') => p.evaluate(s => [...document.querySelectorAll(s + ' button, ' + s + ' a, ' + s + ' [role=button], ' + s + ' select')].filter(e => e.offsetParent !== null && /print|csv|export|peek|next week|download|pdf/i.test((e.innerText || '') + ' ' + (e.title || '') + ' ' + (e.id || ''))).map(e => ({ tag: e.tagName, id: e.id, t: (e.innerText || '').trim().slice(0, 50), title: (e.title || '').slice(0, 90), a: [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ') })), sel)
try {
  await W.toastSpy(p)
  await T.toEdit(p)
  out.editBtns = await btns()
  /* tap a warning line: what changes */
  await T.openList(p, '#eWeek', 0)
  const before = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .puck')].map(e => e.className))
  const ln = p.locator('#eWeek .day[data-day="0"] [data-dwbox="0"] .witem').nth(4)
  out.tapped = (await ln.innerText()).replace(/\s+/g, ' ')
  await ln.click({ position: { x: 60, y: 12 } }); await L.sleep(500)
  out.afterTap = await p.evaluate(b => { const now = [...document.querySelectorAll('#eWeek .day[data-day="0"] .puck')]; const ch = []; now.forEach((e, i) => { if (e.className !== b[i]) ch.push({ who: e.dataset.person, was: b[i], now: e.className }) }); return { ch, itemCls: [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-dwbox="0"] .witem')].map(e => e.className), bodyCls: document.body.className, lit: [...document.querySelectorAll('.wlit, .whl, .wsel, .warnsel, .trace, .flash')].slice(0, 10).map(e => e.className + ' :: ' + (e.innerText || '').slice(0, 30)) } }, before)
  await T.pic(p, 'probe-warning-tapped')
  /* tap an In-time warning line */
  const ln0 = p.locator('#eWeek .day[data-day="0"] [data-dwbox="0"] .witem').nth(0)
  await ln0.click({ position: { x: 60, y: 12 } }); await L.sleep(500)
  out.afterTap0 = await p.evaluate(() => ({ itemCls: [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-dwbox="0"] .witem')].slice(0, 3).map(e => e.className), marked: [...document.querySelectorAll('#eWeek [data-warnkey]')].filter(e => /wk|sel|lit|on|hot/.test(e.className)).map(e => e.dataset.warnkey + ' :: ' + e.className).slice(0, 8), all: [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-warnkey^="it:"]')].map(e => e.dataset.warnkey + ' :: ' + e.className) }))
  await T.pic(p, 'probe-intime-warning-tapped')
  /* publish Monday as it stands */
  const pub = await T.pubOrig(p, 0)
  out.pub = { pub, toasts: await W.toasts(p), head: await T.head(p, 0) }
  await T.pic(p, 'probe-monday-publish')
  out.editBtns2 = await btns()
  out.planmenu = await T.versions(p, 0); await p.keyboard.press('Escape')
  await T.toPage(p, 'viewsched')
  out.viewBtns = await btns()
  out.viewHead = await T.vface(p, 0)
  out.viewAttrs = await p.evaluate(() => { const s = new Set(); document.querySelectorAll('#page-viewsched *').forEach(e => { for (const a of e.attributes) if (a.name.startsWith('data-')) s.add(a.name) }); return [...s].sort() })
  out.viewTop = await p.evaluate(() => [...document.querySelectorAll('#page-viewsched button, #page-viewsched select')].filter(e => e.offsetParent !== null).slice(0, 40).map(e => (e.id || '') + ':' + (e.innerText || '').trim().slice(0, 24) + ':' + (e.title || '').slice(0, 50)))
  await T.pic(p, 'probe-viewsched')
  await T.toPage(p, 'admin')
  out.adminBtns = await btns()
  out.adminText = await p.evaluate(() => (document.querySelector('#page-admin') || document.body).innerText.slice(0, 1500))
} catch (e) { out.err = String(e && e.stack || e) }
out.errors = w.errors
writeFileSync(process.env.STK_DUMP, JSON.stringify(out, null, 1))
await w.browser.close()
console.log(JSON.stringify(out, null, 1).slice(0, 9000))
