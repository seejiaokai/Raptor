/* Board layout walk, walker A (chat 11, 8 Nov 26): a jet's line on the desktop board, 821-1099 wide (D1781), and the
   plain-user round. Brief: docs/superpowers/briefs/2026-11-08-board-layout-walk.md. Served build: http://localhost:4180/.
   Run from raptor-port/:  node scripts/handpass/bl-walk-a.mjs   (ONLY=a1,a2 ... picks parts). Nothing here builds. */
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
console.log('bl-walk-a v1')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const OUT = path.join(ROOT, 'docs/img/handpass/2026-11-08-board-layout/walk/a')
const BASE = 'http://localhost:4180'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
if (!ONLY.length) { rmSync(OUT, { recursive: true, force: true }) }
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))
let N = readdirSync(OUT).filter(f => /^\d{3}-/.test(f)).length
const LOG = []
const say = s => { console.log(s); LOG.push(s) }
const chk = (id, ok, note) => say(`${ok ? 'PASS' : 'FAIL'} ${id} — ${note}`)

const cr = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let wk = null

async function world(vp, { dsf = 1, engine = 'chromium' } = {}) {
  let br = cr
  if (engine === 'webkit') { wk ||= await webkit.launch(); br = wk }
  let ctx
  if (dsf !== 1 && engine === 'chromium') {
    // a browser STARTED at the display scale (walk-scripts 7), never an emulated picture scale
    br = await chromium.launch({ ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), args: [`--force-device-scale-factor=${dsf}`, `--window-size=${vp.width},${vp.height}`] })
    ctx = await br.newContext({ viewport: null })
  } else ctx = await br.newContext({ viewport: vp, deviceScaleFactor: dsf })
  if (br !== cr && br !== wk) { const oc = ctx.close.bind(ctx); ctx.close = async () => { await oc(); await br.close() } }
  const page = await ctx.newPage()
  page.errs = []
  page.on('pageerror', e => { page.errs.push(e.message); say('PAGE ERROR ' + e.message) })
  await page.goto(BASE + '/')
  if (dsf !== 1) say(`   (page reports innerWidth ${await page.evaluate(() => innerWidth)}, devicePixelRatio ${await page.evaluate(() => devicePixelRatio)})`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' })
  await sleep(500)
  return { ctx, page }
}
const toPage = async (page, name) => {
  let l = page.locator(`[data-page="${name}"]:visible`)
  if (!(await l.count())) { await page.click('#burger'); await sleep(400); l = page.locator(`[data-page="${name}"]:visible`) }
  await l.first().click(); await sleep(800)
}
const toEdit = page => toPage(page, 'editsched')
const toView = page => toPage(page, 'viewsched')
async function openBoard(page, di = 0) {
  await toEdit(page)
  await page.click(`#eWeek .sb-open[data-sbday="${di}"]`)
  await page.waitForSelector('#schedBoard'); await sleep(700)
}
async function pic(page, name, clip = null) {
  N++
  const f = `${String(N).padStart(3, '0')}-${name}.png`
  const o = { path: path.join(OUT, f) }
  if (clip) { const vp = page.viewportSize() || await page.evaluate(() => ({ width: innerWidth, height: innerHeight })); const x = Math.max(0, Math.round(clip.x)), y = Math.max(0, Math.round(clip.y)); o.clip = { x, y, width: Math.min(Math.round(clip.w), vp.width - x), height: Math.min(Math.round(clip.h), vp.height - y) } }
  await page.screenshot(o)
  return f
}
/* scroll the board's list so the element's top stands at the foot of the board's top */
const standWave = (page, idx) => page.evaluate(i => {
  const g = document.querySelectorAll('.sb-go')[i]; g.scrollIntoView({ block: 'start' }); return g.getBoundingClientRect().top
}, idx)
const boardClip = page => page.evaluate(() => { const r = document.querySelector('.sb-boardwrap').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })

/* ---- the measure: every line of every wave, raw boxes ---- */
const MEASURE = () => {
  const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }
  const side = document.querySelector('.sb-side'), wrap = document.querySelector('.sb-boardwrap')
  const out = { vw: innerWidth, sideL: side ? R(side).l : null, sideW: side ? R(side).w : null, wrapR: R(wrap).r, waves: [] }
  document.querySelectorAll('.sb-go').forEach((go, gi) => {
    const w = { gi, title: go.querySelector('.sb-wtitle')?.value, rect: R(go), heads: [], lines: [], itimes: [] }
    const lc = go.querySelector('.sb-lcols')
    const first = go.querySelector('.sb-line')
    const textBox = el => { const g = document.createRange(); g.selectNodeContents(el); const r = g.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom } }
    if (lc && first) {
      for (const c of lc.children) {
        const cs = getComputedStyle(c)
        if (cs.display === 'none') continue
        const parts = c.classList.contains('sb-hrb') || c.classList.contains('sb-htl') ? [...c.children] : [c]
        for (const p of parts) {
          const label = p.textContent.trim(); if (!label) continue
          const r = R(p); if (r.w <= 0) continue
          w.heads.push({ label, box: r, text: textBox(p) })
        }
      }
    }
    go.querySelectorAll('.sb-line').forEach((ln, li) => {
      const L = { li, rect: R(ln), scrollW: ln.scrollWidth, clientW: ln.clientWidth }
      const q = (s, all) => all ? [...ln.querySelectorAll(s)].map(R) : (ln.querySelector(s) ? R(ln.querySelector(s)) : null)
      L.lin = q('.lin'); L.msn = q('.msn'); L.rb = q('.sb-rb input', 1); L.tl = q('.sb-tl input', 1)
      L.slots = q('.sb-slot', 1); L.rcell = q('.sb-rcell'); L.nts = q('.nts'); L.lctl = q('.lctl'); L.grip = q('.sb-grip')
      L.lctlBtns = q('.lctl button', 1)
      L.rcellKids = [...ln.querySelectorAll('.sb-rcell > *')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: e.className, ...R(e) }))
      L.badges = q('.sabadges')
      L.anyPuck = !!ln.querySelector('.puck')
      L.pucks = [...ln.querySelectorAll('.puck')].map(R)
      L.ntsClipped = ln.querySelector('.nts') ? false : null
      w.lines.push(L)
    })
    go.querySelectorAll('.itrow').forEach(it => {
      const kids = [...it.children].filter(e => e.getBoundingClientRect().width > 0).map(R)
      w.itimes.push({ rect: R(it), scrollW: it.scrollWidth, clientW: it.clientWidth, kids })
    })
    w.areas = [...go.querySelectorAll('.sb-area')].map(a => ({ rect: R(a), scrollW: a.scrollWidth, clientW: a.clientWidth }))
    out.waves.push(w)
  })
  return out
}
const ov = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1.5

