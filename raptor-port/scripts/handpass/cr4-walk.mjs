/* [UI-CONSISTENCY-LOOK] round 4 — THE WALK of the build (D1702–D1707; the bug-check order, WALK tier). Every restyled
   control is MEASURED (its box, its drawn mark's box and colour, the button's colour) and PRESSED, and what it opens is
   checked on screen; the Inputs and SANS rows are measured at seven desktop widths and two phone widths. The same script
   run on the build before the change (CR4W_TAG=before) measures only, so the two measure files are compared by
   cr4-compare.mjs: a button's height must not change, and a gear keeps its button's size (D1707, D487).
   Run (from raptor-port/):
     HP_URL=http://localhost:<port> HP_SHOTS=<folder> CR4W_TAG=after|before [CR4W_ENGINE=chromium|webkit] [CR4W_ONLY=a,b]
       node scripts/handpass/cr4-walk.mjs
   Writes <folder>/<tag>-<engine>-measures.json and <folder>/<tag>-<engine>-results.json; pictures <folder>/<tag>-*.png
   (twice the pixels, cut to the control and its neighbours). Every step that expects something says PASS or FAIL. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium, webkit } from '@playwright/test'
const { BASE, SHOTS, login, go, board } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const TAG = process.env.CR4W_TAG || 'after'
const ENGINE = process.env.CR4W_ENGINE || 'chromium'
const ONLY = (process.env.CR4W_ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const AFTER = TAG === 'after'
mkdirSync(SHOTS, { recursive: true })
const engine = ENGINE === 'webkit' ? webkit : chromium
const browser = await engine.launch({ headless: true, ...(ENGINE === 'chromium' && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const measures = {}, results = [], errors = []
const res = (id, pass, note = '') => { results.push({ id, pass: pass === null ? 'RECORDED' : pass ? 'PASS' : 'FAIL', note }); console.log((pass === null ? 'REC ' : pass ? 'PASS' : 'FAIL') + ' ' + id + (note ? ' — ' + note : '')) }
const tryStep = async (id, fn) => { try { await fn() } catch (e) { res(id, false, 'step broke: ' + e.message.split('\n')[0]) } }

async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: ENGINE === 'chromium', hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${vp.width}: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${vp.width} console: ${m.text()}`) })
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '.toast,.snack{display:none!important} *{scroll-behavior:auto!important}' })
  return { ctx, page }
}
/* a control's measure: its box, its drawn mark (or typed mark) and the colours */
const measure = (page, sel, nth = 0) => page.evaluate(([sel, nth]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  const e = els[nth]; if (!e) return null
  const r = e.getBoundingClientRect(), s = getComputedStyle(e)
  const v = e.querySelector('svg'), vr = v && v.getBoundingClientRect()
  return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, x: Math.round(r.left), y: Math.round(r.top), color: s.color,
    text: e.textContent.replace(/\s+/g, ' ').trim(), mark: v ? { w: Math.round(vr.width * 10) / 10, h: Math.round(vr.height * 10) / 10, color: getComputedStyle(v).color,
      dx: Math.round((vr.left - r.left) * 10) / 10, dy: Math.round((vr.top + vr.height / 2 - (r.top + r.height / 2)) * 10) / 10 } : null }
}, [sel, nth])
async function keep(page, key, sel, nth = 0) { const m = await measure(page, sel, nth); measures[key] = m; return m }
/* a picture cut to the control and what is beside it */
async function pic(page, name, sel, { pad = 30, padX = 120 } = {}) {
  const b = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r0 = e.getBoundingClientRect(); if (r0.top < 0 || r0.bottom > innerHeight) e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
  if (!b) return
  const vp = page.viewportSize()
  const x = Math.max(0, b.x - padX), y = Math.max(0, b.y - pad)
  await page.screenshot({ path: `${SHOTS}/${TAG}-${name}.png`, clip: { x, y, width: Math.min(vp.width - x, b.w + padX * 2), height: Math.min(vp.height - y, b.h + pad * 2) } })
}
const visible = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }), sel)
const press = async (page, sel, touch) => { const l = page.locator(sel).filter({ visible: true }).first(); try { if (touch) await l.tap({ timeout: 8000 }); else await l.click({ timeout: 8000 }) } catch (e) { throw new Error('could not press ' + sel + ': ' + e.message.split('\n')[0]) } await sleep(450) }
/* the drawn mark is a mark in the button's own colour (D1707 — the Leave War's gear keeps .btnglyph's grey) */
const drawnInColour = (m, grey = false) => !!m && !!m.mark && (grey ? m.mark.color === 'rgb(182, 192, 203)' : m.mark.color === m.color)
const noTyped = (m, re) => !!m && !re.test(m.text)

