// draw-beside - [MSQ-PICK-GUARD] step 2, the redraw of pictures 1, 2 and 4 (chat 166, 24 Nov 26): the owner chose the
// refusal note BESIDE THE CONTROL HE PRESSED (the design guide: a refusal says why "beside where it went wrong"; on a
// desktop the foot is far from the squadron picker at the top left). The note is the app's own grey "Blocked:" note,
// raised by the app's own window.toast(text, 'blocked'); then ONLY that note element (#toastEl) is moved, by inline
// style - top and left (or right) set, bottom and transform cleared - and its fade stopped so it stays for the picture.
// Nothing else about its look is changed.
//  p1b (desktop): Saber, an Input window open with typed words; the bar's squadron picker pressed, its list opened and
//      closed again (the pick did not happen) -> R1 just under the picker, its left edge on the picker's, 8px below the bar.
//  p2b (desktop): the same window; the role badge pressed for the member view (one press, nothing opens) -> R2 just under
//      the badge, its RIGHT edge on the badge's, 8px below the bar.
//  p4b (desktop): Hunter on 149, an Input window open with typed words, the bell list open, the 8 Dec line (leading to
//      142) pressed and refused -> R3 just under that line inside the list, on its left edge (under the list if it
//      would not fit inside). The set-up is draw-bell's, copied (that script runs on import).
//   node raptor-port/scripts/handpass/n166/draw-beside.mjs        (ONLY=p1b,p2b,p4b)
// Pictures: drawn/p<n>b-d-after[-crop].png. FACT lines: the note's words, its box, the control's box, the window's title
// and ✕ boxes, what the note overlaps, and whether anything is drawn over the note.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mk, closeAll, FACT, note, signIn, go, barSq, reachPick, roleNow, wait, boxOf, covered, SIZES } from './lib.mjs'
import { DRAWN, TMP, hit, vis, openInput, inputsList, typeWords, inputWin } from './draw-lib.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const R1 = 'Blocked: close the open window, then pick 149.'
const R2 = 'Blocked: close the open window, then switch to the member view.'
const R3 = 'Blocked: close the open window, then press this line again.'
const GAP = 8