/* judge one line in the stacked band (D1781) */
function judgeStacked(m, w, L) {
  const f = []
  const [r0, r1] = L.rb, [t0, t1] = L.tl
  if (!r0 || !r1 || !t0 || !t1) return ['time boxes missing']
  if (Math.abs(r0.l - r1.l) > 1 || r1.t < r0.b - 1) f.push(`R/B not one over the other (R ${r0.l | 0},${r0.t | 0} B ${r1.l | 0},${r1.t | 0})`)
  if (Math.abs(t0.l - t1.l) > 1 || t1.t < t0.b - 1) f.push(`TO/LD not one over the other`)
  if (Math.abs(r0.w - r1.w) > 1 || Math.abs(t0.w - t1.w) > 1) f.push(`pair widths differ R ${r0.w | 0}/B ${r1.w | 0} TO ${t0.w | 0}/LD ${t1.w | 0}`)
  if (Math.abs(r0.h - t0.h) > 1 || Math.abs(r1.h - t1.h) > 1 || Math.abs(r0.t - t0.t) > 1) f.push(`side-by-side boxes differ in height/top (R ${r0.h | 0} TO ${t0.h | 0}; B ${r1.h | 0} LD ${t1.h | 0})`)
  if (L.lin && L.msn && Math.abs(L.lin.h - L.msn.h) > 1) f.push(`CS ${L.lin.h | 0} vs MSN ${L.msn.h | 0} heights`)
  const timesBottom = Math.max(r1.b, t1.b)
  if (L.rcell.t < timesBottom - 1) f.push(`remarks not under the times (rcell top ${L.rcell.t | 0}, times foot ${timesBottom | 0})`)
  if (L.rcell.w <= 300) f.push(`remarks cell ${L.rcell.w | 0}px not over 300`)
  if (L.nts && L.nts.w <= 300 && !L.rcellKids.some(k => /sabadges/.test(k.cls))) f.push(`remarks box ${L.nts.w | 0}px not over 300`)
  const mid = (L.lctl.t + L.lctl.b) / 2
  if (L.lctl.l < L.rcell.r - 1) f.push(`buttons not beside the remarks (lctl left ${L.lctl.l | 0}, rcell right ${L.rcell.r | 0})`)
  if (mid < L.rcell.t - 2 || mid > L.rcell.b + 2) f.push(`buttons' middle ${mid | 0} outside the remarks row ${L.rcell.t | 0}-${L.rcell.b | 0}`)
  if (L.rect.r > m.sideL + 1) f.push(`line right ${L.rect.r | 0} over the crew column left ${m.sideL | 0}`)
  if (L.scrollW > L.clientW + 1) f.push(`line scrolls sideways (${L.scrollW} > ${L.clientW})`)
  for (const [k, v] of [['lin', L.lin], ['msn', L.msn], ['rcell', L.rcell], ['lctl', L.lctl], ...L.rb.map((v, i) => ['rb' + i, v]), ...L.tl.map((v, i) => ['tl' + i, v]), ...L.slots.map((v, i) => ['slot' + i, v])]) {
    if (v && v.r > L.rect.r + 1) f.push(`${k} cut off at right (${v.r | 0} > line ${L.rect.r | 0})`)
    if (v && v.b > L.rect.b + 1) f.push(`${k} cut off at foot`)
  }
  for (const k of L.rcellKids) if (k.r > L.rcell.r + 1) f.push(`remarks-cell part ${k.cls} runs past the cell (${k.r | 0} > ${L.rcell.r | 0})`)
  const parts = [['lin', L.lin], ['msn', L.msn], ['r', r0], ['b', r1], ['to', t0], ['ld', t1], ['rcell', L.rcell], ['lctl', L.lctl], ...L.slots.map((v, i) => ['slot' + i, v])].filter(x => x[1] && x[1].w > 0)
  for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) if (ov(parts[i][1], parts[j][1])) f.push(`${parts[i][0]} overlaps ${parts[j][0]}`)
  return f
}
/* judge a line at 1100 and wider: one line (D1029) */
function judgeOneLine(m, w, L) {
  const f = []
  const [r0, r1] = L.rb, [t0, t1] = L.tl
  if (!r0 || !r1 || !t0 || !t1) return ['time boxes missing']
  const rows = [r0.t, r1.t, t0.t, t1.t]
  if (Math.max(...rows) - Math.min(...rows) > 1) f.push(`times not in one row ${rows.map(x => x | 0)}`)
  if (!(r0.r <= r1.l + 1 && r1.r <= t0.l + 1 && t0.r <= t1.l + 1)) f.push('times not in the order R B TO LD left to right')
  if (L.rcell.l < t1.r - 1) f.push(`remarks not beside the times (rcell left ${L.rcell.l | 0} vs LD right ${t1.r | 0})`)
  if (L.lctl.l < L.rcell.r - 1) f.push('buttons not beside the remarks')
  if (L.rect.r > m.sideL + 1) f.push(`line over the crew column`)
  if (L.scrollW > L.clientW + 1) f.push('line scrolls sideways')
  return f
}
/* the headings of a wave against the first line's boxes: left edge and centre of the heading's words vs the box */
function judgeHeads(w) {
  const L = w.lines[0]; if (!L) return []
  const map = { CS: L.lin, MSN: L.msn, R: L.rb[0], B: L.rb[1], TO: L.tl[0], LD: L.tl[1], START: L.tl[0], END: L.tl[1], FCP: L.slots[0], RCP: L.slots[1], Notes: L.rcell }
  const res = []
  for (const h of w.heads) {
    const bx = map[h.label]; if (!bx || bx.w <= 0) { res.push({ label: h.label, note: 'no box to compare' }); continue }
    const hc = (h.text.l + h.text.r) / 2, bc = (bx.l + bx.r) / 2
    res.push({ label: h.label, dLeft: +(h.text.l - bx.l).toFixed(1), dCentre: +(hc - bc).toFixed(1) })
  }
  return res
}
const fmtH = hs => hs.map(h => h.note ? `${h.label}:${h.note}` : `${h.label}(L${h.dLeft}/C${h.dCentre})`).join(' ')

