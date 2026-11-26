/* Opens the built page (index.html, served by a throwaway static server on a free port) at his iPhone's size (402, WebKit)
   and a desktop's (1536, Chromium), presses the try-out's settings and pictures each state into check/ for the maker to
   look at. Fails on a page error, a missing picture or a setting that changes nothing.
   Run from raptor-port/: node docs/mock/2026-11-26-al-colours/test.mjs */
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { dirname, join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, readFileSync, existsSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const { chromium, webkit } = createRequire(join(HERE, '../../../package.json'))('@playwright/test')
const OUT = join(HERE, 'check'); mkdirSync(OUT, { recursive: true })
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png' }
const srv = createServer((q, r) => { const f = join(HERE, normalize(decodeURIComponent(q.url.split('?')[0])).replace(/^[\\/]+/, '') || 'index.html')
  if (!f.startsWith(HERE) || !existsSync(f)) { r.writeHead(404); return r.end() }
  r.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f)) })
await new Promise(ok => srv.listen(0, '127.0.0.1', ok))
const URL_ = `http://127.0.0.1:${srv.address().port}/index.html`
const problems = []
const SIZES = [['desktop', chromium, { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 }], ['phone', webkit, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]
for (const [name, eng, opts] of SIZES) {
  const b = await eng.launch(), p = await (await b.newContext(opts)).newPage()
  p.on('pageerror', e => problems.push(name + ' PAGE ' + e.message))
  p.on('console', m => { if (m.type() === 'error') problems.push(name + ' CONSOLE ' + m.text()) })
  p.on('response', r => { if (r.status() >= 400) problems.push(name + ' ' + r.status() + ' ' + r.url()) })
  await p.goto(URL_); await p.waitForTimeout(500)
  const press = async (set, val) => { if (name === 'phone' && !(await p.locator('.tt-strip.open').count())) await p.click('#ttMore'); await p.click(`[data-set="${set}"][data-val="${val}"]`); await p.waitForTimeout(200) }
  const stageShot = async file => { await p.evaluate(() => { const s = document.querySelector('.tt-surf.on'), a = s.querySelector('[data-txt="ap:0.0.prog"], [data-bfld="ap:0.0.prog"]') || s.querySelector('[data-alc]:not(.verchip)')
      a.scrollIntoView({ block: 'center' }); if (s.dataset.surf !== 'board') window.scrollBy(0, 180) }); await p.waitForTimeout(300)
    await p.screenshot({ path: join(OUT, `${file}-${name}.png`) }) }
  const sig = () => p.evaluate(() => { const s = document.querySelector('.tt-surf.on'); const e = s.querySelector('[data-alc]:not(.verchip):not(.seat), [data-aln]:not(.seat)'), seat = s.querySelector('.seat[data-alc], .seat[data-aln]')
    const cs = getComputedStyle(e), a = getComputedStyle(seat, '::after')
    return [s.dataset.surf, s.dataset.st, cs.color, cs.textDecorationLine, cs.outlineStyle, a.content, a.width, a.backgroundColor, getComputedStyle(seat.querySelector('.nm')).color, !!s.querySelector('.alx-key'), getComputedStyle(document.getElementById('ttStage')).filter].join(' | ') })
  await p.screenshot({ path: join(OUT, `top-${name}.png`) })
  const seen = new Set()
  const step = async (label, set, val, file) => { await press(set, val); const s = await sig(); if (seen.has(s)) problems.push(`${name}: "${label}" changed nothing`); seen.add(s); console.log(name, label, '→', s); if (file) await stageShot(file) }
  seen.add(await sig()); await stageShot('edit-today')
  await step('Colour only', 'look', 'b', 'edit-b')
  await step('My recommendation', 'look', 'c', 'edit-c')
  await step('All four out', 'st', 'out', null)
  await step('Colour-blind', 'cb', 'on', 'edit-c-cb')
  await press('cb', 'off'); await press('st', 'waiting')
  await step('Number only', 'puck', 'num', null)
  await step('Today’s colours', 'pal', 'today', null)
  await step('View Schedule', 'surf', 'view', 'view-mix')
  await step('Scheduler Board', 'surf', 'board', null)
  await press('look', 'c'); await stageShot('board-c')
  await press('look', 'a'); await stageShot('board-today')
  /* a swatch: AL1 → the first colour offered that is not its own */
  if (name === 'phone' && !(await p.locator('.tt-strip.open').count())) await p.click('#ttMore')
  await p.click('.tt-sw[data-n="1"]'); await p.click('.tt-cand[data-c="#FF9548"]'); await p.waitForTimeout(200)
  const c1 = await p.evaluate(() => getComputedStyle(document.querySelector('.tt-surf.on [data-alc="1"]')).getPropertyValue('--alc').trim())
  if (c1 !== '#FF9548') problems.push(name + ': the swatch did not change AL1 (' + c1 + ')')
  await p.click('#ttReset')
  /* the missing-time outline: red by default on the emptied END, grey on its setting, none when off or on View Schedule */
  await press('look', 'c'); await press('st', 'waiting'); await press('surf', 'edit')
  const missOf = () => p.evaluate(() => { const s = document.querySelector('.tt-surf.on'), e = s.querySelector('.et-miss'); return e ? getComputedStyle(e).boxShadow : 'none' })
  const mRed = await missOf(); await press('miss', 'grey'); const mGrey = await missOf(); await press('miss', 'off'); const mOff = await missOf(); await press('miss', 'red')
  if (mRed === 'none' || mGrey === 'none' || mRed === mGrey || mOff !== 'none') problems.push(`${name}: the missing-time outline setting is wrong (red ${mRed} | grey ${mGrey} | off ${mOff})`)
  await p.evaluate(() => document.querySelector('.tt-surf.on .et-miss').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300); await p.screenshot({ path: join(OUT, `miss-edit-${name}.png`) })
  await press('surf', 'view'); if (await missOf() !== 'none') problems.push(name + ': View Schedule shows a missing-time outline')
  /* THE CLEARANCE: under every line the recommendation draws, on each screen and in each state, at least 2px to the nearest
     thing below it, and never cut off (src/measure.js, loaded here for the test only; it is not part of the page) */
  await p.addScriptTag({ content: readFileSync(join(HERE, 'src/measure.js'), 'utf8') })
  let tight = { gap: 1e9 }, lines = 0
  for (const st of ['waiting', 'out']) for (const surf of ['edit', 'view', 'board']) { await press('st', st); await press('surf', surf)
    const rows = await p.evaluate(() => window.ALXmeasure('.tt-surf.on')); lines += rows.length
    if (!rows.length) problems.push(`${name}: no line found to measure on ${surf}, ${st}`)
    for (const r of rows) { if (r.gap != null && r.gap < tight.gap) tight = { ...r, surf, st }
      if ((r.gap != null && r.gap < 2) || (r.cut != null && r.cut < 0)) problems.push(`${name}: a line too close on ${surf}, ${st}: ${r.place} (${r.state}) gap ${r.gap} cut ${r.cut} → ${r.to}`) } }
  console.log(name, 'clearance:', lines, 'lines measured, tightest', tight.gap, 'px at', tight.place, '(' + tight.surf + ', ' + tight.st + ')')
  await p.click('#ttReset')
  /* the written part */
  for (const id of ['colours', 'pictures', 'clear', 'sims', 'missing', 'alike', 'q2']) { await p.evaluate(id => document.getElementById(id).scrollIntoView(), id); await p.waitForTimeout(500); await p.screenshot({ path: join(OUT, `page-${id}-${name}.png`) }) }
  const wide = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (wide > 1) problems.push(`${name}: the page scrolls sideways by ${wide}px`)
  const broken = await p.evaluate(async () => { const imgs = [...document.images]; imgs.forEach(i => { i.loading = 'eager' }); await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r }))); return imgs.filter(i => !i.naturalWidth).map(i => i.src) })
  if (broken.length) problems.push(name + ': pictures not loading: ' + broken.join(', '))
  await b.close()
}
srv.close()
console.log(problems.length ? 'PROBLEMS\n' + problems.join('\n') : 'no problems')
process.exit(problems.length ? 1 : 0)