/* the app raises its own note; it is then moved, only by its place, and held */
async function raise(s, text) {
  const ok = await s.page.evaluate(t => { if (typeof window.toast !== 'function') return false; window.toast(t, 'blocked'); return true }, text)
  if (!ok) throw new Error('window.toast is not on the page')
  await wait(s, 450) // its 200ms rise-in finished
  return s.page.evaluate(() => { const b = document.querySelector('#toastEl').getBoundingClientRect(); return { w: b.width, h: b.height } })
}
async function moveNote(s, place) {
  await s.page.evaluate(p => {
    const t = document.querySelector('#toastEl')
    t.getAnimations?.().forEach(a => a.cancel())
    const want = { top: p.top + 'px', bottom: 'auto', transform: 'none', left: p.left != null ? p.left + 'px' : 'auto', right: p.right != null ? p.right + 'px' : '', opacity: '1' }
    const put = () => { for (const [k, v] of Object.entries(want)) if (t.style[k] !== v) t.style[k] = v }
    put()
    /* the fade stopped: the app's timer sets opacity 0 after its hold; the drawing puts it back at once (and keeps the
       place, should anything place the note again) */
    window.__n166hold?.disconnect(); window.__n166hold = new MutationObserver(put); window.__n166hold.observe(t, { attributes: true, attributeFilter: ['style'] })
  }, place)
  await wait(s, 200)
}
/* what the note says and where it is; the control's box; the window's title and ✕; overlaps; anything drawn over it */
async function measure(s, key, text, controlSel) {
  const r = await s.page.evaluate(({ controlSel }) => {
    const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width > 0 ? { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right), b: Math.round(b.bottom) } : null }
    const hits = (a, b) => !!a && !!b && a.x < b.r && a.r > b.x && a.y < b.b && a.b > b.y
    const t = document.querySelector('#toastEl'), c = getComputedStyle(t), nb = bx(t)
    const ctl = bx(document.querySelector(controlSel))
    const bar = bx(document.querySelector('.topbar'))
    const w = [...document.querySelectorAll('.inpedwin')].find(e => e.getBoundingClientRect().width > 0)
    const x = w?.querySelector('.win-x')
    const head = x?.parentElement
    const titleEls = head ? [...head.querySelectorAll('*')].filter(e => !e.closest('button') && !e.children.length && e.textContent.trim()) : []
    let title = null
    for (const e of titleEls) { const b = bx(e); if (!b) continue; title = title ? { x: Math.min(title.x, b.x), y: Math.min(title.y, b.y), r: Math.max(title.r, b.r), b: Math.max(title.b, b.b) } : { ...b } }
    if (title) { title.w = title.r - title.x; title.h = title.b - title.y }
    const titleWords = titleEls.map(e => e.textContent.trim()).join(' ').replace(/\s+/g, ' ')
    const win = bx(w), xb = bx(x)
    /* anything drawn over the note: the note takes no presses, so for this one read it takes them, and a grid of points
       across it is asked what is in front */
    const pe = t.style.pointerEvents; t.style.pointerEvents = 'auto'
    const over = new Set()
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 4; j++) {
      const px = nb.x + 12 + (nb.w - 24) * i / 8, py = nb.y + 3 + (nb.h - 6) * j / 4 /* inset past the rounded corners, which take no hits */
      const e = document.elementFromPoint(px, py)
      if (e && !t.contains(e)) over.add((e.id ? '#' + e.id : e.tagName) + '.' + String(e.className).split(/\s+/)[0])
    }
    t.style.pointerEvents = pe
    const bl = bx(document.querySelector('[data-testid="bell-list"]'))
    return {
      words: t.textContent.replace(/\s+/g, ' ').trim(), lead: t.querySelector('.bk-words b')?.textContent ?? null, sign: !!t.querySelector('.bk-sign'),
      face: t.dataset.face || null, opacity: c.opacity, z: c.zIndex, note: nb, control: ctl, topBarBottom: bar?.b ?? null,
      window: win, windowTitle: { words: titleWords, box: title }, windowX: xb, bellList: bl,
      overlaps: { title: hits(nb, title), x: hits(nb, xb), control: hits(nb, ctl), window: hits(nb, win), windowBy: win && hits(nb, win) ? Math.max(0, Math.min(nb.b, win.b) - Math.max(nb.y, win.y)) + 'px deep x ' + Math.max(0, Math.min(nb.r, win.r) - Math.max(nb.x, win.x)) + 'px wide' : null, bellList: hits(nb, bl) },
      drawnOverTheNote: [...over], onScreen: nb.x >= 0 && nb.y >= 0 && nb.r <= innerWidth && nb.b <= innerHeight,
    }
  }, { controlSel })
  FACT(`${key}.note.words`, r.words)
  FACT(`${key}.note.look`, { lead: r.lead, sign: r.sign, face: r.face, opacity: r.opacity, z: r.z })
  FACT(`${key}.note.box`, r.note)
  FACT(`${key}.control.box`, { sel: controlSel, ...r.control })
  FACT(`${key}.topBarBottom`, r.topBarBottom)
  FACT(`${key}.window`, { box: r.window, title: r.windowTitle, x: r.windowX })
  if (r.bellList) FACT(`${key}.bellList.box`, r.bellList)
  FACT(`${key}.overlaps`, r.overlaps)
  FACT(`${key}.drawnOverTheNote`, r.drawnOverTheNote.length ? r.drawnOverTheNote : 'nothing - the note is in front at every point')
  FACT(`${key}.onScreen`, r.onScreen)
  if (r.face !== 'blocked' || r.words !== text) throw new Error('the note did not draw the words: ' + JSON.stringify(r))
  return r
}
/* a picture: the whole screen, or a crop to the union of the given boxes */
async function shot(s, name, rects, pad = 14) {
  const { page } = s
  await page.mouse.move(1, 1).catch(() => {}); await page.waitForTimeout(150)
  let clip
  if (rects) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    clip = { x, y, width: Math.min(s.W, R + pad) - x, height: Math.min(s.H, B + pad) - y }
    FACT(`${name}.crop`, clip)
  }
  await page.screenshot({ path: `${DRAWN}/${name}.png`, ...(clip ? { clip } : {}) })
  note('picture', `${name}.png`)
}
const headOf = (win, h = 150, w = null) => ({ x: win.x, y: win.y, w: w ?? win.w, h })
const state = async s => ({ squadron: await barSq(s), role: (await roleNow(s)).badge, window: await inputWin(s) })
const listRows = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)

async function run(key, fn) {
  const s = await mk('d')
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
}

