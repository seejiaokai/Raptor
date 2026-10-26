// THE MANNING BUBBLE, DRAWN FOR HIM (25 Oct 26 — his D1344, D1345, D1351, with D1277's foot note) — on the built bundle.
// What he asked: "this bid turns available P red. the box is in amber can u make it red. and why any other subsequent
// inputs that put that further red does not show that bubble? And why when i scroll down and cant see the manning bar
// theres no red bubble that show up at the bottom of my screen?"
//   Today (real, only the mark and the label added):
//     t1  the first bid on a day set up so Available P turns red — the bubble, amber, under the Manning button
//     t1f the same at the foot of the screen (the Manning button scrolled out of view), amber
//     t2  a second bid on that already-red day — no bubble (with a picture right after the tap, D1281)
//     t3  a second bid with the Manning button out of view — nothing at the foot either
//     td  an overseas duty filed from the bid window that turns Available P red — the bubble says "This bid …"
//   Drawn (the bubble's OWN node and class changed on the page, or a clone of the real node put back where it stood):
//     A   the first bid's bubble in red, under the button and at the foot
//     B   the second bid's bubble, which will now appear — recommended words and one other wording, both places
//     C   a bubble naming two rows at two levels, red (the worst); IP's day cell given the app's own amber class by hand
//     D   the overseas duty's bubble in red, naming the overseas duty
// The red is the app's own: the red Manning cell's edge colour (240, 85, 95) at the bubble's .7, and its words #FFAAB0
// (`.mx .counts td.red`, matrix.css); the dark fill under it is a new value made the way the amber bubble's #2a2210 is.
// Method: .claude/skills/brainstorming/mockups-on-the-real-app.md. Helpers: lw-r3-lib.mjs (the declutter lib's helpers,
// with its own port and folder). Usage, from raptor-port/:
//   LW_PORT=4180 LW_OUT=2026-10-25-lw-drawings/bubble [SIZES=phone,desk] node scripts/handpass/lw-1025-bubble.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync, writeFileSync } from 'node:fs'
console.log('lw-1025-bubble', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
/* PART=multi (25 Oct 26, his question on the BUILT bubble — "How would B1 look for multiple manning yellow? Is it tough to
   show the counters from what to what? Like 12->11"): one bid turning two Manning rows amber, drawn with each row's
   figures before → after, as a sentence (A) and as the bid window's day line pairs (B); B again for the red case. Its
   pictures are named multi-*; the first set is left as it is. */
const PART = process.env.PART || 'first'
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`)) && (PART === 'multi') === f.startsWith('multi-')) unlinkSync(path.join(L.OUT, f))

const RED_EDGE = 'rgba(240, 85, 95, .7)', RED_INK = '#FFAAB0', RED_FILL = '#2e1418'
const WORDS = {
  B1: 'This bid takes Available P lower, still red.',
  B2: 'This bid takes Available P further into the red.',
  C: 'This bid turns IP amber and Available P red.',
  D: 'This overseas duty turns Available P red.',
}
const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []

const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband { visibility: hidden !important; }' })
/* the drawn red, as one class the drawing adds to the bubble's own node (the app's rules sit under #page-leavewar) */
const redSheet = P => P.addStyleTag({ content: `
  #page-leavewar .mn-bubble.drawn-red, #page-leavewar .mn-foot.drawn-red { border-color: ${RED_EDGE} !important; background: ${RED_FILL} !important; color: ${RED_INK} !important; }
  #page-leavewar .mn-bubble.drawn-red::before { background: ${RED_FILL} !important; border-color: ${RED_EDGE} !important; }
  #page-leavewar .mn-foot.drawn-red .mn-show { color: ${RED_INK} !important; }` })
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}`)
async function availP(w, iso) {
  const P = w.page, sel = `[data-testid="avail-p-${iso}"]`
  await L.reachCell(w, 'bane', iso)
  if (!(await L.vis(P, sel))) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200); await L.press(w, T('counts-toggle')); await P.waitForTimeout(600); await L.reachCell(w, 'bane', iso) }
  if (!(await P.locator(sel).count())) return null
  return (await P.locator(sel).first().innerText()).trim()
}
/* a Required figure typed through the cell's own pad, tried once more from the top of the page if the pad did not come up */
async function setReq(w, iso, n) {
  try { return await L.setRequired(w, 'p', iso, n) } catch (e) {
    console.log('   setRequired retry —', String(e).slice(0, 80))
    await w.page.keyboard.press('Escape').catch(() => {}); await L.closeAny(w)
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(400)
    return L.setRequired(w, 'p', iso, n)
  }
}
const availNow = async (P, iso) => (await P.locator(T(`avail-p-${iso}`)).first().innerText()).trim()
/* what is up now: the bubble under the button, the one at the foot, or none — and its words and colours */
const bubbleNow = P => P.evaluate(() => {
  const vis = e => e && e.getBoundingClientRect().height > 0
  const mid = document.querySelector('[data-testid="manning-bubble"]'), foot = document.querySelector('[data-testid="manning-bubble-foot"]')
  const e = vis(mid) ? mid : vis(foot) ? foot : null
  if (!e) return { where: 'none' }
  const c = getComputedStyle(e), r = e.getBoundingClientRect()
  return { where: e === mid ? 'mid' : 'foot', text: (e === foot ? e.querySelector('[data-testid="manning-bubble-text"]') : e).textContent, border: c.borderTopColor, bg: c.backgroundColor, color: c.color, rect: { x: r.left, y: r.top, width: r.width, height: r.height } }
})
/* the Manning button in view, or scrolled out of view, before the window's last tap — the bubble is placed by that */
async function setManningView(w, inView) {
  const P = w.page
  if (inView) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); return }
  const b = await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom)
  if (b > 0) { await P.evaluate(d => window.scrollBy(0, d), b + 80); await P.waitForTimeout(300) }
}
/* A TAP WITH ITS PICTURE RIGHT AFTER (D1281): on a phone the finger, then the whole screen about a tenth of a second after
   the lift — the bubble goes at the next tap, so it is caught there; the words of the label are put up before the tap
   (they cannot be pressed: pointer-events none). On a desktop a plain click. */
async function tapQ(w, sel, name, label) {
  const P = w.page
  if (!w.phone || !name) { await L.press(w, sel); return null }
  const c = await L.centre(P, sel)
  await P.evaluate(label => {
    const panel = document.querySelector('#page-leavewar') || document.body, cs = getComputedStyle(panel)
    const t = document.createElement('div'); t.className = 'qmk qmk-quick'; t.textContent = label
    Object.assign(t.style, { position: 'fixed', left: '6px', top: '6px', zIndex: 2147483647, pointerEvents: 'none', background: cs.getPropertyValue('--panel-2').trim() || '#1d232c', color: cs.getPropertyValue('--ink').trim() || '#e9eef5', font: '600 12px/16px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(59,198,232,.9)' })
    document.body.appendChild(t)
  }, label)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
  await P.waitForTimeout(40)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await P.waitForTimeout(100)
  const file = `${name}-${w.size}.png`
  await P.screenshot({ path: path.join(L.OUT, file), scale: 'device' })
  const seen = await bubbleNow(P)
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk-quick')) e.remove() })
  /* a tap pictured twice (a first tap that only asks, below a zero balance) keeps one picture: the last */
  for (let i = pics.length - 1; i >= 0; i--) if (pics[i].file === file) pics.splice(i, 1)
  pics.push({ file, label: `${label} — the whole screen; at that moment: ${seen.where === 'none' ? 'no bubble' : `the bubble ${seen.where === 'mid' ? 'under the Manning button' : 'at the foot'}, “${seen.text}”`}` })
  console.log(`   picture ${file} (right after the tap) — bubble: ${seen.where} ${seen.text ?? ''}`)
  await P.waitForTimeout(400)
  return seen
}
/* a pending LL through the one-day window, the Manning button placed as asked, the last tap pictured; asserts it landed */
async function bidLL(w, who, iso, { inView, quick, quickLabel }) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await setSwitch(w, false)
  await setManningView(w, inView)
  let seen = await tapQ(w, T('bid-LL'), quick, quickLabel)
  await P.waitForTimeout(500)
  if (await L.vis(P, T('bid-picker'))) { seen = await tapQ(w, T('bid-LL'), quick, quickLabel); await P.waitForTimeout(600) }
  if (await L.vis(P, T('bid-picker'))) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`LL on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
  const k = await kinds(w, who, iso)
  if (!k.some(x => /^LL\|k-ll\|s-w/.test(x))) throw new Error(`no pending LL for ${who} on ${iso}: ${JSON.stringify(k)}`)
  return { seen, k }
}

