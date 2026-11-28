// draw-lib - [MSQ-PICK-GUARD] step 2 (chat 166, 24 Nov 26): shared helpers for the drawings of the refusal note and the
// refresh note, on the REAL app served at 4700 (never started or stopped here). Reuses step 1's helpers (./lib.mjs, read
// only). Pictures go to docs/mock/2026-11-24-msq-pick-guard/drawn/. Nothing here writes the app's code.
//
// THE TWO DRAWN PARTS (the app's own parts, D1496):
//  - the refusal note: the app's own grey "Blocked:" note, raised by the app's own window.toast(text, 'blocked').
//  - the refresh note: a shade over the whole app (the values of the app's own window shade, `.modal` in
//    ui/scheduler/08-windows-tools.css: rgba(4,7,10,.7), centred, 22px padding) and ONE card in the middle, cloned from
//    the app's own question card (`.askcard`, ui/AskCard.tsx - captured from the running page by raising the Input window's
//    "This input has unsaved changes. Open … and lose them?" card, see captureAsk). Its question line holds the title, its
//    lighter second line the body, its answers row one button "Refresh" with the classes of that card's main (safe) answer.
//    Changed from the real card, each named: placed in the middle of the shade (not hanging from a control), so its small
//    pointer is not drawn; it stands above everything (a z-index of the drawing's own).
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mk, FACT, note, signIn, go, wait, boxOf } from './lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const DRAWN = resolve(HERE, '../../../docs/mock/2026-11-24-msq-pick-guard/drawn')
export const TMP = resolve(HERE, '../../../.tmp/n166-draw')
mkdirSync(DRAWN, { recursive: true }); mkdirSync(TMP, { recursive: true })
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export async function hit(s, sel, ms = 400) {
  const l = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await l.count())) throw new Error('no control ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await wait(s, ms)
}
/* the words typed: a desktop types them; a phone sets them through the box's own input event (typing on an emulated
   phone zooms the page to the box, and every later picture comes out zoomed - the mock-up guide's trap) */
export async function typeWords(s, sel, words) {
  const r = vis(s, sel).first()
  if (s.desk) { await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(words) }
  else await r.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, words)
  await wait(s, 300)
  return r.inputValue()
}
export async function inputsList(s) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test(((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '').trim())) {
    if (!(await vis(s, '#inRangeAll').count())) await hit(s, '#inRangeBtn')
    if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first())
    if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn')
  }
}
/* an existing input opened from the list (the nth row), words typed in its Remarks */
export async function openInput(s, nth = 0, words = 'N166 typed words', filter = null) {
  await inputsList(s)
  let rows = vis(s, '#inBody tr[data-iid], #inList [data-iid]'); if (filter) rows = rows.filter(filter)
  const row = rows.nth(nth)
  const who = (await row.innerText()).replace(/\s+/g, ' ').trim().slice(0, 40)
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  const typed = words ? await typeWords(s, '#inpEditRmk', words) : null
  return { who, typed }
}
/* the input window as drawn now: its title, the band in it, whether Save is live, the Remarks words */
export const inputWin = s => s.page.evaluate(() => {
  const w = [...document.querySelectorAll('.inpedwin')].find(e => e.getBoundingClientRect().width > 0)
  if (!w) return null
  const rmk = w.querySelector('#inpEditRmk'), save = w.querySelector('#inpEditSave')
  const band = w.querySelector('[data-testid="inped-moveband"]')
  return { title: (w.querySelector('.fw-title, .floatwin-title, h2, h3')?.textContent || w.innerText.split('\n')[0]).replace(/\s+/g, ' ').trim().slice(0, 60), band: band ? band.textContent.replace(/\s+/g, ' ').trim() : null, saveLive: !!save && !save.disabled && !save.closest('[inert]'), remarks: rmk ? rmk.value : null, greyed: !!w.querySelector('[inert]') || !!w.closest('[inert]') }
})

