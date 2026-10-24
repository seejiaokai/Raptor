// WALKER 1 of the night of 25 Oct 26 — the manning bubble. Shared helpers for lw-night-w1-*.mjs (the drawing scripts' helpers,
// lw-r3-lib.mjs, plus the readings the scenario list asks for at every bubble step). Own folder and port by default.
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-night/w1'
export const L = await import('./lw-r3-lib.mjs')
export const T = L.T
import path from 'node:path'
import { writeFileSync, renameSync } from 'node:fs'

export const results = []
export const rec = (id, size, verdict, said, pics = []) => { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export const saveResults = name => writeFileSync(path.join(L.OUT, `w1-${name}.json`), JSON.stringify(results, null, 1))

export const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband { visibility: hidden !important; }' })

/* every reading of the bubble: where, the words AS SEEN (parts with a width), level, colours, box inside the screen, who is at its centre */
export const bubbleNow = P => P.evaluate(() => {
  const vis = e => e && e.getBoundingClientRect().height > 0
  const mid = document.querySelector('[data-testid="manning-bubble"]'), foot = document.querySelector('[data-testid="manning-bubble-foot"]')
  const all = { mid: !!mid, foot: !!foot }
  const e = vis(mid) ? mid : vis(foot) ? foot : null
  if (!e) return { where: 'none', all }
  const seen = n => { /* words as SEEN: text of the parts whose box is wider than 1px */
    let out = ''
    const walk = x => { if (x.nodeType === 3) { out += x.textContent; return } if (x.nodeType !== 1) return; const r = x.getBoundingClientRect(); if (r.width <= 1 && r.height <= 1 && x.children.length === 0 && x !== n) return; for (const c of x.childNodes) walk(c) }
    walk(n); return out.replace(/\s+/g, ' ').trim()
  }
  const isFoot = e === foot
  const txtEl = isFoot ? e.querySelector('[data-testid="manning-bubble-text"]') : e
  const c = getComputedStyle(e), r = e.getBoundingClientRect()
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2
  const hit = document.elementFromPoint(cx, cy)
  const arrow = isFoot ? null : (() => { const b = getComputedStyle(e, '::before'); return { bg: b.backgroundColor, border: b.borderTopColor + '/' + b.borderLeftColor } })()
  const show = isFoot ? e.querySelector('[data-testid="manning-bubble-show"]') : null
  const vw = innerWidth, vh = innerHeight
  return {
    where: isFoot ? 'foot' : 'mid', all, level: e.getAttribute('data-level'), cls: e.className,
    text: seen(txtEl), raw: txtEl.textContent, showText: show ? show.textContent : null,
    border: c.borderTopColor, bg: c.backgroundColor, color: c.color, arrow,
    showColor: show ? getComputedStyle(show).color : null,
    rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) },
    inside: r.left >= 0 && r.right <= vw && r.top >= 0 && r.bottom <= vh, vw, vh,
    pe: c.pointerEvents, hitIsBubble: !!hit && (e === hit || e.contains(hit)), hitTag: hit ? (hit.dataset?.testid || hit.className || hit.tagName).toString().slice(0, 40) : null,
    pageScrollX: scrollX, docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }
})
export const bubbleLine = b => b.where === 'none' ? 'no bubble' : `${b.where === 'mid' ? 'under the Manning button' : 'at the foot'}, level ${b.level}, "${b.text}"${b.showText ? ` + "${b.showText}"` : ''}, border ${b.border}, fill ${b.bg}, words ${b.color}${b.arrow ? `, arrow ${b.arrow.bg}` : ''}, box ${b.rect.x},${b.rect.y} ${b.rect.w}×${b.rect.h} ${b.inside ? 'inside' : 'NOT INSIDE'} the ${b.vw}×${b.vh} screen, centre hit ${b.hitIsBubble ? "is the bubble" : "is " + b.hitTag} (pointer-events ${b.pe})`

