// draw-lib - [MSQ-PICK-GUARD] the second questions page (chat 175, 25 Nov 26): shared helpers of the DRAWINGS, on the
// REAL app served at 4700 (never started or stopped here). Reuses this job's lib (./lib.mjs: the four sizes, the phone
// sizes WebKit with touch) and chat 166's openers (../n166/draw-lib.mjs), both read only. Pictures go to
// docs/mock/2026-11-25-msq-pick-guard-q2/drawn/. Nothing here writes the app's code.
//
// THE DRAWN PARTS (the app's own parts, D1496):
//  - the refusal note: the app's own grey "Blocked:" note, raised by the app's own window.toast(text, 'blocked'); its
//    fade is stopped for the picture and, where a picture asks, ONLY its place is changed (top / left / right by inline
//    style, as chat 166's draw-beside did - the look of record p1b, p2b, p4b).
//  - a question card: the app's own `.askcard` (ui/AskCard.tsx - the card the Input window raises for "This input has
//    unsaved changes. Open …'s input and lose them?"), captured once from the running page (its markup and its measured
//    look) and built again from that markup with the new words and buttons. It hangs from the control pressed by the
//    app's own placing rule, copied from ui/AskCard.tsx: 9px from the control, under it where there is room, else over
//    it; its right edge on the control's where the control is right of the middle, else its left; never nearer the
//    screen's edge than 8px; the small pointer at the control's middle. Changed from the real card, each named: it is
//    appended to the page's body and stands above everything (a z-index of the drawing's own).
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mk, closeAll, FACT, note, signIn, go, shut, barSq, wait, boxOf, covered, vis, hit, reachPick, roleNow, windowsNow, bands, tmpDir, tapCentre, tapAt } from './lib.mjs'
import { openInput, inputsList, typeWords, inputWin } from '../n166/draw-lib.mjs'
export { mk, closeAll, FACT, note, signIn, go, shut, barSq, wait, boxOf, covered, vis, hit, reachPick, roleNow, windowsNow, bands, tapCentre, tapAt, openInput, inputsList, typeWords, inputWin }
const HERE = dirname(fileURLToPath(import.meta.url))
export const DRAWN = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q2/drawn')
export const TMP = tmpDir('draw')
mkdirSync(DRAWN, { recursive: true })
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
export const want = k => !ONLY.length || ONLY.includes(k)

/* one picture's run in a fresh browser of its own */
export async function run(key, sz, fn) {
  const s = await mk(sz)
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 240)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
}
/* a picture pair into drawn/: `<name>.png` the whole screen, `<name>-crop.png` cut to the union of the given boxes */
export async function shot(s, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${DRAWN}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${DRAWN}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  note('picture', `${name}.png` + (rects.length ? ' + -crop' : ''))
}
/* a scratch picture, not in the repo */
export async function scratch(s, name) { await s.page.screenshot({ path: `${TMP}/${name}.png` }); note('scratch', name) }

/* THE STAND-IN FOR A FAILED SAVE (chat 166's save-d, d2): the browser's storage refuses every write from now on, so the
   next save fails and the "Not saved" band stands with its Retry */
