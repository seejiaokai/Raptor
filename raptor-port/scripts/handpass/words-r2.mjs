// THE WHOLE-APP WORDS PASS (owner D808) — round 2: View-only Sched and the schedule's remaining lines (16 Oct 26).
//   Q1. View-only Sched — an unpublished day's head says "DRAFT" (the tag) and "Draft" (the stamp at its right end): the
//       stamp goes; the tag, in the place every published day shows its ORIG / AL tag, stays.
//   Q2. the next-week peek's "Next week — click a day to load it" (desktop only; View-only Sched and Edit Schedule):
//       A "Next week" alone; B the same words, the dash a colon (§1b test 2).
//   Q3. Edit Schedule — an accepted Personal Inputs row says "· accepted" twice (after its type, and after its remark's
//       printed "till <date>", D948): the second goes. A rejected ("removed") row is drawn too — the same marker, the same
//       doubling.
//   Q4. the crew panel's "Placeholders · drag in": "Placeholders" alone.
//   And, as built and unmarked, two lines considered and left (no change proposed): "No notes yet." and "No flying — ground day.".
// Draws on the BUILT app, marked; every "after" changes the page's own nodes (mockups-on-the-real-app.md). Nothing in the
// app is changed. The marking is words-r1.mjs's: the ring sits ON the element, and each frame is found again after a
// change. The two "· accepted" markers are drawn by the stylesheet (::after), which a ring cannot hold, so for Q3 each
// is first made a real span INSIDE its element with the same computed look — the "before" heights are measured both
// ways and must match, or the picture is refused.
//
//   node scripts/handpass/words-r2.mjs [out dir]        (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-r2 v6')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/r2')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const facts = {}
const fail = m => { errs.push('PREMISE: ' + m) }

const MARK_CSS = `[data-wpn]{outline:2px solid #ff2d55 !important;outline-offset:2px;border-radius:3px;position:relative}
[data-wpn].wp-new{outline-color:#34c759 !important}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:-4px;top:-19px;background:#ff2d55;color:#fff;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn=""]::before{display:none}
[data-wpn].wp-new::before{background:#34c759;color:#05210f}
[data-wpn].wp-left::before{top:calc(100% + 5px)}
[data-wpn].wp-right::before{top:calc(100% + 5px);left:auto;right:-4px}`
const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  const found = []
  for (const it of items) {
    const all = [...document.querySelectorAll(it.sel)].filter(e => e.getBoundingClientRect().width > 1)
    const list = it.all ? all : all.slice(it.nth || 0, (it.nth || 0) + 1)
    if (!list.length) { found.push(it.n + ': MISSING ' + it.sel); continue }
    /* a tag that would sit above the day's own clipped top edge goes under it instead */
    list.forEach((e, i) => { e.setAttribute('data-wpn', i ? '' : it.n); if (it.new) e.classList.add('wp-new'); if (it.left) e.classList.add('wp-left'); if (it.right) e.classList.add('wp-right') })
    found.push(it.n + ' ×' + list.length + ': ' + (list[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120))
  }
  return found
}, [items, MARK_CSS])
const unmark = page => page.evaluate(() => document.querySelectorAll('[data-wpn]').forEach(e => { e.removeAttribute('data-wpn'); e.classList.remove('wp-new', 'wp-left', 'wp-right') }))
const boxOf = (page, sels, pad = 10) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  if (L > R) return null
  return { x: Math.max(0, L - pad), y: Math.max(0, T - pad - 14), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad + 14 }
}, [sels, pad])
const cap = (b, h) => b && { ...b, height: Math.min(b.height, h) }
const shot = async (page, name, clip) => { if (!clip) { errs.push(name + ': nothing to clip'); return } await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true }); facts.pictures = (facts.pictures || []).concat(name + '.png') }
const heights = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => [s, [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 1).map(e => Math.round(e.getBoundingClientRect().height))])), sels)
const textOf = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent.replace(/\s+/g, ' ').trim()), sel)