/* what colour family a reading is (red: border 240,85,95; amber: 229,168,59-ish) */
export const family = b => { if (b.where === 'none') return 'none'; if (/240, 85, 95/.test(b.border)) return 'red'; if (/229, 168, 59|230, 168|2[23]\d, 1[5-9]\d, [3-7]\d/.test(b.border)) return 'amber'; return 'other:' + b.border }
export const isRedBubble = b => b.where !== 'none' && b.level === 'red' && /240, 85, 95/.test(b.border) && /46, 20, 24|2e1418/i.test(b.bg) && /255, 170, 176/.test(b.color) && (!b.arrow || /46, 20, 24/.test(b.arrow.bg))
export const isAmberBubble = b => b.where !== 'none' && b.level === 'amber' && !/240, 85, 95/.test(b.border)

export const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
export const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)

/* the row's cell: its figure and level for a day */
export async function rowCell(P, testid) {
  return P.evaluate(sel => {
    const td = document.querySelector(sel); if (!td) return null
    const c = getComputedStyle(td)
    return { text: td.textContent.trim(), cls: td.className, bg: c.backgroundColor, color: c.color }
  }, T(testid))
}
export const levelOf = cell => !cell ? null : /\bred\b|\bunder\b/.test(cell.cls) ? 'red' : /\bamber\b|\bamb\b/.test(cell.cls) ? 'amber' : 'ok'
export async function ensureCounts(w) {
  const P = w.page
  if (await L.vis(P, T('avail-p-2026-12-15')) || await P.locator(T('avail-p-2026-12-15')).count()) return
}
export async function availP(w, iso) {
  const P = w.page, sel = T(`avail-p-${iso}`)
  await L.reachCell(w, 'bane', iso)
  if (!(await P.locator(sel).count())) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200); await L.press(w, T('counts-toggle')); await P.waitForTimeout(600); await L.reachCell(w, 'bane', iso) }
  if (!(await P.locator(sel).count())) return null
  return (await P.locator(sel).first().innerText()).trim()
}
export const availNow = async (P, iso) => (await P.locator(T(`avail-p-${iso}`)).first().innerText()).trim()
export const availLevel = async (P, iso) => levelOf(await rowCell(P, `avail-p-${iso}`))
export async function setReq(w, iso, n, kind = 'p') {
  try { return await L.setRequired(w, kind, iso, n) } catch (e) {
    console.log('   setRequired retry —', String(e).slice(0, 80))
    await w.page.keyboard.press('Escape').catch(() => {}); await L.closeAny(w)
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(400)
    return L.setRequired(w, kind, iso, n)
  }
}
/* the Manning button in view (scroll to top), or scrolled out of view before the window's last tap */
export async function setManningView(w, inView) {
  const P = w.page
  if (inView) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); return }
  const b = await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom)
  if (b > 0) { await P.evaluate(d => window.scrollBy(0, d), b + 80); await P.waitForTimeout(300) }
}
export const managerInView = P => P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]')?.getBoundingClientRect(); return !!r && r.bottom > 0 && r.top < innerHeight })

/* A TAP WITH ITS PICTURE RIGHT AFTER (D1281): on a phone, a finger (CDP touch in Chromium, touchscreen.tap in WebKit), then ~100 ms
   later the bubble reading and the whole screen; the held-pointer state is the finger left where it pressed. On a desktop a click,
   then the reading and a settled picture. Returns the bubble reading taken right after. */