/* a picture into drawn/: the whole screen, or cut to the boxes of the given selectors (the n-th VISIBLE match of each) */
export async function shot(s, name, clipSels, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(150)
  let clip
  if (clipSels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); if (!(b.width > 0 && b.height > 0) || c.visibility === 'hidden' || +c.opacity === 0) continue; L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom) }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, clipSels)
    if (!r) throw new Error('crop: nothing drawn for ' + clipSels.join(', '))
    const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad)
    clip = { x, y, width: Math.max(10, Math.min(r.W, r.R + pad) - x), height: Math.max(10, Math.min(r.H, r.B + pad) - y) }
  }
  await page.screenshot({ path: `${DRAWN}/${name}.png`, ...(clip ? { clip } : {}) })
  note('picture', `${name}.png`)
}

/* THE REFUSAL NOTE: the app's own window.toast(text, 'blocked'); read back what it draws, where, and what it overlaps */
export async function blocked(s, key, text) {
  const ok = await s.page.evaluate(t => { if (typeof window.toast !== 'function') return false; window.toast(t, 'blocked'); return true }, text)
  if (!ok) throw new Error('window.toast is not on the page')
  await wait(s, 450)
  const r = await s.page.evaluate(() => {
    const t = document.querySelector('#toastEl'); const b = t.getBoundingClientRect(); const c = getComputedStyle(t)
    const lead = t.querySelector('.bk-words b')?.textContent ?? null, rest = t.querySelector('.bk-rest')?.textContent.trim() ?? null
    const sign = !!t.querySelector('.bk-sign')
    /* anything drawn that the note's box overlaps, and which is in front there (the note itself takes no presses, so the
       element under it is found with the note hidden for one read) */
    const ov = []
    for (const e of document.querySelectorAll('.floatwin, .bidsheet, [role=dialog], [role=alertdialog], [data-testid="bell-list"], #sqnMenu, .drawer.open, .sheet')) {
      const x = e.getBoundingClientRect(); if (!(x.width > 1 && x.height > 1)) continue
      if (x.right > b.left && x.left < b.right && x.bottom > b.top && x.top < b.bottom) ov.push((e.id ? '#' + e.id : '') + '.' + String(e.className).split(/\s+/).slice(0, 2).join('.') + ' z' + getComputedStyle(e).zIndex)
    }
    return { words: t.textContent.replace(/\s+/g, ' ').trim(), lead, rest, sign, face: t.dataset.face || null, at: t.dataset.at || null, opacity: c.opacity, z: c.zIndex, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, overlaps: ov, onScreen: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight }
  })
  FACT(`${key}.note`, r)
  if (r.face !== 'blocked' || r.words !== text) throw new Error('the note did not draw the words: ' + JSON.stringify(r))
  return r
}

/* THE QUESTION CARD TEMPLATE: captured once from the running page, then reused - the real `.askcard` the Input window
   raises when another input is pressed over unsaved changes */
const ASK = resolve(TMP, 'askcard.json')
export async function askTemplate() {
  if (existsSync(ASK)) return JSON.parse(readFileSync(ASK, 'utf8'))
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    await openInput(s, 0, 'N166 ask words')
    const rows = vis(s, '#inBody tr[data-iid], #inList [data-iid]')
    const o = rows.nth(1).locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : rows.nth(1), 700)
    await s.page.waitForSelector('[data-testid="inped-swap"]', { timeout: 6000 })
    const t = await s.page.evaluate(() => {
      const c = document.querySelector('[data-testid="inped-swap"]'), cs = getComputedStyle(c)
      const q = c.querySelector('.askcard-q'), main = c.querySelector('[data-testid="inped-swap-stay"]')
      return { cardClass: c.className, qClass: q.className, btnsClass: c.querySelector('.askcard-btns').className, mainClass: main.className, mainWords: main.textContent.trim(), question: q.textContent.trim(),
        look: { bg: cs.backgroundColor, border: cs.borderTopColor + ' ' + cs.borderTopWidth, radius: cs.borderTopLeftRadius, padding: cs.padding, width: cs.width, shadow: cs.boxShadow, qFont: getComputedStyle(q).fontSize + ' ' + getComputedStyle(q).fontWeight, mainBg: getComputedStyle(main).backgroundColor, mainFont: getComputedStyle(main).fontFamily + ' ' + getComputedStyle(main).fontSize } }
    })
    await hit(s, '[data-testid="inped-swap-stay"]', 400)
    writeFileSync(ASK, JSON.stringify(t, null, 1))
    FACT('askcard.captured', t)
    return t
  } finally { await s.ctx.close().catch(() => {}) }
}

