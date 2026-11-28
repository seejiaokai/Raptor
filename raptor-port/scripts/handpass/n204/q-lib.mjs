// q-lib - section 1 (the guard rail), chat 204, 26 Nov 26: the drawings for questions 19 and 20 (brief
// docs/superpowers/briefs/2026-11-26-msq-s1-q19-20-draw-brief.md). The app is the BUILT one in dist, served at 4741,
// never rebuilt here; nothing here writes the app's code.
// THE NOTE IS THE APP'S OWN, RAISED BY ITS OWN CODE. No door raises it yet (K4-K6), and the built bundle drops the seam's
// ask / say (nothing calls them yet), so a small probe is added to the page as it loads, in this browser only: the served
// index chunk is fetched and one line appended to it - `window.__n204 = { open: <whatIsOpen>, say: <guardSay> }` - the two
// names read off the built file by their shapes. The script then asks the app's own whatIsOpen() what refuses (the real
// state reached by real presses), and hands that to the app's own guardSay(refusal, 'pick', <149's id>, { from }) - so the
// words are guardWords' and the place is toastAt / placeToast's. Only the note's fade is held (its opacity), so it can be
// pictured. For the "recommended" picture the words after "Blocked:" are swapped in the note's own element and the app
// asked to place it again (a resize, which its own listener answers) - its look and place rules unchanged.
// Helpers copied from n198/sansnote-lib.mjs (mk, signIn, hit, boxOf, covered, windowsNow, tring, the teal ring).
import { mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('playwright')
/* the repo's own browser fallback (playwright.config.ts) */
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const URL_ = 'http://localhost:4741/'
export const OUT = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions/q19-20'); mkdirSync(OUT, { recursive: true })
export const TMP = resolve(ROOT, '.tmp/n204-q19-20'); mkdirSync(TMP, { recursive: true })
export const TEAL = '#0D9488'
export const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 402, h: 874, eng: 'webkit' } }

/* the probe: the built index chunk, its two functions found by shape */
const ASSETS = resolve(ROOT, 'dist/assets')
const INDEX = readdirSync(ASSETS).find(f => /^index-.*\.js$/.test(f))
const SRC = readFileSync(resolve(ASSETS, INDEX), 'utf8')
const ID = '[A-Za-z_$][A-Za-z0-9_$]*'
const OPEN = new RegExp(`function (${ID})\\(e=\\[\\]\\)\\{for\\(let t of ${ID}\\)\\{if\\(e\\.includes\\(t\\)\\)continue;`).exec(SRC)?.[1]
const SAY = new RegExp(`function (${ID})\\(e,t,n,r=\\{\\}\\)\\{let i=${ID}\\(e\\.id\\);if\\(!i\\)return;let a=${ID}\\(e\\.reason,i,t,n\\)`).exec(SRC)?.[1]
if (!OPEN || !SAY) throw new Error(`the probe could not find whatIsOpen (${OPEN}) or guardSay (${SAY}) in ${INDEX}`)
export const PROBE = { chunk: INDEX, whatIsOpen: OPEN, guardSay: SAY }
const PATCHED = SRC + `\n;window.__n204={open:${OPEN},say:${SAY}};\n`

