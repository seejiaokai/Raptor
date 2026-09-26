/* [TRK-PALETTE-ASK] walk — the Tracker in Raptor's colours, fully (owner, D157,
   24 Sep 26). 26 Sep 26.

   Drives the real production bundle (bug-check order §7.2, D17) across EVERY
   place the Tracker paints a colour — the roll-call in
   docs/handpass/2026-09-26-trk-palette.md §2 — at desktop and phone width, and
   reads back what was actually PAINTED (computed style, or the SVG attribute
   the chart was drawn with), so each check is a PASS only when the colour on
   screen is Raptor's. Every mark, search, selection and edit is made through
   the app's own controls (§7.7); the store is only read.

   Run against the preview on this chat's port (4180, D230's conditions):
     HP_URL=http://localhost:4180 \
     HP_SHOTS=docs/img/handpass/2026-09-26-trk-palette \
     HP_OUT=docs/handpass/parts/trk-palette node scripts/handpass/trk-palette-walk.mjs
   The last block retakes the two framings of the 24 Sep 26 comparison (the
   pictures he chose "C" from) so the built chart can sit beside them; pass
   PALETTE_AB=<folder holding chart-1440-A.png …> to lay them side by side. */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { open, shot, save, log, reveal, SHOTS, BASE } from './trk-lib.mjs'
import { sleep, ball, arrangeOn, arrangeOff, tool, addBall } from './trk-w1-lib.mjs'

const L = log()
const P = { width: 390, height: 844 }, D = { width: 1440, height: 900 }
const C = {
  bg: 'rgb(11, 13, 16)', panel: 'rgb(20, 24, 29)', panel2: 'rgb(26, 31, 38)', line: 'rgb(42, 49, 58)',
  ink: 'rgb(241, 244, 247)', muted: 'rgb(138, 150, 163)', accent: 'rgb(59, 198, 232)', accentInk: 'rgb(5, 42, 52)',
  ok: 'rgb(87, 201, 122)', hard: 'rgb(240, 85, 95)', adv: 'rgb(229, 168, 59)', san: 'rgb(178, 77, 234)',
  on: 'rgba(59, 198, 232, 0.16)', redInk: 'rgb(251, 180, 185)', redEdge: 'rgba(240, 85, 95, 0.55)', redWash: 'rgba(240, 85, 95, 0.12)',
  dpco: 'rgb(31, 109, 255)', na: 'rgb(205, 187, 142)', black: 'rgb(0, 0, 0)', white: 'rgb(255, 255, 255)',
}
const TYPE = { flight: '#3BC6E8', acad: '#57C97A', test: '#F0555F', sim: '#E5A83B', device: '#B24DEA' }
const OLD = ['#19b6e8', '#27d64a', '#ff4040', '#ffe000', '#b063ff', '#36c2ff', '#ff2b2b', '#16384a', '#5ec8ff', '#e9ecf2']

/* computed style of the first element matching sel */
const cs = (page, sel, props) => page.evaluate(({ sel, props }) => {
  const el = document.querySelector(sel); if (!el) return null
  const s = getComputedStyle(el); const o = {}
  for (const p of props) o[p] = s[p]
  return o
}, { sel, props })
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* Every colour the chart was DRAWN with, from its SVG attributes — no old one may be there. */
const chartColours = page => page.evaluate(() => {
  const out = new Set()
  for (const el of document.querySelectorAll('#flowSvg *'))
    for (const a of ['fill', 'stroke']) { const v = el.getAttribute(a); if (v && v !== 'none' && v !== 'transparent') out.add(v.toLowerCase()) }
  return [...out]
})

/* The shape inside each ball says its type (innerShape: ellipse = sim, 6-point
   polygon = CFT/IAT/EPT, 10-point polygon = flight jet, rect = acad or test). */
const shapeFills = page => page.evaluate(() => {
  const by = { sim: new Set(), device: new Set(), flight: new Set(), rect: new Set() }; let n = 0
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    const t = g.querySelector('text.lbl'); const sh = t && t.previousElementSibling; if (!sh) continue
    const f = (sh.getAttribute('fill') || '').toLowerCase(); n++
    if (sh.tagName === 'ellipse') by.sim.add(f)
    else if (sh.tagName === 'polygon') (sh.getAttribute('points').trim().split(/\s+/).length === 6 ? by.device : by.flight).add(f)
    else by.rect.add(f)
  }
  return { n, sim: [...by.sim], device: [...by.device], flight: [...by.flight], rect: [...by.rect].sort() }
})