/* THE REFRESH NOTE: the shade and the one card, drawn over whatever the screen shows now */
export async function refreshCard(s, key, { title, body }) {
  const tpl = await askTemplate()
  await s.page.evaluate(({ tpl, title, body }) => {
    document.getElementById('n166shade')?.remove(); document.getElementById('n166style')?.remove()
    const t = document.querySelector('#toastEl'); if (t) t.style.opacity = '0'
    const st = document.createElement('style'); st.id = 'n166style'
    /* the card stands in the middle, hanging from no control: its pointer is not drawn */
    st.textContent = '#n166card::before{display:none}'
    document.head.appendChild(st)
    const sh = document.createElement('div'); sh.id = 'n166shade'
    /* the app's window shade's values (.modal, ui/scheduler/08-windows-tools.css), above everything for the drawing */
    Object.assign(sh.style, { position: 'fixed', inset: '0', zIndex: '2147483000', background: 'rgba(4,7,10,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '22px' })
    const c = document.createElement('div'); c.id = 'n166card'
    c.className = tpl.cardClass.replace(/\bac-(below|above|measure)\b/g, '').replace(/\s+/g, ' ').trim()
    c.setAttribute('role', 'alertdialog'); c.setAttribute('aria-label', title)
    Object.assign(c.style, { position: 'relative', left: 'auto', top: 'auto', zIndex: 'auto' })
    const q = document.createElement('span'); q.className = tpl.qClass; q.textContent = title
    const sub = document.createElement('span'); sub.className = 'askcard-sub'; sub.textContent = body
    const btns = document.createElement('span'); btns.className = tpl.btnsClass
    const b = document.createElement('button'); b.type = 'button'; b.className = tpl.mainClass; b.textContent = 'Refresh'
    btns.appendChild(b); c.append(q, sub, btns); sh.appendChild(c); document.body.appendChild(sh)
  }, { tpl, title, body })
  await wait(s, 250)
  const r = await s.page.evaluate(() => {
    const c = document.getElementById('n166card'), cs = getComputedStyle(c), b = c.getBoundingClientRect()
    const q = c.querySelector('.askcard-q'), sub = c.querySelector('.askcard-sub'), btn = c.querySelector('button')
    const at = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    return { title: q.textContent, body: sub.textContent, buttons: [...c.querySelectorAll('button')].map(x => x.textContent.trim()),
      box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, inFront: !!at && c.contains(at), onScreen: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight,
      look: { bg: cs.backgroundColor, border: cs.borderTopColor + ' ' + cs.borderTopWidth, radius: cs.borderTopLeftRadius, padding: cs.padding, width: cs.width, shadow: cs.boxShadow, qFont: getComputedStyle(q).fontSize + ' ' + getComputedStyle(q).fontWeight, subFont: getComputedStyle(sub).fontSize + ' ' + getComputedStyle(sub).color, mainBg: getComputedStyle(btn).backgroundColor, mainFont: getComputedStyle(btn).fontFamily + ' ' + getComputedStyle(btn).fontSize } }
  })
  FACT(`${key}.card`, r)
  const same = Object.keys(tpl.look).filter(k => k !== 'width').every(k => tpl.look[k] === r.look[k])
  FACT(`${key}.card.sameLookAsTheRealCard`, same ? 'yes - surface, edge, corner, padding, shadow, question font and main button match the real card' : { real: tpl.look, drawn: r.look })
  if (r.title !== title || r.body !== body || r.buttons.join() !== 'Refresh' || !r.inFront) throw new Error('the card did not draw as asked: ' + JSON.stringify(r))
  return r
}
export { FACT, note, wait, boxOf }
