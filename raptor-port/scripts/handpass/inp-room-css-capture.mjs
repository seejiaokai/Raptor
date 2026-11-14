// [INP-ROOM-TIDY-2] (14 Nov 26) — the proof that writing "the input window stands where it opens" once, in place of five
// times (06-inputs.css, 16-medical.css), changes nothing a person sees. Walk-scripts §8 ("when nothing on screen should
// change"): record the running build before the edit and after it, compare the records as text. The approach is
// [LW-BIDPICKER-CSS-INSIDE]'s capture (lw-bidpicker-css-capture.mjs on that branch), cut down to these two rooms.
//
// It serves nothing: point it at a build already served (`npx vite preview --port 4297 --strictPort`, BASE below). For
// each STATE — the Inputs list and the Medical tab with no window, with the input's window where it opens, dragged away
// (placed), and reopened where he left it — at a desktop (1536 x 864), his PC's page (1229 x 600, 1536 at 125%) and his
// iPhone (402 x 874, touch), in a fresh world each, it saves every element of the page's workspace and of the window: its
// getComputedStyle (every property) and its ::before / ::after; and a picture of the screen. The records stay OUTSIDE the
// repo (OUT, below) — only the diff's one-line result is worth keeping.
//
// usage, from raptor-port/:  node scripts/handpass/inp-room-css-capture.mjs <before|after|...>
// then:                      node scripts/handpass/inp-room-css-capture.mjs --diff <labelA> <labelB>
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'

const OUT_ROOT = process.env.OUT_ROOT || 'C:/Users/User/raptor-night-1114/code-tidy'
const BASE = process.env.BASE || 'http://localhost:4297'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const args = process.argv.slice(2)

/* ------------------------------------------------------------------ the diff */
if (args[0] === '--diff') {
  const [a, b] = [args[1], args[2]]
  const read = l => JSON.parse(readFileSync(path.join(OUT_ROOT, l, 'styles.json'), 'utf8'))
  const A = read(a), B = read(b)
  const out = []
  let states = 0, els = 0
  for (const st of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
    if (!A[st] || !B[st]) { out.push(`${st}: state only in ${A[st] ? a : b}`); continue }
    states++
    const ea = A[st], eb = B[st]
    const ka = Object.keys(ea), kb = Object.keys(eb)
    els += ka.length
    if (ka.join('\n') !== kb.join('\n')) out.push(`${st}: element lists differ (${ka.length} vs ${kb.length}); first: ${ka.find(k => !(k in eb)) ?? kb.find(k => !(k in ea))}`)
    for (const k of ka) {
      if (!eb[k]) continue
      for (const part of new Set([...Object.keys(ea[k]), ...Object.keys(eb[k])])) {
        const pa = ea[k][part] ?? {}, pb = eb[k][part] ?? {}
        if (typeof pa === 'string' || typeof pb === 'string') { if (pa !== pb) out.push(`${st} | ${k} | ${part}: ${JSON.stringify(pa)} -> ${JSON.stringify(pb)}`); continue }
        for (const p of new Set([...Object.keys(pa), ...Object.keys(pb)])) if (pa[p] !== pb[p]) out.push(`${st} | ${k} | ${part} | ${p}: ${JSON.stringify(pa[p])} -> ${JSON.stringify(pb[p])}`)
      }
    }
  }
  const head = `${states} states, ${els} elements compared (each with every computed property and its ::before / ::after)`
  const file = path.join(OUT_ROOT, `diff-${a}-vs-${b}.txt`)
  writeFileSync(file, head + '\n' + (out.length ? out.join('\n') + '\n' : 'EMPTY — no computed style differs\n'))
  console.log(head)
  console.log(`${out.length} differences -> ${file}`)
  console.log(out.slice(0, 40).join('\n'))
  process.exit(0)
}

const LABEL = args[0]
if (!LABEL || LABEL.startsWith('--')) { console.log('usage: <label> | --diff <a> <b>'); process.exit(1) }
const OUT = path.join(OUT_ROOT, LABEL)
mkdirSync(OUT, { recursive: true })
const T0 = '2026-11-04T09:00:00+08:00'
const browser = await chromium.launch(launchOptions)