let shotN = 0
export async function tapPic(w, target, name, { hold = 0, label = null } = {}) {
  const P = w.page
  const c = typeof target === 'string' ? await L.centre(P, target) : target
  if (label) await P.evaluate(label => {
    const t = document.createElement('div'); t.className = 'qmk-quick'; t.textContent = label
    Object.assign(t.style, { position: 'fixed', left: '6px', top: '6px', zIndex: 2147483647, pointerEvents: 'none', background: '#1d232c', color: '#e9eef5', font: '600 11px/14px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '3px 7px', borderRadius: '6px', border: '1px solid rgba(59,198,232,.9)', maxWidth: '80vw' })
    document.body.appendChild(t)
  }, label)
  let seen
  if (w.phone) {
    if (w.cdp) {
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
      await P.waitForTimeout(40 + hold)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else {
      await P.touchscreen.tap(c.x, c.y)
    }
    await P.waitForTimeout(100)
    seen = await bubbleNow(P)
    if (name) await P.screenshot({ path: path.join(L.OUT, `${name}.png`), scale: w.cdp ? 'device' : 'css' })
    await P.waitForTimeout(250)
  } else {
    await P.mouse.click(c.x, c.y)
    await P.waitForTimeout(120)
    seen = await bubbleNow(P)
    if (name) await P.screenshot({ path: path.join(L.OUT, `${name}.png`), scale: 'css' })
    await P.waitForTimeout(200)
  }
  if (label) await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk-quick')) e.remove() })
  return seen
}
/* a settled picture of the whole screen, or clipped to a box */
export async function settled(w, name, clip = null) {
  const o = { path: path.join(L.OUT, `${name}.png`), scale: w.phone && w.cdp ? 'device' : 'css' }
  if (clip) o.clip = clip
  await w.page.screenshot(o)
  return `${name}.png`
}
/* a picture of the bubble and the Manning cell area, cropped: bubble union its Manning button and the day's Available cell */
export async function cropPic(w, name, selectors, pad = 10) {
  const P = w.page
  const box = await P.evaluate(({ sels, pad }) => {
    let l = 1e9, t = 1e9, r = -1e9, b = -1e9
    for (const s of sels) { const e = [...document.querySelectorAll(s)].find(e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0 && q.bottom > 0 && q.top < innerHeight && q.right > 0 && q.left < innerWidth }); if (!e) continue; const q = e.getBoundingClientRect(); l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom) }
    if (l > r || b <= t) return null
    l = Math.max(0, l - pad); t = Math.max(0, t - pad); r = Math.min(innerWidth, r + pad); b = Math.min(innerHeight, b + pad)
    return { x: Math.round(l), y: Math.round(t), width: Math.round(r - l), height: Math.round(b - t) }
  }, { sels: selectors, pad })
  if (!box || box.height <= 0 || box.width <= 0) return null
  await P.screenshot({ path: path.join(L.OUT, `${name}.png`), clip: box, scale: w.phone && w.cdp ? 'device' : 'css' })
  return `${name}.png`
}

/* a pending LL (or OL …) through the one-day window, the Manning button as asked, the last tap pictured; asserts it landed.
   `approve`: the window's switch as asked (null = leave). Returns { seen (bubble right after the placing tap), k (cell boxes) }. */
export async function bidType(w, who, iso, { type = 'LL', inView = true, name = null, approve = false, portion = null, closeFirst = true } = {}) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  if (approve !== null) await setSwitch(w, approve)
  if (portion) await L.press(w, T(`portion-${portion}`))
  await setManningView(w, inView)
  let seen = await tapPic(w, T(`bid-${type}`), name)
  await P.waitForTimeout(500)
  if (await L.vis(P, T('bid-picker'))) { seen = await tapPic(w, T(`bid-${type}`), name); await P.waitForTimeout(600) }
  if (await L.vis(P, T('bid-picker'))) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`${type} on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
  const k = await kinds(w, who, iso)
  return { seen, k }
}
/* a filing (OD / CSE) or UNA through the one-day window, last tap pictured */
export async function fileKind(w, who, iso, code, { inView = true, name = null, portion = null } = {}) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  if (portion) await L.press(w, T(`portion-${portion}`))
  await setManningView(w, inView)
  const sel = code === 'UNA' ? T('bid-una') : T(`bid-file-${code}`)
  const seen = await tapPic(w, sel, name)
  await P.waitForTimeout(600)
  if (await L.vis(P, T('bid-picker'))) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`${code} on ${iso} did not close the window: ${d?.text?.slice(0, 200)}`) }
  const k = await kinds(w, who, iso)
  return { seen, k }
}
export const dismissBubble = async w => { /* any tap on blank page area goes; a key too */ await w.page.keyboard.press('Shift').catch(() => {}); await w.page.waitForTimeout(150) }
export const peopleIds = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
export async function startWorld(size, engine = 'chromium', who = 'admin', plain = false) {
  const w = await L.newCtx(size, engine)
  if (who === 'admin') { await (plain ? L.signInPlain(w, 'admin') : L.signIn(w, 'admin')) }
  else await (plain ? L.signInPlain(w, 'member') : L.signIn(w, 'member'))
  await hideTransient(w.page)
  return w
}
export async function closeAll(w) { await L.closeAny(w); await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(200) }
export const sc = (size) => async (id, fn, w) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { rec(id, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 400)); if (w) { await closeAll(w).catch(() => {}) } } }

/* ---- the drag window (select-sheet) ---- */
/* drag from one cell to another (a mouse on a desktop; a finger that holds, then moves, on a phone — a person's pace: hold 320 ms). Returns whether the window opened. */
export async function dragCells(w, [p1, a], [p2, z], { hold = 320 } = {}) {
  const P = w.page
  await L.reachCell(w, p1, a)
  await P.locator(T(L.cellId(p1, a))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(L.cellId(p1, a))).first().boundingBox(), bZ = await P.locator(T(L.cellId(p2, z))).first().boundingBox()
  if (!bA || !bZ) throw new Error('no box for the drag')
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  if (w.phone) {
    if (!w.cdp) { /* WebKit: no raw touch — a long-press then move with the mouse as the only drag */
      await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.waitForTimeout(hold); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up()
    } else await L.holdDrag(w, [A, { x: (A.x + Z.x) / 2, y: (A.y + Z.y) / 2 }, Z], hold)
  } else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
  await P.waitForTimeout(500)
  return L.vis(P, T('select-sheet'))
}
/* press a leave / filing in the drag window: the picture right after the tap; a second tap if the below-zero ask came.
   Returns { seen (first tap), seen2 (the second tap if made), asked, open (the window still open) }. */
export async function selPress(w, sel, name, { ask = 'allow' } = {}) {
  const P = w.page
  const seen = await tapPic(w, sel, name)
  await P.waitForTimeout(500)
  let seen2 = null, asked = false
  const noteNow = (await L.txt(P, T('sel-note'))) || ''
  if (/Tap the same leave again/.test(noteNow)) {
    asked = true
    if (ask === 'ask-then-go') {
      /* the first tap's picture is kept as "-ask"; the placing tap's picture takes the plain name */
      if (name) { try { renameSync(path.join(L.OUT, `${name}.png`), path.join(L.OUT, `${name}-ask.png`)) } catch {} }
      seen2 = await tapPic(w, sel, name); await P.waitForTimeout(600)
    }
  }
  return { seen, seen2, asked, askNote: asked ? noteNow : null, open: await L.vis(P, T('select-sheet')), note: (await L.txt(P, T('sel-note'))) || '' }
}
export const writesCount = P => P.evaluate(() => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('raptor:leavewar/rec:')) n++ } return n })

/* a posting out through the one-day window's ⋯ (the first outcome, "archived" — the app's default), from the day's own date; asserts the window closed */
export async function postOut(w, who, iso) {
  const P = w.page
  await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await L.press(w, T('bid-more')); await P.waitForTimeout(300)
  await L.press(w, T('bid-postout')); await P.waitForTimeout(400)
  const line = await L.txt(P, T('po-line'))
  const seen = await tapPic(w, T('po-confirm'), null)
  await P.waitForTimeout(700)
  const stillOpen = await L.vis(P, T('bid-picker'))
  return { line, seen, stillOpen }
}
export async function postIn(w, who, iso) {
  const P = w.page
  await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await L.press(w, T('bid-more')); await P.waitForTimeout(300)
  await L.press(w, T('bid-postin')); await P.waitForTimeout(400)
  const sheet = await L.sheetDump(P)
  return { sheet }
}

/* an OD (or other filing) over a weekend raises Raptor's own OIL question over its input window: answer "No OIL", Save, and close the input window */
export async function clearOilAsk(w) {
  const P = w.page
  let did = []
  if (await L.vis(P, T('oilconf'))) { await L.press(w, T('oil-none')); await P.waitForTimeout(200); await L.press(w, T('oilconf-save')); await P.waitForTimeout(500); did.push('oilconf No OIL + Save') }
  for (let i = 0; i < 3; i++) {
    const open = await P.evaluate(() => !!document.querySelector('[data-testid="inped-placed"]') && document.querySelector('[data-testid="inped-placed"]').getBoundingClientRect().height > 0)
    if (!open) break
    await P.keyboard.press('Escape'); await P.waitForTimeout(400); did.push('Escape')
  }
  return did
}
