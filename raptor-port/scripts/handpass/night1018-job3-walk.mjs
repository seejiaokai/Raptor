/* Walk for night job 3 (18 Oct 26): the Leave War's top takes the phone's two-line layout up to 700 wide (D1000, D1016).
   Drives the BUILT app already served (SPF_URL, default http://localhost:4174); builds nothing.
   Run: SPF_URL=http://localhost:4174 node scripts/handpass/night1018-job3-walk.mjs
   Out: docs/img/handpass/2026-10-18-night-job3/ (emptied first). Phone sizes by touch (isMobile + hasTouch), scale 2. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = resolve(here, '../../docs/img/handpass/2026-10-18-night-job3')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('night1018-job3-walk v1 →', OUT, 'at', BASE)

const results = []           // { step, ok, note, pic }
const problems = []          // console errors, page errors, 4xx
let pic = 0
const check = (step, ok, note, picName) => {
  results.push({ step, ok, note, pic: picName || '' })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${step} — ${note}${picName ? ` [${picName}]` : ''}`)
}
const shot = async (page, name) => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(150)
  const f = `${String(++pic).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: join(OUT, f) })
  return f
}

/* a signed-in Leave War at a size; `touch` for the phone sizes */
async function openLW({ w, h, user = 'ad', pass = 'a', touch = w <= 700, tag, storageState }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => problems.push(`${tag}: page error: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') problems.push(`${tag}: console error: ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) problems.push(`${tag}: ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (storageState ? '/' : '/?fresh=1'))
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  const btn = page.locator('#loginForm button[type=submit]')
  if (touch) await btn.tap(); else await btn.click()
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { state: 'attached' })
  await sleep(500)
  await page.evaluate(() => {
    if (window.setFlyRun) window.setFlyRun('2026-01-02', { p: 16, w: 16 })
    if (window.lwSaveManningRule) window.lwSaveManningRule({ id: 'sc-d', label: 'SC D', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 0, red: 0 } })
  })
  await sleep(400)
  return { ctx, page }
}
const tapOrClick = async (page, loc, touch) => { if (touch) await loc.tap(); else await loc.click() }

/* everything the walk asserts about the top, read in the page. Visible = has a box wider than 1px. */
const measure = () => {
  const pg = document.querySelector('#page-leavewar')
  const vis = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 ? r : null }
  const ids = ['war-picker', 'war-new', 'lw-viewing', 'stage-now', 'bid-window', 'undermanned', 'legend-open', 'stage-advance', 'stage-back']
  const items = {}
  for (const id of ids) { const e = pg.querySelector(`[data-testid="${id}"]`); const r = vis(e); if (r) items[id] = { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), txt: (e.textContent || '').trim().replace(/\s+/g, ' ') } }
  // the words a person SEES: children with a box wider than 1px (walk-scripts §4)
  const seen = e => !e ? '' : [...e.querySelectorAll('*')].filter(c => c.children.length === 0 && vis(c)).map(c => (c.textContent || '').trim()).join(' ').replace(/\s+/g, ' ')
  const labs = [...pg.querySelectorAll(':scope > .topbar .lab, :scope > .filters .lab')].filter(vis).map(e => e.textContent.trim())
  const keys = Object.keys(items)
  const overlaps = []
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const a = items[keys[i]], b = items[keys[j]]
    const ix = Math.min(a.r, b.r) - Math.max(a.l, b.l), iy = Math.min(a.b, b.b) - Math.max(a.t, b.t)
    if (ix > 1 && iy > 1) overlaps.push(`${keys[i]}×${keys[j]}`)
  }
  const past = keys.filter(k => items[k].r > innerWidth + 0.5 || items[k].l < -0.5)
  const lineY = k => items[k] ? Math.round((items[k].t + items[k].b) / 2) : null
  const line1 = ['war-picker', 'war-new', 'lw-viewing'].filter(k => items[k]).map(lineY)
  const line2 = ['stage-now', 'bid-window', 'undermanned', 'legend-open', 'stage-advance', 'stage-back'].filter(k => items[k]).map(lineY)
  const spread = a => a.length ? Math.max(...a) - Math.min(...a) : 0
  const rows = [...pg.querySelectorAll('[data-testid^="row-"]')].filter(vis)
  const stg = pg.querySelector('.stage'), card = pg.querySelector('.card')
  const hd = pg.querySelector('.card-hd')
  const hdBtns = hd ? [...hd.querySelectorAll('button')].filter(vis).map(b => b.innerText.trim().replace(/\s+/g, ' ')) : []
  const tb = pg.querySelector(':scope > .topbar'), fl = pg.querySelector(':scope > .filters')
  const vwho = pg.querySelector('.vwho'), vlab = pg.querySelector('.vlab')
  return {
    items, labs, overlaps, past, line1, line2, line1Spread: spread(line1), line2Spread: spread(line2),
    line2Below: line1.length && line2.length ? Math.min(...line2) > Math.max(...line1) : null,
    pageScroll: document.documentElement.scrollWidth - innerWidth,
    firstRow: rows[0] ? Math.round(rows[0].getBoundingClientRect().top) : -1,
    phoneWords: !pg.querySelector('[data-testid="period-label"]'),
    stagePad: stg ? getComputedStyle(stg).padding : null,
    cardLeft: card ? Math.round(card.getBoundingClientRect().left) : null,
    topLeft: tb ? Math.round(Math.min(...[...tb.querySelectorAll('select, button, .lab, .lw-viewing')].map(e => e.getBoundingClientRect()).filter(r => r.width > 1).map(r => r.left))) : null,
    topRight: tb ? Math.round(Math.max(...[...tb.querySelectorAll('select, button, .lab, .lw-viewing')].map(e => e.getBoundingClientRect()).filter(r => r.width > 1).map(r => r.right))) : null,
    topbarPadL: tb ? getComputedStyle(tb).paddingLeft : null, filtersPadL: fl ? getComputedStyle(fl).paddingLeft : null,
    hdBtns,
    menu: (() => { const m = pg.querySelector('[data-testid="stage-menu"]'); const r = vis(m); return r ? { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), txt: [...m.querySelectorAll('button')].map(b => b.textContent.trim()) } : null })(),
    stageTxt: items['stage-now'] ? items['stage-now'].txt : null,
    viewing: { seen: seen(pg.querySelector('[data-testid="lw-viewing"]')), vlabOk: vlab ? (vis(vlab) && vlab.scrollWidth <= vlab.clientWidth + 1) : null, vwho: vwho ? { txt: vwho.textContent, ell: getComputedStyle(vwho).textOverflow, cut: vwho.scrollWidth > vwho.clientWidth + 1, r: Math.round(vwho.getBoundingClientRect().right) } : null },
    vw: innerWidth,
  }
}
const brief = m => `rows1 ${JSON.stringify(m.line1)} rows2 ${JSON.stringify(m.line2)} below ${m.line2Below}; first roster row ${m.firstRow}; overlaps [${m.overlaps}]; past edge [${m.past}]; page sideways ${m.pageScroll}; labels [${m.labs}]; phone words ${m.phoneWords}; top ${m.topLeft}..${m.topRight} of ${m.vw}, card left ${m.cardLeft}`
const twoLines = m => m.phoneWords && m.line1Spread <= 6 && m.line2Spread <= 6 && m.line2Below === true && !m.overlaps.length && !m.past.length && m.pageScroll <= 0 && m.labs.length === 0

/* ---------- S1, S2: admin at 440 and 600 ---------- */
{
  const { ctx, page } = await openLW({ w: 440, h: 956, tag: 'S1' })
  const m = await measure0(page)
  const p = await shot(page, 'S1-admin-440')
  const ctrls = Object.keys(m.items)
  check('S1 two lines, nothing overlapping or past the screen, no sideways scroll', twoLines(m) && ctrls.includes('stage-now'), brief(m) + `; controls ${ctrls.join(',')}`, p)
  check('S1 first roster row near 469 (was 564)', Math.abs(m.firstRow - 469) <= 12, `first roster row top ${m.firstRow}px`, p)
  check('S1 edge: top lines up with the grid card from 431 up (20px)', Math.abs(m.topLeft - m.cardLeft) <= 4 || m.topLeft === m.cardLeft, `top's left control ${m.topLeft}px, grid card left ${m.cardLeft}px, top right ${m.topRight} of ${m.vw}; padding line1 ${m.topbarPadL} line2 ${m.filtersPadL}`, p)
  results.s1 = m
  await ctx.close()
}
async function measure0(page) { return page.evaluate(measure) }
{
  const { ctx, page } = await openLW({ w: 600, h: 960, tag: 'S2' })
  const m = await measure0(page)
  const p = await shot(page, 'S2-admin-600')
  check('S2 two lines, nothing overlapping or past the screen, no sideways scroll', twoLines(m), brief(m), p)
  check('S2 first roster row near 434', Math.abs(m.firstRow - 434) <= 12, `first roster row top ${m.firstRow}px`, p)
  check('S2 edge: top lines up with the grid card (20px)', Math.abs(m.topLeft - m.cardLeft) <= 4, `top's left control ${m.topLeft}px, grid card left ${m.cardLeft}px`, p)
  await ctx.close()
}

/* ---------- S3: 700 and 701 ---------- */
{
  const a = await openLW({ w: 700, h: 900, tag: 'S3a' })
  const m = await measure0(a.page)
  const p = await shot(a.page, 'S3-700')
  check('S3 700 wide is two lines (the phone top)', twoLines(m), brief(m), p)
  await a.ctx.close()
  const b = await openLW({ w: 701, h: 900, tag: 'S3b', touch: false })
  const d = await measure0(b.page)
  const p2 = await shot(b.page, 'S3-701')
  const want = ['Period', 'Stage']
  const wide = !d.phoneWords && want.every(x => d.labs.includes(x)) && d.items['war-new']?.txt === '+ New' && !!d.items['stage-advance'] && !!d.items['stage-back'] && !d.overlaps.length && !d.past.length && d.pageScroll <= 0
  check('S3 701 wide is the desktop strip (labels Period/Stage, "+ New", both stage moves in sight)', wide, `${brief(d)}; + button reads "${d.items['war-new']?.txt}"; stage moves: ${d.items['stage-advance']?.txt} / ${d.items['stage-back']?.txt}; bidding label present: ${d.labs.includes('Bidding on')}; under-manned label: ${d.labs.includes('Under-manned')}`, p2)
  await b.ctx.close()
}

/* ---------- S4: stage menu at 440 and 600 ---------- */
for (const w of [440, 600]) {
  const { ctx, page } = await openLW({ w, h: w === 440 ? 956 : 960, tag: `S4-${w}` })
  const stageNow = page.locator('[data-testid="stage-now"]')
  const before = (await stageNow.textContent()).trim()
  await stageNow.tap(); await sleep(400)
  const m = await measure0(page)
  const p1 = await shot(page, `S4-${w}-menu-open`)
  const txts = m.menu ? m.menu.txt : []
  const inScreen = m.menu && m.menu.l >= 0 && m.menu.r <= m.vw && m.menu.b <= innerHeight0(page)
  check(`S4 ${w}: tapping the stage button opens the menu with "→ BIDDING CLOSED" and "← DRAFT"`, !!m.menu && txts.includes('→ BIDDING CLOSED') && txts.includes('← DRAFT') && m.menu.l >= 0 && m.menu.r <= m.vw, `stage reads "${before}"; menu ${JSON.stringify(m.menu)}`, p1)
  await page.locator('[data-testid="stage-advance"]').tap(); await sleep(500)
  const m2 = await measure0(page)
  const p2 = await shot(page, `S4-${w}-after-advance`)
  check(`S4 ${w}: pressing "→ BIDDING CLOSED" changes the stage and closes the menu`, m2.stageTxt !== before && m2.menu === null && /closed/i.test(m2.stageTxt || ''), `stage now reads "${m2.stageTxt}" (was "${before}"); menu open: ${!!m2.menu}`, p2)
  await page.locator('[data-testid="stage-now"]').tap(); await sleep(400)
  const m3 = await measure0(page)
  const p3 = await shot(page, `S4-${w}-menu-from-closed`)
  await page.locator('[data-testid="stage-back"]').tap(); await sleep(500)
  const m4 = await measure0(page)
  const p4 = await shot(page, `S4-${w}-moved-back`)
  check(`S4 ${w}: moving it back returns the stage`, m4.stageTxt === before && m4.menu === null, `menu from closed offered ${JSON.stringify(m3.menu?.txt)}; after the move back the stage reads "${m4.stageTxt}" (was "${before}")`, p4)
  await page.locator('[data-testid="stage-now"]').tap(); await sleep(400)
  const open1 = (await measure0(page)).menu !== null
  const v = page.viewportSize()
  await page.touchscreen.tap(20, v.height - 40); await sleep(400)
  const m5 = await measure0(page)
  const p5 = await shot(page, `S4-${w}-after-outside-tap`)
  check(`S4 ${w}: a tap outside closes the menu and changes nothing`, open1 && m5.menu === null && m5.stageTxt === before, `menu was open: ${open1}; after the outside tap menu open: ${!!m5.menu}; stage reads "${m5.stageTxt}"`, p5)
  await ctx.close()
}
function innerHeight0() { return 99999 }

/* ---------- S5: member at 600 ---------- */
{
  const { ctx, page } = await openLW({ w: 600, h: 960, user: 'us', pass: 'us', tag: 'S5' })
  const m = await measure0(page)
  const before = m.stageTxt
  const tagName = await page.locator('[data-testid="stage-now"]').evaluate(e => e.tagName)
  await page.locator('[data-testid="stage-now"]').tap(); await sleep(400)
  const m2 = await measure0(page)
  const p = await shot(page, 'S5-member-600')
  const ok = m.phoneWords && !m.items['war-new'] && m.line1Spread <= 6 && m.line2Spread <= 6 && m.line2Below === true && !m.overlaps.length && !m.past.length && m.pageScroll <= 0 && m2.menu === null && !m2.items['stage-advance']
  check('S5 member at 600: two lines, no "+", the stage is a plain label that opens nothing', ok, `${brief(m)}; "+" present: ${!!m.items['war-new']}; stage element is <${tagName}>, reads "${before}"; after a tap menu open: ${!!m2.menu}`, p)
  await ctx.close()
}

/* ---------- S6: the grid card's own row at 440 and 600 (and 430, 701 for padding) ---------- */
const pads = {}
for (const w of [430, 440, 600, 701]) {
  const { ctx, page } = await openLW({ w, h: 960, tag: `S6-${w}`, touch: w <= 700 })
  const m = await measure0(page)
  pads[w] = m.stagePad
  if (w === 440 || w === 600) {
    const hd = page.locator('#page-leavewar .card-hd')
    await hd.scrollIntoViewIfNeeded(); await sleep(200)
    const box = await hd.boundingBox()
    const f = `${String(++pic).padStart(2, '0')}-S6-${w}-grid-card-top-row.png`
    await page.screenshot({ path: join(OUT, f), clip: { x: 0, y: Math.max(0, box.y - 12), width: m.vw, height: box.height + 24 } })
    const txt = m.hdBtns.join(' | ')
    check(`S6 ${w}: grid card's own row still reads "Rearrange" and "OIL tracker"`, /Rearrange/.test(txt) && /OIL tracker/.test(txt), `card buttons (seen words): ${txt}; grid card padding ${m.stagePad}`, f)
  }
  await ctx.close()
}
check('S6 grid card padding is the same at 440/600 as the phone rule would give at 430? (info)', true, `padding at 430 ${pads[430]}, 440 ${pads[440]}, 600 ${pads[600]}, 701 ${pads[701]} (compare by eye: the card was not meant to change)`, '')

/* ---------- S7: a phone 390x844 ---------- */
{
  const { ctx, page } = await openLW({ w: 390, h: 844, tag: 'S7' })
  const m = await measure0(page)
  const p = await shot(page, 'S7-admin-390')
  check('S7 390×844 admin: the top as before (two lines)', twoLines(m), brief(m), p)
  results.s7 = m
  await ctx.close()
}

/* ---------- S8: 600x960 -> 960x600 and back, live ---------- */
{
  const { ctx, page } = await openLW({ w: 600, h: 960, tag: 'S8' })
  const a = await measure0(page); const pa = await shot(page, 'S8-a-600x960')
  await page.setViewportSize({ width: 960, height: 600 }); await sleep(700)
  const b = await measure0(page); const pb = await shot(page, 'S8-b-960x600')
  const wide = !b.phoneWords && b.labs.includes('Period') && b.labs.includes('Stage') && b.items['war-new']?.txt === '+ New' && !b.menu && !b.overlaps.length && !b.past.length && b.pageScroll <= 0
  await page.setViewportSize({ width: 600, height: 960 }); await sleep(700)
  const c = await measure0(page); const pc = await shot(page, 'S8-c-back-600x960')
  check('S8 600→960 switches to the desktop strip live, nothing half-drawn', wide && twoLines(a), `600: ${brief(a)} || 960: ${brief(b)}`, pb)
  check('S8 960→600 back to the two-line top, same as the start', twoLines(c) && c.firstRow === a.firstRow, `back: ${brief(c)} (first row was ${a.firstRow})`, pc)
  await ctx.close()
}

/* ---------- B1: menu open at 600, then resize to 900 wide ---------- */
{
  const { ctx, page } = await openLW({ w: 600, h: 960, tag: 'B1' })
  await page.locator('[data-testid="stage-now"]').tap(); await sleep(400)
  const open = (await measure0(page)).menu !== null
  const pa = await shot(page, 'B1-a-menu-open-600')
  await page.setViewportSize({ width: 900, height: 960 }); await sleep(800)
  const m = await measure0(page)
  const stray = await page.evaluate(() => ({ menu: document.querySelectorAll('[data-testid="stage-menu"]').length, scrim: document.querySelectorAll('[data-testid="stage-scrim"]').length }))
  const pb = await shot(page, 'B1-b-resized-900')
  check('B1 menu open at 600, resize to 900: the menu does not stay floating', open && stray.menu === 0 && stray.scrim === 0 && !m.phoneWords && !!m.items['stage-advance'], `menu was open: ${open}; after the resize menus ${stray.menu}, scrims ${stray.scrim}; phone words ${m.phoneWords}; stage moves in sight: ${!!m.items['stage-advance']}`, pb)
  await ctx.close()
}

/* ---------- B2: a long callsign in "Viewing as" ---------- */
/* There is no "Viewing as" picker any more: the line names the signed-in person. So the longest seeded callsign is
   given a sign-in on Admin -> Users, and signed in as. */
let longName = null
{
  const setup = await browser.newContext({ viewport: { width: 1200, height: 900 } })
  const sp = await setup.newPage()
  sp.on('pageerror', e => problems.push(`B2 setup: page error: ${e.message}`))
  await sp.goto(BASE + '/')
  await sp.fill('#luser', 'ad'); await sp.fill('#lpass', 'a')
  await sp.locator('#loginForm button[type=submit]').click()
  await sp.waitForSelector('#vWeek .day', { state: 'attached' })
  longName = await sp.evaluate(() => { const P = window.PEOPLE || {}; const ps = (Array.isArray(P) ? P : Object.values(P)).map(p => (p && (p.cs || p.callsign || p.name))).filter(Boolean); return ps.sort((a, b) => String(b).length - String(a).length)[0] })
  console.log('longest callsign on the roster:', longName)
  let storageState = null, note = ''
  try {
    await sp.evaluate(() => window.go('admin'))
    await sp.getByText('Users', { exact: false }).first().click(); await sleep(500)
    const row = sp.locator(`[data-person]:has(.acc-name:text-is("${longName}"))`).first()
    await row.locator('.acc-main').click(); await sleep(300)
    await sp.fill('#accGiveName', 'longsign'); await sp.locator('#accGive').click(); await sleep(500)
    note = await sp.evaluate(() => (document.querySelector('[data-testid="toast"], .toast')?.textContent || ''))
    storageState = await setup.storageState()
  } catch (e) { note = 'setup failed: ' + e.message.split('\n')[0] }
  console.log('B2 setup note:', note)
  await setup.close()
  if (storageState) {
    for (const w of [440, 390]) {
      let r
      try { r = await openLW({ w, h: 900, user: 'longsign', pass: 'x', tag: `B2-${w}`, storageState }) } catch (e) { check(`B2 ${w}: long callsign`, false, 'NOT WALKED — could not sign in as the long-callsign account: ' + e.message.split('\n')[0], ''); continue }
      const m = await measure0(r.page)
      const p = await shot(r.page, `B2-${w}-real-${longName}`)
      const v = m.viewing
      check(`B2 ${w}: real callsign "${v.vwho?.txt}" shown, "Viewing as" kept whole, nothing past the edge`, twoLines(m) && v.vlabOk && /Viewing as/.test(v.seen) && v.vwho.r <= m.vw, `${brief(m)}; seen words "${v.seen}"; callsign cut: ${v.vwho?.cut}, ellipsis style ${v.vwho?.ell}`, p)
      // stress: the same line with a very long callsign written into the box (the real roster has none longer)
      await r.page.evaluate(() => { document.querySelector('.vwho').textContent = 'Wolverine-Nightfall-Extra-Long' })
      await sleep(300)
      const m2 = await measure0(r.page)
      const p2 = await shot(r.page, `B2-${w}-stress-long`)
      const v2 = m2.viewing
      check(`B2 ${w} stress (callsign text swapped in the page for a 30-letter one): cut with "…", "Viewing as" intact, inside the screen`, v2.vlabOk && /Viewing as/.test(v2.seen) && v2.vwho.cut && v2.vwho.ell === 'ellipsis' && v2.vwho.r <= m2.vw && !m2.overlaps.length && !m2.past.length && m2.pageScroll <= 0, `seen "${v2.seen}"; cut ${v2.vwho.cut}, text-overflow ${v2.vwho.ell}, right edge ${v2.vwho.r} of ${m2.vw}; overlaps [${m2.overlaps}] past [${m2.past}] page sideways ${m2.pageScroll}`, p2)
      await r.ctx.close()
    }
  } else check('B2 long callsign', false, 'NOT WALKED — ' + note, '')
}

/* ---------- report ---------- */
const flat = results.filter(r => r.step)
console.log('\n=== SUMMARY ===')
for (const r of flat) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.step}`)
console.log(`\n${flat.filter(r => r.ok).length} pass / ${flat.filter(r => !r.ok).length} fail`)
console.log('problems (console errors, page errors, 4xx):', problems.length ? '\n  ' + [...new Set(problems)].join('\n  ') : 'none')
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results: flat, problems }, null, 1))
await browser.close()
