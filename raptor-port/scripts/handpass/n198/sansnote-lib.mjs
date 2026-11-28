// sansnote-lib - section 1 (the guard rail), chat 198, 26 Nov 26 (brief
// docs/superpowers/briefs/2026-11-26-msq-s1-sansnote-draw-brief.md). The SANS calendar settings note drawn beside the
// approved Inputs one. The helpers are COPIED, bodies unchanged, from the scripts that drew the approved Inputs note,
// because those hard-code port 4700 and build their world through a form box that no longer exists:
//   mk / SIZES        n175/lib.mjs        (d = Chromium 1536x864, p = WebKit 402x874 with touch, both at 2x)
//   raise / place / noteFacts            n175/draw-lib.mjs  (the app's own window.toast(text, 'blocked'), fade stopped)
//   tring / sshot / underCtl / atFoot / clearOfNamed   n191/draw-s1-lib.mjs (teal dashed ring, foot place, picker place)
//   pickerOpenedAndClosed / menuListOpenedAndClosed / refusePick   n191/draw-s1-notes.mjs
//   signIn / go / hit / boxOf / covered / barSq / shut / windowsNow   n194/k0p-lib.mjs
// Only the port (4741) and the picture names (s1-cal-sanssettings-*) differ. The app is the BUILT one in dist, never
// rebuilt here. Nothing here writes the app's code.
import { mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('playwright')
/* the repo's own browser fallback (playwright.config.ts) */
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const URL_ = 'http://localhost:4741/'
export const DRAWN = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/drawn')
export const TMP = resolve(ROOT, '.tmp/n198-sansnote'); mkdirSync(TMP, { recursive: true })
export const TEAL = '#0D9488'
export const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 402, h: 874, eng: 'webkit' } }
const browsers = {}
export async function mk(sz) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit.launch() : chromium.launch(LAUNCH))
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext(opts)
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
export async function signIn(s, u, p) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(600)
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
  return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName.toLowerCase()}${t?.id ? '#' + t.id : ''}${t?.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}`
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

/* ---- THE REFUSAL NOTE (n175/draw-lib.mjs, unchanged) ---- */
export async function raise(s, text) {
  await s.page.evaluate(() => { window.__n175hold?.disconnect(); const t = document.querySelector('#toastEl'); if (t && window.__n175want) for (const k of ['top', 'bottom', 'left', 'right', 'transform']) t.style[k] = '' })
  const ok = await s.page.evaluate(t => { if (typeof window.toast !== 'function') return false; window.toast(t, 'blocked'); return true }, text)
  if (!ok) throw new Error('window.toast is not on the page')
  await wait(s, 450)
  await s.page.evaluate(() => {
    const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.cancel())
    window.__n175want = { opacity: '1' }
    const put = () => { for (const [k, v] of Object.entries(window.__n175want)) if (t.style[k] !== v) t.style[k] = v }
    put(); window.__n175hold?.disconnect(); window.__n175hold = new MutationObserver(put); window.__n175hold.observe(t, { attributes: true, attributeFilter: ['style'] })
  })
  await wait(s, 150)
  return s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), at: t.dataset.at || null } })
}
export async function place(s, p) {
  await s.page.evaluate(p => {
    const t = document.querySelector('#toastEl')
    Object.assign(window.__n175want, { top: p.top != null ? p.top + 'px' : 'auto', bottom: p.bottom != null ? p.bottom + 'px' : 'auto', transform: 'none', left: p.left != null ? p.left + 'px' : 'auto', right: p.right != null ? p.right + 'px' : 'auto', opacity: '1' })
    for (const [k, v] of Object.entries(window.__n175want)) t.style[k] = v
  }, p)
  await wait(s, 200)
}
export async function noteFacts(s, key, text, sels = {}) {
  const r = await s.page.evaluate(({ sels }) => {
    const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 ? { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } : null }
    const first = sel => [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 })
    const hits = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    const t = document.querySelector('#toastEl'), c = getComputedStyle(t), nb = bx(t)
    const rg = document.createRange(); rg.selectNodeContents(t)
    const tops = []; for (const q of rg.getClientRects()) { if (q.width < 2) continue; const m = q.top + q.height / 2; if (!tops.some(y => Math.abs(y - m) < q.height * 0.6)) tops.push(m) }
    const pe = t.style.pointerEvents; t.style.pointerEvents = 'auto'
    const over = new Set()
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 4; j++) { const e = document.elementFromPoint(nb.x + 12 + (nb.w - 24) * i / 8, nb.y + 3 + (nb.h - 6) * j / 4); if (e && !t.contains(e)) over.add((e.id ? '#' + e.id : e.tagName) + '.' + String(e.className).split(/\s+/)[0]) }
    t.style.pointerEvents = pe
    const out = { words: t.textContent.replace(/\s+/g, ' ').trim(), lead: t.querySelector('.bk-words b')?.textContent ?? null, sign: !!t.querySelector('.bk-sign'), face: t.dataset.face || null, at: t.dataset.at || null, opacity: c.opacity, box: nb, lines: tops.length, onScreen: nb.x >= 0 && nb.y >= 0 && nb.x + nb.w <= innerWidth && nb.y + nb.h <= innerHeight, drawnOverTheNote: [...over], boxes: {}, liesOver: [] }
    for (const [k, sel] of Object.entries(sels)) { const b = bx(first(sel)); out.boxes[k] = b; if (hits(nb, b)) out.liesOver.push(k) }
    return out
  }, { sels })
  FACT(`${key}.note`, { words: r.words, box: r.box, lines: r.lines, where: r.at, lead: r.lead, sign: r.sign, face: r.face, onScreen: r.onScreen })
  FACT(`${key}.note.liesOver`, r.liesOver.length ? r.liesOver : 'none of: ' + Object.keys(sels).join(', '))
  FACT(`${key}.note.drawnOverIt`, r.drawnOverTheNote.length ? r.drawnOverTheNote : 'nothing - the note is in front at every point')
  if (r.face !== 'blocked' || r.words !== text) throw new Error('the note did not draw the words: ' + JSON.stringify(r.words))
  return r
}

/* ---- the marks, places and pictures (n191/draw-s1-lib.mjs, unchanged but for the folder) ---- */
export const tring = (s, b, tag = '') => s.page.evaluate(([b, c, tag]) => {
  const d = document.createElement('div'); d.className = '__s1ring'; d.dataset.tag = tag
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px dashed ${c}`, outlineOffset: '0', zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' })
  document.body.appendChild(d); return { ring: { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }, around: b, tag }
}, [b, TEAL, tag])
export async function sshot(s, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
  const file = `s1-${name}`
  await page.screenshot({ path: `${DRAWN}/${file}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${DRAWN}/${file}-crop.png`, clip })
    FACT(`${file}.crop`, clip)
  }
  console.log('  picture ' + file + '.png' + (rects.length ? ' + -crop' : ''))
}
export async function underCtl(s, k, ctlSel, edge = null) {
  const ctl = await boxOf(s, ctlSel), bar = await boxOf(s, '.topbar')
  const left = edge ? edge === 'left' : ctl.x + ctl.w / 2 < s.W / 2
  const p = left ? { top: bar.y + bar.h + 8, left: ctl.x } : { top: bar.y + bar.h + 8, right: Math.round(s.W - (ctl.x + ctl.w)) }
  FACT(`${k}.placed`, { control: ctlSel, controlBox: ctl, edge: left ? 'left' : 'right', ...p })
  await place(s, p)
}
const NAMES = '^(Save|Cancel|Add|Add person|Add person and sign-in|Save and add another|Save them|Discard them|Stay|Delete|Close|Retry|✕)$|^Create |^Add \\d+ holidays?$'
export async function clearOfNamed(s, k, extra = '') {
  const meets = () => s.page.evaluate(([names, extra]) => {
    const t = document.querySelector('#toastEl'), n = t.getBoundingClientRect(), re = new RegExp(names)
    const pool = [...document.querySelectorAll('button, [role="button"]')].filter(e => re.test(e.textContent.trim()) || (e.getAttribute('aria-label') || '') === 'Close')
    if (extra) pool.push(...document.querySelectorAll(extra))
    const pe = t.style.pointerEvents; t.style.pointerEvents = 'none'
    const front = e => { const b = e.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + Math.min(b.height / 2, 6)); return !!h && (h === e || e.contains(h)) }
    const hits = pool.filter(e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 && front(e) && b.left < n.right && b.right > n.left && b.top < n.bottom && b.bottom > n.top })
    t.style.pointerEvents = pe
    return { met: hits.map(e => (e.getAttribute('data-testid') || e.id || e.textContent.trim().slice(0, 30))), top: hits.length ? Math.min(...hits.map(e => e.getBoundingClientRect().top)) : null, H: innerHeight }
  }, [NAMES, extra])
  let r = await meets(); const steps = []
  for (let i = 0; i < 6 && r.met.length; i++) { steps.push(r.met); await place(s, { bottom: Math.round(r.H - r.top + 8), left: 12, right: 12 }); r = await meets() }
  const b = await boxOf(s, '#toastEl')
  FACT(`${k}.clearOfNamed`, steps.length ? { metAtEachPlace: steps, movedTo: 'just above the highest named control met, until clear', box: b } : 'the foot place covers no control the note names')
  return steps
}
export async function atFoot(s, k) {
  await place(s, { bottom: 26, left: 12, right: 12 })
  await s.page.evaluate(() => { document.querySelector('#toastEl').dataset.at = 'foot' })
  await wait(s, 200)
  const b = await boxOf(s, '#toastEl'); FACT(`${k}.placed`, { where: 'the foot (ui/toast.ts placeToast\'s phone foot: 12px each side, 26px up)', box: b })
  return b
}