const SIZES = {
  desk: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 },
  pc: { viewport: { width: 1229, height: 600 } },
  phone: { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent },
}
async function world(size) {
  const ctx = await browser.newContext(SIZES[size])
  await ctx.clock.install({ time: new Date(T0) })
  const page = await ctx.newPage()
  page.setDefaultTimeout(15000)
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  await page.goto(BASE + '/?fresh=1')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  /* passing notes hidden in both builds alike — they time out on their own clock and would make two runs differ */
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  await page.evaluate(() => window.go('inputs'))
  await page.waitForFunction(() => window.CURPAGE === 'inputs')
  await page.waitForTimeout(500)
  return { ctx, page, phone: size === 'phone', size, errs }
}
async function press(w, sel) {
  const l = w.page.locator(sel).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.phone) await l.tap(); else await l.click()
  await w.page.clock.runFor(900)
  await w.page.waitForTimeout(300)
}
async function drag(w) {
  const t = await w.page.locator('[data-testid="win-inputedit"] .win-ttl').boundingBox()
  await w.page.mouse.move(t.x + 10, t.y + t.height / 2); await w.page.mouse.down()
  await w.page.mouse.move(t.x - 600, t.y + 120, { steps: 10 }); await w.page.mouse.up()
  await w.page.clock.runFor(900)
  await w.page.waitForTimeout(300)
}

/* every element of the page's workspace and of the input's window, keyed by its place in the tree (tag and index under
   its parent), so two runs line up element for element */
async function snap(w, name, rec) {
  await w.page.clock.runFor(900)
  await w.page.waitForTimeout(300)
  const got = await w.page.evaluate(() => {
    const roots = [...document.querySelectorAll('.inputs-workspace, #medView, .floatwin.inpedwin')]
    const pathOf = e => { const p = []; for (let n = e; n && n !== document.body; n = n.parentElement) p.unshift(n.tagName.toLowerCase() + ':' + [...n.parentElement.children].indexOf(n)); return p.join('>') }
    const css = (e, pseudo) => { const s = getComputedStyle(e, pseudo); const o = {}; for (let i = 0; i < s.length; i++) o[s[i]] = s.getPropertyValue(s[i]); return o }
    const out = {}
    for (const r of roots) for (const e of [r, ...r.querySelectorAll('*')]) {
      const k = pathOf(e)
      if (out[k]) continue
      const before = getComputedStyle(e, '::before').content, after = getComputedStyle(e, '::after').content
      out[k] = { cls: (e.getAttribute('class') || '') + (e.hasAttribute('data-placed') ? ' [data-placed]' : ''), el: css(e) }
      if (before && before !== 'none' && before !== 'normal') out[k].before = css(e, '::before')
      if (after && after !== 'none' && after !== 'normal') out[k].after = css(e, '::after')
    }
    return out
  })
  rec[name] = got
  await w.page.screenshot({ path: path.join(OUT, name + '.png') })
  console.log(`${name}: ${Object.keys(got).length} elements${w.errs.length ? ' — ERRORS ' + w.errs.join(' | ') : ''}`)
}

const rec = {}
for (const size of Object.keys(SIZES)) {
  /* the Inputs list, every date shown */
  let w = await world(size)
  await press(w, '#inListBtn')
  await press(w, '#inRangeBtn'); await press(w, '#inRangeAll')
  await snap(w, `${size}-inputs-1-list`, rec)
  await press(w, '#inNew')
  await snap(w, `${size}-inputs-2-window-at-rest`, rec)
  if (!w.phone) {
    await drag(w)
    await snap(w, `${size}-inputs-3-window-dragged`, rec)
    await w.page.keyboard.press('Escape'); await w.page.clock.runFor(900)
    await press(w, '#inBody tr .in-open')
    await snap(w, `${size}-inputs-4-reopened-placed`, rec)
  }
  await w.ctx.close()
  /* the Medical tab */
  w = await world(size)
  await press(w, '#inMedBtn')
  await w.page.waitForSelector('#medView .medcard')
  await snap(w, `${size}-medical-1-cards`, rec)
  await press(w, '#medNew')
  await snap(w, `${size}-medical-2-window-at-rest`, rec)
  if (!w.phone) {
    await drag(w)
    await snap(w, `${size}-medical-3-window-dragged`, rec)
    await w.page.keyboard.press('Escape'); await w.page.clock.runFor(900)
    await press(w, '.medcard')
    await press(w, '#docViewEdit')
    await snap(w, `${size}-medical-4-reopened-placed`, rec)
  }
  await w.ctx.close()
}
writeFileSync(path.join(OUT, 'styles.json'), JSON.stringify(rec))
await browser.close()
console.log('saved ->', OUT)
