// draw-r6-misc-d12 - round 6, D12: his correction "D12 i dont remember my drop down of personnel design is so ugly".
// TODAY (read on the app first): the sign-off boxes (PLANNED BY …) and "+ Input"'s Person box are the browser's own select -
// a press opens the browser's own list (on his iPhone, the wheel at the foot of the screen), which no screen picture holds;
// so today's pictures show the boxes as drawn, closed. The app's own drop-down is the top bar's squadron list (the
// Schedules menu, `.sb-moremenu.sqm-panel`: a small-capitals heading, one row a choice - a tick on the chosen one, the
// choice in white, a grey word at the right), which the phone's ☰ menu opens in place too (D2384). Its own person picker
// is the pucks ("Several people", Inputs → Calendar's "Add people") - for picking several, not one.
//  m6-d-today-plannedby  Kestrel, 149's Edit Schedule, Mon 7 Dec: the PLANNED BY box as drawn today (closed, focused).
//  m6-d-today-person     Hunter, 149 picked, Inputs → "+ Input": the Person box as drawn today - it reads "Hunter" (142).
//  m6-?-plannedby        THE RECOMMENDED DESIGN: the app's own drop-down, its parts copied from the real Schedules menu
//                        (read on Saber's top bar), hung 6px under the box (its heading left out - the box's label is just above), W6.noName first (ticked:
//                        nothing signed), 149's own (Kestrel), then the names from another squadron, the grey word at the
//                        right their squadron's number (Hunter 142, Saber 142). Ringed: the list.
//  m6-?-plannedby-chosen the closed box after choosing Hunter: "Hunter · 142" (round 5's e11b: W.plannedByName).
//  m6-?-person           the same drop-down under the Person box, W6.noName first (ticked: the box starts
//                        empty, his D2628 C2), then only 149's own men, A to Z - no other squadron's names (C2). Ringed.
//  m6-d-person-chosen    the closed box after choosing Osprey (a 149 man - Hunter is not offered on 149, C2).
// The list's look and place are drawn; its keys and its closing are the Schedules menu's (not drawn).
//   node raptor-port/scripts/handpass/n176/draw-r6-misc-d12.mjs   (ONLY=tpl,today,pb-d,pb-p,pbc-d,pbc-p,per-d,per-p,perc-d)
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, W6, FACT, want, wait, vis, hit, reachPick, shot, box, closeAll, TMP, barSq, vring, union } from './draw-r6-misc-lib.mjs'
import { go, newInputWindow } from '../n175/p6-lib.mjs'
const ST11 = resolve(TMP, 'state-e11.json'), TPL = resolve(TMP, 'r6-sqm-tpl.json')
const HOME = { Hunter: '142', Saber: '142' }
/* the Schedules menu's parts, read once on Saber's top bar (its look too, to check the copy draws the same) */
async function template() {
  if (existsSync(TPL) && !process.env.FRESH) return JSON.parse(readFileSync(TPL, 'utf8'))
  let t = null
  await run('tpl', 'd', async s => {
    await as(s, 'saber'); await hit(s, '#sqnMenuBtn', 500)
    t = await s.page.evaluate(() => {
      const m = document.querySelector('#sqnMenu'); const c = getComputedStyle(m)
      const rows = [...m.querySelectorAll('.sqm-row')]
      const head = [...m.children].find(e => !e.classList.contains('sqm-row'))
      const look = e => { const c = getComputedStyle(e); return { bg: c.backgroundColor, border: c.borderTopColor + ' ' + c.borderTopWidth, radius: c.borderTopLeftRadius, shadow: c.boxShadow.slice(0, 60), font: c.fontSize + ' ' + c.fontWeight, color: c.color, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) } }
      return { panel: m.cloneNode(false).outerHTML, head: head ? head.outerHTML : null, on: rows.find(r => r.getAttribute('aria-checked') === 'true').outerHTML, off: rows.find(r => r.getAttribute('aria-checked') !== 'true').outerHTML,
        look: { panel: look(m), row: look(rows[0]), num: look(rows[0].querySelector('.sqm-num')), lbl: look(rows[0].querySelector('.sqm-lbl')), head: head ? look(head) : null }, children: [...m.children].map(e => e.tagName + '.' + e.className) }
    })
  })
  FACT('tpl', { children: t.children, look: t.look })
  writeFileSync(TPL, JSON.stringify(t)); return t
}
/* the app's drop-down hung under `boxSel`: heading, rows [name, grey word, chosen] */
const dropDown = (s, tpl, boxSel, heading, rows, minW = 0) => s.page.evaluate(([tpl, boxSel, heading, rows, minW]) => {
  const anchor = document.querySelector(boxSel).getBoundingClientRect()
  const h = document.createElement('div'); h.innerHTML = tpl.panel; const m = h.firstElementChild
  m.id = 'm6list'; m.removeAttribute('aria-labelledby'); m.setAttribute('aria-label', heading)
  /* the menu's small-capitals heading is left out: the box's own label ("PLANNED BY", "PERSON") stands just above the
     list, so the heading would say it twice (HEAD=1 draws it) */
  if (tpl.head && tpl.withHead) { const x = document.createElement('div'); x.innerHTML = tpl.head; const hd = x.firstElementChild; hd.removeAttribute('id'); hd.textContent = heading; m.appendChild(hd) }
  for (const [name, word, on] of rows) {
    const x = document.createElement('div'); x.innerHTML = on ? tpl.on : tpl.off; const r = x.firstElementChild
    r.removeAttribute('data-unit'); r.setAttribute('aria-checked', String(!!on))
    r.querySelector('.sqm-num').textContent = name; r.querySelector('.sqm-lbl').textContent = word || ''
    m.appendChild(r)
  }
  Object.assign(m.style, { position: 'fixed', left: Math.round(anchor.left) + 'px', top: Math.round(anchor.bottom + 6) + 'px', right: 'auto', bottom: 'auto', zIndex: 2147483000, minWidth: Math.max(minW, Math.round(anchor.width)) + 'px', display: 'block', visibility: 'visible', opacity: '1', transform: 'none' })
  document.body.appendChild(m)
  const look = e => { const c = getComputedStyle(e); return { bg: c.backgroundColor, border: c.borderTopColor + ' ' + c.borderTopWidth, radius: c.borderTopLeftRadius, shadow: c.boxShadow.slice(0, 60), font: c.fontSize + ' ' + c.fontWeight, color: c.color, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) } }
  const r = m.getBoundingClientRect(), row = m.querySelector('.sqm-row')
  return { listed: [...m.querySelectorAll('.sqm-row')].map(e => e.querySelector('.sqm-num').textContent + (e.querySelector('.sqm-lbl').textContent ? ' | ' + e.querySelector('.sqm-lbl').textContent : '') + (e.getAttribute('aria-checked') === 'true' ? ' (ticked)' : '')),
    box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, onScreen: r.bottom <= innerHeight, look: { panel: look(m), row: look(row), num: look(row.querySelector('.sqm-num')), lbl: look(row.querySelector('.sqm-lbl')) } }
}, [tpl, boxSel, heading, rows, minW])
/* Kestrel on 149's Edit Schedule, Mon 7 Dec (round 5's way to the day); the PLANNED BY box given an id */
async function toPlannedBy(s) {
  await as(s, 'kestrel'); await go(s, 'editsched'); await wait(s, 1200)
  /* the desktop's week calendar button; on a phone the bar's "Jump to a date" */
  await hit(s, vis(s, s.desk ? 'button.wk-cal' : 'button.filt-cal'), 700)
  for (let i = 0; i < 8; i++) { const t = await s.page.evaluate(() => document.querySelector('#weekCal')?.innerText.slice(0, 40) || ''); if (/December 2026/.test(t)) break; await hit(s, vis(s, '#weekCal button[aria-label="Next month"]').first(), 250) }
  await hit(s, vis(s, '#weekCal button').filter({ hasText: /^7$/ }).first(), 1200)
  const sel = await s.page.evaluate(() => {
    const pb = [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0).find(e => /PLANNED BY/i.test(e.getAttribute('aria-label') || ''))
    if (!pb) return null; pb.id = 'n176pb'; pb.closest('label').id = 'm6pbBox'
    return { label: pb.getAttribute('aria-label'), offered: [...pb.options].map(o => o.textContent.trim()), picked: pb.options[pb.selectedIndex]?.textContent.trim() }
  })
  if (!sel) throw new Error('no PLANNED BY box')
  await s.page.evaluate(() => { const b = document.querySelector('#m6pbBox').getBoundingClientRect(); if (b.top < 120 || b.bottom > innerHeight - 260) scrollBy(0, b.top - 140) }); await wait(s, 300)
  return { squadron: await barSq(s), ...sel }
}
const field = (s, sel) => s.page.evaluate(sel => { const f = document.querySelector(sel); const r = f.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
async function toPerson(s) {
  await as(s, 'hunter'); await reachPick(s, 149, s.desk ? 'bar' : 'menu'); await newInputWindow(s); await wait(s, 600)
  const t = await s.page.evaluate(() => { const e = document.querySelector('#inpEditPerson'); (e.closest('[data-testid="pp"]') || e.parentElement).id = 'm6perField'; return { tag: e.tagName, picked: e.options[e.selectedIndex]?.textContent.trim(), offered: [...e.options].map(o => o.textContent.trim()) } })
  return { squadron: await barSq(s), ...t }
}
try {
  const tpl = await template(); tpl.withHead = !!process.env.HEAD
  /* 149's own men (read on Kestrel's Admin → Users, round 1's e10 way) */
  const own149 = ['Condor', 'Falcon', 'Gannet', 'Harrier', 'Heron', 'Kestrel', 'Merlin', 'Osprey', 'Raven', 'Shrike']
  if (want('today')) {
    await run('today.pb', 'd', async s => {
      const t = await toPlannedBy(s); FACT('today.plannedby', { ...t, element: 'the browser\'s own select (an invisible <select> over the box\'s words) - its open list is the browser\'s, not drawn by the app' })
      await s.page.focus('#n176pb'); await wait(s, 200)
      const f = await field(s, '#m6pbBox')
      await shot(s, 'm6-d-today-plannedby', [f, { ...f, x: f.x - 300, w: f.w + 600 }])
    }, { state: ST11 })
    await run('today.per', 'd', async s => {
      const t = await toPerson(s); FACT('today.person', { ...t, element: 'the browser\'s own select' })
      await shot(s, 'm6-d-today-person', [await box(s, '.inpedwin')].map(b => b && { ...b, h: Math.min(b.h, 300) }))
    })
  }
  /* the recommended design: PLANNED BY */
  for (const sz of ['d', 'p']) if (want('pb-' + sz)) await run(`pb.${sz}`, sz, async s => {
    const t = await toPlannedBy(s); FACT(`pb.${sz}.today`, t)
    const own = t.offered.filter(n => n !== '— name —' && !HOME[n]), out = t.offered.filter(n => HOME[n])
    const rows = [[W6.noName, '', true], ...own.map(n => [n, '', false]), ...out.map(n => [n, HOME[n], false])]
    const r = await dropDown(s, tpl, '#m6pbBox', 'PLANNED BY', rows, s.desk ? 220 : 0)
    FACT(`pb.${sz}.drawn`, { ...r, sameLookAsTheMenu: JSON.stringify([tpl.look.panel.bg, tpl.look.panel.border, tpl.look.panel.radius, tpl.look.row.h, tpl.look.num.font, tpl.look.lbl.font, tpl.look.lbl.color]) === JSON.stringify([r.look.panel.bg, r.look.panel.border, r.look.panel.radius, r.look.row.h, r.look.num.font, r.look.lbl.font, r.look.lbl.color]) })
    await vring(s, r.box, 'list')
    const f = await field(s, '#m6pbBox')
    await shot(s, `m6-${sz}-plannedby`, [r.box, { ...f, y: f.y - 24, h: f.h + 24 }, s.desk ? { ...f, x: f.x - 200, w: f.w + 400 } : null])
  }, { state: ST11 })
  for (const sz of ['d', 'p']) if (want('pbc-' + sz)) await run(`pbc.${sz}`, sz, async s => {
    await toPlannedBy(s)
    const w = W.plannedByName('Hunter', '142')
    const r = await s.page.evaluate(w => { const e = document.querySelector('#n176pb'); for (const o of e.options) if (o.textContent.trim() === 'Hunter') o.textContent = w; e.selectedIndex = [...e.options].findIndex(o => o.textContent === w); const l = e.closest('label.sgn'); const was = l.querySelector('.v').textContent; l.classList.add('on'); l.querySelector('.v').textContent = w; return { was, now: l.querySelector('.v').textContent, cls: l.className } }, w)
    FACT(`pbc.${sz}.drawn`, r)
    const f = await field(s, '#m6pbBox')
    await shot(s, `m6-${sz}-plannedby-chosen`, [f, s.desk ? { ...f, x: f.x - 300, w: f.w + 600 } : { ...f, x: 0, w: s.W, y: f.y - 60, h: f.h + 120 }])
  }, { state: ST11 })
  /* the recommended design: the Person box */
  for (const sz of ['d', 'p']) if (want('per-' + sz)) await run(`per.${sz}`, sz, async s => {
    const t = await toPerson(s); FACT(`per.${sz}.today`, t)
    /* the box starts empty (C2): a blank first choice, picked */
    await s.page.evaluate(own => { const e = document.querySelector('#inpEditPerson'); for (const o of [...e.options]) if (!own.includes(o.textContent.trim())) o.remove(); const b = document.createElement('option'); b.value = ''; b.textContent = ''; e.prepend(b); e.selectedIndex = 0 }, own149)
    const rows = [[W6.noName, '', true], ...own149.map(n => [n, '', false])]
    const r = await dropDown(s, tpl, '#inpEditPerson', 'PERSON', rows, s.desk ? 220 : 0)
    FACT(`per.${sz}.drawn`, r)
    await vring(s, r.box, 'list')
    await shot(s, `m6-${sz}-person`, [r.box, await box(s, '#m6perField')])
  })
  if (want('perc-d')) await run('perc.d', 'd', async s => {
    await toPerson(s)
    const r = await s.page.evaluate(own => { const e = document.querySelector('#inpEditPerson'); for (const o of [...e.options]) if (!own.includes(o.textContent.trim())) o.remove(); e.selectedIndex = [...e.options].findIndex(o => o.textContent.trim() === 'Osprey'); return e.options[e.selectedIndex].textContent }, own149)
    FACT('perc.d.drawn', { closedBoxReads: r })
    await shot(s, 'm6-d-person-chosen', [await box(s, '#m6perField'), await box(s, '.inpedwin .win-ttl, .inpedwin')].map((b, i) => i ? b && { ...b, h: 60 } : b))
  })
} finally { await closeAll() }
