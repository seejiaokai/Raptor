// Chat 162 (24 Nov 26) — the proposed Undo words, drawn on the REAL app for his page (the guide:
// .claude/skills/brainstorming/mockups-on-the-real-app.md). Each bubble is reached by the real presses (Saber, Admin → Users,
// the row, Save, Undo); then ONLY its words are changed — the bubble's one text node — nothing restyled, no node removed,
// nothing hidden. Just before each picture the script asserts the bubble is still showing and holds the drawn words, or
// refuses the picture. "today" pictures are real and unchanged.
// Run from anywhere (the build already served on http://localhost:4700/):
//   node raptor-port/docs/mock/2026-11-24-msq-night-questions/draw-undo.mjs [today|A|B|C|D|E|F|all] [d1|d2|p|all]
// d1 = desktop 1536x864 at 1x, d2 = the same at 2x, p = his iPhone's 402x874 in WebKit, touch, 3x.
// Pictures: checked/undo-today-<case>-<desk|phone>[-1x|-2x]-…png and checked/undo-new-<A..F>-<desk|phone>[-1x|-2x]-…png
import { chromium, webkit } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { fact, fail, Stop, press, signIn, users, openRow, lineBtn, rowSeen, toastGone, toastGeom, save } from '../../../scripts/handpass/n162/undo-lib.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, 'checked'); mkdirSync(OUT, { recursive: true })
const SIZES = {
  d1: { engine: chromium, desk: true, tag: 'desk-1x', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 } },
  d2: { engine: chromium, desk: true, tag: 'desk-2x', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: webkit, desk: false, tag: 'phone', opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
const NEW = 'hunter.m@mail'
const DOT = '·', APOS = '’'
/* the drawings: the real flow (set-up Save, the change) and the words drawn in its Undo bubble */
const DRAW = {
  A: { pid: 'prowler', plan: true, change: { role: 'main' }, words: `Undid: Made a member, Plan of 149 ended ${DOT} Hunter` },
  B: { pid: 'prowler', plan: true, change: { role: 'main', name: NEW }, words: `Undid: Made a member, Plan of 149 ended, sign-in name changed ${DOT} Hunter` },
  C: { pid: 'prowler', change: { role: 'main', name: NEW }, words: `Undid: Made a member, sign-in name changed ${DOT} Hunter` },
  D: { pid: 'prowler', change: { name: NEW }, words: `Undid: Sign-in name changed ${DOT} Hunter` },
  E: { pid: 'bane', change: { role: 'admin' }, words: `Undid: Made an admin of 142 ${DOT} Ranger` },
  F: { pid: 'prowler', change: { role: 'main' }, words: `Undid: Made a member ${DOT} Hunter` },
}
const PHONE_DRAW = new Set(['A', 'B', 'D'])

let browsers = {}
async function newPage(sz) {
  const S = SIZES[sz]
  const key = S.engine === webkit ? 'wk' : 'cr'
  if (!browsers[key]) browsers[key] = await S.engine.launch()
  const ctx = await browsers[key].newContext(S.opts)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => { errs.push(String(e)); console.log(`PAGE ERROR [${sz}] ${e}`) })
  page.on('dialog', d => d.accept().catch(() => {}))
  return { ctx, page, sz, desk: S.desk, errs, tag: S.tag }
}
async function closeAll() { for (const b of Object.values(browsers)) await b.close().catch(() => {}); browsers = {} }

/* the opened row changed. The sign-in name: typed on a desktop; on the emulated phone set through the box's own input event
   (never typed — a focused small box zooms the emulated phone, guide Traps) */
