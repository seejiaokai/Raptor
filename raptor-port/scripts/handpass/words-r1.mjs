// THE WHOLE-APP WORDS PASS (owner D808) — round 1: the day's panels on Edit Schedule and the Scheduler Board.
// Draws, on the BUILT app, each text the round puts to him — marked and numbered — and beside it the same screen with the
// proposed change applied to the page (a removal, a rewording, the editing line moved into the Legend fold). Nothing in
// the app is changed; the "after" pictures are drawn by changing the page's own nodes (mockups-on-the-real-app.md).
//
//   node scripts/handpass/words-r1.mjs [out dir]        (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-r1 v7')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/r1')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const facts = {}

/* the mark is drawn ON the element — an outline and a numbered tag in its own ::before — so it cannot drift from it
   when anything above it moves (v4's overlay boxes did, on a phone); an outline takes no room, so nothing moves */
const MARK_CSS = `[data-wpn]{outline:2px solid #ff2d55 !important;outline-offset:2px;border-radius:3px;position:relative}
[data-wpn].wp-new{outline-color:#34c759 !important}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:-4px;top:-19px;background:#ff2d55;color:#fff;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn].wp-new::before{background:#34c759;color:#05210f}`

const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  const found = []
  for (const it of items) {
    const e = [...document.querySelectorAll(it.sel)].filter(e => e.getBoundingClientRect().width > 1)[it.nth || 0]
    if (!e) { found.push(it.n + ': MISSING ' + it.sel); continue }
    e.setAttribute('data-wpn', it.n); if (it.new) e.classList.add('wp-new')
    found.push(it.n + ': ' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140))
  }
  return found
}, [items, MARK_CSS])
const unmark = page => page.evaluate(() => document.querySelectorAll('[data-wpn]').forEach(e => { e.removeAttribute('data-wpn'); e.classList.remove('wp-new') }))
/* the box round several elements, in doc coordinates, padded — what a picture is clipped to */
const boxOf = (page, sels, pad = 12) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  if (L > R) return null
  return { x: Math.max(0, L - pad), y: Math.max(0, T - pad - 14), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad + 14 }
}, [sels, pad])
const shot = async (page, name, clip) => { if (!clip) { errs.push(name + ': nothing to clip'); return } await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true }) }

/* THE PROPOSED CHANGES, drawn on the page — each returns what it changed, for the record */
const AFTER = {
  /* Q2: "tap to review" / "tap to collapse" go; the caret stays (week and board) */
  cue: () => [...document.querySelectorAll('.dwcue')].map(c => { const p = c.previousSibling; if (p && p.nodeType === 3) p.textContent = p.textContent.replace(/\s*·\s*$/, ' '); c.remove(); return 'cue' }),
  /* Q2: the week's how-to lines go; a fold keeps its caret only */
  weekHints: () => [...document.querySelectorAll('#eWeek .pl-hint')].map(h => {
    const t = h.textContent
    if (/inputs? ·|show ⌄/.test(t)) { h.textContent = t.replace(/ · show ⌄/, ' ⌄'); return 'fold count' }
    if (/hide ⌃/.test(t)) { h.textContent = '⌃'; return 'pi hint → caret' }
    h.remove(); return 'hint removed'
  }),
  /* Q2: Available crew's fold words */
  avail: () => [...document.querySelectorAll('.ap-h .n')].map(n => { n.textContent = n.textContent.replace(/by wave · close ⌃/, '⌃').replace(/ ⌄$/, ' ⌄'); return n.textContent }),
  /* Q1: the board's panel subtitles go — a folded panel keeps its count */
  boardSubs: () => [...document.querySelectorAll('#schedBoard .sb-ph > .sub')].map(s => {
    const t = s.textContent
    if (/\d+ inputs? ·/.test(t)) { s.textContent = t.replace(/ · show ⌄/, ' ⌄'); return 'fold count' }
    s.remove(); return 'removed: ' + t.slice(0, 40)
  }),
  /* Q3: the removed-input note, the dash a full stop — every word kept */
  inpnote: () => [...document.querySelectorAll('.pl-inpnote, .sb-pinote')].map(n => { n.textContent = 'A removed input flags nothing until accepted again. Delete it here if it should go entirely.'; return 'note' }),
  /* Q4: the amendments panel's empty line */
  alnone: () => [...document.querySelectorAll('.al-none')].map(n => { n.textContent = 'No amendments published yet.'; return 'al' }),
  /* Q2: the editing line joins the Legend, as its own "Editing:" group — the Legend's own markup, cloned */
  legend: () => {
    const lg = document.querySelector('#page-editsched .legend'); if (!lg) return ['NO LEGEND']
    const lab = [...lg.children].find(c => c.textContent.trim() === 'Flags:')
    const add = document.createElement('span'); add.id = 'wp-edit-row'; add.style.cssText = 'display:contents'
    const head = lab.cloneNode(true); head.textContent = 'Personal Inputs and Unavailable:'
    add.append(' ', head)
    for (const t of ['times and remarks type in place', 'clear a time for all day', 'press the type to change it']) { const s = document.createElement('span'); s.textContent = t; add.append(' ', s) }
    lg.append(add); return ['legend row']
  },
}
const apply = (page, keys) => page.evaluate(([keys, src]) => { const out = {}; for (const k of keys) out[k] = (0, eval)('(' + src[k] + ')')(); return out },
  [keys, Object.fromEntries(Object.entries(AFTER).map(([k, f]) => [k, f.toString()]))])