export async function refuseSaves(s) {
  await s.page.evaluate(() => { window.__n175 = { hits: 0, real: Storage.prototype.setItem }; Storage.prototype.setItem = function () { window.__n175.hits++; throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') } })
}
/* an input's Remarks changed and its Save pressed with the stand-in on: the window closes, the band stands */
export async function failedSave(s, key, words = 'N175 not saved') {
  const o = await openInput(s, 0, null)
  await refuseSaves(s)
  const typed = await typeWords(s, '#inpEditRmk', words)
  await hit(s, '#inpEditSave', 300)
  await s.page.waitForSelector('.savestat.failed', { timeout: 8000 })
  await wait(s, 600)
  const band = await bandNow(s)
  FACT(`${key}.standIn`, 'browser storage refuses every write (localStorage.setItem throws), installed just before the Save')
  FACT(`${key}.failedSave`, { input: o.who, typed, band })
  if (!band || !/^Not saved/.test(band.words) || !band.retry) throw new Error('the "Not saved" band with Retry is not standing: ' + JSON.stringify(band))
  return band
}
export const bandNow = s => s.page.evaluate(() => {
  const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 ? { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } : null }
  const e = [...document.querySelectorAll('.savestat.failed, .saveband')].find(x => x.getBoundingClientRect().width > 1 && /Not saved/.test(x.textContent))
  if (!e) return null
  const r = [...e.querySelectorAll('button')].find(b => /^Retry$/.test(b.textContent.trim()))
  const at = r ? (() => { const b = r.getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) })() : null
  return { words: e.textContent.replace(/\s+/g, ' ').trim(), box: bx(e), retry: bx(r), retryInFront: !!r && !!at && (at === r || r.contains(at)) }
})

/* THE REFUSAL NOTE. raise: the app's own note, its fade stopped. place: only its place changed. */
export async function raise(s, text) {
  /* a note raised before in this browser: its hold let go and its drawn place cleared, so the app places it afresh */
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
/* the app's own two places for a passing note - the foot, or the top (its rule while a window is open on a phone,
   D731 (1)): the note's own `data-at` switched, nothing else */
export async function standAt(s, where) {
  await s.page.evaluate(w => { document.querySelector('#toastEl').dataset.at = w }, where)
  await wait(s, 200)
  return s.page.evaluate(() => { const t = document.querySelector('#toastEl'), b = t.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), at: t.dataset.at || null } })
}
/* what the note says, where, how many lines its words take, what it lies over, whether anything is drawn over it */
export async function noteFacts(s, key, text, sels = {}) {
  const r = await s.page.evaluate(({ sels }) => {
    const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 ? { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } : null }
    const first = sel => [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 })
    const hits = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    const t = document.querySelector('#toastEl'), c = getComputedStyle(t), nb = bx(t)
    /* the lines its words take: the distinct lines of the letters themselves */
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

/* THE QUESTION CARD'S TEMPLATE: the real `.askcard`, captured once (a desktop) from the Input window's "Open the other
   input and lose them?" question, then reused */
const ASK = resolve(TMP, 'askcard.json')
export async function askTemplate() {
  if (existsSync(ASK)) return JSON.parse(readFileSync(ASK, 'utf8'))
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    await openInput(s, 0, 'N175 ask words')
    const rows = vis(s, '#inBody tr[data-iid], #inList [data-iid]')
    const o = rows.nth(1).locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : rows.nth(1), 700)
    await s.page.waitForSelector('[data-testid="inped-swap"]', { timeout: 6000 })
    const t = await s.page.evaluate(() => {
      const c = document.querySelector('[data-testid="inped-swap"]'), cs = getComputedStyle(c)
      const q = c.querySelector('.askcard-q'), go = c.querySelector('[data-testid="inped-swap-go"]'), stay = c.querySelector('[data-testid="inped-swap-stay"]')
      const look = b => { const x = getComputedStyle(b); return `${x.backgroundColor} | ${x.color} | ${x.borderTopColor} ${x.borderTopWidth} | ${x.fontSize} ${x.fontWeight} | ${x.minHeight} | ${x.padding} | ${x.borderTopLeftRadius}` }
      return { html: c.outerHTML, cardClass: c.className, question: q.textContent.trim(), buttons: [go.textContent.trim(), stay.textContent.trim()], classes: { danger: go.className, primary: stay.className },
        look: { bg: cs.backgroundColor, border: cs.borderTopColor + ' ' + cs.borderTopWidth, radius: cs.borderTopLeftRadius, padding: cs.padding, width: cs.width, shadow: cs.boxShadow, gap: cs.gap, qFont: getComputedStyle(q).fontSize + ' ' + getComputedStyle(q).fontWeight + ' ' + getComputedStyle(q).color, danger: look(go), primary: look(stay) } }
    })
    await hit(s, '[data-testid="inped-swap-stay"]', 400)
    writeFileSync(ASK, JSON.stringify(t, null, 1))
    FACT('askcard.captured', { question: t.question, buttons: t.buttons, classes: t.classes, look: t.look })
    return t
  } finally { await s.ctx.close().catch(() => {}) }
}
/* THE QUESTION CARD, hanging from the control pressed. buttons: [[words, 'danger' | 'plain' | 'primary'], …] - 'danger'
   and 'primary' take the real card's two buttons' classes; 'plain' is the app's ordinary button (`abtn`, as the window's
   Cancel). The last is the safe answer, as on the real card. */