/* ================= desktop and phone: each surface in turn ================= */
async function pass(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const K = k => `${tag}-${k}`

  if (want('inputs')) await tryStep(K('inputs-gear'), async () => {
    await go(page, 'inputs'); await sleep(600)
    const m = await keep(page, K('inputs-gear'), '#inGear'); await pic(page, K('inputs-gear'), '#inGear')
    if (AFTER) res(K('inputs-gear drawn, white, no ⚙'), drawnInColour(m) && noTyped(m, /⚙/) && m.mark.w === 18, JSON.stringify(m.mark))
    await press(page, '#inGear', touch)
    if (AFTER) res(K('inputs-gear opens the Inputs calendar settings'), await visible(page, '[data-testid="win-inputsset"]'))
    await page.keyboard.press('Escape'); await sleep(300)
    if (await visible(page, '[data-testid="win-inputsset"]')) await press(page, '[data-testid="iset-cancel"]', touch)
    if (AFTER) res(K('inputs settings closes'), !(await visible(page, '[data-testid="win-inputsset"]')))
    await press(page, '#inListBtn', touch)
    const ml = await keep(page, K('inputs-list-gear'), '#inGear'); await pic(page, K('inputs-list-gear'), '#inGear')
    if (AFTER) res(K('the List keeps the same gear in the same place'), !!ml && ml.x === m.x && drawnInColour(ml), `calendar x ${m.x}, list x ${ml && ml.x}`)
    await press(page, '#inCalBtn', touch)
  })
  if (want('inputs') && touch) await tryStep(K('inputs-phone-filters'), async () => {
    /* D693, D1702: on a phone the group is not drawn — the Filters button opens the fields under the whole row, the gear stays */
    const g0 = await measure(page, '#inGear'), f0 = await measure(page, '#inFiltersBtn')
    await press(page, '#inFiltersBtn', touch)
    const g1 = await measure(page, '#inGear'), f1 = await measure(page, '#inFiltersBtn')
    await pic(page, K('inputs-phone-filters-open'), '.inputs-top', { pad: 10, padX: 10 })
    measures[K('inputs-phone-filters')] = { g0, g1, f0, f1 }
    res(K('phone: Filters opens the fields and neither the gear nor Filters moves (D693)'), g0.x === g1.x && g0.y === g1.y && f0.x === f1.x && f0.y === f1.y && await visible(page, '#inFilters'), `gear ${g0.x},${g0.y} → ${g1.x},${g1.y}`)
    await press(page, '#inFiltersBtn', touch)
  })
  if (want('sans')) await tryStep(K('sans-gear'), async () => {
    await go(page, 'inputs'); await sleep(400)
    await press(page, '#inSansMode', touch); await sleep(500)
    const m = await keep(page, K('sans-gear'), '.sc-gear'); await pic(page, K('sans-gear'), '.sc-gear')
    if (AFTER) res(K('SANS gear drawn, white, no ⚙'), drawnInColour(m) && noTyped(m, /⚙/) && m.mark.w === 18, JSON.stringify(m.mark))
    await press(page, '.sc-gear', touch)
    if (AFTER) res(K('SANS gear opens the SANS settings'), await visible(page, '[data-testid="win-sansset"]'))
    await page.keyboard.press('Escape'); await sleep(300)
    await press(page, '#inCalBtn', touch).catch(() => {})
  })
  if (want('lw')) await tryStep(K('leavewar'), async () => {
    await go(page, 'leavewar'); await sleep(900)
    const g = await keep(page, K('lw-gear'), '.lw-gear'); await pic(page, K('lw-gear'), '.lw-gear')
    if (AFTER) res(K('the Leave War gear: the same drawing, grey as today (D1707)'), drawnInColour(g, true), JSON.stringify(g && g.mark))
    const t = await keep(page, K('lw-oiltab'), '[data-testid="oil-tracker"]'); await pic(page, K('lw-oiltab'), '[data-testid="oil-tracker"]', { padX: 200 })
    if (AFTER) res(K('the OIL tab wears the ticket in its colour'), !!t && !!t.mark && t.mark.color === t.color, JSON.stringify(t && t.mark))
    await press(page, '[data-testid="oil-tracker"]', touch); await sleep(500)
    if (AFTER) res(K('the OIL tab opens the OIL tracker'), await visible(page, '[data-testid="oil-sheet"]'))
    const og = await keep(page, K('oil-gear'), '[data-testid="oil-settings"]'); await pic(page, K('oil-gear'), '[data-testid="oil-settings"]', { padX: 80 })
    const rg = await keep(page, K('oil-range'), '[data-testid="oil-range-pick"]'); await pic(page, K('oil-range'), '[data-testid="oil-range-pick"]', { padX: 80 })
    if (AFTER) res(K('OIL tracker gear drawn in its colour, no ⚙'), drawnInColour(og) && noTyped(og, /⚙/) && og.mark.w === 16, JSON.stringify(og && og.mark))
    if (AFTER) res(K('Range: the line calendar in its colour, no 📅'), drawnInColour(rg) && noTyped(rg, /📅/u) && rg.text === 'Range', JSON.stringify(rg && rg.mark))
    await press(page, '[data-testid="oil-range-pick"]', touch)
    if (AFTER) res(K('Range opens the date picker'), await visible(page, '.oil-pickrow'))
    await press(page, '[data-testid="oil-settings"]', touch)
    if (AFTER) res(K('the OIL gear opens the OIL tracker settings'), await visible(page, '[data-testid="oil-settings-done"]'))
    await press(page, '[data-testid="oil-settings-done"]', touch).catch(() => {})
    await page.keyboard.press('Escape'); await sleep(400)
    if (await visible(page, '[data-testid="oil-sheet"]')) { await page.keyboard.press('Escape'); await sleep(300) }
    if (AFTER) res(K('the OIL tracker closes, the grid back'), !(await visible(page, '[data-testid="oil-sheet"]')))
  })
  if (want('lwset')) await tryStep(K('lw-settings'), async () => {
    await go(page, 'leavewar'); await sleep(600)
    await press(page, '.lw-gear', touch); await sleep(400)
    await page.locator('[data-testid=settings-rearrange]').scrollIntoViewIfNeeded(); await sleep(250)
    const r = await keep(page, K('lw-rearrange'), '[data-testid=settings-rearrange]'), o = await keep(page, K('lw-resetorder'), '[data-testid=roster-reset-order]')
    await pic(page, K('lw-order-row'), '[data-testid=settings-rearrange]', { padX: 140 })
    if (AFTER) res(K('Rearrange the grid: the Reorder mark, no ⇅'), drawnInColour(r) && noTyped(r, /⇅/) && r.mark.w === 14, JSON.stringify(r && r.mark))
    if (AFTER) res(K('Reset order: the arrow turning back, no ↺'), !!o && !!o.mark && o.mark.color === o.color && noTyped(o, /↺/), JSON.stringify(o && o.mark))
    await press(page, '[data-testid=settings-rearrange]', touch); await sleep(500)
    const d = await keep(page, K('lw-done'), '[data-testid=roster-arrange]'); await pic(page, K('lw-done'), '[data-testid=roster-arrange]', { padX: 160 })
    if (AFTER) res(K('Rearrange turns arranging on; Done wears the Reorder mark'), drawnInColour(d) && d.text === 'Done', JSON.stringify(d && d.mark))
    await press(page, '[data-testid=roster-arrange]', touch)
    if (AFTER) res(K('Done ends arranging'), !(await visible(page, '[data-testid=roster-arrange]')))
    /* a hand order makes Reset order live: drag nothing — the arm and its question are words only */
  })
  if (want('lwmenu')) await tryStep(K('lw-more-menu'), async () => {
    await go(page, 'leavewar'); await sleep(700)
    const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await sleep(800) }
    await page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-07-20"]')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.top > 0 && r.bottom < innerHeight }); if (!c) throw new Error('no cell in view'); c.classList.add('zz-cell') })
    await press(page, '.zz-cell', touch); await sleep(600)
    await press(page, '[data-testid=bid-more]', touch); await sleep(300)
    const items = await page.evaluate(() => [...document.querySelectorAll('[data-testid=bid-more-menu] button')].map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return { t: b.textContent.trim(), h: Math.round(r.height), w: Math.round(r.width), bg: s.backgroundColor, border: s.borderTopWidth, size: s.fontSize, weight: s.fontWeight } }))
    const panel = await measure(page, '[data-testid=bid-more-menu]')
    measures[K('lw-menu')] = { panel, items }
    await pic(page, K('lw-menu'), '[data-testid=bid-more-menu]', { pad: 60, padX: 60 })
    if (AFTER) res(K('the ⋯ menu: plain rows 38 tall, 13px 500, no box (D1706)'), items.length > 0 && items.every(i => i.h === 38 && i.border === '0px' && i.size === '13px' && i.weight === '500' && (i.bg === 'rgba(0, 0, 0, 0)' || /70, 196, 108/.test(i.bg))), JSON.stringify(items))
    await page.keyboard.press('Escape'); await sleep(300)
    if (AFTER) res(K('Escape closes the ⋯ menu, the window stays'), !(await visible(page, '[data-testid=bid-more-menu]')) && await visible(page, '[data-testid=bid-more]'))
    /* the plain-user round: file Attach from the menu, see it, take it back with the one Undo */
    await press(page, '[data-testid=bid-more]', touch); await sleep(250)
    await press(page, '[data-testid=bid-file-ATCH]', touch); await sleep(700)
    const filed = await page.evaluate(() => document.body.innerText.includes('ATCH'))
    await pic(page, K('lw-after-attach'), '.zz-cell', { pad: 80, padX: 200 }).catch(() => {})
    if (AFTER) res(K('Attach from the menu files it (ATCH on the grid or the day)'), filed)
    if (await visible(page, '[data-testid=bid-cancel]')) await press(page, '[data-testid=bid-cancel]', touch)
    await page.keyboard.press('Escape'); await sleep(300)
    await page.locator('#undoBtn').filter({ visible: true }).first().click({ timeout: 3000 }).catch(() => {}); await sleep(600)
    res(K('the one Undo takes the Attach back'), null, 'ATCH on the page after Undo: ' + await page.evaluate(() => document.body.innerText.includes('ATCH')))
  })
  if (want('board')) await tryStep(K('board'), async () => {
    await board(page, 0); await sleep(500)
    if (!touch) {
      const t = await keep(page, K('board-templates'), '#sbTpl'), s = await keep(page, K('board-sortall'), '#sbSortAll'), h = await keep(page, K('board-history'), '#sbHist')
      await pic(page, K('board-bar'), '#sbSortAll', { padX: 260 })
      if (AFTER) res(K('Templates: page of blocks, 14, its colour; no ▤'), drawnInColour(t) && noTyped(t, /▤/) && t.mark.w === 14, JSON.stringify(t && t.mark))
      if (AFTER) res(K('Sort all: Reorder mark, 14, its colour; no ⇅'), drawnInColour(s) && noTyped(s, /⇅/) && s.mark.w === 14, JSON.stringify(s && s.mark))
      res(K('the bar\'s heights: Templates / Sort all / History'), null, `${t.h} / ${s.h} / ${h && h.h}`)
      await press(page, '#sbSortAll', touch)
      if (AFTER) res(K('Sort all opens its question'), await visible(page, '#sortAllPop'))
      await press(page, '#sortAllCancel', touch)
      if (AFTER) res(K('its Cancel closes it'), !(await visible(page, '#sortAllPop')))
      await press(page, '#sbTpl', touch)
      if (AFTER) res(K('Templates opens the day templates menu'), await page.evaluate(() => /day templates/i.test(document.body.innerText)))
      await page.keyboard.press('Escape'); await sleep(300)
      const a = await keep(page, K('board-autosort'), '#schedBoard [data-sortsec]'); const it = await keep(page, K('board-additem'), '#schedBoard [data-sortsec] + .mbtn, #schedBoard [data-sortsec] ~ .mbtn')
      await pic(page, K('board-autosort'), '#schedBoard [data-sortsec]', { padX: 160 })
      if (AFTER) res(K('Auto sort: Reorder mark 13, its colour; no ⇅'), drawnInColour(a) && noTyped(a, /⇅/) && a.mark.w === 13, JSON.stringify(a && a.mark))
      measures[K('autosort-vs-neighbour')] = { autosort: a && a.h, neighbour: it && it.h }
      await press(page, '#schedBoard [data-sortsec]', touch)
      res(K('Auto sort presses with no page error'), errors.filter(e => e.startsWith(String(vp.width))).length === 0, errors.join(' | '))
      await press(page, '#schedBoard [data-wvadd]', touch); await sleep(300)
      const g = await keep(page, K('board-wavegear'), '.wm-mng'); await pic(page, K('board-wavegear'), '.wm-mng', { pad: 40, padX: 160 })
      if (AFTER) res(K('the waves menu gear: drawn 14, its colour; no ⚙'), drawnInColour(g) && noTyped(g, /⚙/) && g.mark.w === 14, JSON.stringify(g && g.mark))
      await press(page, '.wm-mng', touch); await sleep(300)
      if (AFTER) res(K('the waves gear opens Flying waves'), await visible(page, '#waveTplModal .modal-head'))
      await press(page, '#waveTplClose', touch).catch(() => {})
      await board(page, 5); await sleep(500)
      const o = await keep(page, K('board-oilearn'), '#sbOil'); await pic(page, K('board-oilearn'), '#sbOil', { padX: 300 })
      if (AFTER) res(K('OIL Earn: the ticket, 14, its colour; no ◧; History still its clock'), drawnInColour(o) && noTyped(o, /◧/) && o.mark.w === 14, JSON.stringify(o && o.mark))
      await press(page, '#sbOil', touch)
      const on = await page.evaluate(() => document.querySelector('#sbOil')?.classList.contains('on'))
      const oo = await keep(page, K('board-oilearn-on'), '#sbOil'); await pic(page, K('board-oilearn-on'), '#sbOil', { padX: 300 })
      if (AFTER) res(K('OIL Earn turns the mode on, lit, its ticket in the lit colour'), !!on && drawnInColour(oo), JSON.stringify(oo && oo.mark))
      await press(page, '#sbOil', touch)
    } else {
      await press(page, '#sbMore', touch); await sleep(300)
      const items = await page.evaluate(() => [...document.querySelectorAll('#sbMoreMenu .sb-moreitem')].map(b => { const r = b.getBoundingClientRect(), v = b.querySelector('svg'), vr = v && v.getBoundingClientRect(), bi = b.querySelector('.bi'), br = bi && bi.getBoundingClientRect(); return { t: b.textContent.trim(), h: Math.round(r.height), mark: v ? { w: Math.round(vr.width), color: getComputedStyle(v).color, centred: Math.abs((vr.left + vr.width / 2) - (br.left + br.width / 2)) < 1 } : null, color: getComputedStyle(b).color } }))
      measures[K('board-more')] = items
      await pic(page, K('board-more'), '#sbMoreMenu', { pad: 50, padX: 40 })
      // the moment after a press (D1281): a picture within ~100 ms of the tap on the layout switch is taken below
      if (AFTER) res(K('the ⋯ menu: Sort all and the layout switch drawn, 15, centred, row colour'), items.filter(i => i.mark).length >= 2 && items.filter(i => i.mark).every(i => i.mark.w === 15 && i.mark.centred && i.mark.color === i.color) && !items.some(i => /[⇅📱🖥]/u.test(i.t)), JSON.stringify(items))
      const before = await page.evaluate(() => document.querySelector('#sbMoreWide')?.textContent.trim())
      await page.locator('#sbMoreWide').tap(); await sleep(100)
      await page.screenshot({ path: `${SHOTS}/${TAG}-${K('board-wide-justtapped')}.png` })
      await sleep(600)
      await press(page, '#sbMore', touch); await sleep(250)
      const after = await page.evaluate(() => document.querySelector('#sbMoreWide')?.textContent.trim())
      const mk = await keep(page, K('board-more-wide-after'), '#sbMoreWide')
      await pic(page, K('board-more-after-switch'), '#sbMoreMenu', { pad: 50, padX: 40 })
      if (AFTER) res(K('the layout switch switches, and its mark follows (screen ↔ phone)'), before !== after && !!mk && !!mk.mark, `${before} → ${after}`)
      await press(page, '#sbMoreWide', touch); await sleep(500)
    }
    await page.keyboard.press('Escape'); await sleep(300)
  })
  if (want('tracker')) await tryStep(K('tracker'), async () => {
    if (await page.locator('#schedBoard').count()) { await page.keyboard.press('Escape'); await sleep(300) }
    await go(page, 'tracker'); await sleep(1000)
    const f = await keep(page, K('trk-flex'), '#flexBtn'), info = await keep(page, K('trk-info'), '#detailsBtn')
    await pic(page, K('trk-flex'), '#flexBtn', { padX: 200 })
    if (AFTER) res(K('the Tracker gear: drawn 16, its colour, no ⚙, as tall as ⓘ beside it'), drawnInColour(f) && noTyped(f, /⚙/) && f.mark.w === 16 && !!info && f.h === info.h, `${JSON.stringify(f && f.mark)} h ${f && f.h} / ⓘ ${info && info.h}`)
    await press(page, '#flexBtn', touch)
    if (AFTER) res(K('the gear opens Flex settings'), await visible(page, '#trkFlexWin'))
    await page.keyboard.press('Escape'); await sleep(300)
    if (AFTER) res(K('Escape closes Flex settings'), !(await visible(page, '#trkFlexWin')))
    for (const [btn, panel] of [['#fileMenuBtn', '#fileMenuPanel'], ['#courseMenuBtn', '#courseMenuPanel'], ['#sylMenuBtn', '#sylMenuPanel']]) {
      await press(page, btn, touch); await sleep(250)
      const rows = await page.evaluate(p => [...document.querySelectorAll(p + ' > button')].filter(b => b.getBoundingClientRect().width).map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return { t: b.textContent.trim(), h: Math.round(r.height), bg: s.backgroundColor, border: s.borderTopWidth, size: s.fontSize } }), panel)
      measures[K('trk-menu' + panel)] = rows
      await pic(page, K('trk-menu-' + panel.slice(1)), panel, { pad: 30, padX: 30 })
      if (AFTER) res(K(`the ${btn} menu: plain rows 38 tall, 13px, no box (D1706)`), rows.length > 0 && rows.every(r => r.h >= 38 && r.border === '0px' && r.size === '13px' && r.bg === 'rgba(0, 0, 0, 0)'), JSON.stringify(rows))
      await page.keyboard.press('Escape'); await sleep(200)
      if (await visible(page, panel)) await press(page, btn, touch)
    }
    /* a row is pressed: Reorder courses opens its window */
    await press(page, '#courseMenuBtn', touch); await press(page, '#ordCourse', touch); await sleep(300)
    if (AFTER) res(K('a menu row works: Reorder courses opens its window'), await visible(page, '#ordModal[data-ord="course"]'))
    if (await visible(page, '#ordOverlay')) await page.mouse.click(5, page.viewportSize().height - 5); await sleep(300)
    if (await visible(page, '#ordModal')) { await page.keyboard.press('Escape'); await sleep(300) }
    if (AFTER) res(K('the reorder window closes'), !(await visible(page, '#ordModal')))
    /* Edit chart layout's tools */
    await press(page, '#sylMenuBtn', touch); await press(page, '#arrangeBtn', touch); await sleep(800)
    if (touch && await visible(page, '#foldTools')) {
      const ft = await keep(page, K('trk-foldtool'), '#foldTool'), ff = await keep(page, K('trk-foldfit'), '#foldFit')
      await pic(page, K('trk-fold'), '#arrFold', { pad: 10, padX: 0 })
      if (AFTER) res(K('the folded row: the tool in use and Fit wear their marks'), !!ft && !!ft.mark && !!ff && !!ff.mark, `${ft && ft.text} / ${ff && ff.text}`)
      await press(page, '#foldTools', touch); await sleep(400)
    }
    const tools = await page.evaluate(() => [...document.querySelectorAll('#arrTools > button')].filter(b => b.getBoundingClientRect().width).map(b => { const r = b.getBoundingClientRect(), v = b.querySelector('svg'); return { t: b.textContent.trim(), h: Math.round(r.height), mark: v ? Math.round(v.getBoundingClientRect().width) : 0 } }))
    measures[K('trk-tools')] = tools
    await pic(page, K('trk-tools'), '#arrTools', { pad: 6, padX: 0 })
    if (AFTER) res(K('every chart tool drawn 13 (Merge, Unmerge, the adds words alone); no typed mark'), tools.length > 10 && tools.every(t => /^(Merge|Unmerge|\+ )/.test(t.t) ? t.mark === 0 : t.mark === 13) && !tools.some(t => /[✋▣→🗑╱❐✕⌢➤⤢↺📋]/u.test(t.t)), JSON.stringify(tools))
    const hs = [...new Set(tools.map(t => t.h))]
    if (AFTER) res(K('the tools are one height'), hs.length === 1, JSON.stringify(hs))
    await page.evaluate(() => [...document.querySelectorAll('#arrTools > button')].find(b => b.textContent.trim() === 'Select')?.classList.add('zz-sel'))
    await press(page, '#arrTools > button.zz-sel', touch)
    if (AFTER) res(K('Select is chosen (lit)'), await page.evaluate(() => [...document.querySelectorAll('#arrTools > button')].find(b => b.textContent.trim() === 'Select')?.classList.contains('primary')))
    if (touch && await visible(page, '#foldTool')) { const ft = await measure(page, '#foldTool'); res(K('the folded row names the chosen tool with its mark'), !!ft && ft.text === 'Select' && !!ft.mark, JSON.stringify(ft)) }
    await page.keyboard.press('Escape'); await sleep(300)
    await press(page, '#sylMenuBtn', touch); await press(page, '#arrangeBtn', touch); await sleep(500)
    /* the lull: Copy to… and a period's ✕ (made through the app's own picker) */
    await page.evaluate(() => window.scrollTo(0, 0))
    if (await visible(page, '#copyLullBtn') || touch) {
      if (touch && !(await visible(page, '#copyLullBtn'))) { const tab = page.locator('.viewtabs button, .vt-seg button').filter({ hasText: /Info/ }).first(); if (await tab.count()) { await tab.tap(); await sleep(500) } }
      const c = await keep(page, K('trk-copy'), '#copyLullBtn'); await pic(page, K('trk-lull'), '#copyLullBtn', { pad: 40, padX: 160 })
      const z = await page.evaluate(() => { const v = document.querySelector('#copyLullBtn svg'); return v.getBoundingClientRect().width / parseFloat(getComputedStyle(v).width) })
      if (AFTER) res(K('Copy to…: the copy mark 13 at the panel\'s own zoom, no ⧉'), !!c && !!c.mark && Math.abs(c.mark.w - 13 * z) < 0.6 && noTyped(c, /⧉/), `zoom ${z.toFixed(2)} — ${JSON.stringify(c)}`)
      await press(page, '#setLullBtn', touch); await sleep(400)
      const cells = page.locator('#lullCal .grid > :not(.dow)').filter({ hasText: /^\d+$/ })
      if (await cells.count() > 12) { await cells.nth(10).click(); await sleep(200); await cells.nth(12).click(); await sleep(500) }
      if (await visible(page, '#lullCal')) await press(page, '#lullClose', touch)
      const x = await keep(page, K('trk-lull-x'), '.lullchip .x')
      await pic(page, K('trk-lull-chip'), '.lullchip', { pad: 30, padX: 120 })
      if (AFTER) res(K('a lull period’s ✕ is the drawn ✕ (no ×)'), !!x && !!x.mark && noTyped(x, /×/), JSON.stringify(x))
      if (x) { await press(page, '.lullchip .x', touch); if (AFTER) res(K('the ✕ asks first'), await visible(page, '#dlgOk')); if (await visible(page, '#dlgOk')) await press(page, '#dlgOk', touch); if (AFTER) res(K('the ✕ removes the period'), !(await visible(page, '.lullchip'))) }
    } else res(K('Copy to… in view'), false, 'no #copyLullBtn')
  })
  await ctx.close()
}

