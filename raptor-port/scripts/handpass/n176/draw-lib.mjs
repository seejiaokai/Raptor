// draw-lib - [MSQ-PICK-GUARD] the third round's drawings (chat 176, 25 Nov 26): shared helpers, on the REAL app served at
// 4700 (never started or stopped here). Every browser starts from THE WORLD (./world.mjs - three squadrons, Hunter with
// rights in all three), its saved data copied in. Reuses n175's helpers (read only): the sizes and presses (n175/lib.mjs
// via p6-lib.mjs), the set-up presses (give, archive, usersTab), and the refusal note's raise / place / noteFacts
// (n175/draw-lib.mjs). Pictures go to docs/mock/2026-11-25-msq-pick-guard-q3/drawn/. Nothing here writes the app's code.
// Every word a drawing adds comes from ./words.mjs (W).
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mk, closeAll, FACT, note, signIn, go, wait, vis, hit, usersTab, give, archive, toastNow, reachPick, barSq, boxOf, covered, shut, pageOn, roleNow, windowsNow } from '../n175/p6-lib.mjs'
import { raise, place, noteFacts, standAt } from '../n175/draw-lib.mjs'
import { world, TMP } from './world.mjs'
export { W } from './words.mjs'
export { mk, closeAll, FACT, note, signIn, go, wait, vis, hit, usersTab, give, archive, toastNow, reachPick, barSq, boxOf, covered, shut, pageOn, roleNow, windowsNow, raise, place, noteFacts, standAt, world, TMP }
const HERE = dirname(fileURLToPath(import.meta.url))
export const DRAWN = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q3/drawn')
mkdirSync(DRAWN, { recursive: true })
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
export const want = k => !ONLY.length || ONLY.includes(k)
export const USERS = { saber: ['ad', 'a'], hunter: ['ad2', 'a2'], kestrel: ['ad9', 'a9'] }