/* ---- the press made as far as the guard lets it (n191/draw-s1-notes.mjs, unchanged) ---- */
async function pickerOpenedAndClosed(s, k) {
  await hit(s, '#sqnMenuBtn', 400)
  FACT(`${k}.listOpened`, await words(s, '#sqnMenu .sqm-row'))
  await hit(s, '#sqnMenuBtn', 400)
  if ((await words(s, '#sqnMenu .sqm-row')).length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  FACT(`${k}.listClosed`, !(await words(s, '#sqnMenu .sqm-row')).length)
}
async function menuListOpenedAndClosed(s, k) {
  FACT(`${k}.burger`, await covered(s, '#burger'))
  await hit(s, '#burger', 500)
  if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
  FACT(`${k}.listOpened`, await words(s, '#drawerSqnList .sqm-row'))
  await shut(s)
  FACT(`${k}.menuClosed`, !(await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))))
}
export async function refusePick(s, k, text, sels = {}, extra = '') {
  if (s.desk) await pickerOpenedAndClosed(s, k); else await menuListOpenedAndClosed(s, k)
  await raise(s, text)
  if (s.desk) await underCtl(s, k, '#sqnMenuBtn'); else { await atFoot(s, k); await clearOfNamed(s, k, extra) }
  const m = await noteFacts(s, k, text, { picker: '#sqnMenuBtn', burger: '#burger', ...sels })
  FACT(`${k}.state`, { squadron: await barSq(s), windows: (await windowsNow(s)).map(w => w.testid || w.what) })
  return m
}

/* two phone pictures side by side, each cut to the same part of its screen (CSS px of the phone), at 2x */
export async function sideBySide(outFile, left, right, cut) {
  const b = browsers.chromium || (browsers.chromium = await chromium.launch(LAUNCH))
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  const d = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  const fig = (f, label) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:600;color:#111">${label}</figcaption>
    <div style="width:${cut.w}px;height:${cut.h}px;overflow:hidden;position:relative;border:1px solid #bbb">
    <img src="${d(f)}" style="position:absolute;left:${-cut.x}px;top:${-cut.y}px;width:${cut.phoneW}px"></div></figure>`
  await p.setContent(`<html><body style="margin:0;background:#fff;font:15px system-ui,sans-serif"><div id="w" style="display:inline-flex;gap:28px;padding:16px;align-items:flex-start">${fig(left.file, left.label)}${fig(right.file, right.label)}</div></body></html>`)
  await p.waitForTimeout(300)
  await p.locator('#w').screenshot({ path: outFile })
  await ctx.close()
  console.log('  picture ' + outFile.split(/[\\/]/).pop() + ' (side by side) cut=' + JSON.stringify(cut))
}