/* ================= the Inputs and SANS rows at many widths (D1702) ================= */
async function rows() {
  const widths = [{ w: 1920, h: 900 }, { w: 1536, h: 864 }, { w: 1440, h: 900 }, { w: 1366, h: 768 }, { w: 1340, h: 768 }, { w: 1300, h: 768 }, { w: 1280, h: 768 }, { w: 1100, h: 768 }, { w: 900, h: 768 }, { w: 821, h: 768 }, { w: 402, h: 874, touch: true }, { w: 375, h: 812, touch: true }]
  const out = {}
  for (const W of widths) {
    const { ctx, page } = await world({ width: W.w, height: W.h }, !!W.touch)
    await go(page, 'inputs'); await sleep(600)
    const m = await page.evaluate(() => {
      const q = s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); return e && e.getBoundingClientRect() }
      const top = q('.inputs-top'), g = q('#inGear'), tabs = q('.inputs-tabs'), s = q('#inFSearch'), f = q('#inFiltersBtn'), views = q('.inputs-views')
      return { rowH: Math.round(top.height), gearTop: Math.round(g.top - top.top), gearRight: Math.round(top.right - g.right), gearH: Math.round(g.height), gearW: Math.round(g.width),
        viewsTop: Math.round(views.top - top.top), searchW: (() => { const e = document.querySelector('#inFSearch'); const l = e && e.closest('label'); const r = l && l.getBoundingClientRect(); return r && r.width ? Math.round(r.width) : null })(), filtersTop: f ? Math.round(f.top - top.top) : null,
        fieldsTop: (() => { const e = document.querySelector('#inFilters'); const r = e && e.getBoundingClientRect(); return r && r.width ? Math.round(r.top - top.top) : null })(),
        lines: new Set([...document.querySelectorAll('.inputs-top > *, .inputs-top .inputs-filtergroup > *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && getComputedStyle(e).display !== 'contents' }).map(e => Math.round(e.getBoundingClientRect().top / 20))).size }
    })
    await page.screenshot({ path: `${SHOTS}/${TAG}-row-inputs-${W.w}.png`, clip: { x: 0, y: 40, width: W.w, height: Math.min(260, W.h - 40) } })
    await page.locator('#inSansMode').filter({ visible: true }).first().click(); await sleep(600)
    const sm = await page.evaluate(() => {
      const q = s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); return e && e.getBoundingClientRect() }
      const head = q('.sc-head'), g = q('.sc-gear'), tabs = q('.inputs-tabs, .sc-head .intab')
      return { headH: Math.round(head.height), gearTop: Math.round(g.top - head.top), gearRight: Math.round(head.right - g.right), gearH: Math.round(g.height), gearW: Math.round(g.width) }
    })
    await page.screenshot({ path: `${SHOTS}/${TAG}-row-sans-${W.w}.png`, clip: { x: 0, y: 40, width: W.w, height: Math.min(200, W.h - 40) } })
    out[W.w] = { inputs: m, sans: sm }
    console.log(W.w, JSON.stringify(out[W.w]))
    await ctx.close()
  }
  measures.rows = out
  if (AFTER) for (const [w, r] of Object.entries(out)) {
    const desk = +w >= 821
    if (desk) res(`row ${w}: the Inputs gear at the row's right end and never alone on a line of its own`, r.inputs.gearRight <= 2 && (r.inputs.gearTop <= 4 || r.inputs.fieldsTop === r.inputs.gearTop || r.inputs.searchW === null), JSON.stringify(r.inputs))
    if (+w >= 1366 && +w <= 1919) res(`row ${w}: the Inputs row is one line`, r.inputs.gearTop <= 4, JSON.stringify(r.inputs))
    res(`row ${w}: the SANS gear never alone on a line (Highlight beside it)`, r.sans.gearTop <= 6 || r.sans.headH > 60, JSON.stringify(r.sans))
  }
}

const PASSES = (process.env.CR4W_PASS || 'pc,ph,rows').split(',')
if (PASSES.includes('pc')) await pass('pc', PC, false)
if (PASSES.includes('ph')) await pass('ph', PHONE, true)
if (PASSES.includes('rows')) await rows()
writeFileSync(`${SHOTS}/${TAG}-${ENGINE}-measures.json`, JSON.stringify(measures, null, 1))
writeFileSync(`${SHOTS}/${TAG}-${ENGINE}-results.json`, JSON.stringify({ results, errors }, null, 1))
const fails = results.filter(r => r.pass === 'FAIL')
console.log(`\n${TAG} ${ENGINE}: ${results.filter(r => r.pass === 'PASS').length} PASS, ${fails.length} FAIL, ${results.filter(r => r.pass === 'RECORDED').length} recorded; page errors ${errors.length}`)
for (const f of fails) console.log('  FAIL', f.id, '—', f.note.slice(0, 300))
for (const e of errors) console.log('  ERROR', e.slice(0, 300))
await browser.close()