const browsers = {}
export async function mk(sz) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit.launch() : chromium.launch(LAUNCH))
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext(opts)
  await ctx.route(`**/assets/${INDEX}`, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: PATCHED }))
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H: S.h, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} [${sz}] ${r.url().slice(0, 120)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
export async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
export function FACT(k, v) { console.log(`FACT ${k}=${JSON.stringify(v)}`) }
export const wait = (s, ms) => s.page.waitForTimeout(ms)
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export async function run(key, sz, fn) {
  const s = await mk(sz)
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { FACT(`${key}.errs`, s.errs); await s.ctx.close().catch(() => {}) }
}
export async function signIn(s, u, p) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(600)
  if (!(await page.evaluate(() => !!window.__n204))) throw new Error('the probe is not on the page')
}
export async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await s.page.waitForTimeout(ms)
}
export const boxOf = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }
}, sel)
export const covered = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return 'not drawn'
  const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return `off screen at ${Math.round(x)},${Math.round(y)}`
  const t = document.elementFromPoint(x, y)
  return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName.toLowerCase()}${t?.id ? '#' + t.id : ''}`
}, sel)
export const barSq = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 }
  const m = [...document.querySelectorAll('.topbar .mark, .drawer-sqn .mark')].find(shown)
  return m ? m.textContent.replace(/\s+/g, ' ').trim() : null
})
export async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    if (s.desk) await s.page.mouse.click(s.W - 8, 500); else await s.page.touchscreen.tap(s.W - 8, Math.min(500, s.H - 20))
    await s.page.waitForTimeout(400)
  }
}
export async function go(s, name) {
  const tab = vis(s, `#topnav a[data-page="${name}"]`)
  if (await tab.count()) { await hit(s, tab.first(), 500); return }
  await hit(s, '#burger', 350)
  await hit(s, `#drawerNav a[data-page="${name}"]`, 500)
  await shut(s)
}
export const windowsNow = s => s.page.evaluate(() => {
  const vis = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }
  const found = []
  for (const e of document.querySelectorAll('[role=dialog], [role=alertdialog], .floatwin, dialog[open], #dlgModal, .modal, .lwsheet, .sheet')) { if (!vis(e)) continue; if (found.some(o => o.contains(e))) continue; found.push(e) }
  return found.map(el => ({ what: (el.id ? '#' + el.id : '') + '.' + String(el.className).split(/\s+/).slice(0, 2).join('.'), testid: el.dataset?.testid || null, words: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) }))
})
export const words = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)

/* the squadron list as a person opens it - the picker on a desktop, the ☰ menu's list on a phone - read (its rows and
   149's id), then closed again with nothing picked, as the built guard would leave it after a refused press */
export async function listOpenedAndClosed(s, k) {
  let rows
  if (s.desk) {
    await hit(s, '#sqnMenuBtn', 400)
    rows = await rowsOf(s, '#sqnMenu .sqm-row')
    await s.page.keyboard.press('Escape'); await wait(s, 300)
    if ((await words(s, '#sqnMenu .sqm-row')).length) { await hit(s, '#sqnMenuBtn', 300) }
  } else {
    await hit(s, '#burger', 500)
    if (!(await s.page.locator('#drawerSqnList .sqm-row').filter({ visible: true }).count()) && await s.page.locator('#drawerSqnBtn').count()) await hit(s, '#drawerSqnBtn', 400)
    rows = await rowsOf(s, '#drawerSqnList .sqm-row')
    await shut(s)
  }
  FACT(`${k}.squadronList`, rows)
  return rows
}
const rowsOf = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ words: e.innerText.replace(/\s+/g, ' ').trim(), num: e.querySelector('.sqm-num')?.textContent.trim() ?? null, data: { ...e.dataset } })), sel)