/* one picture's run, in a fresh browser holding the world (or the state given) */
export async function run(key, sz, fn, { state, ctxOpts } = {}) {
  const st = state || (await world())
  const s = await mk(sz, { storageState: st, ...(ctxOpts || {}) })
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
export async function as(s, who) { const [u, p] = USERS[who]; await signIn(s, u, p) }
/* a picture pair into drawn/: `<name>.png` the whole screen, `<name>-crop.png` cut to the union of the given boxes */
export async function shot(s, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
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
export async function scratch(s, name) { await s.page.screenshot({ path: `${TMP}/${name}.png` }); note('scratch', name) }
/* the box of the first drawn element matching sel */
export const box = (s, sel) => boxOf(s, sel)
/* the words of what matches, as drawn */
export const words = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
/* the lines a block's words take */
export const linesOf = (s, sel) => s.page.evaluate(sel => {
  const t = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!t) return null
  const rg = document.createRange(); rg.selectNodeContents(t)
  const tops = []; for (const q of rg.getClientRects()) { if (q.width < 2) continue; const m = q.top + q.height / 2; if (!tops.some(y => Math.abs(y - m) < q.height * 0.6)) tops.push(m) }
  return tops.length
}, sel)

/* THE DESKTOP'S SQUADRON PICKER pressed, its list opened, then closed by the picker itself - the pick does not happen
   (n175/draw-notes' way) */
export async function pickerOpenedAndClosed(s, k) {
  const rows = () => words(s, '#sqnMenu .sqm-row')
  await hit(s, '#sqnMenuBtn', 400)
  FACT(`${k}.listOpened`, await rows())
  await hit(s, '#sqnMenuBtn', 400)
  if ((await rows()).length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
}
/* THE PHONE'S ☰ menu opened, its squadron list opened, then both closed again - the pick does not happen */
export async function menuListOpenedAndClosed(s, k) {
  await hit(s, '#burger', 400)
  if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
  FACT(`${k}.listOpened`, await words(s, '#drawerSqnList .sqm-row'))
  await shut(s)
}
/* the note just under the control pressed (chat 166's approved look, n175's rule): left edge on the control's, 8px under
   the top bar */
export async function under(s, k, ctlSel) {
  const ctl = await boxOf(s, ctlSel), bar = await boxOf(s, '.topbar')
  const p = ctl.x + ctl.w / 2 < s.W / 2 ? { top: bar.y + bar.h + 8, left: ctl.x } : { top: bar.y + bar.h + 8, right: Math.round(s.W - (ctl.x + ctl.w)) }
  FACT(`${k}.placed`, { control: ctlSel, controlBox: ctl, ...p })
  await place(s, p)
}

/* ---- THE NEW "+ ADD A PERSON" (D2599, D2628 C11) ---- the button cloned from the page's own Filter button (its funnel
   taken out, the words W.addButton), beside Filter on a desktop, full width under the search on a phone; the form is
   Admin → Users' own "Add a person" block moved in place under the People row, its heading and the rule above it hidden,
   its full-width add button replaced by the app's row-foot pair (the row editor's `.acc-acts`: a primary and a plain
   button) "Add person" · "Cancel". */
export async function addButton(s, W) {
  return s.page.evaluate(({ label, desk }) => {
    const f = document.querySelector('#accFilter'); if (!f) throw new Error('no Filter button')
    const b = f.cloneNode(true); b.id = 'n176add'; b.removeAttribute('aria-haspopup'); b.removeAttribute('aria-expanded'); b.removeAttribute('aria-controls')
    b.querySelector('svg')?.remove(); b.textContent = label
    if (desk) { f.closest('.od-fwrap').insertAdjacentElement('afterend', b) }
    else { const row = f.closest('.od-findrow'); b.style.width = '100%'; b.style.marginTop = '8px'; b.style.justifyContent = 'center'; row.insertAdjacentElement('afterend', b) }
    const r = b.getBoundingClientRect(); return { words: b.textContent, box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, filterH: Math.round(f.getBoundingClientRect().height) }
  }, { label: W.addButton, desk: s.desk })
}
export async function openFormInPlace(s, W) {
  return s.page.evaluate(({ save, cancel }) => {
    const blk = document.querySelector('#accAddBlock'); if (!blk) throw new Error('no Add a person block')
    const sep = blk.previousElementSibling; if (sep && sep.tagName === 'HR') sep.style.display = 'none'
    blk.querySelector('h4.adm-sub').style.display = 'none'
    const anchor = document.querySelector('#n176add').closest('.od-head') || document.querySelector('.od-head')
    anchor.insertAdjacentElement('afterend', blk)
    blk.style.marginTop = '10px'; blk.style.marginBottom = '14px'
    const old = blk.querySelector('#accAdd'); old.style.display = 'none'
    const acts = document.createElement('div'); acts.className = 'acc-acts'; acts.id = 'n176acts'
    const a = document.createElement('button'); a.className = 'abtn primary'; a.type = 'button'; a.textContent = save; a.id = 'n176save'
    const c = document.createElement('button'); c.className = 'abtn'; c.type = 'button'; c.textContent = cancel; c.id = 'n176cancel'
    acts.append(a, c)
    blk.appendChild(acts)
    const r = blk.getBoundingClientRect(); return { box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, foot: [...acts.querySelectorAll('button')].map(b => b.textContent) }
  }, { save: W.addSave, cancel: W.addCancel })
}
/* a value typed into a box as a person types (React sees it) */
export async function typeInto(s, sel, text) {
  const l = vis(s, sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) { await l.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(text) }
  else await l.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, text)
  await wait(s, 250)
  return l.inputValue()
}

/* ---- THE BELL ---- (draw-e3, draw-e6): its list, its lines read part by part, and THE CHANGE of his D2624 / D2628 C1 */
export const LIST = '[data-testid="bell-list"]'
export const lineParts = s => s.page.evaluate(l => [...document.querySelectorAll(l + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.dataset.testid, name: e.querySelector('.bl-name')?.textContent, mark: e.querySelector('.bl-sqn')?.textContent ?? null, day: e.querySelector('.bl-day')?.textContent, what: e.querySelector('.bl-what')?.textContent, ago: e.querySelector('.bl-ago')?.textContent, unread: e.classList.contains('unread') })), LIST)
/* THE CHANGE: the grey number first, one column. `extra` - lines to add, each cloned from the first real line. */
export async function numbersFirst(s, { home, clones = [], about = [] }) {
  return s.page.evaluate(({ L, home, clones, about }) => {
    const lines = [...document.querySelectorAll(L + ' .bl-line')]
    const tpl = lines[0]
    for (const c of clones) {
      const e = tpl.cloneNode(true); e.removeAttribute('data-testid'); e.dataset.n176 = 'cloned'
      e.classList.toggle('unread', !!c.unread)
      e.querySelector('.bl-name').textContent = c.name
      e.querySelector('.bl-sqn')?.remove()
      if (c.mark) { const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = c.mark; e.querySelector('.bl-name').after(m) }
      e.querySelector('.bl-day').textContent = c.day
      e.querySelector('.bl-what').textContent = c.what
      e.querySelector('.bl-ago').textContent = c.ago
      const at = c.after != null ? lines[c.after] : null
      if (at) at.after(e); else tpl.parentElement.appendChild(e)
    }
    const all = [...document.querySelectorAll(L + ' .bl-line')]
    /* the column: every line's number moved (or, his home's unmarked lines, a clone of the app's own badge added) to the
       start of its first line, in a fixed width as wide as the widest number; his own account's lines an empty place */
    const out = []
    for (const e of all) {
      const t = e.querySelector('.bl-t'), what = e.querySelector('.bl-what').textContent
      const own = about.some(re => new RegExp(re).test(what))
      let m = e.querySelector('.bl-sqn')
      if (!m) { m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = own ? '' : home }
      m.dataset.n176col = '1'
      t.prepend(m)
      if (own) { m.textContent = '000'; m.style.visibility = 'hidden' }
      out.push({ own, mark: own ? '(empty place)' : m.textContent })
    }
    const w = Math.max(...[...document.querySelectorAll('[data-n176col]')].map(m => m.getBoundingClientRect().width))
    for (const m of document.querySelectorAll('[data-n176col]')) { m.style.marginLeft = '0'; m.style.marginRight = '7px'; m.style.width = Math.ceil(w) + 'px'; m.style.textAlign = 'center'; m.style.boxSizing = 'border-box' }
    return { column: Math.ceil(w), lines: out }
  }, { L: LIST, home, clones, about })
}