/* THE PROPOSED CHANGES, drawn on the page */
const AFTER = {
  /* Q1: an unpublished day's read-only "Draft" stamp goes (never the "Working draft" or stored-draft stamp — not doubled) */
  draftStamp: sel => [...document.querySelectorAll(sel + ' .dbeak.ro:not(.work)')].filter(b => /^Draft$/.test(b.textContent.trim())).map(b => { b.remove(); return 'removed' }),
  /* Q2: the peek's line — A the label alone, B the dash a colon */
  peekA: () => [...document.querySelectorAll('.peek-nextwk')].map(p => { p.textContent = 'Next week'; return p.textContent }),
  peekB: () => [...document.querySelectorAll('.peek-nextwk')].map(p => { p.textContent = 'Next week: click a day to load it'; return p.textContent }),
  /* Q3: the two "· accepted" / "· removed" markers made real spans with the stylesheet's own look, so a ring can hold one */
  realMarkers: () => {
    if (!document.getElementById('wp-nomark')) { const s = document.createElement('style'); s.id = 'wp-nomark'; s.textContent = '.pl-row .ntx::after,.pl-row .rk-till::after{content:none !important}'; document.head.append(s) }
    const out = []
    for (const row of document.querySelectorAll('#eWeek .pl-row.accd, #eWeek .pl-row.inp-dorm')) {
      if (row.querySelector('.wp-mk')) continue
      for (const el of row.querySelectorAll('.ntx, .rk-till')) {
        document.getElementById('wp-nomark').disabled = true
        const ps = getComputedStyle(el, '::after'); const c = ps.content
        const look = { fontSize: ps.fontSize, letterSpacing: ps.letterSpacing, color: ps.color, fontWeight: ps.fontWeight, display: ps.display, whiteSpace: ps.whiteSpace }
        document.getElementById('wp-nomark').disabled = false
        if (!c || c === 'none' || c === 'normal') continue
        const sp = document.createElement('span'); sp.className = 'wp-mk' + (el.closest('.rmk') ? ' wp-mk-rmk' : ' wp-mk-nm')
        sp.textContent = JSON.parse(c); Object.assign(sp.style, look); el.append(sp); out.push((el.closest('.rmk') ? 'rmk' : 'name') + ':' + sp.textContent)
      }
    }
    return out
  },
  /* Q3: the remark's marker goes; the one after the type stays */
  dropRmkMarker: () => [...document.querySelectorAll('.wp-mk-rmk')].map(s => { s.remove(); return 'removed' }),
  /* Q4: the placeholders heading */
  dragIn: () => [...document.querySelectorAll('.rh2')].filter(h => /drag in/.test(h.textContent)).map(h => { h.textContent = 'Placeholders'; return h.textContent }),
}
const apply = (page, key, arg) => page.evaluate(([src, arg]) => (0, eval)('(' + src + ')')(arg), [AFTER[key].toString(), arg])

async function signIn(page, to) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(to => window.go(to), to); await page.waitForTimeout(800)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'; scrollTo(0, 0) })
}