/* The first balls on the chart, top-left first — the ones marked below. */
const firstBalls = (page, k) => page.evaluate(k => [...document.querySelectorAll('#flowSvg .ball')]
  .map(g => ({ id: g.dataset.id, r: g.getBoundingClientRect() }))
  .sort((a, b) => (a.r.top - b.r.top) || (a.r.left - b.r.left)).slice(0, k).map(x => x.id), k)

/* The active student's wedge on one ball: its fill, the ticks, the cyan edge. */
const wedgeOf = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
  const mine = g.querySelector('path.mine'); const wi = mine ? mine.dataset.wi : '0'
  const w = g.querySelector(`path.wedge[data-wi="${wi}"]`)
  const ticks = [...g.querySelectorAll('line.ftick')]
  return { fill: w && w.getAttribute('fill'), mine: mine && mine.getAttribute('stroke'),
    ticks: ticks.length, tick: [...new Set(ticks.map(t => t.getAttribute('stroke')))].join(',') }
}, id)

/* Grade the active student on one ball through the pop-up, as a person does. */
async function grade(page, id, label, fails = 0, picture = null) {
  await reveal(page, id)
  const b = await ball(page, id).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(400)
  await page.waitForSelector('#pop', { state: 'visible', timeout: 4000 })
  for (let i = 0; i < fails; i++) { await page.locator('#pop .fails button', { hasText: '+' }).click(); await sleep(250) }
  if (picture) await shot(page, picture)
  await page.locator('#pop .opts button', { hasText: label }).first().click(); await sleep(450)
  if (await page.locator('#pop:visible').count()) { await page.keyboard.press('Escape'); await sleep(250) }
}

