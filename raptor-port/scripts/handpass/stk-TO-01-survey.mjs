/* walker TO — survey 2: Logic in edit mode (no value changed), the board's wave markup, the Insights window (read only) */
import { writeFileSync } from 'node:fs'
import * as B from './ins-a-lib.mjs'
const { L, W } = B
const out = {}
const w = await B.world()
const p = w.p
try {
  await L.go(p, 'logic')
  out.logicIT = await p.evaluate(() => { const pg = document.querySelector('#page-logic'); const t = pg.innerText; const i = t.indexOf('IN-TIME / RALLY'); return t.slice(i, i + 3000) })
  await p.locator('#lgEdit').click(); await L.sleep(400)
  out.logicInputs = await p.evaluate(() => { const pg = document.querySelector('#page-logic'); return [...pg.querySelectorAll('input, select, textarea, [role="switch"], [contenteditable="true"]')].map(e => ({ tag: e.tagName, id: e.id, type: e.type, v: e.value, role: e.getAttribute('role'), chk: e.getAttribute('aria-checked'), a: [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'placeholder' || a.name === 'aria-label').map(a => a.name + '=' + a.value).join(' '), near: (e.closest('label') || e.parentElement.parentElement).innerText.replace(/\s+/g, ' ').slice(0, 140) })) })
  await p.evaluate(() => { const e = [...document.querySelectorAll('#page-logic *')].find(x => /^IN-TIME \/ RALLY$/.test((x.innerText || '').trim())); if (e) e.scrollIntoView({ block: 'start' }) }); await L.sleep(300)
  await B.pic(p, 'survey-logic-intime-edit')
  await p.evaluate(() => { const e = document.querySelector('#lgMissionMix'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(300)
  await B.pic(p, 'survey-logic-mix')
  await p.locator('#lgDone').click(); await L.sleep(300)
  await B.toEdit(p)
  await W.boardOn(p, 0)
  out.boardWave = await p.evaluate(() => { const it = document.querySelector('#sbBoard [data-intimes="0|1"]'); let e = it; for (let i = 0; i < 6 && e; i++) { if (e.querySelector('[data-gline]') && e.querySelector('[data-bfld^="ff:0.1.0"]')) break; e = e.parentElement } return { cls: e ? e.className : null, html: e ? e.outerHTML.slice(0, 12000) : null } })
  out.boardIt = await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-itline]')].map(e => ({ tag: e.tagName, key: e.dataset.itline, v: e.value, text: e.innerText, type: e.type })))
  out.feedback = await p.evaluate(() => [...document.querySelectorAll('[data-reporting-feedback]')].map(e => ({ where: e.closest('#schedBoard') ? 'board' : 'week', html: e.outerHTML.slice(0, 500), text: e.innerText, disp: getComputedStyle(e).display })))
  out.boardWarn = await B.readBoard(p)
  await W.boardOff(p)
  const r = await B.ins(p, 'survey-insights')
  out.ins = { how: r.how, title: r.title, tiles: r.tiles, secs: r.secs, shots: r.shots }
  out.insHtml = await (async () => { await B.insOpen(p); const h = await p.evaluate(() => { const hs = [...document.querySelectorAll('#insightBody .isec-h')]; const h = hs.find(e => /Work hours/i.test(e.innerText)); const n = h.nextElementSibling; return h.outerHTML + '\n' + (n ? n.outerHTML.slice(0, 2500) : '') }); await B.insClose(p); return h })()
  out.list0 = await (async () => { await B.openList(p, '#eWeek', 0); return B.readList(p, '#eWeek', 0) })()
  await B.pic(p, 'survey-mon-list')
} catch (e) { out.err = String(e && e.stack || e) }
out.errors = w.errors
writeFileSync(process.env.STK_DUMP, JSON.stringify(out, null, 1))
await w.browser.close()
console.log('done', out.err || '')