for (const size of [{ tag: 'desk', viewport: { width: 1440, height: 3200 }, dsf: 2 }, { tag: 'phone', viewport: { width: 390, height: 3600 }, dsf: 3, touch: true }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size.tag} console: ` + m.text().slice(0, 200)) })
  const T = size.tag

  /* ── Q1. View-only Sched: Monday's head ── */
  await signIn(page, 'viewsched')
  const VH = '#vWeek .day[data-day="0"] .day-head'
  const headFrame = async () => { const b = await boxOf(page, [VH], 8); return b && { ...b, height: b.height + 18 } }
  facts[T + ' Q1 head text before'] = await textOf(page, VH)
  facts[T + ' Q1 found'] = await mark(page, [{ n: '1', sel: `${VH} .dbeak.ro`, left: true }])
  facts[T + ' Q1 day heads with both DRAFT and Draft'] = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day:not(.peek) .day-head')].filter(h => h.querySelector('.verchip.draft') && [...h.querySelectorAll('.dbeak.ro')].some(b => b.textContent.trim() === 'Draft')).length + ' of ' + document.querySelectorAll('#vWeek .day:not(.peek) .day-head').length)
  facts[T + ' Q1 height before'] = await heights(page, [VH])
  if (!(await page.$(`${VH} .verchip.draft`))) fail(T + ' Q1: Monday has no DRAFT tag')
  await shot(page, `${T}-q1-draft-before`, await headFrame())
  await unmark(page)
  facts[T + ' Q1 after'] = await apply(page, 'draftStamp', VH)
  facts[T + ' Q1 head text after'] = await textOf(page, VH)
  facts[T + ' Q1 height after'] = await heights(page, [VH])
  await shot(page, `${T}-q1-draft-after`, await headFrame())

  /* ── Q2. the next-week peek (desktop only — a phone draws none) ── */
  await signIn(page, 'viewsched')
  /* the same line on Edit Schedule's week — one builder draws both; read before anything is drawn on the page */
  facts[T + ' Q2 the line on Edit Schedule too'] = await page.evaluate(() => [...document.querySelectorAll('#eWeek .peek-nextwk')].map(e => e.textContent))
  facts[T + ' Q2 peek days drawn'] = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day.peek')].filter(d => d.getBoundingClientRect().width > 1).length)
  if (T === 'desk') {
    /* bring the boundary into view: Sunday and the first peek day side by side */
    await page.evaluate(() => { const p = document.querySelector('#vWeek .day.peek'); p.scrollIntoView({ inline: 'end', block: 'nearest' }); scrollTo(0, 0) })
    await page.waitForTimeout(300)
    const peekFrame = async () => cap(await boxOf(page, ['#vWeek .day[data-day="6"]', '#vWeek .day.peek[data-peek-day="0"]'], 8), 560)
    facts[T + ' Q2 found'] = await mark(page, [{ n: '2', sel: '#vWeek .peek-nextwk', right: true }])
    facts[T + ' Q2 height before'] = await heights(page, ['#vWeek .day.peek[data-peek-day="0"] .day-head'])
    await shot(page, `${T}-q2-peek-before`, await peekFrame())
    await unmark(page)
    facts[T + ' Q2 after A'] = await apply(page, 'peekA')
    facts[T + ' Q2 height after A'] = await heights(page, ['#vWeek .day.peek[data-peek-day="0"] .day-head'])
    await mark(page, [{ n: '2 A', sel: '#vWeek .peek-nextwk', new: true, right: true }])
    await shot(page, `${T}-q2-peek-after-a`, await peekFrame())
    await unmark(page)
    facts[T + ' Q2 after B'] = await apply(page, 'peekB')
    facts[T + ' Q2 height after B'] = await heights(page, ['#vWeek .day.peek[data-peek-day="0"] .day-head'])
    await mark(page, [{ n: '2 B', sel: '#vWeek .peek-nextwk', new: true, right: true }])
    await shot(page, `${T}-q2-peek-after-b`, await peekFrame())
    await unmark(page)
  }

  /* ── Q3. Edit Schedule: Monday's Personal Inputs, the accepted rows ── */
  await signIn(page, 'editsched')
  await page.evaluate(() => document.querySelector('#eWeek [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  const D = '#eWeek .day[data-day="0"]'
  await page.evaluate(D => { const h = [...document.querySelectorAll(D + ' .sub-h')].find(h => /^\W*Personal Inputs/.test(h.textContent)); const sec = h?.closest('.sub'); if (sec) sec.id = 'wpw-pinp' }, D)
  const ROWS = '#wpw-pinp .pl-row.accd'
  const piFrame = async () => cap(await boxOf(page, ['#wpw-pinp'], 6), T === 'desk' ? 420 : 900)
  const h0 = await heights(page, ['#wpw-pinp', ROWS])
  facts[T + ' Q3 rows text (stylesheet markers)'] = await page.evaluate(R => [...document.querySelectorAll(R)].map(r => [...r.querySelectorAll('.ntx, .rk-till')].map(e => e.textContent.trim() + (getComputedStyle(e, '::after').content.replace(/^none$/, '') || '')).join(' | ')), ROWS)
  /* the rows exactly as built, nothing drawn on them — the proof that the stylesheet's own markers look as the marked picture does */
  await shot(page, `${T}-q3-accepted-asbuilt`, await piFrame())
  facts[T + ' Q3 made real'] = await apply(page, 'realMarkers')
  const h1 = await heights(page, ['#wpw-pinp', ROWS])
  facts[T + ' Q3 heights: stylesheet markers / real spans'] = [h0, h1]
  if (JSON.stringify(h0) !== JSON.stringify(h1)) fail(T + ' Q3: making the markers real changed a height')
  facts[T + ' Q3 found'] = await mark(page, [{ n: T === 'phone' ? '' : '3', sel: `${ROWS} .wp-mk-rmk`, all: true, left: true }])
  await shot(page, `${T}-q3-accepted-before`, await piFrame())
  await unmark(page)
  facts[T + ' Q3 after'] = (await apply(page, 'dropRmkMarker')).length + ' removed'
  facts[T + ' Q3 rows text after'] = await textOf(page, ROWS)
  facts[T + ' Q3 heights after'] = await heights(page, ['#wpw-pinp', ROWS])
  await shot(page, `${T}-q3-accepted-after`, await piFrame())
  /* a REJECTED row — press the real Reject on the first accepted row (this browser's throwaway copy of the demo data) */
  await signIn(page, 'editsched')
  await page.evaluate(() => document.querySelector('#eWeek [data-pitog="0"]')?.click()); await page.waitForTimeout(400)
  await page.evaluate(D => { const h = [...document.querySelectorAll(D + ' .sub-h')].find(h => /^\W*Personal Inputs/.test(h.textContent)); const sec = h?.closest('.sub'); if (sec) sec.id = 'wpw-pinp' }, D)
  const rej = page.locator('#wpw-pinp .pl-row.accd .accb.undo').first()
  facts[T + ' Q3 reject pressed on'] = await rej.evaluate(b => b.closest('.pl-row').innerText.replace(/\s+/g, ' '))
  await rej.click(); await page.waitForTimeout(600)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
  await page.evaluate(D => { const h = [...document.querySelectorAll(D + ' .sub-h')].find(h => /^\W*Personal Inputs/.test(h.textContent)); const sec = h?.closest('.sub'); if (sec) sec.id = 'wpw-pinp' }, D)
  const DORM = '#wpw-pinp .pl-row.inp-dorm'
  facts[T + ' Q3 removed row (stylesheet markers)'] = await page.evaluate(R => [...document.querySelectorAll(R)].map(r => [...r.querySelectorAll('.ntx, .rk-till')].map(e => e.textContent.trim() + (getComputedStyle(e, '::after').content.replace(/^none$/, '') || '')).join(' | ')), DORM)
  if (!(await page.$(DORM))) fail(T + ' Q3: Reject made no removed row')
  else {
    const dFrame = async () => { const b = await boxOf(page, [DORM], 6); return b && { ...b, y: b.y - 6, height: b.height + 6 } }
    const d0 = await heights(page, [DORM])
    await apply(page, 'realMarkers')
    const d1 = await heights(page, [DORM])
    facts[T + ' Q3 removed row heights: stylesheet / real / after'] = [d0, d1]
    if (JSON.stringify(d0) !== JSON.stringify(d1)) fail(T + ' Q3: making the removed row\'s markers real changed its height')
    await mark(page, [{ n: '3', sel: `${DORM} .wp-mk-rmk`, all: true, left: true }])
    await shot(page, `${T}-q3-removed-before`, await dFrame())
    await unmark(page)
    await apply(page, 'dropRmkMarker')
    facts[T + ' Q3 removed row after'] = await textOf(page, DORM)
    facts[T + ' Q3 removed row heights: stylesheet / real / after'].push(await heights(page, [DORM]))
    await shot(page, `${T}-q3-removed-after`, await dFrame())
  }

  /* ── Q4. the crew panel's placeholders heading (on a phone the panel is a drawer behind its AIRCREW tab — opened first) ── */
  await signIn(page, 'editsched')
  facts[T + ' Q4 drawer'] = await page.evaluate(() => { const ph = [...document.querySelectorAll('#eRoster .rh2')].find(h => /Placeholders/.test(h.textContent)); const r = ph?.getBoundingClientRect(); return r && r.width > 1 && r.left >= 0 && r.right <= innerWidth ? 'open' : 'closed' })
  if (facts[T + ' Q4 drawer'] === 'closed') { await page.click('#rosTab'); await page.waitForTimeout(600); await page.evaluate(() => scrollTo(0, 0)) }
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('#eRoster .rh2')].find(h => /Placeholders/.test(h.textContent)); h.closest('.rall').id = 'wp-ph'
    /* the next heading in the panel ("Pilots · 6 free") — to show the panel's other headings carry no such hint */
    const nx = [...document.querySelectorAll('#eRoster *')].filter(e => /^Pilots\s*·\s*\d+\s*free$/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 1).pop(); if (nx) nx.id = 'wp-next'
  })
  const crewFrame = async () => page.evaluate(() => {
    const ph = document.getElementById('wp-ph').getBoundingClientRect(), nx = (document.getElementById('wp-next') || document.getElementById('wp-ph')).getBoundingClientRect()
    const L = Math.max(0, ph.left - 14), R = Math.min(innerWidth, Math.max(ph.right, nx.right) + 10)
    return { x: L, y: Math.max(0, ph.top + scrollY - 56), width: R - L, height: nx.bottom - ph.top + 56 + 10 }
  })
  facts[T + ' Q4 drawer after opening'] = await page.evaluate(() => { const r = document.querySelector('#wp-ph .rh2').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth ? 'open' : 'still closed' })
  if (facts[T + ' Q4 drawer after opening'] !== 'open') fail(T + ' Q4: the crew panel is not open')
  facts[T + ' Q4 crew headings'] = await textOf(page, '.rh2')
  facts[T + ' Q4 found'] = await mark(page, [{ n: '4', sel: '#wp-ph .rh2' }])
  facts[T + ' Q4 height before'] = await heights(page, ['#wp-ph'])
  await shot(page, `${T}-q4-dragin-before`, await crewFrame())
  await unmark(page)
  facts[T + ' Q4 after'] = await apply(page, 'dragIn')
  facts[T + ' Q4 height after'] = await heights(page, ['#wp-ph'])
  await shot(page, `${T}-q4-dragin-after`, await crewFrame())

  /* ── considered and left: two lines, before only ── */
  await signIn(page, 'editsched')
  await page.evaluate(() => { const s = document.querySelector('#eWeek .day[data-day="0"] .blknote.ed'); if (s) s.id = 'wp-note' })
  facts[T + ' left: empty note boxes on the week'] = await page.evaluate(() => [...document.querySelectorAll('#eWeek .blknote.ed')].filter(n => !n.textContent.trim() && n.getBoundingClientRect().width > 1).length)
  /* unmarked: the ring's numbered tag would take the box's own ::before, which is where "No notes yet." is drawn */
  await shot(page, `${T}-left-nonotes`, await page.evaluate(() => { const n = document.getElementById('wp-note'); const h = n.previousElementSibling; const a = h.getBoundingClientRect(), b = n.getBoundingClientRect(); return { x: Math.max(0, a.left - 8), y: a.top + scrollY - 22, width: Math.max(a.width, b.width) + 16, height: b.bottom - a.top + 30 } }))
  await signIn(page, 'viewsched')
  await page.evaluate(() => { const n = document.querySelector('#vWeek .day[data-day="4"] .nobox'); if (n) { n.id = 'wp-ground'; n.scrollIntoView({ inline: 'center', block: 'nearest' }); scrollTo(0, n.getBoundingClientRect().top + scrollY - 200) } })
  await page.waitForTimeout(300)
  await shot(page, `${T}-left-groundday`, await boxOf(page, ['#wp-ground'], 10))
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify({ ...facts, errors: errs }, null, 1))
console.log(JSON.stringify(facts, null, 1).slice(0, 9000))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