/* ======================= DESKTOP, admin ======================= */
{
  const { browser, page, errors } = await open({ size: D, who: 'a' })

  /* S1 the page itself */
  const root = await cs(page, '#page-tracker .tr-root', ['backgroundColor', 'color'])
  L.ok('S1 page: background and text are Raptor\'s', same(root, { backgroundColor: C.bg, color: C.ink }), JSON.stringify(root))
  const sel = await cs(page, '#page-tracker header select', ['backgroundColor', 'borderTopColor', 'color'])
  L.ok('S1 bar: a dropdown is Raptor\'s panel, edge and ink', same(sel, { backgroundColor: C.panel2, borderTopColor: C.line, color: C.ink }), JSON.stringify(sel))
  const zc = await cs(page, '#flowZoomCtl', ['backgroundColor', 'borderTopColor'])
  const zp = await cs(page, '#fzPct', ['color'])
  L.ok('S13 zoom control: Raptor\'s panel and edge, its % in muted', same(zc, { backgroundColor: C.panel2, borderTopColor: C.line }) && zp && zp.color === C.muted, JSON.stringify({ zc, zp }))
  await shot(page, 'd01-page')

  /* S2 the chart: every ball's type colour, the code on it, nothing old drawn */
  const sf = await shapeFills(page)
  L.ok('S2 chart: every sim is Raptor\'s amber', same(sf.sim, [TYPE.sim.toLowerCase()]), JSON.stringify(sf.sim))
  L.ok('S2 chart: every CFT/IAT/EPT is Raptor\'s purple', same(sf.device, [TYPE.device.toLowerCase()]), JSON.stringify(sf.device))
  L.ok('S2 chart: every flight is Raptor\'s blue', same(sf.flight, [TYPE.flight.toLowerCase()]), JSON.stringify(sf.flight))
  L.ok('S2 chart: every acad / test is Raptor\'s green / red', same(sf.rect, [TYPE.acad.toLowerCase(), TYPE.test.toLowerCase()].sort()), JSON.stringify(sf.rect) + ` (${sf.n} balls)`)
  const lbl = await cs(page, '#flowSvg .ball text.lbl', ['fill'])
  L.ok('S2 chart: the code on a ball is Raptor\'s darkest', lbl && lbl.fill === C.bg, JSON.stringify(lbl))
  const drawn0 = await chartColours(page)
  L.ok('S2 chart: no retired Tracker colour is drawn anywhere on it', !drawn0.some(c => OLD.includes(c)), drawn0.join(' '))
  await page.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = 950 }); await sleep(400)
  await shot(page, 'd02-chart-all-types')
  await page.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = 0 }); await sleep(300)

  /* S3 the colour key under the bar */
  const key = await page.evaluate(() => [...document.querySelectorAll('#page-tracker .legend span')].map(s => {
    const i = s.querySelector('.sw'); return [s.textContent.trim(), i ? getComputedStyle(i).backgroundColor : null] }))
  const want = { Flight: C.accent, 'Acad/Spec': C.ok, Test: C.hard, Sim: C.adv, 'CFT/IAT/EPT': C.san, DCO: C.black, DPCO: C.dpco, Marginal: C.ok, NA: C.na, 'Not done': C.white }
  const keyBad = Object.entries(want).filter(([k, v]) => !key.some(([t, c]) => t === k && c === v))
  L.ok('S3 colour key: every swatch matches what the chart draws', keyBad.length === 0, keyBad.length ? 'wrong: ' + JSON.stringify(keyBad) + ' saw ' + JSON.stringify(key) : key.map(k => k.join('=')).join(', '))
  await shot(page, 'd03-legend', { el: '#page-tracker .legend' })

  /* S2 + S5 the marks on the chart, made through the pop-up */
  const ids = await firstBalls(page, 4)
  await grade(page, ids[0], 'DCO')
  await grade(page, ids[1], 'DPCO', 2, 'd05-pop-with-two-failures')
  await grade(page, ids[2], 'Marginal')
  await grade(page, ids[3], 'N.A.')
  const w = await Promise.all(ids.map(id => wedgeOf(page, id)))
  L.ok('S2 marks: DCO wedge black, DPCO blue, Marginal Raptor\'s green, N.A. tan', w[0].fill === '#000000' && w[1].fill === '#1f6dff' && w[2].fill.toLowerCase() === '#57c97a' && w[3].fill === '#cdbb8e', JSON.stringify(w.map(x => x.fill)))
  L.ok('S2 marks: two failures draw two ticks in Raptor\'s red', w[1].ticks === 2 && w[1].tick === '#F0555F', JSON.stringify(w[1]))
  L.ok('S2 marks: the picked student\'s wedge wears Raptor\'s accent edge on every ball', w.every(x => x.mine === '#3BC6E8'), JSON.stringify(w.map(x => x.mine)))
  await reveal(page, ids[0])
  await shot(page, 'd04-marks-on-chart')
  const hov = await page.evaluate(() => { const r = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
    const flat = []; const walk = rs => { for (const x of rs) { if (x.cssRules) walk(x.cssRules); if (x.selectorText) flat.push(x) } }; walk(r)
    const h = flat.find(x => /\.wedge:hover/.test(x.selectorText)); return h ? h.style.stroke : null })
  L.ok('S2 chart: a hovered crew wedge edges in Raptor\'s accent', hov === 'var(--accent)', String(hov))

  /* S5 the pop-up's own colours */
  await reveal(page, ids[2]); const pb = await ball(page, ids[2]).boundingBox()
  await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2); await sleep(400)
  const dots = await page.evaluate(() => [...document.querySelectorAll('#pop .opts button')].filter(b => b.querySelector('.dot')).map(b => [b.textContent.trim(), getComputedStyle(b.querySelector('.dot')).backgroundColor]))
  const popRule = await cs(page, '#popDoneRow', ['borderTopColor'])
  const pop = await cs(page, '#pop', ['backgroundColor', 'borderTopColor'])
  L.ok('S5 pop-up: its grade dots match the chart and the key', same(Object.fromEntries(dots), { 'Not done': C.white, DCO: C.black, DPCO: C.dpco, Marginal: C.ok, 'N.A.': C.na }), JSON.stringify(dots))
  L.ok('S5 pop-up: Raptor\'s panel, edge and divider', same(pop, { backgroundColor: C.panel2, borderTopColor: C.line }) && popRule && popRule.borderTopColor === C.line, JSON.stringify({ pop, popRule }))
  await page.keyboard.press('Escape'); await sleep(250)

  /* S4 the side panel: cards, Overall's bar, the key ball, Failures */
  const card = await cs(page, '#page-tracker .card', ['backgroundColor', 'borderTopColor'])
  const h3 = await cs(page, '#page-tracker .card h3', ['color'])
  L.ok('S4 side panel: cards are Raptor\'s panel and edge, headings its accent', same(card, { backgroundColor: C.panel2, borderTopColor: C.line }) && h3.color === C.accent, JSON.stringify({ card, h3 }))
  const bar = await page.evaluate(() => { const b = document.querySelector('#page-tracker .bar'); const f = b && b.firstElementChild
    return b && { track: getComputedStyle(b).backgroundColor, fill: f && getComputedStyle(f).backgroundImage } })
  L.ok('S4 Overall: the progress bar runs Raptor\'s flight blue into its green, on its edge colour', !!bar && bar.track === C.line && bar.fill.includes(C.accent) && bar.fill.includes(C.ok), JSON.stringify(bar))
  const kb = await page.evaluate(() => { const on = [...document.querySelectorAll('#page-tracker .side svg path')].find(p => /rgba/.test(p.getAttribute('fill') || ''))
    const txt = [...document.querySelectorAll('#page-tracker .side svg text')].map(t => t.getAttribute('fill'))
    return { onFill: on && on.getAttribute('fill'), onStroke: on && on.getAttribute('stroke'), names: [...new Set(txt.filter(Boolean))] } })
  L.ok('S4 Students: the key ball\'s picked wedge is Raptor\'s "on" wash and accent edge, names in its ink / accent',
    kb.onFill === 'rgba(59,198,232,.16)' && kb.onStroke === '#3BC6E8' && kb.names.every(n => ['#3BC6E8', '#F1F4F7'].includes(n)), JSON.stringify(kb))
  const ft = await cs(page, '#page-tracker .failtot', ['backgroundColor', 'borderTopColor', 'color'])
  const fc = await cs(page, '#page-tracker .failchip', ['borderTopColor', 'color'])
  L.ok('S4 Failures: the count and each chip are Raptor\'s red tints, outlined not solid', same(ft, { backgroundColor: C.redWash, borderTopColor: C.redEdge, color: C.redInk }) && same(fc, { borderTopColor: C.redEdge, color: C.redInk }), JSON.stringify({ ft, fc }))
  const flex = await page.evaluate(() => [...document.querySelectorAll('#page-tracker .flexbar')].map(f => getComputedStyle(f).backgroundColor))
  L.ok('S4 Currency: its flex bars are drawn in Raptor\'s tones (or the Tracker\'s own grey)', flex.length > 0 && flex.every(c => [C.ok, C.adv, C.hard, 'rgb(90, 97, 114)'].includes(c)), JSON.stringify(flex))
  await shot(page, 'd06-side-panel', { el: '#page-tracker .side' })

  /* S14 the failure log pop-up */
  await page.locator('#page-tracker .failTitle').first().click(); await sleep(400)
  const fl = await cs(page, '#failLog', ['backgroundColor', 'borderTopColor'])
  L.ok('S14 failure log: Raptor\'s panel and edge', same(fl, { backgroundColor: C.panel2, borderTopColor: C.line }), JSON.stringify(fl))
  await shot(page, 'd07-failure-log')
  await page.keyboard.press('Escape'); await sleep(300)
  if (await page.locator('#failLog:visible').count()) { await page.locator('#failLog button', { hasText: '✕' }).first().click().catch(() => {}); await sleep(300) }

  /* S7 find: the predictions and the searched ball */
  await page.fill('#hSearch', ids[0].slice(0, 3)); await sleep(500)
  const fd = await page.evaluate(() => [...document.querySelectorAll('.findlist.on .fdot')].map(d => [d.className, getComputedStyle(d).backgroundColor]))
  const fdBad = fd.filter(([k, c]) => { const t = (k.match(/t-(\w+)/) || [])[1]; return t && c !== { flight: 'rgb(59, 198, 232)', acad: 'rgb(87, 201, 122)', test: 'rgb(240, 85, 95)', sim: 'rgb(229, 168, 59)', device: 'rgb(178, 77, 234)' }[t] })
  L.ok('S7 find list: each prediction\'s dot is its type\'s Raptor colour', fd.length > 0 && fdBad.length === 0, `${fd.length} dots; wrong ${JSON.stringify(fdBad)}`)
  await page.keyboard.press('ArrowDown'); await sleep(200)
  const fr = await cs(page, '.findlist.on .findrow.on', ['backgroundColor'])
  L.ok('S7 find list: the picked prediction wears Raptor\'s "on" wash', !!fr && fr.backgroundColor === C.on, JSON.stringify(fr))
  await shot(page, 'd08-find-list')
  await page.keyboard.press('Enter'); await sleep(500)
  const found = await page.evaluate(() => { const c = document.querySelector('#flowSvg circle.found'); return c && c.getAttribute('stroke') })
  L.ok('S7 find: the searched ball keeps its own turquoise ring, not the accent', found === '#00e5c8', String(found))
  await shot(page, 'd09-searched-ball')
  await page.fill('#hSearch', ''); await page.keyboard.press('Escape'); await sleep(300)

  /* S8 + S12 Details mode: the pressed button and the bubble */
  await page.click('#detailsBtn'); await sleep(250)
  const db = await cs(page, '#detailsBtn', ['backgroundColor', 'borderTopColor'])
  L.ok('S8 bar: a switched-on button is Raptor\'s "on" wash with its accent edge', same(db, { backgroundColor: C.on, borderTopColor: C.accent }), JSON.stringify(db))
  const dh = await page.evaluate(() => { const h = document.querySelector('.arrhint.on'), o = document.getElementById('detailsHintOff'); if (!h || !o) return null
    return { bg: getComputedStyle(h).backgroundColor, img: getComputedStyle(h).backgroundImage, ink: getComputedStyle(h).color, off: [getComputedStyle(o).backgroundColor, getComputedStyle(o).color] } })
  L.ok('S8 Details hint: the same washed bar, its Turn off button Raptor\'s accent with its dark ink',
    !!dh && dh.bg === C.panel && dh.img.includes('rgba(59, 198, 232, 0.16)') && dh.ink === C.ink && same(dh.off, [C.accent, C.accentInk]), JSON.stringify(dh))
  await reveal(page, ids[1]); await ball(page, ids[1]).click(); await sleep(450)
  const bub = await page.evaluate(() => { const b = document.getElementById('detailBubble'); if (!b || getComputedStyle(b).display === 'none') return null
    const s = getComputedStyle(b), id = b.querySelector('.dbId'), mk = b.querySelector('.mkrec')
    return { bg: s.backgroundColor, edge: s.borderTopColor, ink: s.color, id: id && getComputedStyle(id).color,
      rule: mk && [getComputedStyle(mk).borderTopStyle, getComputedStyle(mk).borderTopColor] } })
  L.ok('S12 details bubble: Raptor\'s panel, accent edge and ink; the student\'s record under a dashed divider in Raptor\'s edge colour',
    !!bub && same(bub, { bg: C.panel, edge: C.accent, ink: C.ink, id: C.accent, rule: ['dashed', C.line] }), JSON.stringify(bub))
  await shot(page, 'd10-details-bubble')
  await page.click('#detailsBtn'); await sleep(250)

  /* S6 Show All */
  await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
  const sa = await page.evaluate(() => ({
    panel: getComputedStyle(document.getElementById('showAllPanel')).backgroundColor,
    dots: [...new Set([...document.querySelectorAll('#saBody .sdot')].map(d => getComputedStyle(d).backgroundColor))],
    badges: [...document.querySelectorAll('#saBody .sst:not(.undone)')].map(b => [b.textContent.trim(), getComputedStyle(b).backgroundColor, getComputedStyle(b).color]) }))
  const typeRgb = [C.accent, C.ok, C.hard, C.adv, C.san]
  L.ok('S6 Show All: Raptor\'s panel, and every event\'s dot a Raptor type colour', sa.panel === C.panel && sa.dots.length > 0 && sa.dots.every(c => typeRgb.includes(c)), JSON.stringify({ panel: sa.panel, dots: sa.dots }))
  const badgeBad = sa.badges.filter(([t, bg, ink]) => !((/DCO/.test(t) && !/DPCO/.test(t) && bg === C.black && ink === C.white) || (/DPCO/.test(t) && bg === C.dpco && ink === C.bg) || (/Marg/i.test(t) && bg === C.ok && ink === C.bg) || (/N\.?A/.test(t) && bg === C.na && ink === C.bg)))
  L.ok('S6 Show All: each graded badge wears its grade\'s fill, dark text in Raptor\'s darkest', sa.badges.length >= 3 && badgeBad.length === 0, JSON.stringify(sa.badges))
  await shot(page, 'd11-show-all')
  await page.locator('#saBody .sedit').first().click(); await sleep(300)
  const ed = await cs(page, '#saBody .sarow.editing', ['backgroundColor', 'borderBottomColor'])
  L.ok('S6 Show All: the row being edited is a faint accent wash with an accent rule', same(ed, { backgroundColor: 'rgba(59, 198, 232, 0.05)', borderBottomColor: C.accent }), JSON.stringify(ed))
  await shot(page, 'd12-show-all-editing')
  await page.click('#saClose'); await sleep(300)

  /* S8 a bar menu open, and S9 the + Add dialog's main button */
  await page.click('#sylMenuBtn'); await sleep(300)
  const mb = await cs(page, '#sylMenuBtn', ['backgroundColor', 'borderTopColor'])
  const mp = await cs(page, '#page-tracker .menupanel.on', ['backgroundColor', 'borderTopColor'])
  L.ok('S8 menus: the open menu\'s button is switched on; its panel is Raptor\'s', same(mb, { backgroundColor: C.on, borderTopColor: C.accent }) && same(mp, { backgroundColor: C.panel2, borderTopColor: C.line }), JSON.stringify({ mb, mp }))
  await shot(page, 'd13-menu-open')
  await page.click('#sylMenuBtn'); await sleep(250)
  await page.locator('#addStu:visible').first().click(); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(250)
  const ok = await cs(page, '#dlgOk', ['backgroundColor', 'borderTopColor'])
  const dlgBox = await cs(page, '#dlgModal', ['backgroundColor'])
  L.ok('S9 dialogs: the main button is Raptor\'s "on" wash with its accent edge, on Raptor\'s panel', same(ok, { backgroundColor: C.on, borderTopColor: C.accent }) && dlgBox.backgroundColor === C.panel2, JSON.stringify({ ok, dlgBox }))
  await shot(page, 'd14-add-dialog')
  await page.locator('#dlgModal button', { hasText: /^Cancel/ }).first().click(); await sleep(250)

  /* S10 Edit chart layout */
  await arrangeOn(page)
  const adds = await page.evaluate(() => [...document.querySelectorAll('#arrTools button')].filter(b => /^\+ /.test(b.textContent.trim())).map(b => [b.textContent.trim(), getComputedStyle(b).borderLeftColor]))
  const addWant = { '+ Flight': C.accent, '+ Acad': C.ok, '+ Test': C.hard, '+ Sim': C.adv, '+ CFT/IAT/EPT': C.san }
  L.ok('S10 edit strip: each + event button carries its type\'s Raptor colour', Object.entries(addWant).every(([k, v]) => adds.some(([t, c]) => t === k && c === v)), JSON.stringify(adds))
  const hint = await page.evaluate(() => { const h = document.querySelector('.arrhint.on'); if (!h) return null; const s = getComputedStyle(h)
    return { bg: s.backgroundColor, img: s.backgroundImage, ink: s.color, edge: s.borderBottomColor } })
  L.ok('S10 hint bar: Raptor\'s "on" wash laid on its panel (opaque over the key), ink text, accent rule',
    !!hint && hint.bg === C.panel && hint.img.includes('rgba(59, 198, 232, 0.16)') && hint.ink === C.ink && hint.edge === C.accent, JSON.stringify(hint))
  const canvas = await cs(page, '#flowSvg.arrange', ['borderTopColor'])
  L.ok('S10 the editing canvas: its dashed edge is Raptor\'s edge colour', !!canvas && canvas.borderTopColor === C.line, JSON.stringify(canvas))
  await tool(page, '▣ Select')
  const tb = await page.evaluate(() => { const b = [...document.querySelectorAll('#arrTools button')].find(x => x.textContent.includes('▣ Select')); return b && [b.className, getComputedStyle(b).backgroundColor] })
  L.ok('S10 edit strip: the chosen tool is switched on in Raptor\'s wash', !!tb && /primary/.test(tb[0]) && tb[1] === C.on, JSON.stringify(tb))
  await shot(page, 'd15-edit-layout')
  /* a drag-select band (read while the finger is still down) */
  const grab = await page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect()
    for (let fy = 0.15; fy < 0.9; fy += 0.07) for (let fx = 0.55; fx < 0.95; fx += 0.05) { const x = b.left + b.width * fx, y = b.top + b.height * fy
      const el = document.elementFromPoint(x, y); if (el && !el.closest('.ball') && (el.id === 'flowSvg' || el.closest('#flowSvg'))) return { x, y } } return null })
  let band = null
  if (grab) {
    await page.mouse.move(grab.x, grab.y); await page.mouse.down()
    for (let k = 1; k <= 5; k++) await page.mouse.move(grab.x - 30 * k, grab.y + 12 * k)
    band = await page.evaluate(() => { const r = document.querySelector('#bandLayer rect'); return r && [r.getAttribute('fill'), r.getAttribute('stroke')] })
    await page.mouse.up(); await sleep(250)
  }
  L.ok('S10 a drag-select band is Raptor\'s accent, washed', same(band, ['rgba(59,198,232,.12)', '#3BC6E8']), JSON.stringify(band))
  /* the band picks the ball(s) it covered: each wears the dashed ring. Read off
     whichever balls are picked — the hint line above the chart says how many. */
  const picked = await page.evaluate(() => ({ said: (document.querySelector('.arrhint.on') || {}).textContent || '',
    rings: [...document.querySelectorAll('#flowSvg .ball circle')].filter(x => x.getAttribute('stroke-dasharray') === '3 2').map(x => x.getAttribute('stroke')) }))
  L.ok('S10 a ball picked by the band wears Raptor\'s accent dashed ring', picked.rings.length > 0 && picked.rings.every(s => s === '#3BC6E8'), JSON.stringify(picked))
  await shot(page, 'd15b-band-picked')
  /* a new ball is a STRUCTURE edit — the chart goes unsaved (a moved ball saves itself) */
  await tool(page, '✋ Move')
  await addBall(page, '+ Acad', 'PAL-1'); await sleep(400)
  const dirty = await cs(page, '#saveChanges.dirty', ['backgroundColor', 'borderTopColor'])
  L.ok('S10 an unsaved chart: Save changes is Raptor\'s amber, washed', same(dirty, { backgroundColor: 'rgba(229, 168, 59, 0.16)', borderTopColor: C.adv }), JSON.stringify(dirty))
  await shot(page, 'd16-unsaved-chart')
  /* connect: the first ball picked wears the accent ring */
  await tool(page, '→ Connect')
  await reveal(page, ids[2]); const cb = await ball(page, ids[2]).boundingBox()
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(350)
  const conn = await page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
    const c = g && [...g.querySelectorAll('circle')].find(x => x.getAttribute('stroke-width') === '3'); return c && c.getAttribute('stroke') }, ids[2])
  L.ok('S10 connect: the prerequisite picked first wears Raptor\'s accent ring', conn === '#3BC6E8', String(conn))
  const ports = await page.evaluate(() => [...new Set([...document.querySelectorAll('#flowSvg .port')].map(p => p.getAttribute('fill')))])
  L.note('S10 connection ports while connecting', ports.length ? ports.join(',') : '(none drawn in this tool)')
  await shot(page, 'd17-connect-picked')
  await page.keyboard.press('Escape'); await sleep(250)
  /* a line being drawn */
  await tool(page, '╱ Line')
  const prev = await page.evaluate(() => { const p = document.getElementById('drawPrev'), s = document.getElementById('drawStart'); return [p && p.getAttribute('stroke'), s && s.getAttribute('fill')] })
  L.ok('S10 draw a line: the line being drawn and its start are Raptor\'s accent', same(prev, ['#3BC6E8', '#3BC6E8']), JSON.stringify(prev))
  await tool(page, '❐ Edit lines')
  const ports2 = await page.evaluate(() => [...new Set([...document.querySelectorAll('#flowSvg .port')].map(p => p.getAttribute('fill')))])
  L.ok('S10 edit lines: every snap point is Raptor\'s accent', ports2.length > 0 && same(ports2, ['#3BC6E8']), JSON.stringify(ports2))
  await shot(page, 'd18-snap-points')
  /* the event editor (✎ Text, then a ball) */
  await tool(page, '✎ Text')
  await reveal(page, ids[3]); const tbx = await ball(page, ids[3]).boundingBox()
  await page.mouse.click(tbx.x + tbx.width / 2, tbx.y + tbx.height / 2); await sleep(400)
  const edm = await page.evaluate(() => { const d = document.getElementById('edDelete'), s = document.getElementById('edSave'), m = document.getElementById('editModal')
    return m && { del: [getComputedStyle(d).borderTopColor, getComputedStyle(d).color], save: getComputedStyle(s).backgroundColor, box: getComputedStyle(m).backgroundColor } })
  L.ok('S9 event editor: Delete ball in Raptor\'s red and light red, Save switched on, on Raptor\'s panel', !!edm && same(edm.del, [C.hard, C.redInk]) && edm.save === C.on && edm.box === C.panel2, JSON.stringify(edm))
  const opts = await page.evaluate(() => [...document.querySelectorAll('#editModal select option')].map(o => o.textContent.trim()))
  L.ok('S9 event editor: the Colour / type list names each type by the colour now drawn (a sim is amber)',
    ['Flight (blue)', 'Acad / Spec (green)', 'Test (red)', 'Sim (amber)', 'CFT/IAT/EPT (purple)'].every(t => opts.includes(t)), JSON.stringify(opts))
  await shot(page, 'd19-event-editor')
  await page.click('#edCancel'); await sleep(250)
  const drawn1 = await chartColours(page)
  L.ok('S10 in Edit chart layout, no retired Tracker colour is drawn either', !drawn1.some(c => OLD.includes(c)), drawn1.join(' '))
  await arrangeOff(page)
  /* leaving with the new ball unsaved: the save slot's words say so, in amber */
  const stat = await page.evaluate(() => { const s = document.querySelector('.savestat'); return s && [s.className, s.textContent.trim(), getComputedStyle(s).color] })
  L.ok('S10 leaving Edit chart layout unsaved: the save slot\'s words are Raptor\'s amber', !!stat && /saving/.test(stat[0]) && stat[2] === C.adv, JSON.stringify(stat))
  await shot(page, 'd20-unsaved-words')

  L.ok('desktop: no console error, failed request or page error', errors.length === 0, errors.join(' | ') || 'none')
  await browser.close()
}