/* THE APP'S OWN REFUSAL: whatIsOpen() on the state reached, then guardSay(refusal, 'pick', to, { from }) */
export async function refuseAppWay(s, k, to) {
  const from = s.desk ? 'bar' : 'drawer'
  const r = await s.page.evaluate(([to, from]) => {
    const w = window.__n204.open([])
    if (!w) return { refused: false }
    const ref = { reason: w.reason, id: w.row.id, where: w.row.where }
    window.__n204.say(ref, 'pick', to, { from })
    const t = document.querySelector('#toastEl')
    return { refused: true, refusal: ref, words: t ? t.textContent.replace(/\s+/g, ' ').trim() : null, at: t?.dataset.at ?? null }
  }, [to, from])
  FACT(`${k}.refusal`, r)
  if (!r.refused) throw new Error('nothing refuses the pick in this state')
  await hold(s)
  return r
}
/* the note's fade held off (opacity only - its place is the app's) */
async function hold(s) {
  await wait(s, 400)
  await s.page.evaluate(() => {
    const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.finish())
    const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }
    put(); window.__n204hold?.disconnect(); window.__n204hold = new MutationObserver(put); window.__n204hold.observe(t, { attributes: true, attributeFilter: ['style'] })
  })
  await wait(s, 150)
}
/* the recommended wording: the words after "Blocked:" swapped in the note's own element, then placed again by the app */
export async function swapWords(s, k, text) {
  const r = await s.page.evaluate(text => {
    const t = document.querySelector('#toastEl'), rest = t.querySelector('.bk-rest'), lead = t.querySelector('.bk-words b')
    const i = text.indexOf(':'); lead.textContent = text.slice(0, i + 1); rest.textContent = ' ' + text.slice(i + 1).trim()
    window.dispatchEvent(new Event('resize'))
    return t.textContent.replace(/\s+/g, ' ').trim()
  }, text)
  await wait(s, 300)
  FACT(`${k}.swapped`, r)
  if (r !== text) throw new Error('the swap did not take: ' + r)
}
export async function noteFacts(s, key, text, sels = {}) {
  const r = await s.page.evaluate(({ sels }) => {
    const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 ? { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } : null }
    const first = sel => [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 })
    const hits = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    const t = document.querySelector('#toastEl'), c = getComputedStyle(t), nb = bx(t)
    const rg = document.createRange(); rg.selectNodeContents(t)
    const tops = []; for (const q of rg.getClientRects()) { if (q.width < 2) continue; const m = q.top + q.height / 2; if (!tops.some(y => Math.abs(y - m) < q.height * 0.6)) tops.push(m) }
    const out = { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, at: t.dataset.at || null, opacity: c.opacity, box: nb, lines: tops.length, onScreen: nb.x >= 0 && nb.y >= 0 && nb.x + nb.w <= innerWidth && nb.y + nb.h <= innerHeight, boxes: {}, liesOver: [] }
    for (const [k, sel] of Object.entries(sels)) { const b = bx(first(sel)); out.boxes[k] = b; if (hits(nb, b)) out.liesOver.push(k) }
    return out
  }, { sels })
  FACT(`${key}.note`, { words: r.words, box: r.box, lines: r.lines, where: r.at, face: r.face, opacity: r.opacity, onScreen: r.onScreen })
  FACT(`${key}.note.liesOver`, r.liesOver.length ? r.liesOver : 'none of: ' + Object.keys(sels).join(', '))
  if (r.face !== 'blocked' || r.words !== text) throw new Error('the note did not draw the words: ' + JSON.stringify(r.words))
  return r
}
/* the mark of this round: what is new in the app (the note) - a teal dashed ring, 2px, 4px clear */
export const tring = (s, b, tag = '') => s.page.evaluate(([b, c, tag]) => {
  const d = document.createElement('div'); d.className = '__n204ring'; d.dataset.tag = tag
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px dashed ${c}`, outlineOffset: '0', zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' })
  document.body.appendChild(d); return { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }
}, [b, TEAL, tag])
export const untring = s => s.page.evaluate(() => document.querySelectorAll('.__n204ring').forEach(e => e.remove()))
/* a picture pair: `<name>.png` the whole screen and `<name>-crop.png` cut to the boxes given (whole=false: the crop only) */
export async function sshot(s, name, rects, pad = 14, whole = true) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
  if (whole) await page.screenshot({ path: `${OUT}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${OUT}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log('  picture ' + name + (whole ? '.png' : '') + (rects.length ? ' + -crop' : ''))
}

/* THE THIRD SQUADRON (his D2630: three squadrons in the picker), made by the picture itself as n191/draw-s1-notes.mjs
   made it: Saber, Admin -> Squadrons -> "+ New squadron": 150, Home base, first admin Kestrel (149) -> Save */
export async function adminCat(s, label) {
  /* already on Admin: only the section is pressed (its list stays as a person leaves it) */
  if (await s.page.evaluate(() => window.CURPAGE) !== 'admin') { await go(s, 'admin'); await wait(s, 700) }
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: new RegExp('^' + label) }).first(), 700)
}
export async function make150(s, k) {
  const { page } = s
  await adminCat(s, 'Squadrons')
  await hit(s, '#sqNew', 500)
  await page.fill('#sqNewNum', '150'); await page.selectOption('#sqNewPlace', 'p1').catch(() => {})
  await page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' })
  await hit(s, '#sqNewSave', 1000)
  FACT(`${k}.made150`, { list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200), formClosed: !(await vis(s, '#sqNewSave').count()) })
}