if (want('p1b')) await run('p1b', async s => {
  const k = 'p1b.d.after'
  await signIn(s, 'ad', 'a'); FACT(`${k}.opened`, await openInput(s, 0))
  await hit(s, '#sqnMenuBtn', 400)
  FACT(`${k}.listOpened`, await listRows(s, '#sqnMenu .sqm-row'))
  await hit(s, '#sqnMenuBtn', 400)
  if ((await listRows(s, '#sqnMenu .sqm-row')).length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  FACT(`${k}.listClosed`, !(await listRows(s, '#sqnMenu .sqm-row')).length)
  await raise(s, R1)
  const ctl = await boxOf(s, '#sqnMenuBtn'), bar = await boxOf(s, '.topbar')
  await moveNote(s, { top: Math.round(bar.y + bar.h) + GAP, left: Math.round(ctl.x) })
  const m = await measure(s, k, R1, '#sqnMenuBtn')
  FACT(`${k}.state`, await state(s))
  await shot(s, 'p1b-d-after'); await shot(s, 'p1b-d-after-crop', [m.note, m.control, headOf(m.window, 160, 140)])
})
if (want('p2b')) await run('p2b', async s => {
  const k = 'p2b.d.after'
  await signIn(s, 'ad', 'a'); FACT(`${k}.opened`, await openInput(s, 0))
  FACT(`${k}.badge`, { words: (await roleNow(s)).badge, covered: await covered(s, '#roleBadge') })
  await raise(s, R2)
  const ctl = await boxOf(s, '#roleBadge'), bar = await boxOf(s, '.topbar')
  await moveNote(s, { top: Math.round(bar.y + bar.h) + GAP, right: Math.round(s.W - (ctl.x + ctl.w)) })
  const m = await measure(s, k, R2, '#roleBadge')
  FACT(`${k}.state`, await state(s))
  await shot(s, 'p2b-d-after'); await shot(s, 'p2b-d-after-crop', [m.note, m.control, headOf(m.window, 160)])
})

/* p4b - draw-bell's set-up, copied */
const STATE = resolve(TMP, 'bell-state-d.json')
const lineBtn = (unitNum, v) => `[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${v}"]`
async function setup() {
  const s = await mk('d'); const { page } = s
  await signIn(s, 'ad', 'a')
  await go(s, 'admin'); await wait(s, 600)
  const r = page.locator('[data-person="prowler"] .acc-tap').first(); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = page.locator(lineBtn('149', 'plan')); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await page.locator('#accEdSave').click(); await wait(s, 700)
  await go(s, 'inputs'); await wait(s, 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 600)
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
  await page.selectOption('#inpEditPerson', v)
  const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Tue 8 Dec 2026"]').first()
  for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day()); await page.fill('#inpEditRmk', 'n166 for hunter'); await hit(s, '#inpEditSave', 500)
  for (let i = 0; i < 3; i++) {
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  FACT('p4b.setup.inputFiled', !(await vis(s, '#inpEditRmk').count()))
  await wait(s, 800)
  writeFileSync(STATE, JSON.stringify(await s.ctx.storageState()))
  await s.ctx.close()
}
let br
async function fresh() {
  const S = SIZES.d; br = br || await chromium.launch()
  const ctx = await br.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2, storageState: STATE })
  const page = await ctx.newPage(); page.on('dialog', d => d.dismiss().catch(() => {}))
  return { ctx, page, sz: 'd', desk: true, W: S.w, H: S.h }
}
if (want('p4b')) {
  try {
    await setup()
    const s = await fresh(), k = 'p4b.d.after'
    try {
      await signIn(s, 'ad2', 'a2')
      const p = await reachPick(s, 149, 'bar'); FACT(`${k}.setupPick149`, { pressed: !!p.pressed, squadron: await barSq(s) })
      await inputsList(s)
      const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasNotText: /Hunter/ }).first()
      FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
      const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
      FACT(`${k}.typed`, await typeWords(s, '#inpEditRmk', 'N166 bell words'))
      const bb = await boxOf(s, '#notifyBell'); await s.page.mouse.click(bb.x + bb.w / 2, bb.y + bb.h / 2); await wait(s, 600)
      const line = s.page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /8 Dec/ }).first()
      if (!(await line.count())) throw new Error('no 8 Dec line in the bell')
      await line.evaluate(e => e.setAttribute('data-n166line', '1'))
      FACT(`${k}.line`, { words: (await line.innerText()).replace(/\s+/g, ' ').trim(), covered: await covered(s, '[data-n166line]') })
      /* the press is refused by the guard: the line is not pressed, the list stays as it stood, the note is raised */
      const size = await raise(s, R3)
      const lb = await boxOf(s, '[data-n166line]'), list = await boxOf(s, '[data-testid="bell-list"]')
      let place = { top: Math.round(lb.y + lb.h) + 4, left: Math.round(lb.x) }, where = 'under the line, inside the list'
      if (place.left + size.w > list.x + list.w || place.top + size.h > list.y + list.h) { place = { top: Math.round(list.y + list.h) + GAP, left: Math.round(list.x) }; where = 'under the list (it would not fit inside)' }
      FACT(`${k}.placed`, { where, ...place, noteW: Math.round(size.w), lineBox: lb, listBox: list })
      await moveNote(s, place)
      const m = await measure(s, k, R3, '[data-n166line]')
      FACT(`${k}.state`, { squadron: await barSq(s), window: await inputWin(s) })
      await shot(s, 'p4b-d-after'); await shot(s, 'p4b-d-after-crop', [m.note, m.control, m.bellList, headOf(m.window, 160)].filter(Boolean))
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
  } catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { if (br) await br.close() }
}
await closeAll()