/* ======================= PHONE, admin, by finger ======================= */
{
  const { browser, page, errors } = await open({ size: P, who: 'a', touch: true })
  const root = await cs(page, '#page-tracker .tr-root', ['backgroundColor', 'color'])
  L.ok('phone S1: background and text are Raptor\'s', same(root, { backgroundColor: C.bg, color: C.ink }), JSON.stringify(root))
  const vt = await page.evaluate(() => [...document.querySelectorAll('#page-tracker .viewtabs button')].map(b => [b.textContent.trim(), b.className, getComputedStyle(b).backgroundColor]))
  const act = vt.find(v => /active/.test(v[1]))
  L.ok('phone S11: the chosen view tab is switched on in Raptor\'s wash', !!act && act[2] === C.on && vt.filter(v => !/active/.test(v[1])).every(v => v[2] === C.panel2), JSON.stringify(vt))
  const sf = await shapeFills(page)
  L.ok('phone S2: the chart\'s five types are Raptor\'s colours', same(sf.sim, [TYPE.sim.toLowerCase()]) && same(sf.device, [TYPE.device.toLowerCase()]) && same(sf.flight, [TYPE.flight.toLowerCase()]), JSON.stringify(sf))
  await page.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = 950 }); await sleep(400)
  await shot(page, 'p01-chart-all-types')
  await page.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = 0 }); await sleep(300)
  await shot(page, 'p02-chart-top')
  const sb = await page.locator('#hSearchBtn').boundingBox()
  await page.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(350)
  const fpn = await cs(page, '.findpanel.on', ['backgroundColor', 'borderTopColor'])
  L.ok('phone S7: the find strip is Raptor\'s panel and edge', same(fpn, { backgroundColor: C.panel, borderTopColor: C.line }), JSON.stringify(fpn))
  await page.fill('#hSearch', 'ST'); await sleep(450)
  await shot(page, 'p03-find')
  await page.fill('#hSearch', ''); await page.keyboard.press('Escape'); await sleep(300)
  const info = page.locator('#page-tracker .viewtabs button', { hasText: /Info|Panel|Stats/i }).first()
  const ib = await info.boundingBox(); await page.touchscreen.tap(ib.x + ib.width / 2, ib.y + ib.height / 2); await sleep(500)
  await shot(page, 'p04-info-panel')
  const card = await cs(page, '#page-tracker .card', ['backgroundColor'])
  L.ok('phone S4: the Info half\'s cards are Raptor\'s panel', !!card && card.backgroundColor === C.panel2, JSON.stringify(card))
  L.ok('phone: no console error, failed request or page error', errors.length === 0, errors.join(' | ') || 'none')
  await browser.close()
}