async function change(s, pid, { role, line149, name } = {}) {
  const { page } = s
  await openRow(s, pid)
  if (line149) await press(s, lineBtn('149', line149))
  if (name !== undefined) {
    const box = page.locator('#accEdName').filter({ visible: true }).first()
    if (s.desk) { await press(s, box); await box.fill(name) }
    else {
      await box.evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })) }, name)
      if ((await box.inputValue()) !== name) fail('the sign-in box did not take the name')
    }
  }
  if (role) {
    const box = page.locator('#accEdRole').filter({ visible: true }).first()
    if (await box.isDisabled()) fail(`the Role box is greyed for ${pid}`)
    await box.selectOption(role)
  }
}
async function setup(s, d) {
  await signIn(s, 'ad', 'a'); await users(s)
  if (d.plan) { await change(s, 'prowler', { line149: 'plan' }); await save(s, 'setup.plan149') }
}
const rowLoc = (s, pid) => s.page.locator(`#page-admin [data-person="${pid}"]:has(.acc-tap)`).filter({ visible: true }).first()
/* the row in the middle of the screen, clear of the bubble at the foot, so a crop holds both */
async function rowToFoot(s, pid) {
  await rowLoc(s, pid).evaluate(e => e.scrollIntoView({ block: 'center' }))
  await s.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
}
async function crop(s, pid, file) {
  const c = await s.page.evaluate(([pid, desk]) => {
    const t = document.getElementById('toastEl').getBoundingClientRect()
    const row = [...document.querySelectorAll(`#page-admin [data-person="${pid}"]`)].find(e => e.querySelector('.acc-tap') && e.getBoundingClientRect().width > 1)
    const rb = row.getBoundingClientRect()
    const top = Math.max(0, Math.min(t.top, rb.top) - 16), bottom = Math.min(innerHeight, Math.max(t.bottom, rb.bottom) + 16)
    let x = 0, w = innerWidth
    if (desk) { x = Math.max(0, Math.min(t.left, rb.left) - 16); w = Math.min(innerWidth, Math.max(t.right, rb.right) + 16) - x }
    return { x, y: top, width: w, height: bottom - top, rowInView: rb.top >= 0 && rb.bottom <= innerHeight, covered: rb.bottom > t.top && rb.top < t.bottom }
  }, [pid, s.desk])
  if (!c.rowInView) fail(`${file}: the row is not wholly in view`)
  if (c.covered) fail(`${file}: the bubble stands over the row`)
  await s.page.screenshot({ path: `${OUT}/${file}`, clip: { x: c.x, y: c.y, width: c.width, height: c.height } })
}
const bubbleIs = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { shown: t.style.opacity === '1' && +getComputedStyle(t).opacity > 0.99, text: t.textContent, nodes: t.childNodes.length } : null })
async function undoBubble(s) {
  await toastGone(s)
  const b = s.page.locator('#undoBtn').filter({ visible: true }).first()
  if (!(await b.count()) || await b.isDisabled()) fail('Undo not pressable')
  if (s.desk) await b.click(); else await b.tap()
  await s.page.waitForFunction(() => { const t = document.getElementById('toastEl'); return !!t && t.style.opacity === '1' && +getComputedStyle(t).opacity > 0.99 && t.textContent.startsWith('Undid') }, null, { timeout: 10000 }).catch(() => fail('no Undid bubble'))
  await s.page.evaluate(() => Promise.all((document.getElementById('toastEl').getAnimations?.() || []).map(a => a.finished.catch(() => {}))))
}
async function geomFacts(s, key) {
  const g = await toastGeom(s)
  fact(`${key}.lines`, g.lines); fact(`${key}.box`, g.box); fact(`${key}.insideScreen`, g.insideScreen); fact(`${key}.cut`, g.cut.length ? g.cut.join('; ') : 'none')
}
/* the picture pair, the premise asserted first (shown, and holding exactly these words) */
async function shoot(s, pid, words, base) {
  const b = await bubbleIs(s)
  if (!b || !b.shown || b.text !== words) fail(`${base}: refused — the bubble is ${JSON.stringify(b)}, not showing ${JSON.stringify(words)}`)
  await s.page.screenshot({ path: `${OUT}/${base}-full.png` })
  await crop(s, pid, `${base}-crop.png`)
  const a = await bubbleIs(s)
  if (!a.shown || a.text !== words) fail(`${base}: the bubble changed during the pictures: ${JSON.stringify(a)}`)
}