async function signIn(page) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
}

for (const size of [{ tag: 'desk', viewport: { width: 1440, height: 3200 }, dsf: 2 }, { tag: 'phone', viewport: { width: 390, height: 3600 }, dsf: 3, touch: true }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size.tag} console: ` + m.text().slice(0, 200)) })
  await signIn(page)
  const T = size.tag

  /* ── 1. the week's Monday: its issues bar, the input panels, Available crew ── */
  await page.evaluate(() => document.querySelector('#eWeek [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  const D = '#eWeek .day[data-day="0"]'
  const weekItems = [
    { n: 'W1', sel: `${D} .dwcue` },
    { n: 'W2', sel: `${D} .sec-pinp .pl-hint, ${D} .sub-h.pl-fold .pl-hint` },
    { n: 'W3', sel: `${D} .pl-inpnote` },
    { n: 'W4', sel: `${D} .sec-sans .pl-hint` },
    { n: 'W5', sel: `${D} .sec-unav .pl-hint, ${D} .sec.unav .pl-hint` },
    { n: 'W6', sel: `${D} .ap-h .n` },
  ]
  /* the Unavailable hint is the last .pl-hint of the day — find it by its own heading, not by a guessed class */
  const unavSel = await page.evaluate(D => { const hs = [...document.querySelectorAll(D + ' .sub-h')]; const u = hs.find(h => /^\W*Unavailable/.test(h.textContent)); if (u) u.querySelector('.pl-hint')?.setAttribute('data-wp', 'unav'); const p = hs.find(h => /^\W*Personal Inputs/.test(h.textContent)); if (p) p.querySelector('.pl-hint')?.setAttribute('data-wp', 'pinp'); return !!u }, D)
  weekItems[1].sel = '[data-wp="pinp"]'; weekItems[4].sel = '[data-wp="unav"]'
  facts[T + ' week found'] = await mark(page, weekItems)
  const weekTop = await boxOf(page, [`${D} .daywarn`], 10)
  const weekLow = await boxOf(page, [`${D} .sec-avail`, '[data-wp="pinp"]', '[data-wp="unav"]', `${D} .sec-sans`, `${D} .pl-inpnote`], 10)
  await shot(page, `${T}-week-top-before`, weekTop)
  await shot(page, `${T}-week-panels-before`, weekLow ? { ...weekLow, height: Math.min(weekLow.height, size.tag === 'desk' ? 1500 : 2600) } : null)
  await unmark(page)
  facts[T + ' week after'] = await apply(page, ['cue', 'weekHints', 'avail', 'inpnote'])
  await mark(page, [{ n: 'W3', sel: `${D} .pl-inpnote`, new: true }])
  await shot(page, `${T}-week-top-after`, weekTop)
  await shot(page, `${T}-week-panels-after`, weekLow ? { ...weekLow, height: Math.min(weekLow.height, size.tag === 'desk' ? 1500 : 2600) } : null)
  await unmark(page)

  /* ── 2. the amendments panel and the Legend fold (Edit Schedule's head) ── */
  await page.evaluate(() => { const lb = document.querySelector('#page-editsched .legendbox'); if (lb && lb.tagName === 'DETAILS') lb.open = true; else lb?.querySelector('.legend-sum')?.click() })
  await page.waitForTimeout(300)
  await signIn(page) /* a fresh page: the "after" edits above are gone */
  await page.evaluate(() => { const lb = document.querySelector('#page-editsched .legendbox'); if (lb && lb.tagName === 'DETAILS') lb.open = true; else lb?.querySelector('.legend-sum')?.click() })
  await page.waitForTimeout(300)
  facts[T + ' head found'] = await mark(page, [{ n: 'W7', sel: '.al-none' }])
  const head = await boxOf(page, ['#page-editsched .al-none', '#page-editsched .legendbox'], 10)
  await shot(page, `${T}-head-before`, head)
  await unmark(page)
  facts[T + ' head after'] = await apply(page, ['alnone', 'legend'])
  await mark(page, [{ n: 'W7', sel: '.al-none', new: true }, { n: 'W2 + W5 moved here', sel: '#wp-edit-row > span:nth-child(1)', new: true }])
  const head2 = await boxOf(page, ['#page-editsched .al-none', '#page-editsched .legendbox'], 10)
  await shot(page, `${T}-head-after`, head2)
  await unmark(page)

  /* ── 3. the Scheduler Board's Monday: its panel headings. The board scrolls on its own, so the page is made tall
        enough to hold it whole and left at its top — then a header's box on screen is its box in the picture ── */
  await page.setViewportSize({ width: size.viewport.width, height: 9000 })
  await signIn(page)
  await page.locator('#eWeek [data-sbday="0"]').first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(700)
  await page.evaluate(() => document.querySelector('#schedBoard [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  await page.evaluate(() => { scrollTo(0, 0); document.querySelectorAll('#schedBoard *').forEach(e => { if (e.scrollTop) e.scrollTop = 0 }); const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
  const heads = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-ph')].filter(h => h.getBoundingClientRect().width > 1 && h.querySelector(':scope > .sub')).map((h, i) => { h.setAttribute('data-wph', String(i)); return h.textContent.replace(/\s+/g, ' ').trim() }))
  facts[T + ' board heads'] = heads
  const bItems = [{ n: 'B1', sel: '#schedBoard .dwcue' }]
  heads.forEach((_, i) => bItems.push({ n: 'B' + (i + 2), sel: `#schedBoard [data-wph="${i}"] > .sub` }))
  bItems.push({ n: 'W3', sel: '#schedBoard .sb-pinote' })
  facts[T + ' board found'] = await mark(page, bItems)
  /* each picture's frame is found again AFTER the change: a line removed moves every panel below it up */
  const piAt = heads.findIndex(h => /Personal Inputs/.test(h))
  const frames = async () => {
    const out = [await page.evaluate(() => { const e = document.querySelector('#schedBoard [data-sbwtog]') || document.querySelector('#schedBoard .dwcue')?.parentElement; if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 22), width: r.width + 12, height: r.height + 30 } })]
    for (let i = 0; i < heads.length; i++) out.push(await boxOf(page, [`#schedBoard [data-wph="${i}"]`].concat(i === piAt ? ['#schedBoard .sb-pinote'] : []), 6))
    return out
  }
  const clips = await frames()
  for (let i = 0; i < clips.length; i++) await shot(page, `${T}-board-${String(i + 1).padStart(2, '0')}-before`, clips[i])
  await unmark(page)
  facts[T + ' board after'] = await apply(page, ['cue', 'boardSubs', 'inpnote'])
  await mark(page, [{ n: 'W3', sel: '#schedBoard .sb-pinote', new: true }])
  const clips2 = await frames()
  for (let i = 0; i < clips2.length; i++) await shot(page, `${T}-board-${String(i + 1).padStart(2, '0')}-after`, clips2[i] && clips[i] ? { ...clips2[i], height: Math.max(clips2[i].height, 40) } : clips2[i])
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 6000))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