/* ======= the 24 Sep 26 framings, so the built chart sits beside A and C ======= */
{
  const CHROMIUM = '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const shots = {}
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await page.goto(BASE + '/?fresh=1')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 })
    await page.evaluate(() => window.setPage('tracker'))
    await page.waitForSelector('#page-tracker svg', { timeout: 15000 })
    await page.waitForTimeout(1200)
    await page.evaluate(() => { const b = document.querySelector('#page-tracker .board'); if (b) b.scrollTop = 950 })
    await page.waitForTimeout(500)
    const file = resolve(SHOTS, `built-chart-${w}.png`)
    await page.screenshot({ path: file, clip: w > 800 ? { x: 0, y: 70, width: 1000, height: 640 } : { x: 0, y: 0, width: w, height: h } })
    shots[w] = file
    await ctx.close()
  }
  const AB = process.env.PALETTE_AB
  if (AB && existsSync(resolve(AB, 'chart-1440-A.png'))) {
    for (const [w, colW, name] of [[1440, 1000, 'compare-desktop'], [390, 390, 'compare-phone']]) {
      const files = [resolve(AB, `chart-${w}-A.png`), resolve(AB, `chart-${w}-C.png`), shots[w]]
      const labels = ['Before — the Tracker\'s own colours', 'C — the picture chosen on 24 Sep 26', 'Built — this branch']
      const ctx = await browser.newContext({ viewport: { width: colW > 800 ? colW + 48 : colW * 3 + 24 * 4, height: 400 } })
      const page = await ctx.newPage()
      const cells = files.map((f, i) => `<figure><figcaption>${labels[i]}</figcaption><img src="data:image/png;base64,${readFileSync(f).toString('base64')}"></figure>`).join('')
      await page.setContent(`<html><body style="margin:0;background:#FFFFFF;font:600 20px system-ui;${colW > 800 ? 'display:flex;flex-direction:column' : 'display:flex'};gap:24px;padding:24px">
        <style>figure{margin:0;width:${colW}px}img{width:${colW}px;border:1px solid #999}figcaption{margin:0 0 10px;color:#111}</style>${cells}</body></html>`)
      await page.screenshot({ path: resolve(SHOTS, `${name}.png`), fullPage: true })
      await ctx.close()
    }
    L.note('comparison pictures', 'compare-desktop.png, compare-phone.png (before / C / built)')
  } else L.note('comparison pictures', 'PALETTE_AB not given — built-chart-1440.png and built-chart-390.png only')
  await browser.close()
}

save('trk-palette-walk', L.rows)
const fails = L.rows.filter(r => r.pass === false)
console.log(`\n${L.rows.filter(r => r.pass).length} PASS, ${fails.length} FAIL`)
process.exit(fails.length ? 1 : 0)