/* THE MARK AND THE LABEL, then the picture cut to them (lw-r2r3-questions.mjs's frame, unchanged but for its folder). */
async function frame(w, name, { marks = [], around = [], label, pad = 8, check = null }) {
  const P = w.page
  const tg = `${name}-${w.size}`
  const clip = await P.evaluate(({ marks, around, label, pad }) => {
    for (const e of document.querySelectorAll('.qmk')) e.remove()
    const one = s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
    const uni = rs => { rs = rs.filter(Boolean); if (!rs.length) return null; return { l: Math.min(...rs.map(r => r.l)), t: Math.min(...rs.map(r => r.t)), r: Math.max(...rs.map(r => r.r)), b: Math.max(...rs.map(r => r.b)) } }
    const rectOf = t => typeof t === 'string' ? one(t) : Array.isArray(t) ? uni(t.map(rectOf)) : { l: t.x, t: t.y, r: t.x + t.width, b: t.y + t.height }
    const missing = []
    const mr = marks.map(m => { const r = rectOf(m); if (!r) missing.push(JSON.stringify(m)); return r }).filter(Boolean)
    const ar = around.map(a => { const r = rectOf(a); if (!r) missing.push(JSON.stringify(a)); return r }).filter(Boolean)
    if (missing.length) return { missing }
    const CY = 'rgba(59,198,232,.9)'
    const body = document.body
    const box = (r, cls) => { const d = document.createElement('div'); d.className = 'qmk ' + cls; Object.assign(d.style, { position: 'fixed', left: `${r.l}px`, top: `${r.t}px`, width: `${r.r - r.l}px`, height: `${r.b - r.t}px`, zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' }); body.appendChild(d); return d }
    const inflated = mr.map(r => ({ l: r.l - 4, t: r.t - 4, r: r.r + 4, b: r.b + 4 }))
    inflated.forEach(r => { const d = box(r, 'qmk-box'); d.style.border = `2px dashed ${CY}`; d.style.borderRadius = '7px' })
    let c = uni([...ar, ...inflated])
    c = { l: c.l - pad, t: c.t - pad, r: c.r + pad, b: c.b + pad }
    const panelEl = document.querySelector('#page-leavewar') || body
    const cs = getComputedStyle(panelEl)
    const bg = cs.getPropertyValue('--panel-2').trim() || cs.getPropertyValue('--panel').trim() || '#1d232c'
    const ink = cs.getPropertyValue('--ink').trim() || '#e9eef5'
    const tag = document.createElement('div'); tag.className = 'qmk qmk-label'; tag.textContent = label
    Object.assign(tag.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', background: bg, color: ink, font: '600 12px/16px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${CY}`, whiteSpace: 'normal', maxWidth: `${Math.min(innerWidth - 8, Math.max(c.r - c.l - 4, 240))}px`, boxSizing: 'border-box', boxShadow: 'none' })
    body.appendChild(tag)
    const tw = tag.offsetWidth, th = tag.offsetHeight
    let tx = Math.max(4, Math.min(c.l + 2, innerWidth - tw - 4)), ty
    if (c.t - th - 6 >= 2) { ty = c.t - th - 6; c.t = ty - 4 }
    else if (c.b + th + 6 <= innerHeight - 2) { ty = c.b + 4; c.b = ty + th + 4 }
    else { ty = Math.max(2, c.t + 2); tx = Math.max(4, c.r - tw - 6) }
    tag.style.left = `${tx}px`; tag.style.top = `${ty}px`
    c.l = Math.min(c.l, tx - 4); c.r = Math.max(c.r, tx + tw + 4)
    c = { l: Math.max(0, c.l), t: Math.max(0, c.t), r: Math.min(innerWidth, c.r), b: Math.min(innerHeight, c.b) }
    return { x: Math.round(c.l), y: Math.round(c.t), width: Math.round(c.r - c.l), height: Math.round(c.b - c.t), boxes: inflated.length }
  }, { marks, around, label, pad })
  if (clip.missing) throw new Error(`${tg}: nothing drawn for ${clip.missing.join(', ')}`)
  if (check) { const why = await check(); if (why) throw new Error(`${tg}: the drawn premise is gone — ${why}`) }
  const n = await P.evaluate(() => document.querySelectorAll('.qmk-box').length)
  if (n !== clip.boxes) throw new Error(`${tg}: ${n} marks on the page, ${clip.boxes} drawn`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  pics.push({ file: tg + '.png', label })
  console.log(`   picture ${tg}.png — ${label}`)
}

/* THE DRAWING: the real bubble's node given the red class (and its words, where they change), or — where the app raised
   none — a clone of the real node, saved when it was up, put back first in the Manning bar where the real one stands */
const paintReal = (P, words) => P.evaluate(words => {
  const e = document.querySelector('[data-testid="manning-bubble"]') || document.querySelector('[data-testid="manning-bubble-foot"]')
  if (!e) return 'no real bubble up'
  e.classList.add('drawn-red'); e.dataset.drawn = 'bubble'
  if (words) (e.querySelector('[data-testid="manning-bubble-text"]') || e).textContent = words
  return null
}, words)
const injectClone = (P, html, words) => P.evaluate(([html, words]) => {
  for (const e of document.querySelectorAll('[data-drawn="clone"]')) e.remove()
  const hd = document.querySelector('[data-testid="counts-toggle"]').closest('.card-hd')
  const box = document.createElement('div'); box.innerHTML = html.replace(/data-testid="manning-/g, 'data-testid="drawn-manning-')
  const e = box.firstElementChild
  e.dataset.drawn = 'clone'; e.classList.add('drawn-red')
  ;(e.querySelector('[data-testid="drawn-manning-bubble-text"]') || e).textContent = words
  hd.prepend(e)
  return null
}, [html, words])
const setWords = (P, words) => P.evaluate(words => { const e = document.querySelector('[data-drawn="clone"]') || document.querySelector('[data-drawn="bubble"]'); if (!e) return 'gone'; (e.querySelector('[data-testid$="bubble-text"]') || e).textContent = words; return null }, words)
const dropDrawn = P => P.evaluate(() => { for (const e of document.querySelectorAll('[data-drawn="clone"]')) e.remove(); for (const e of document.querySelectorAll('[data-drawn="bubble"]')) { e.classList.remove('drawn-red'); delete e.dataset.drawn } for (const e of document.querySelectorAll('[data-drawn="amber"]')) { e.classList.remove('amber'); delete e.dataset.drawn } })
/* the premise, asserted right before each drawn picture: the drawn node up, red, holding the words drawn */
const drawnCheck = (P, words) => async () => P.evaluate(([words, edge]) => {
  const e = document.querySelector('[data-drawn="clone"]') || document.querySelector('[data-drawn="bubble"]')
  if (!e || e.getBoundingClientRect().height === 0) return 'the drawn bubble is not on screen'
  const c = getComputedStyle(e)
  if (!/240, 85, 95/.test(c.borderTopColor)) return 'not red: ' + c.borderTopColor
  const t = (e.querySelector('[data-testid$="bubble-text"]') || e).textContent
  return t === words ? null : `words "${t}"`
}, [words, RED_EDGE])
const DRAWN = '[data-drawn="clone"], [data-drawn="bubble"]'

/* ============ PART=multi: one bid, two Manning rows amber; the figures before → after ============ */
const DM = '2026-12-09'
/* a counter's amber point typed in its own window — the explainer its name opens (an admin's Amber below, then Save) */
async function setAmberPoint(w, id, n) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await L.press(w, T(`manning-info-${id}`))
  await P.waitForSelector(T('thresh-amber'), { timeout: 5000 })
  const was = await P.locator(T('thresh-amber')).inputValue()
  await P.locator(T('thresh-amber')).fill(String(n))
  await L.press(w, T('thresh-save')); await P.waitForTimeout(400)
  if (await L.vis(P, T('manning-info-close'))) { await L.press(w, T('manning-info-close')); await P.waitForTimeout(300) }
  return was
}
/* the bid window's day line as drawn: its words, and each part's colour, weight and size, read off the real one */
const readDayLine = P => P.evaluate(() => {
  const root = document.querySelector('[data-testid="bid-dayline"]'); if (!root) return null
  const st = e => { if (!e) return null; const c = getComputedStyle(e); return { color: c.color, weight: c.fontWeight, size: c.fontSize } }
  const row = lv => { const r = root.querySelector(`.dl-${lv}`); return r && { name: st(r.querySelector('.dl-name')), fig: st(r.querySelector('.dl-fig')) } }
  const pr = getComputedStyle(document.querySelector('#page-leavewar') || document.body)
  return { text: root.innerText.replace(/\s+/g, ' ').trim(), amber: row('amber'), red: row('red'), dot: st(root.querySelector('.dl-dot')), gap: getComputedStyle(root.querySelector('.dl-pairs') || root).columnGap, adv: pr.getPropertyValue('--adv').trim(), hard: pr.getPropertyValue('--hard').trim() }
})
/* A: the real bubble's own node, its words replaced */
const sayReal = (P, words) => P.evaluate(t => { const e = document.querySelector('[data-testid="manning-bubble"]'); if (!e) return 'no real bubble up'; e.dataset.drawn = 'bubble'; e.textContent = t; return null }, words)
/* B: the real bubble's own node, its words replaced by "This bid:" and the day line's pairs — each pair's name and figure
   in the colour the day line gives its level (read off the real day line; a red pair, which the amber window does not
   show, takes the day line's rule for red: the app's --hard), a grey dot between, each pair kept whole as the day line
   keeps it. The bubble keeps its own size and weight. */
const paintPairs = (P, lead, pairs, dl) => P.evaluate(([lead, pairs, dl]) => {
  const e = document.querySelector('[data-testid="manning-bubble"]')
  if (!e) return 'no real bubble up'
  e.dataset.drawn = 'bubble'; e.textContent = ''
  const gap = dl.gap && dl.gap !== 'normal' ? dl.gap : '7px'
  const box = document.createElement('span'); Object.assign(box.style, { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: gap, rowGap: '2px' })
  const ld = document.createElement('span'); ld.textContent = lead; box.appendChild(ld)
  pairs.forEach((p, i) => {
    const wrap = document.createElement('span'); Object.assign(wrap.style, { display: 'inline-flex', alignItems: 'baseline', columnGap: gap, whiteSpace: 'nowrap' })
    if (i > 0) { const d = document.createElement('span'); d.textContent = '·'; d.style.color = dl.dot?.color ?? ''; wrap.appendChild(d) }
    const c = dl[p.level] ? { n: dl[p.level].name.color, f: dl[p.level].fig.color } : { n: p.level === 'red' ? dl.hard : dl.adv, f: p.level === 'red' ? dl.hard : dl.adv }
    const n = document.createElement('span'); n.textContent = p.name; n.style.color = c.n
    const f = document.createElement('span'); f.textContent = p.fig; f.style.color = c.f
    const r = document.createElement('span'); r.append(n, ' ', f); wrap.appendChild(r)
    box.appendChild(wrap)
  })
  e.appendChild(box)
  return null
}, [lead, pairs, dl])
/* the premise of an A or B picture: the drawn node up, its edge the level's colour, its words as drawn */
const levelCheck = (P, words, level) => async () => P.evaluate(([words, level]) => {
  const e = document.querySelector('[data-drawn="bubble"]')
  if (!e || !e.getBoundingClientRect().height) return 'the drawn bubble is not on screen'
  const c = getComputedStyle(e).borderTopColor
  if (!(level === 'red' ? /240, 85, 95/ : /229, 168, 59/).test(c)) return 'edge ' + c
  return e.textContent.replace(/\s+/g, '') === words.replace(/\s+/g, '') ? null : `words "${e.textContent}"`
}, [words, level])

async function multiPart(w, size, ids, sc) {
  const P = w.page
  const anvil = ids.Anvil, ace = ids.Ace, saint = ids.Saint
  console.log(size, { anvil, ace, saint })
  let dl = null
  /* ============ 9 Dec: one bid (Anvil, an SXO who is an IP) turns IP and SXO amber; Available P stays fine ============ */
  await sc('multi-amber', async () => {
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const av0 = await availP(w, DM)
    const fig = async id => Number((await P.locator(T(`count-${id}-${DM}`)).first().innerText()).trim())
    const lvl = id => P.evaluate(sel => document.querySelector(sel)?.className ?? '', T(`count-${id}-${DM}`))
    const ip0 = await fig('ip'), sxo0 = await fig('sxo')
    /* each row's amber point set to the day's own figure: the figure stays fine ("amber below"), one fewer is amber */
    const wasIp = await setAmberPoint(w, 'ip', ip0), wasSxo = await setAmberPoint(w, 'sxo', sxo0)
    await availP(w, DM)
    note('multi', size, `9 Dec: IP ${ip0}, SXO ${sxo0}, Available P ${av0}; amber points IP ${wasIp} → ${ip0}, SXO ${wasSxo} → ${sxo0}; cells "${await lvl('ip')}", "${await lvl('sxo')}"`)
    if (/\b(amber|red)\b/.test(await lvl('ip') + ' ' + await lvl('sxo'))) throw new Error('a row is already amber before the bid')
    /* the bid window's day line: read (the look B copies) and pictured, then the window cancelled */
    await L.openCellR(w, anvil, DM)
    await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    dl = await readDayLine(P)
    note('multi', size, `Anvil's bid window on 9 Dec, its day line: "${dl?.text}" — ${JSON.stringify({ amber: dl?.amber, red: dl?.red, dot: dl?.dot, gap: dl?.gap, adv: dl?.adv, hard: dl?.hard })}`)
    if (!dl || !dl.amber) throw new Error('the day line names no amber row: ' + dl?.text)
    await frame(w, 'multi-ref-dayline', { marks: [T('bid-dayline')], around: ['[data-testid="bid-picker"] .bidsheet-hd', T('bid-dayline')], label: 'Today, the bid window before the bid: its day line (the look B copies)' })
    await L.press(w, T('bid-cancel')); await P.waitForTimeout(300)
    /* the bid */
    const r = await bidLL(w, anvil, DM, { inView: true, quick: 'multi-amber-quick', quickLabel: 'Today, right after the tap on LL (one bid, two rows amber)' })
    const b = await bubbleNow(P)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
    const ip1 = await fig('ip'), sxo1 = await fig('sxo'), av1 = await availNow(P, DM)
    const avCls = await P.evaluate(sel => document.querySelector(sel)?.className ?? '', T(`avail-p-${DM}`))
    note('multi', size, `Anvil's pending LL ${JSON.stringify(r.k)}: IP ${ip0} → ${ip1} ("${await lvl('ip')}"), SXO ${sxo0} → ${sxo1} ("${await lvl('sxo')}"), Available P ${av0} → ${av1} ("${avCls}"); bubble ${JSON.stringify(b)}`)
    if (b.where !== 'mid') throw new Error('no bubble under the Manning button: ' + JSON.stringify(b))
    if (/\b(under|amber|red)\b/.test(avCls)) throw new Error('Available P is not fine: ' + avCls)
    const marks = [DRAWN, T(`count-ip-${DM}`), T(`count-sxo-${DM}`)]
    const around = [T('counts-toggle'), T(`count-ip-${DM}`), T(`count-sxo-${DM}`), T('count-ip-2026-12-13')]
    await frame(w, 'multi-amber-today', { marks: [T('manning-bubble'), ...marks.slice(1)], around, label: `Today: one bid turns two rows amber, IP ${ip0} → ${ip1} and SXO ${sxo0} → ${sxo1}` })
    const A = `This bid turns IP amber (${ip0} → ${ip1}) and SXO amber (${sxo0} → ${sxo1}).`
    const whyA = await sayReal(P, A); if (whyA) throw new Error(whyA)
    await frame(w, 'multi-amber-a', { marks, around, label: 'Drawn A: a sentence, each row’s figures in brackets', check: levelCheck(P, A, 'amber') })
    const pairs = [{ level: 'amber', name: 'IP', fig: `${ip0} → ${ip1}` }, { level: 'amber', name: 'SXO', fig: `${sxo0} → ${sxo1}` }]
    const whyB = await paintPairs(P, 'This bid:', pairs, dl); if (whyB) throw new Error(whyB)
    await frame(w, 'multi-amber-b', { marks, around, label: 'Drawn B: the bid window’s day line pairs, led by “This bid:”', check: levelCheck(P, `This bid: IP ${ip0} → ${ip1} · SXO ${sxo0} → ${sxo1}`, 'amber') })
    await dropDrawn(P)
  })
  /* ============ 15 Dec: the red case, a row taken lower (Ace, then Saint: ops pilots, neither IP nor SXO) ============ */
  await sc('multi-red', async () => {
    if (!dl) throw new Error('no day line was read')
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const a0 = await availP(w, D1)
    const req = await setReq(w, D1, Number(a0))
    await bidLL(w, ace, D1, { inView: true, quick: null })
    const a1 = await availNow(P, D1)
    const r = await bidLL(w, saint, D1, { inView: true, quick: 'multi-red-quick', quickLabel: 'Today, right after the tap on LL (a second bid on a red day)' })
    const b = await bubbleNow(P)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
    const a2 = await availNow(P, D1)
    note('multi', size, `15 Dec: Required P ${req}; Ace's bid ${a0} → ${a1}; Saint's ${JSON.stringify(r.k)} ${a1} → ${a2}; bubble ${JSON.stringify(b)}`)
    if (b.where !== 'mid') throw new Error('no bubble under the Manning button: ' + JSON.stringify(b))
    const around = [T('counts-toggle'), T(`avail-p-${D1}`), T('avail-p-2026-12-19')]
    await frame(w, 'multi-red-today', { marks: [T('manning-bubble'), T(`avail-p-${D1}`)], around, label: `Today: a second bid takes Available P ${a1} → ${a2}, still red` })
    const whyB = await paintPairs(P, 'This bid:', [{ level: 'red', name: 'Available P', fig: `${a1} → ${a2}` }], dl); if (whyB) throw new Error(whyB)
    await frame(w, 'multi-red-b', { marks: [DRAWN, T(`avail-p-${D1}`)], around, label: 'Drawn B, the red case: the day line’s pair, led by “This bid:”', check: levelCheck(P, `This bid: Available P ${a1} → ${a2}`, 'red') })
    await dropDrawn(P)
  })
}

const D1 = '2026-12-15', D2 = '2026-12-16', D3 = '2026-12-17'
for (const size of SIZES) {
  const w = await L.newCtx(size)
  const P = w.page
  await L.signIn(w, 'admin')
  await hideTransient(P); await redSheet(P)
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const drifter = ids.Drifter, ridge = ids.Ridge, trident = ids.Trident, hunter = ids.Hunter
  console.log(size, { drifter, ridge, trident, hunter })
  const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 300)); await dropDrawn(P).catch(() => {}); await L.closeAny(w); await P.keyboard.press('Escape').catch(() => {}) } }
  const saved = {}

  if (PART === 'multi') await multiPart(w, size, ids, sc)
  else {
  /* ============ 15 Dec: Required P set to Available P; a first bid, then a second ============ */
  await sc('mid', async () => {
    const a0 = await availP(w, D1)
    const req = await setReq(w, D1, Number(a0))
    note('mid', size, `15 Dec: Available P ${a0}, Required P set ${req}`)
    /* (1) the first bid: Drifter's pending LL, the Manning button in view */
    const r1 = await bidLL(w, drifter, D1, { inView: true, quick: 't1-quick', quickLabel: 'Today, right after the tap on LL (the first bid)' })
    const b1 = await bubbleNow(P)
    const a1 = await availNow(P, D1)
    const cell1 = await P.evaluate(d => document.querySelector(`[data-testid="avail-p-${d}"]`)?.className, D1)
    note('mid', size, `first bid (Drifter): cell ${JSON.stringify(r1.k)}; Available P ${a0} → ${a1} (${cell1}); bubble ${JSON.stringify(b1)}`)
    if (b1.where !== 'mid') throw new Error('the first bid raised no bubble under the Manning button: ' + JSON.stringify(b1))
    saved.midHtml = await P.locator(T('manning-bubble')).evaluate(e => e.outerHTML)
    saved.midRel = await P.evaluate(() => { const b = document.querySelector('[data-testid="manning-bubble"]').getBoundingClientRect(), m = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return { dx: b.left - m.left, dy: b.top - m.top, width: b.width, height: b.height } })
    saved.a = [a0, a1]
    /* one width for every 15 Dec picture under the button: four days to its right */
    const around = [T('counts-toggle'), T(`avail-p-${D1}`), T('avail-p-2026-12-19')]
    await frame(w, 't1-mid', { marks: [T('manning-bubble'), T(`avail-p-${D1}`)], around, label: `Today: a bid turns Available P red (${a0} → ${a1}). The bubble is amber.` })
    /* A: the same node, red */
    const why = await paintReal(P, null); if (why) throw new Error(why)
    await frame(w, 'a-drawn-mid', { marks: [DRAWN, T(`avail-p-${D1}`)], around, label: 'Drawn: the same bubble in red', check: drawnCheck(P, b1.text) })
    await dropDrawn(P)

    /* (2) a second bid on the already-red day: Ridge's pending LL, the Manning button in view */
    const r2 = await bidLL(w, ridge, D1, { inView: true, quick: 't2-quick', quickLabel: 'Today, right after the tap on LL (the second bid)' })
    const b2 = await bubbleNow(P)
    const a2 = await availNow(P, D1)
    note('mid', size, `second bid (Ridge): cell ${JSON.stringify(r2.k)}; Available P ${a1} → ${a2}; bubble ${JSON.stringify(b2)}`)
    if (b2.where !== 'none') note('mid', size, 'NOTE — the second bid DID raise a bubble: ' + JSON.stringify(b2))
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
    const m = await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return { x: r.left, y: r.top } })
    const ghost = { x: m.x + saved.midRel.dx, y: m.y + saved.midRel.dy, width: saved.midRel.width, height: saved.midRel.height }
    await frame(w, 't2-mid', { marks: [ghost, T(`avail-p-${D1}`)], around, label: b2.where === 'none' ? `Today: a second bid takes Available P ${a1} → ${a2}. No bubble.` : `Today: a second bid, Available P ${a1} → ${a2}: “${b2.text}”` })
    /* B: the bubble the second bid will raise — a clone of the real one, red, the recommended words, then the other words */
    await injectClone(P, saved.midHtml, WORDS.B1)
    await frame(w, 'b-drawn-mid', { marks: [DRAWN, T(`avail-p-${D1}`)], around, label: 'Drawn: the second bid raises the bubble too, in red', check: drawnCheck(P, WORDS.B1) })
    await setWords(P, WORDS.B2)
    await frame(w, 'b-drawn-mid-other', { marks: [DRAWN, T(`avail-p-${D1}`)], around, label: 'Drawn, other words: the second bid’s bubble', check: drawnCheck(P, WORDS.B2) })
    /* C: two rows at two levels — IP's 15 Dec cell given the app's own amber class by hand, the bubble red (the worst) */
    await setWords(P, WORDS.C)
    const ipSel = T(`count-ip-${D1}`)
    const ip = await P.evaluate(sel => { const td = document.querySelector(sel); if (!td) return null; td.classList.add('amber'); td.dataset.drawn = 'amber'; const c = getComputedStyle(td); return { text: td.textContent.trim(), bg: c.backgroundColor, color: c.color } }, ipSel)
    note('C', size, `IP's 15 Dec cell drawn amber: ${JSON.stringify(ip)}`)
    if (!ip) throw new Error('no IP cell for 15 Dec')
    await frame(w, 'c-drawn-mid', { marks: [DRAWN, ipSel, T(`avail-p-${D1}`)], around: [...around, ipSel], label: 'Drawn: IP made amber by hand (its figure left as it is), to show two rows. The bubble takes the worse level, red.', check: async () => (await drawnCheck(P, WORDS.C)()) || (await P.evaluate(sel => /229, 168, 59/.test(getComputedStyle(document.querySelector(sel)).backgroundColor) ? null : 'IP cell not amber', ipSel)) })
    await dropDrawn(P)
  })

  /* ============ 16 Dec: the same with the Manning button scrolled out of view — the foot ============ */
  await sc('foot', async () => {
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const a0 = await availP(w, D2)
    const req = await setReq(w, D2, Number(a0))
    note('foot', size, `16 Dec: Available P ${a0}, Required P set ${req}`)
    const r1 = await bidLL(w, trident, D2, { inView: false, quick: 't1f-quick', quickLabel: 'Today, right after the tap on LL (the first bid, Manning out of view)' })
    const b1 = await bubbleNow(P)
    note('foot', size, `first bid (Trident): cell ${JSON.stringify(r1.k)}; bubble ${JSON.stringify(b1)}`)
    if (b1.where !== 'foot') throw new Error('the first bid raised no bubble at the foot: ' + JSON.stringify(b1))
    saved.footHtml = await P.locator(T('manning-bubble-foot')).evaluate(e => e.outerHTML)
    saved.footRect = b1.rect
    const cell1 = T(L.cellId(trident, D2))
    /* the bubble and the bid's own cell, so the picture shows where the bid went and what the foot says (both sizes) */
    const aroundF = [T('manning-bubble-foot'), cell1]
    await frame(w, 't1-foot', { marks: [T('manning-bubble-foot')], around: aroundF, label: 'Today, the Manning button out of view: the bubble at the foot, amber' })
    const why = await paintReal(P, null); if (why) throw new Error(why)
    await frame(w, 'a-drawn-foot', { marks: [DRAWN], around: aroundF.map(s => s === T('manning-bubble-foot') ? DRAWN : s), label: 'Drawn: the foot bubble in red', check: drawnCheck(P, b1.text) })
    await dropDrawn(P)
    /* (3) a second bid on the already-red day, the Manning button out of view */
    const r2 = await bidLL(w, hunter, D2, { inView: false, quick: 't3-quick', quickLabel: 'Today, right after the tap on LL (the second bid, Manning out of view)' })
    const b2 = await bubbleNow(P)
    note('foot', size, `second bid (Hunter): cell ${JSON.stringify(r2.k)}; bubble ${JSON.stringify(b2)}`)
    if (b2.where !== 'none') note('foot', size, 'NOTE — the second bid DID raise a bubble: ' + JSON.stringify(b2))
    const cell2 = T(L.cellId(hunter, D2))
    const ghost = { ...saved.footRect }
    await frame(w, 't3-foot', { marks: [ghost], around: [ghost, cell2], label: b2.where === 'none' ? 'Today: a second bid, the Manning button out of view. Nothing at the foot.' : `Today: a second bid: “${b2.text}”` })
    await injectClone(P, saved.footHtml, WORDS.B1)
    const aroundB = [DRAWN, cell2]
    await frame(w, 'b-drawn-foot', { marks: [DRAWN], around: aroundB, label: 'Drawn: the second bid’s bubble at the foot, in red', check: drawnCheck(P, WORDS.B1) })
    await setWords(P, WORDS.B2)
    await frame(w, 'b-drawn-foot-other', { marks: [DRAWN], around: aroundB, label: 'Drawn, other words: the second bid’s bubble at the foot', check: drawnCheck(P, WORDS.B2) })
    await dropDrawn(P)
  })

  /* ============ 17 Dec: an overseas duty filed from the bid window ============ */
  await sc('od', async () => {
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const a0 = await availP(w, D3)
    const req = await setReq(w, D3, Number(a0))
    await L.openCellR(w, drifter, D3)
    await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await setManningView(w, true)
    const seen = await tapQ(w, T('bid-file-OD'), 'td-quick', 'Today, right after the tap on OD')
    await P.waitForTimeout(700)
    if (await L.vis(P, T('bid-picker'))) throw new Error('the window stayed open after OD')
    const k = await kinds(w, drifter, D3)
    if (!k.some(x => /k-od/.test(x))) throw new Error('no OD on 17 Dec: ' + JSON.stringify(k))
    const b = await bubbleNow(P)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
    const a1 = await availNow(P, D3)
    note('od', size, `17 Dec: Required P ${req}; OD filed for Drifter ${JSON.stringify(k)}; Available P ${a0} → ${a1}; bubble ${JSON.stringify(b)} (right after the tap: ${JSON.stringify(seen)})`)
    if (b.where !== 'mid') throw new Error('the OD raised no bubble under the Manning button: ' + JSON.stringify(b))
    const around = [T('counts-toggle'), T(`avail-p-${D3}`), T('avail-p-2026-12-21')]
    await frame(w, 'td-mid', { marks: [T('manning-bubble'), T(`avail-p-${D3}`)], around, label: `Today: an overseas duty filed turns Available P red (${a0} → ${a1}). The bubble says “This bid”, in amber.` })
    const why = await paintReal(P, WORDS.D); if (why) throw new Error(why)
    await frame(w, 'd-drawn-mid', { marks: [DRAWN, T(`avail-p-${D3}`)], around, label: 'Drawn: the bubble names the overseas duty, in red', check: drawnCheck(P, WORDS.D) })
    await dropDrawn(P)
  })
  }

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${PART === 'multi' ? 'multi-' : ''}${SIZES.join('-')}.json`), JSON.stringify({ log, pics, colours: { RED_EDGE, RED_INK, RED_FILL }, words: WORDS }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