/* ============================================================================ A1 / A4 / A5 sizes */
async function widthWalk(w, { dsf = 1, h = 900, engine = 'chromium', tag = '', withSC = true } = {}) {
  const { ctx, page } = await world({ width: w, height: h }, { dsf, engine })
  await openBoard(page, 0)
  say(`-- ${w}x${h} ${engine} dsf${dsf} ${tag}`)
  if (withSC) {
    // a standby wave through + Wave
    await page.click('[data-wvadd]:visible'); await sleep(300)
    await page.locator('button.wm[data-wmkind="sc"]').click(); await sleep(700)
  }
  const m = await page.evaluate(MEASURE)
  const band = w >= 821 && w <= 1099, wide = w >= 1100
  say(`   crew column left ${m.sideL | 0} (width ${m.sideW | 0}), board list right ${m.wrapR | 0}; ${m.waves.length} waves: ${m.waves.map(x => `${x.title}:${x.lines.length}`).join(' ')}`)
  let bad = 0, total = 0
  for (const wv of m.waves) {
    for (const L of wv.lines) {
      total++
      const f = band ? judgeStacked(m, wv, L) : wide ? judgeOneLine(m, wv, L) : []
      if (f.length) { bad++; say(`   FAIL ${wv.title} line ${L.li}: ${f.join('; ')}`) }
    }
  }
  const sample = m.waves[0].lines[0]
  say(`   sample line (1st wave, line 0): height ${sample.rect.h | 0}, width ${sample.rect.w | 0}, remarks ${sample.rcell.w | 0}px, rcell top ${sample.rcell.t | 0} times foot ${Math.max(sample.rb[1].b, sample.tl[1].b) | 0}`)
  chk(`A1/A2/A4 ${w}`, bad === 0 && total > 0, `${total - bad} of ${total} lines judged ${band ? 'stacked' : wide ? 'one-row' : 'phone (not judged by rule)'} fine`)
  for (const wv of m.waves) say(`   heads ${wv.title}: ${fmtH(judgeHeads(wv))}`)
  // in-time rows
  let itBad = 0, itTot = 0
  for (const wv of m.waves) for (const it of wv.itimes) { itTot++; if (it.scrollW > it.clientW + 1 || it.rect.r > wv.rect.r + 1 || it.rect.r > m.sideL + 1) itBad++ }
  say(`   in-time rows ${itTot}, cut/over: ${itBad}`)
  // pictures: the first wave's head, and the SC wave
  await standWave(page, 0); await sleep(250)
  await pic(page, `${w}${tag}-wave1`)
  if (withSC) { await standWave(page, m.waves.length - 1); await sleep(250); await pic(page, `${w}${tag}-sc`) }
  // a crop of the first two lines of wave 1, to read the boxes
  await standWave(page, 0); await sleep(200)
  const r1 = await page.evaluate(() => { const g = document.querySelector('.sb-go'); const a = g.querySelector('.sb-lcols').getBoundingClientRect(); const ls = g.querySelectorAll('.sb-line'); const b = ls[1].getBoundingClientRect(); return { x: a.left - 4, y: a.top - 4, w: a.width + 8, h: b.bottom - a.top + 8 } })
  await pic(page, `${w}${tag}-crop`, r1)
  await ctx.close()
  return m
}