export async function askCard(s, key, { at, question, buttons, sels = {} }) {
  const tpl = await askTemplate()
  await s.page.evaluate(({ tpl, at, question, buttons }) => {
    document.getElementById('n175card')?.remove()
    const tt = document.querySelector('#toastEl'); if (tt && !window.__n175want) tt.style.opacity = '0'
    const ctl = [...document.querySelectorAll(at)].find(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 })
    if (!ctl) throw new Error('no control ' + at)
    const holder = document.createElement('div'); holder.innerHTML = tpl.html
    const c = holder.firstElementChild; c.id = 'n175card'; c.removeAttribute('data-testid'); c.removeAttribute('style')
    c.className = 'askcard ac-below ac-over'
    c.setAttribute('aria-label', question)
    c.querySelector('.askcard-q').textContent = question
    const row = c.querySelector('.askcard-btns'); row.textContent = ''
    for (const [words, kind] of buttons) { const b = document.createElement('button'); b.type = 'button'; b.className = kind === 'plain' ? 'abtn' : tpl.classes[kind]; b.textContent = words; row.appendChild(b) }
    document.body.appendChild(c)
    c.style.zIndex = '2147483000'
    /* the app's own placing rule (ui/AskCard.tsx) */
    const GAP = 9, EDGE = 8, FRAME = '.floatwin, .bidsheet, [role="dialog"], dialog'
    const vw = innerWidth, vh = innerHeight, r = ctl.getBoundingClientRect()
    const fw = ctl.closest(FRAME), fr = fw ? fw.getBoundingClientRect() : null
    const lo = fr && fr.width >= 316 ? Math.max(EDGE, fr.left + 4) : EDGE, hi = fr && fr.width >= 316 ? Math.min(vw - EDGE, fr.right - 4) : vw - EDGE
    const W = c.offsetWidth, H = c.offsetHeight
    const mid = (r.left + r.right) / 2, fmid = fr ? (fr.left + fr.right) / 2 : vw / 2
    let left = mid > fmid ? r.right - W : r.left, top, side = 'below'
    left = Math.min(Math.max(left, lo), Math.max(lo, hi - W))
    if (r.bottom + GAP + H <= vh - EDGE || r.top - GAP - H < EDGE) top = r.bottom + GAP; else { top = r.top - GAP - H; side = 'above' }
    const px = Math.min(Math.max(mid - left, 14), W - 14)
    c.className = 'askcard ac-' + side + ' ac-over'
    c.style.left = Math.round(left) + 'px'; c.style.top = Math.round(top) + 'px'; c.style.setProperty('--ac-px', Math.round(px) + 'px')
  }, { tpl, at, question, buttons })
  await wait(s, 250)
  const r = await s.page.evaluate(({ at, sels }) => {
    const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 ? { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } : null }
    const first = sel => [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 })
    const hits = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    const c = document.getElementById('n175card'), cs = getComputedStyle(c), cb = bx(c), q = c.querySelector('.askcard-q')
    const rg = document.createRange(); rg.selectNodeContents(q)
    const tops = []; for (const k of rg.getClientRects()) { if (k.width < 2) continue; const m = k.top + k.height / 2; if (!tops.some(y => Math.abs(y - m) < k.height * 0.6)) tops.push(m) }
    const look = b => { const x = getComputedStyle(b); return `${x.backgroundColor} | ${x.color} | ${x.borderTopColor} ${x.borderTopWidth} | ${x.fontSize} ${x.fontWeight} | ${x.minHeight} | ${x.padding} | ${x.borderTopLeftRadius}` }
    const btns = [...c.querySelectorAll('button')]
    const at0 = document.elementFromPoint(cb.x + cb.w / 2, cb.y + 12)
    const out = { question: q.textContent, buttons: btns.map(b => b.textContent.trim()), buttonKinds: btns.map(b => b.className), buttonsOnOneLine: new Set(btns.map(b => Math.round(b.getBoundingClientRect().top))).size === 1, buttonsInside: btns.every(b => { const x = b.getBoundingClientRect(); return x.left >= cb.x && x.right <= cb.x + cb.w + 0.5 }),
      box: cb, lines: tops.length, side: c.className.includes('ac-above') ? 'over the control' : 'under the control', control: bx(first(at)), inFront: !!at0 && c.contains(at0), onScreen: cb.x >= 0 && cb.y >= 0 && cb.x + cb.w <= innerWidth && cb.y + cb.h <= innerHeight, boxes: {}, liesOver: [],
      look: { bg: cs.backgroundColor, border: cs.borderTopColor + ' ' + cs.borderTopWidth, radius: cs.borderTopLeftRadius, padding: cs.padding, width: cs.width, shadow: cs.boxShadow, gap: cs.gap, qFont: getComputedStyle(q).fontSize + ' ' + getComputedStyle(q).fontWeight + ' ' + getComputedStyle(q).color }, btnLooks: btns.map(look) }
    for (const [k, sel] of Object.entries(sels)) { const b = bx(first(sel)); out.boxes[k] = b; if (hits(cb, b)) out.liesOver.push(k) }
    return out
  }, { at, sels })
  FACT(`${key}.card`, { question: r.question, buttons: r.buttons, box: r.box, lines: r.lines, hangs: r.side, from: at, control: r.control, buttonsOnOneLine: r.buttonsOnOneLine, buttonsInside: r.buttonsInside, inFront: r.inFront, onScreen: r.onScreen })
  FACT(`${key}.card.liesOver`, r.liesOver.length ? r.liesOver : 'none of: ' + Object.keys(sels).join(', '))
  if (s.desk) {
    const same = Object.keys(tpl.look).filter(k => !['danger', 'primary'].includes(k)).every(k => tpl.look[k] === r.look[k])
    const kinds = buttons.map(([, kind], i) => kind === 'plain' ? 'plain: the app\'s ordinary button' : (tpl.look[kind] === r.btnLooks[i] ? `${kind}: as the real card's` : `${kind}: DIFFERS ${r.btnLooks[i]} / ${tpl.look[kind]}`))
    FACT(`${key}.card.sameLookAsTheRealCard`, same ? { card: 'yes - surface, edge, corner, padding, width, shadow, gap and question letters match the real card', buttons: kinds } : { real: tpl.look, drawn: r.look })
  }
  if (r.question !== question || r.buttons.join('|') !== buttons.map(b => b[0]).join('|') || !r.inFront) throw new Error('the card did not draw as asked: ' + JSON.stringify(r))
  return r
}
export const R = b => b ? { x: b.x, y: b.y, w: b.w, h: b.h } : null

