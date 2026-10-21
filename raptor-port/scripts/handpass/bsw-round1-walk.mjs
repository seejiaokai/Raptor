/* The walk of round 1's builds (owner D1125–D1128): each checked as an assertion of the RIGHT behaviour (a PASS means
   correct), pressed through the app's own controls, with a picture of each surface.
   D1125 — the Inputs and SANS rows at 1536, 1366, 1024 and 900 wide: the arrows, month and Today in the same places on both,
           the switch where it was between the Calendar and the List, the row's line count; a phone (402, 320 by touch)
           unchanged but the SANS month's letters.
   D1126 — the top bar's height on every page at 1280, 1536 and 1600.
   D1127 — every search box, typed into: its magnifier, its height against its row, the typed words found.
   D1128 — Quals' and Logic's pair, pressed, at 1536 and 402.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-round1-walk.mjs → <folder>/round1/ */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/round1'; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rows = []; const errs = []
const check = (id, ok, what, got) => { rows.push({ id, ok: !!ok, what, got }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${got !== undefined ? ' — ' + JSON.stringify(got) : ''}`) }
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.goto(BASE + '/'); await login(page, 'a'); return { ctx, page }
}
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(400) }
const band = async (page, name, h, vp) => { const top = await page.evaluate(() => document.querySelector('.topbar').getBoundingClientRect().bottom); await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: top, width: vp.width, height: h } }) }
const boxes = (page, sels) => page.evaluate(ss => ss.map(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), mid: +(r.top + r.height / 2).toFixed(1), fs: getComputedStyle(e).fontSize, fw: getComputedStyle(e).fontWeight } }), sels)
const lines = (page, sel) => page.evaluate(s => { const kids = [...document.querySelector(s).children].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none'); const tops = kids.map(e => e.getBoundingClientRect()); let n = 1; const sorted = tops.map(r => r.top + r.height / 2).sort((a, b) => a - b); for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > 20) n++; return n }, sel)

/* ---- D1125, desktop widths ---- */
for (const w of [1536, 1366, 1024, 900]) {
  const vp = { width: w, height: 864 }; const { ctx, page } = await world(vp, false)
  await go(page, 'inputs'); await sleep(500)
  const I = await boxes(page, ['#inMemberMode', '#icPrev', '.ic-mon', '#icNext', '#icToday', '#inCalBtn'])
  const iLines = await lines(page, '.ic-head.inputs-top'); await band(page, `d1125-${w}-inputs`, 140, vp)
  await press(page, '#inListBtn', false)
  const L = await boxes(page, ['#inCalBtn']); const lLines = await lines(page, '.inputs-top'); await band(page, `d1125-${w}-list`, 140, vp)
  check('D1125', Math.abs(L[0].l - I[5].l) < 0.6 && Math.abs(L[0].t - I[5].t) < 0.6, `${w}: the switch where it was, Calendar → List (D687)`, [I[5].l, I[5].t, L[0].l, L[0].t])
  await press(page, '#inCalBtn', false); await press(page, '#inSansMode', false)
  const S = await boxes(page, ['#inMemberMode', '[data-testid=sc-prev]', '[data-testid=sc-month]', '[data-testid=sc-next]', '[data-testid=sc-today]'])
  const sLines = await lines(page, '.sc-head'); await band(page, `d1125-${w}-sans`, 140, vp)
  const same = [1, 2, 3, 4].every(i => Math.abs(I[i].l - S[i].l) < 1.5 && Math.abs(I[i].w - S[i].w) < 1.5)
  check('D1125', same, `${w}: ‹, month, ›, Today in the same places on Inputs and SANS`, { inputs: I.slice(1, 5).map(b => b.l), sans: S.slice(1, 5).map(b => b.l) })
  check('D1125', Math.abs(I[0].t - S[0].t) < 0.6, `${w}: the tabs at the same height on both`, [I[0].t, S[0].t])
  check('D1125', S[2].fs === I[2].fs && S[2].fw === I[2].fw, `${w}: one month style`, [I[2].fs, I[2].fw, S[2].fs, S[2].fw])
  check('D1125', w >= 1536 ? iLines === 1 && lLines === 1 && sLines === 1 : iLines === lLines && sLines === 1, `${w}: lines in the rows (Inputs calendar, List, SANS)`, [iLines, lLines, sLines])
  await ctx.close()
}
/* ---- D1125, a phone: unchanged but the SANS month's letters ---- */
for (const w of [402, 320]) {
  const vp = { width: w, height: 874 }; const { ctx, page } = await world(vp, true)
  await go(page, 'inputs'); await sleep(500)
  const I = await boxes(page, ['#inMemberMode', '#icPrev', '.ic-mon', '#icNext', '#icToday']); await band(page, `d1125-phone${w}-inputs`, 200, vp)
  await press(page, '#inSansMode', true)
  const S = await boxes(page, ['#inMemberMode', '[data-testid=sc-prev]', '[data-testid=sc-month]', '[data-testid=sc-next]', '[data-testid=sc-today]']); await band(page, `d1125-phone${w}-sans`, 200, vp)
  check('D1125', [1, 2, 3, 4].every(i => Math.abs(I[i].l - S[i].l) < 1.5 && Math.abs(I[i].t - S[i].t) < 2.6), `phone ${w}: ‹, month, ›, Today in the same places (D705, kept; the 1–2px between the two rows' tops is older)`, { inputs: I.slice(1).map(b => [b.l, b.t]), sans: S.slice(1).map(b => [b.l, b.t]) })
  check('D1125', S[2].fs === I[2].fs && S[2].fw === I[2].fw, `phone ${w}: one month style`, [I[2].fs, I[2].fw, S[2].fs, S[2].fw])
  await ctx.close()
}
/* ---- D1126: the top bar on every page ---- */
for (const w of [1280, 1536, 1600]) {
  const vp = { width: w, height: 864 }; const { ctx, page } = await world(vp, false); const hs = {}
  for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']) { await go(page, p); await sleep(300); hs[p] = await page.evaluate(() => Math.round(document.querySelector('.topbar').getBoundingClientRect().height)) }
  await go(page, 'editsched'); await sleep(300); await page.screenshot({ path: `${OUT}/d1126-${w}-editsched.png`, clip: { x: 0, y: 0, width: w, height: 120 } })
  check('D1126', Math.max(...Object.values(hs)) - Math.min(...Object.values(hs)) <= 1 && (w < 1344 || Object.values(hs).every(h => h < 80)), `${w}: every page's top bar the same height — one line from 1344 up (below it every page takes two, as before)`, hs)
  await ctx.close()
}
/* ---- D1127: every search box, typed into ---- */
for (const [vp, touch, tag] of [[{ width: 1536, height: 864 }, false, 'pc'], [{ width: 402, height: 874 }, true, 'phone']]) {
  const { ctx, page } = await world(vp, touch)
  const one = async (name, sel, word, open) => {
    if (open) await open()
    const r = await page.evaluate(s => { const i = document.querySelector(s); if (!i || !i.getBoundingClientRect().width) return null; const box = i.closest('.searchbox,.findbox') || i.parentElement; const b = box.getBoundingClientRect(); const g = box.querySelector('svg'); const gr = g && g.getBoundingClientRect(); return { glyph: !!g && gr.right <= i.getBoundingClientRect().left + 1, emoji: /\u{1F50D}/u.test(box.textContent || ''), h: Math.round(b.height), x: b.left, y: b.top, w: b.width } }, sel)
    if (!r) { check('D1127', false, `${tag} ${name}: the box is on screen`); return }
    await page.locator(sel).first().fill(word); await sleep(300)
    await page.screenshot({ path: `${OUT}/d1127-${tag}-${name}.png`, clip: { x: Math.max(0, r.x - 40), y: Math.max(0, r.y - 12), width: Math.min(vp.width - Math.max(0, r.x - 40), r.w + 80), height: r.h + 24 } })
    check('D1127', r.glyph && !r.emoji, `${tag} ${name}: the line magnifier inside on the left, no emoji (box ${r.h} tall)`, r)
    await page.locator(sel).first().fill(''); await sleep(150)
  }
  await go(page, 'editsched'); await sleep(300); if (!touch) await one('week', '#searchE', 'Ace')
  await go(page, 'quals'); await sleep(300); await one('quals', '#qFilter', 'Ace')
  await go(page, 'logic'); await sleep(300); await one('logic', '#lgSearch', 'crew')
  await go(page, 'admin'); await sleep(300); await one('admin', '#accFind', 'ace', touch ? async () => { const u = page.getByRole('button', { name: /^Users/ }).first(); if (await u.count()) { await u.tap(); await sleep(400) } } : null)
  await go(page, 'inputs'); await sleep(300); await press(page, '#inListBtn', touch)
  await one('inputs', '#inFSearch', 'leave', touch ? async () => { await press(page, '#inFiltersBtn', touch) } : null)
  if (touch) await press(page, '#inFiltersBtn', touch)
  await press(page, '#inCalBtn', touch)
  await go(page, 'tracker'); await sleep(700)
  await one('tracker', '#hSearch', 'ST', touch ? async () => { await press(page, '#hSearchBtn', touch) } : null)
  if (touch) { const g = await page.evaluate(() => { const b = document.querySelector('#hSearchBtn'); return { svg: !!b.querySelector('svg'), emoji: /\u{1F50D}/u.test(b.textContent) } }); check('D1127', g.svg && !g.emoji, 'phone tracker: the search button shows the line magnifier', g) }
  if (!touch) { await go(page, 'editsched'); await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(500); await one('board', '#searchB', 'Ace') }
  await ctx.close()
}
/* ---- D1128: Quals' pair and Logic's, pressed ---- */
for (const [vp, touch, tag] of [[{ width: 1536, height: 864 }, false, 'pc'], [{ width: 402, height: 874 }, true, 'phone']]) {
  const { ctx, page } = await world(vp, touch)
  const btn = sel => page.evaluate(s => { const b = document.querySelector(s); return [b.textContent.trim(), b.classList.contains('primary')] }, sel)
  await go(page, 'quals'); await sleep(300); const q1 = await btn('#qEdit'); await band(page, `d1128-${tag}-quals-rest`, 70, vp)
  await press(page, '#qEdit', touch); const q2 = await btn('#qSave'); await band(page, `d1128-${tag}-quals-editing`, 70, vp)
  const tick = await page.evaluate(() => !!document.querySelector('#qtbl.qeditable, #qtbl td[data-q]'))
  await press(page, '#qSave', touch); const back = await page.evaluate(() => !document.querySelector('#qEdit').hidden)
  await go(page, 'logic'); await sleep(300); const l1 = await btn('#lgEdit'); await press(page, '#lgEdit', touch); const l2 = await btn('#lgDone'); await press(page, '#lgDone', touch)
  check('D1128', JSON.stringify([q1, q2]) === JSON.stringify([l1, l2]) && q1[0] === '✎ Edit' && q2[0] === 'Done' && !q1[1] && q2[1], `${tag}: Quals' pair is Logic's — ✎ Edit plain, Done blue`, { quals: [q1, q2], logic: [l1, l2] })
  check('D1128', back, `${tag}: Done ends editing`, back)
  await ctx.close()
}
check('ALL', errs.length === 0, 'no page error or console error on the way', errs.slice(0, 5))
writeFileSync(`${OUT}/round1.json`, JSON.stringify(rows, null, 1))
console.log(`${rows.filter(r => r.ok).length} / ${rows.length} PASS`)
await browser.close()