const sizes = (process.env.SIZES || "821,874,900,1000,1099,1100,1536").split(",").map(Number)
if (want('a1')) for (const w of sizes) await tryRun(`size ${w}`, () => widthWalk(w))
if (want('a1x')) {
  await tryRun('1000 @125%', () => widthWalk(1000, { dsf: 1.25, h: 800, tag: '-125pc' }))
  await tryRun('webkit 1000', () => widthWalk(1000, { engine: 'webkit', tag: '-webkit' }))
}
async function tryRun(label, fn) { try { return await fn() } catch (e) { say(`NOT WALKED ${label}: ${e.message.split('\n')[0]}`) } }

/* ============================================================================ A5: 820 desktop, 402 phone */
if (want('a5')) {
  await tryRun('820', async () => {
    const { ctx, page } = await world({ width: 820, height: 900 })
    await openBoard(page, 0)
    const m = await page.evaluate(MEASURE)
    const L = m.waves[0].lines[0]
    say(`-- 820 desktop mouse: line height ${L.rect.h | 0}, rb tops ${L.rb.map(x => x.t | 0)} tl tops ${L.tl.map(x => x.t | 0)} rcell ${L.rcell.w | 0}x${L.rcell.h | 0} at top ${L.rcell.t | 0}; wide-class? ${await page.evaluate(() => !!document.querySelector('.sb-wide'))}`)
    await standWave(page, 0); await sleep(250); await pic(page, '820-wave1')
    await ctx.close()
  })
  await tryRun('402', async () => {
    const br = cr
    const ctx = await br.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    page.on('pageerror', e => say('PAGE ERROR ' + e.message))
    await page.goto(BASE + '/'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
    // Edit Schedule is a page name in the top bar: on a phone, inside the side menu (burger)
    await page.click('#burger'); await sleep(400)
    await page.locator('[data-page="editsched"]:visible').first().click(); await sleep(800)
    await page.locator('#eWeek .sb-open[data-sbday="0"]:visible').first().tap(); await page.waitForSelector('#schedBoard'); await sleep(900)
    const m = await page.evaluate(MEASURE)
    const L = m.waves[0].lines[0]
    say(`-- 402 phone: line height ${L.rect.h | 0}, width ${L.rect.w | 0}, rb tops ${L.rb.map(x => x.t | 0)} tl tops ${L.tl.map(x => x.t | 0)} rcell ${L.rcell.w | 0}x${L.rcell.h | 0}; wide look? ${await page.evaluate(() => !!document.querySelector('.sb-wide'))}`)
    await standWave(page, 0); await sleep(300); await pic(page, '402-wave1')
    // A6: the layout switch
    const more = page.locator('#sbMore'); await more.tap(); await sleep(400)
    await pic(page, '402-more-open')
    const items = await page.evaluate(() => [...document.querySelectorAll('#sbMoreMenu .sb-moreitem')].map(e => e.textContent.trim().replace(/\s+/g, ' ') + '|' + e.getBoundingClientRect().width))
    say(`   ⋯ items: ${items.join(' ; ')}`)
    const sw = page.locator('#sbMoreMenu .sb-moreitem').filter({ hasText: /desktop|layout/i }).first()
    if (await sw.count()) {
      await sw.tap(); await sleep(900)
      await pic(page, '402-desktop-layout')
      const m2 = await page.evaluate(MEASURE)
      const L2 = m2.waves[0].lines[0]
      say(`   after the switch: .sb-wide ${await page.evaluate(() => !!document.querySelector('.sb-wide'))}; line height ${L2.rect.h | 0} width ${L2.rect.w | 0}; rb tops ${L2.rb.map(x => x.t | 0)} tl tops ${L2.tl.map(x => x.t | 0)} rcell ${L2.rcell.w | 0}`)
      await standWave(page, 0); await sleep(300); await pic(page, '402-desktop-layout-wave1')
      await page.locator('#sbMore').tap(); await sleep(400)
      const back = page.locator('#sbMoreMenu .sb-moreitem').filter({ hasText: /phone|layout/i }).first()
      await pic(page, '402-desktop-layout-more')
      if (await back.count()) { await back.tap(); await sleep(900); await pic(page, '402-switched-back'); say(`   switched back: .sb-wide ${await page.evaluate(() => !!document.querySelector('.sb-wide'))}`) }
    } else say('   NOT FOUND: the layout switch item in ⋯')
    await ctx.close()
  })
}

/* ============================================================================ A3 in-time lines over a wave */
if (want('a3')) await tryRun('A3', async () => {
  for (const w of [1000, 874]) {
    const { ctx, page } = await world({ width: w, height: 900 })
    await openBoard(page, 0)
    await standWave(page, 0); await sleep(250)
    const before = await page.evaluate(() => document.querySelectorAll('.sb-go')[0].querySelectorAll('.itrow').length)
    await pic(page, `a3-${w}-intimes-before`)
    const btn = page.locator('.sb-go').first().getByRole('button', { name: '+ In-time', exact: true })
    await btn.click(); await sleep(500)
    const m = await page.evaluate(MEASURE)
    const wv = m.waves[0]
    say(`-- A3 ${w}: in-time rows ${before} -> ${wv.itimes.length}`)
    let bad = 0
    wv.itimes.forEach((it, i) => { const f = []; if (it.scrollW > it.clientW + 1) f.push('scrolls sideways'); if (it.rect.r > wv.rect.r + 1) f.push('past the wave'); for (let a = 0; a < it.kids.length; a++) for (let b2 = a + 1; b2 < it.kids.length; b2++) if (ov(it.kids[a], it.kids[b2])) f.push('parts overlap'); for (let j = i + 1; j < wv.itimes.length; j++) if (ov(it.rect, wv.itimes[j].rect)) f.push('rows overlap'); if (f.length) { bad++; say(`   FAIL row ${i}: ${f.join('; ')}`) } })
    chk(`A3 ${w}`, bad === 0 && wv.itimes.length > before, `${wv.itimes.length} in-time rows, ${bad} faulty`)
    await standWave(page, 0); await sleep(250); await pic(page, `a3-${w}-intimes-after`)
    const first = wv.lines[0]
    say(`   the first line below the in-times still stacked: rcell ${first.rcell.w | 0}px, R/B left ${first.rb.map(x => x.l | 0)}`)
    await ctx.close()
  }
})

/* ============================================================================ A7 the week */
if (want('a7')) await tryRun('A7', async () => {
  const { ctx, page } = await world({ width: 1000, height: 900 })
  await toEdit(page)
  const wk1 = await page.evaluate(() => {
    const d = document.querySelector('#eWeek .day'); const r = x => { const b = x.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(',') }
    const l = [...d.querySelectorAll('.puck')].length
    return { dayRect: r(d), pucks: l, rbs: [...d.querySelectorAll('.tm, input')].length, hasStacked: !!d.querySelector('.sb-line'), html: d.className }
  })
  say(`-- A7 Edit Schedule week at 1000: first day box ${wk1.dayRect}, pucks ${wk1.pucks}, any board line markup inside the week: ${wk1.hasStacked}`)
  await pic(page, 'a7-editsched-week-1000')
  await page.evaluate(() => document.querySelector('#eWeek .day').scrollIntoView({ block: 'start' })); await sleep(200)
  await pic(page, 'a7-editsched-day1-1000')
  // the week's own timing rows: R over B, TO over LD in the week's way
  const rows = await page.evaluate(() => { const d = document.querySelector('#eWeek .day'); const o = []; d.querySelectorAll('.fl, .frow, [class*="fm"]').forEach(e => { if (o.length < 3) o.push(e.className + ':' + Math.round(e.getBoundingClientRect().height)) }); return o })
  say(`   week row classes: ${rows.join(' ; ')}`)
  await toView(page)
  await pic(page, 'a7-viewsched-1000')
  const h1 = await page.evaluate(() => { const d = document.querySelector('#vWeek .day'); return d ? Math.round(d.getBoundingClientRect().height) : null })
  say(`   View-only Sched first day height ${h1}`)
  await ctx.close()
})

/* ============================================================================ A9 history dot */
if (want('a9')) await tryRun('A9', async () => {
  const { ctx, page } = await world({ width: 1000, height: 900 })
  await openBoard(page, 0)
  await standWave(page, 0); await sleep(200)
  // change the TO time on the first line (the second box of a stacked pair...)
  const to = page.locator('.sb-go').first().locator('.sb-line').first().locator('input[data-bfld$=".to"]')
  await to.click(); await to.fill('12:55'); await page.keyboard.press('Enter'); await sleep(500)
  const val = await to.inputValue()
  say(`-- A9 TO now reads ${val}`)
  await page.locator('#sbHist').click(); await sleep(600)
  await standWave(page, 0); await sleep(300)
  await pic(page, 'a9-history-on')
  const info = await page.evaluate(() => {
    const ln = document.querySelector('.sb-go .sb-line'); const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
    const dots = [...ln.querySelectorAll('*')].filter(e => /hist|dot|chg|gold|edited/i.test(e.className && e.className.baseVal === undefined ? e.className : '') ).map(e => ({ cls: e.className, ...R(e) }))
    const boxes = {}; ln.querySelectorAll('input.tm').forEach(i => boxes[i.getAttribute('data-bfld').split('.').pop()] = { ...R(i), cls: i.className, parent: i.parentElement.className })
    return { dots, boxes }
  })
  say(`   dot-like parts in the line: ${info.dots.map(d => d.cls + '@' + (d.l | 0) + ',' + (d.t | 0)).join(' ; ') || 'none by class'}`)
  say(`   boxes: ${Object.entries(info.boxes).map(([k, v]) => `${k} ${v.l | 0},${v.t | 0}-${v.r | 0},${v.b | 0} [${v.cls}]`).join(' | ')}`)
  const crop = await page.evaluate(() => { const l = document.querySelector('.sb-go .sb-line').getBoundingClientRect(); return { x: l.left, y: l.top - 4, w: l.width, h: l.height + 8 } })
  await pic(page, 'a9-history-line-crop', crop)
  await page.locator('#sbHist').click(); await sleep(500)
  await pic(page, 'a9-history-off')
  await ctx.close()
})

/* ============================================================================ A8 a published day's look */
if (want('a8')) await tryRun('A8', async () => {
  const { ctx, page } = await world({ width: 1000, height: 900 })
  await openBoard(page, 0)
  for (const [k, v] of [['cur', 'dj'], ['sked', 'shaft'], ['plan', 'yeti'], ['appr', 'snap']]) { await page.selectOption(`#schedBoard select[data-sign="${k}"][data-signday="0"]`, v); await sleep(250) }
  await page.locator('#schedBoard [data-beak="0"]').click(); await sleep(900)
  say('-- A8 published Monday through its own controls: four sign-off names chosen, then Publish day')
  await page.click('#schedBoard .planselbtn'); await sleep(400)
  await pic(page, 'a8-plans-menu')
  await page.getByText("read-only — look, don't change").first().click()
  await sleep(900)
  const m = await page.evaluate(MEASURE)
  say(`   look at Original: ${m.waves.length} waves; board still open ${!!(await page.$('#schedBoard'))}; plan button reads: ${await page.evaluate(() => document.querySelector('#schedBoard .planselbtn')?.innerText.split('\n').join(' '))}`)
  await standWave(page, 0); await sleep(300)
  await pic(page, 'a8-look-original-wave1')
  const lk = await page.evaluate(() => { const g = document.querySelector('.sb-go'); const a = g.querySelector('.sb-lcols').getBoundingClientRect(); const ls = g.querySelectorAll('.sb-line'); const b = ls[1].getBoundingClientRect(); return { x: a.left - 4, y: a.top - 4, w: a.width + 8, h: b.bottom - a.top + 8 } })
  await pic(page, 'a8-look-original-crop', lk)
  await page.evaluate(() => { document.querySelector('.sb-boardwrap').scrollTop = 0 }); await sleep(200)
  await pic(page, 'a8-look-original-top')
  say(`   look DOM: waves ${m.waves.length}, lines per wave ${m.waves.map(w => w.lines.length)}, first line has rcell ${!!(m.waves[0].lines[0] && m.waves[0].lines[0].rcell)}, rb ${m.waves[0].lines[0] && m.waves[0].lines[0].rb.length}`)
  try {
    let bad = 0, total = 0
    for (const wv of m.waves) for (const L of wv.lines) { total++; const miss = ['rcell','lctl','lin','msn'].filter(k => !L[k]); if (miss.length) say(`   line ${L.li} of ${wv.title}: no box for ${miss.join(',')} (read only)`); L.lctl ||= { l: L.rcell.r, t: L.rcell.t, r: L.rcell.r, b: L.rcell.b, w: 0, h: 0 }; const f = judgeStacked(m, wv, L); if (f.length) { bad++; say(`   FAIL ${wv.title} line ${L.li}: ${f.join('; ')}`) } }
    chk('A8 1000 look', total > 0 && bad === 0, `${total - bad} of ${total} lines stacked fine in the read-only look`)
    const ed = await page.evaluate(() => [...document.querySelectorAll('.sb-go input, .sb-go textarea')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.readOnly || e.disabled))
    say(`   inputs in the look: ${ed.length}, read-only/disabled: ${ed.filter(Boolean).length}`)
    } catch (e) { say('   NOT JUDGED by rule: ' + e.message) }
  await ctx.close()
})

/* ============================================================================ the plain-user round at 1000 */
if (want('rd')) await tryRun('round', async () => {
  const { ctx, page } = await world({ width: 1000, height: 900 })
  const boardOpen = async () => !!(await page.$('#schedBoard'))
  await openBoard(page, 0)
  say("-- round: opened from Edit Schedule's date button for Monday")
  await pic(page, 'rd-01-open')
  await standWave(page, 0); await sleep(250)
  const ln = () => page.locator('.sb-go').first().locator('.sb-line').first()
  const n0 = await page.locator('.sb-go').first().locator('.sb-line').count()
  const typeIn = async (sel, v) => { const e = ln().locator(sel); await e.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Tab'); await sleep(250) }
  await typeIn('.lin', 'ZQ'); await typeIn('.msn', 'INTERCEPT-LONG')
  await typeIn('input[data-bfld$=".rl"]', '09:05'); await typeIn('input[data-bfld$=".br"]', '09:45'); await typeIn('input[data-bfld$=".to"]', '11:10'); await typeIn('input[data-bfld$=".ld"]', '12:30')
  const longRem = 'Long remark: ' + 'check the tanker, the area, the weather and the radio plan again. '.repeat(3)
  await typeIn('.nts', longRem)
  const vals = await ln().evaluate(e => ({ lin: e.querySelector('.lin').value, msn: e.querySelector('.msn').value, rl: e.querySelector('[data-bfld$=".rl"]').value, br: e.querySelector('[data-bfld$=".br"]').value, to: e.querySelector('[data-bfld$=".to"]').value, ld: e.querySelector('[data-bfld$=".ld"]').value, nts: e.querySelector('.nts').value.length }))
  say(`   typed: ${JSON.stringify(vals)}`)
  chk('round typing', vals.lin === 'ZQ' && vals.rl === '09:05' && vals.br === '09:45' && vals.to === '11:10' && vals.ld === '12:30' && vals.nts > 150, 'the line kept what was typed')
  await standWave(page, 0); await sleep(300)
  await pic(page, 'rd-02-typed')
  const mm = await page.evaluate(MEASURE)
  const L0 = mm.waves[0].lines[0]
  const f = judgeStacked(mm, mm.waves[0], L0).filter(x => !/^CS .* vs MSN/.test(x))
  say(`   (a mission long enough to wrap makes its own box taller than the callsign box: CS ${L0.lin.h | 0} MSN ${L0.msn.h | 0}, typed data)
   the typed line after a long remark: height ${L0.rect.h | 0}, remarks ${L0.rcell.w | 0}x${L0.rcell.h | 0}; faults: ${f.join('; ') || 'none'}`)
  chk('round typed line still stacked', f.length === 0, `height ${L0.rect.h | 0}`)
  await pic(page, 'rd-02b-typed-crop', await page.evaluate(() => { const l = document.querySelector('.sb-go .sb-line').getBoundingClientRect(); return { x: l.left - 4, y: l.top - 4, w: l.width + 8, h: l.height + 8 } }))
  // + Line on the wave
  await page.locator('.sb-go').first().locator('[data-gline]').click(); await sleep(600)
  const n1 = await page.locator('.sb-go').first().locator('.sb-line').count()
  chk('round + Line', n1 === n0 + 1, `lines ${n0} -> ${n1}`)
  await standWave(page, 0); await sleep(250); await pic(page, 'rd-03-plus-line')
  // delete the new (last) line with its X
  const lastDel = page.locator('.sb-go').first().locator('[data-ldel]').last()
  await lastDel.scrollIntoViewIfNeeded(); await lastDel.click(); await sleep(500)
  await pic(page, 'rd-04-delete-question')
  const q = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && /^(Yes|Remove|Delete|Confirm|Cancel|No|Keep)/i.test(e.textContent.trim())).map(e => e.textContent.trim() + '#' + e.className))
  say(`   delete question buttons: ${q.join(' ; ') || 'none seen (deleted at once?)'}`)
  const yes = page.locator('button').filter({ hasText: /^(Yes|Remove|Delete|Confirm)/i }).filter({ visible: true }).first()
  if (await yes.count()) { await yes.click(); await sleep(600) }
  const n2 = await page.locator('.sb-go').first().locator('.sb-line').count()
  chk('round delete', n2 === n0, `lines ${n1} -> ${n2}`)
  await standWave(page, 0); await sleep(250); await pic(page, 'rd-05-after-delete')
  // a line with crew: its X and its question
  const crewDel = page.locator('.sb-go').first().locator('[data-ldel]').nth(1)
  await crewDel.scrollIntoViewIfNeeded(); await crewDel.click(); await sleep(500)
  await pic(page, 'rd-04b-delete-crew-line')
  const q2 = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && /^(Yes|Remove|Delete|Confirm|Cancel|No|Keep)/i.test(e.textContent.trim())).map(e => e.textContent.trim()))
  say('   delete of a line with crew: question buttons: ' + (q2.join(' ; ') || 'none seen'))
  const yes2 = page.locator('button').filter({ hasText: /^(Yes|Remove|Delete|Confirm)/i }).filter({ visible: true }).first()
  if (await yes2.count()) { await yes2.click(); await sleep(600) }
  const n2b = await page.locator('.sb-go').first().locator('.sb-line').count()
  say('   lines after deleting a crewed line: ' + n2 + ' -> ' + n2b)
  await pic(page, 'rd-04c-after-crew-delete')
  // undo, redo
  const top0 = await page.evaluate(() => document.querySelector('.sb-boardwrap').scrollTop)
  await page.click('#sbUndo'); await sleep(600)
  const n3 = await page.locator('.sb-go').first().locator('.sb-line').count()
  const top1 = await page.evaluate(() => document.querySelector('.sb-boardwrap').scrollTop)
  say(`   Undo: lines ${n2} -> ${n3}; the list's scroll ${top0 | 0} -> ${top1 | 0} (the changed line in view: it should stay)`)
  await pic(page, 'rd-06-undo')
  await page.click('#sbRedo'); await sleep(600)
  const n4 = await page.locator('.sb-go').first().locator('.sb-line').count()
  const top2 = await page.evaluate(() => document.querySelector('.sb-boardwrap').scrollTop)
  say(`   Redo: lines ${n3} -> ${n4}; scroll ${top2 | 0}`)
  await pic(page, 'rd-07-redo')
  say(`   more-menu button (#sbMore) on this desktop look: width ${await page.evaluate(() => Math.round(document.querySelector('#sbMore').getBoundingClientRect().width))} (0 = not drawn here, a phone-only control)`)

  // every menu and window, open and closed
  const behind = async () => page.evaluate(() => { const g = document.querySelector('.sb-go'); return g ? Math.round(g.getBoundingClientRect().top) + ':' + document.querySelectorAll('.sb-line').length : 'x' })
  const OUTSIDE = [985, 70]
  const menus = [
    { name: '+ Wave', open: async () => { await page.locator('.sb-sec [data-wvadd]').first().scrollIntoViewIfNeeded(); await page.locator('.sb-sec [data-wvadd]').first().click() }, item: async () => { await page.locator('.wm[data-wmkind=""]').first().click() } },
    { name: 'Templates', open: async () => { await page.click('#sbTpl') }, item: async () => { await page.getByText('Manage templates').first().click(); await sleep(500); await pic(page, 'rd-manage-templates'); await page.keyboard.press('Escape'); await sleep(300) } },
    { name: 'Insights', open: async () => { await page.click('#sbInsights') }, item: async () => { await page.mouse.click(769, 97) } },
    { name: 'History and its changes window', open: async () => { await page.click('#sbHist') }, item: async () => { await page.locator('.chgwin .win-x').click() }, after: async () => { /* history toggled on by the open: switch it off again if still on */ } },
  ]
  let mi = 10
  for (const mn of menus) {
    for (const way of ['escape', 'outside', 'item']) {
      if (!(await boardOpen())) { say(`   board gone before ${mn.name}/${way}`); await openBoard(page, 0) }
      await page.evaluate(() => { const w = document.querySelector('.sb-boardwrap'); w.scrollTop = 0 }); await sleep(150)
      const before = await behind()
      try { await mn.open() } catch (e) { say(`   NOT WALKED ${mn.name} (${way}) — open: ${e.message.split('\n')[0]}`); break }
      await sleep(500)
      const slug = mn.name.replace(/[^a-z]/gi, '').toLowerCase().slice(0, 14)
      await pic(page, `rd-${mi}-${slug}-open-${way}`)
      try {
        if (way === 'escape') await page.keyboard.press('Escape')
        else if (way === 'outside') await page.mouse.click(OUTSIDE[0], OUTSIDE[1])
        else await mn.item()
      } catch (e) { say(`   NOT WALKED close ${mn.name}/${way}: ${e.message.split('\n')[0]}`) }
      await sleep(600)
      const open2 = await boardOpen()
      const after = open2 ? await behind() : 'board closed'
      const still = open2 ? await page.evaluate(() => ({ chg: !!document.querySelector('.chgwin') && document.querySelector('.chgwin').getBoundingClientRect().width > 0, ins: [...document.querySelectorAll('body *')].some(e => e.getBoundingClientRect().width > 300 && /Week insights/.test(e.textContent) && e.children.length < 3), tpl: !![...document.querySelectorAll('body *')].find(e => e.getBoundingClientRect().width > 0 && /^DAY TEMPLATES/i.test(e.textContent.trim())), wm: !!document.querySelector('.wm[data-wmkind]') && document.querySelector('.wm[data-wmkind]').getBoundingClientRect().width > 0 })) : null
      say(`   ${mn.name} / ${way}: board open after ${open2}; still showing ${JSON.stringify(still)}; wave1 top:lines before ${before}, after ${after}`)
      await pic(page, `rd-${mi}-${slug}-closed-${way}`)
      mi++
      if (way === 'item' && mn.name === '+ Wave') { await page.click('#sbUndo').catch(() => {}); await sleep(500) }
      if (mn.name.startsWith('History')) { const on = await page.evaluate(() => document.querySelector('#sbHist').classList.contains('on') || document.querySelector('#sbHist').getAttribute('aria-pressed') === 'true'); if (on && way === 'item') { say('   history is still marked on after its window closed') } }
    }
  }
  // the day's issues: the header, then a warning's line (a jump to its row)
  if (!(await boardOpen())) await openBoard(page, 0)
  await page.evaluate(() => { document.querySelector('.sb-boardwrap').scrollTop = 0 }); await sleep(200)
  const warnState = () => page.evaluate(() => { const w = document.querySelector('#sbWarn'); const r = w.getBoundingClientRect(); return { h: Math.round(r.height), items: w.querySelectorAll('.wln, [class*=wln]').length, text: w.innerText.split('\n')[0].slice(0, 40) } })
  say('   issues box before: ' + JSON.stringify(await warnState()))
  await page.locator('#sbWarn').getByText(/issues/).first().click(); await sleep(500)
  say('   issues box after pressing its heading: ' + JSON.stringify(await warnState()))
  await pic(page, 'rd-30-issues-heading-pressed')
  await page.locator('#sbWarn').getByText(/issues/).first().click(); await sleep(500)
  say('   issues box after pressing it again: ' + JSON.stringify(await warnState()))
  await pic(page, 'rd-31-issues-heading-pressed-again')
  const w1 = page.locator('#sbWarn .wln, #sbWarn [class*=wln]').filter({ visible: true }).nth(3)
  if (await w1.count()) { await w1.click(); await sleep(700); await pic(page, 'rd-32-issue-line-tapped') ; say('   a warning line tapped: the board stays open ' + await boardOpen()) }
  if (!(await boardOpen())) await openBoard(page, 0)
  await page.click('#sbDone'); await sleep(900)
  say(`   Done: board open ${await boardOpen()}; on page ${await page.evaluate(() => window.CURPAGE)}`)
  await pic(page, 'rd-90-after-done-editsched')
  const d0 = await page.evaluate(() => { const d = document.querySelector('#eWeek .day'); return [...d.querySelectorAll('input,textarea')].map(e => e.value).filter(v => /ZQ|INTERCEPT|11:10|Long remark/.test(v)).slice(0, 5) })
  say(`   Edit Schedule shows the edits (as input values): ${JSON.stringify(d0)}; text has ZQ: ${await page.evaluate(() => document.querySelector('#eWeek').innerText.includes('ZQ'))}`)
  await toView(page)
  await pic(page, 'rd-91-viewsched')
  const v0 = await page.evaluate(() => document.querySelector('#vWeek').innerText.includes('ZQ') + ':' + document.querySelector('#vWeek').innerText.includes('11:10'))
  say(`   View-only Sched shows ZQ/11:10: ${v0}`)
  await ctx.close()
})

console.log('DONE; pictures', N)
writeFileSync(path.join(OUT, '_log.txt'), LOG.join('\n'))
await cr.close(); if (wk) await wk.close()