/* today, real and unchanged: case 1 (the row before the Undo, then the bubble); on the phone, also 6a's real bubble measured */
async function today(sz) {
  const s = await newPage(sz)
  const k = `today.c1.${sz}`
  await setup(s, { plan: true })
  await change(s, 'prowler', { role: 'main' }); await save(s, `${k}.save`)
  await toastGone(s)
  await rowToFoot(s, 'prowler')
  fact(`${k}.rowBeforeUndo`, await rowSeen(s, 'prowler'))
  const base = `undo-today-c1-${s.tag}`
  const rb = await rowLoc(s, 'prowler').boundingBox()
  await s.page.screenshot({ path: `${OUT}/${base}-before-undo-full.png` })
  await s.page.screenshot({ path: `${OUT}/${base}-before-undo-crop.png`, clip: s.desk ? { x: rb.x - 16, y: rb.y - 16, width: rb.width + 32, height: rb.height + 32 } : { x: 0, y: Math.max(0, rb.y - 16), width: 402, height: rb.height + 32 } })
  await undoBubble(s)
  const w = (await bubbleIs(s)).text
  fact(`${k}.bubble`, w)
  fact(`${k}.bubble.nonAsciiCodePoints`, [...w].filter(ch => ch.charCodeAt(0) > 126).map(ch => `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`))
  await geomFacts(s, `${k}.bubble`)
  await shoot(s, 'prowler', w, base)
  fact(`${k}.rowAfterUndo`, await rowSeen(s, 'prowler'))
  await s.ctx.close()
  /* 6a, today's real bubble (the approved words) — the dot and the apostrophe read off it */
  const t = await newPage(sz)
  const k6 = `today.c6a.${sz}`
  await setup(t, {})
  await change(t, 'prowler', { line149: 'plan', name: NEW }); await save(t, `${k6}.save`)
  await rowToFoot(t, 'prowler')
  await undoBubble(t)
  const w6 = (await bubbleIs(t)).text
  fact(`${k6}.bubble`, w6)
  await geomFacts(t, `${k6}.bubble`)
  const cps = [...w6].filter(ch => ch.charCodeAt(0) > 126).map(ch => `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
  fact(`${k6}.bubble.nonAsciiCodePoints`, cps)
  if (!w6.includes(DOT)) fail(`the real 6a bubble has no U+00B7 middle dot: ${w6}`)
  await t.ctx.close()
}

async function drawOne(id, sz) {
  const d = DRAW[id]
  const s = await newPage(sz)
  const k = `new.${id}.${sz}`
  await setup(s, d)
  await change(s, d.pid, d.change); await save(s, `${k}.save`)
  fact(`${k}.rowAfterSave`, await rowSeen(s, d.pid))
  /* the hover: today's title read, then the drawn title put on the button (words only); no picture — the browser's own
     hover tip is not drawn in a screenshot */
  if (s.desk) {
    const u = s.page.locator('#undoBtn').filter({ visible: true }).first()
    await u.hover()
    fact(`${k}.undoHover.today`, await u.getAttribute('title'))
    const drawn = d.words.replace(/^Undid: /, 'Undo — ')
    await u.evaluate((e, v) => e.setAttribute('title', v), drawn)
    fact(`${k}.undoHover.drawn`, await u.getAttribute('title'))
  }
  await toastGone(s)
  await rowToFoot(s, d.pid)
  await undoBubble(s)
  const was = await bubbleIs(s)
  fact(`${k}.bubble.today`, was.text)
  if (sz === 'p') await geomFacts(s, `${k}.bubble.today`)
  /* the one transform: the bubble's single text node gets the drawn words */
  const r = await s.page.evaluate(words => {
    const t = document.getElementById('toastEl')
    if (t.childNodes.length !== 1 || t.firstChild.nodeType !== 3) return { ok: false, nodes: t.childNodes.length }
    t.firstChild.nodeValue = words
    return { ok: true }
  }, d.words)
  if (!r.ok) fail(`${k}: the bubble is not one text node (${r.nodes} nodes) — nothing drawn`)
  fact(`${k}.bubble.drawn`, (await bubbleIs(s)).text)
  await geomFacts(s, `${k}.bubble.drawn`)
  await shoot(s, d.pid, d.words, `undo-new-${id}-${s.tag}`)
  fact(`${k}.rowAfterUndo`, await rowSeen(s, d.pid))
  if (s.errs.length) fact(`${k}.pageErrors`, s.errs)
  await s.ctx.close()
}

const what = (process.argv[2] || 'all'), size = (process.argv[3] || 'all')
const sizes = size === 'all' ? ['d1', 'd2', 'p'] : [size]
const jobs = what === 'all' ? ['today', 'A', 'B', 'C', 'D', 'E', 'F'] : [what]
if (sizes.some(z => !SIZES[z]) || jobs.some(j => j !== 'today' && !DRAW[j])) { console.error('usage: draw-undo.mjs [today|A..F|all] [d1|d2|p|all]'); process.exit(2) }
try {
  for (const j of jobs) for (const z of sizes) {
    if (j !== 'today' && z === 'p' && !PHONE_DRAW.has(j)) continue
    console.log(`--- ${j} ${z}`)
    if (j === 'today') await today(z); else await drawOne(j, z)
  }
} catch (e) {
  console.error(`FAILED: ${e instanceof Stop ? e.message : e.stack || e}`)
  process.exitCode = 1
} finally { await closeAll() }