/* ADMIN → USERS, A ROW OPENED WITH TYPING: a person's row pressed open (chat 166's type-c way), words typed into its
   sign-in box. Returns the row's own words, the typed words, and the selectors of the row and its box. */
export async function openUsersRow(s, words = 'n175.typed@mail', person = 'prowler') {
  await go(s, 'admin'); await wait(s, 700)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
  const r = vis(s, `#page-admin .acc-row[data-person="${person}"] .acc-tap`).first()
  await r.scrollIntoViewIfNeeded()
  const b = await r.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + 40, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + 40, b.y + b.height / 2)
  await s.page.waitForSelector('#page-admin .acc-row.od-row-on .acc-edit', { timeout: 8000 }); await wait(s, 400)
  const box = (await vis(s, '#accEdName').count()) ? '#accEdName' : '#accGiveName'
  const typed = await typeWords(s, box, words)
  if (s.desk) await s.page.mouse.move(1, 1)
  const row = await s.page.evaluate(() => { const e = document.querySelector('#page-admin .acc-row.od-row-on'); return { words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 120), buttons: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()).slice(0, 12) } })
  return { rowSel: '#page-admin .acc-row.od-row-on', boxSel: box, typed, ...row }
}
/* INPUTS SETTINGS → CALENDAR → HOLIDAYS → + ADD, a name typed (chat 166's win-a way) */
export async function openHolidayAdd(s, words = 'N175 holiday') {
  const tid = t => `[data-testid="${t}"]`
  await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700)
  if (await vis(s, tid('days-tab-holidays')).count()) await hit(s, tid('days-tab-holidays'))
  await hit(s, tid('hol-add'), 500)
  let typed = await typeWords(s, tid('hol-name'), words).catch(() => null)
  if (typed !== words) { await vis(s, tid('hol-name')).first().fill(words); typed = await vis(s, tid('hol-name')).first().inputValue() }
  return { typed, boxSel: tid('hol-name') }
}
