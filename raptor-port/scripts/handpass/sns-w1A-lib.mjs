// sns-w1A-lib — walker A's helpers for the D2573 walk (a SANS man struck on a flying seat with no times yet), chat 179,
// 25 Nov 26. Built on the passing recipes of D:/raptor-work/c174-walk/recipes.md (swd-w14a-lib and under it swd-w12-lib,
// swd-w11-lib, sah-w10-lib, asp-w2-lib, sud-w5-lib, sfd-w1-lib) — imported, never edited. window.* is only READ here
// (and window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './sns-w1A-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
const Z = await import('./swd-w14a-lib.mjs')
export { Z }
export const { T, L, W5, RANGER, D, post, bell, sayB, asR, asS, sleep, J, addLine, armSeat, crewSay, warns, warnSay, cx, planSim, lineTimes } = Z
export const S = W5.S
export const IPMAN = 'ipman'
/* the brief's desktop: 1536 × 1000 (the library's own is 864 high) */
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
export const OUT = L.OUT
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
export const RLONG = "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."
export const TODAYW = 'SANS — no availability filed for today'

/* a Chromium phone (402 × 874, touch, 3x) for the touch-drag steps only: WebKit's touches drive no pointer events
   (walk-scripts §4), so a finger drag is walked in Chromium over CDP and said so */
L.SIZES.pc = { name: 'phone-chromium', eng: L.SIZES.d.eng, launch: L.SIZES.d.launch, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } }

/* one scenario at one size, a fresh context, the clock installed before load, Saber signed in (sah-w10-lib's run, copied;
   'pc' marks the phone so the drawers and taps follow the phone's routes, CDP fingers for drags) */
export class NW extends Error {}
export function need(W, id, what, ok, note, pic) { W.rec(id, 'set-up: ' + what, ok ? true : 'NW', note, pic); if (!ok) throw new NW(what) }
export async function run(name, szKey, fn, when = '2026-07-15T09:00:00') {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  if (szKey === 'pc') { W.isPhone = true; W.cdp = true }
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today (page clock), Saber signed in", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    if (e instanceof NW) W.rec('stopped', 'the rest of this scenario', 'NW', 'its set-up could not be made: ' + e.message, await W.pic(p, 'NW').catch(() => ''))
    else W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}

/* every crew-list puck under `root` read: the SANS Avail heading's words, each man's place, strike, printed reason, title,
   the order inside SANS Avail; and whether each printed reason line sits inside its panel */
export const crewAll = (p, root) => p.evaluate(root => {
  const R = document.querySelector(root)
  if (!R) return { root: 'none' }
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const t = e => e ? (e.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : ''
  const sans = [...R.querySelectorAll('.rsans')].find(vis)
  const head = sans ? t(sans.querySelector('.rh') || sans.firstElementChild) : 'no SANS Avail'
  const panel = sans || R
  const pr = panel.getBoundingClientRect()
  const pucks = [...R.querySelectorAll('.rpuck[data-person]')].filter(e => !e.closest('.availwin') && vis(e)).map(e => {
    const rw = e.querySelector('.rwhy')
    const rb = rw && vis(rw) ? rw.getBoundingClientRect() : null
    const col = e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? t(e.closest('.rcol').querySelector('.rh')) : '?'
    const cr = (e.closest('.rsans') || e.closest('.rcol') || R).getBoundingClientRect()
    return { id: e.dataset.person, cs: t(e.querySelector('.puck') || e).split(' ')[0], where: col, struck: /(^|\s)no(\s|$)/.test(e.className),
      title: e.getAttribute('title') || '', printed: rb ? t(rw) : '',
      inside: rb ? (rb.left >= cr.left - 0.5 && rb.right <= cr.right + 0.5 && rb.right <= window.innerWidth + 0.5 && rw.scrollWidth <= rw.clientWidth + 1) : null,
      box: rb ? [Math.round(rb.left), Math.round(rb.right), Math.round(cr.left), Math.round(cr.right)] : null }
  })
  return { head, pucks, sansOrder: pucks.filter(x => x.where === 'SANS Avail').map(x => x.id + (x.struck ? '(x)' : '')), vw: window.innerWidth }
}, root)
export const who = (c, id) => (c && c.pucks || []).filter(x => x.id === id)
export const say1 = (c, id) => who(c, id).map(x => `[${x.where}${x.struck ? ', STRUCK' : ', plain'}] title "${x.title}"${x.printed ? ` printed "${x.printed}"${x.inside === false ? ' (OUTSIDE its panel ' + J(x.box) + ')' : ''}` : ' (no reason printed)'}`).join(' + ') || 'not shown'
export const sayAll = c => c && c.pucks ? `"${c.head}" · SANS order ${c.sansOrder.join(',')}` : J(c)

/* arm a seat on the open board (its own box), read the whole crew list; leave it armed */
export async function boardArm(p, W, di, key, tag) {
  await L.openBoard(p, W, di)
  const z = p.locator(L.B(`[data-slot="${key}"]`)).first()
  if (!(await z.count())) return { armed: null, why: 'no seat ' + key }
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  if (W.isPhone) { await z.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-arm-now-phone.png`) }).catch(() => {}) } else await z.click()
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  /* the phone board's Desktop layout hides the AIRCREW tab: its crew list stands beside the board */
  if (await p.locator('#schedBoard .sb-ros .ros-tab:visible').count()) await W5.boardDrawer(p, W, true)
  const c = await crewAll(p, '#schedBoard')
  return { armed, c }
}
/* press a man's crew-list puck on the open board with a seat armed; the seat read back, the note read at once */
export async function boardPick(p, W, key, id, tag) {
  const sel = `#schedBoard .rpuck[data-person="${id}"]:visible`
  const l = p.locator(sel).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) { await l.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-pick-now-phone.png`) }).catch(() => {}) } else await l.click()
  await sleep(250)
  const note = await L.toastSaid(p)
  const notePic = await W.pic(p, tag + '-note')
  const placed = await seatHolds(p, key)
  return { note, notePic, placed }
}
export const seatHolds = (p, key) => p.evaluate(k => { const [di, wi, fi, ai, s] = k.split('.'); const a = (((window.DAYS[+di] || {}).waves || [])[+wi] || {}).formations; const x = a && a[+fi] && a[+fi].aircraft[+ai]; return x ? x[s] || '' : 'no seat' }, key)
export async function disarm(p, W) { return W5.disarm(p, W) }
/* a clip round one man's crew puck (the reason line under it), plus the whole screen */
export async function crewPics(p, W, root, id, tag) {
  const pc = await W5.clip(p, W, p.locator(`${root} .rpuck[data-person="${id}"]:visible`).first(), tag, 40)
  const full = await W.pic(p, tag)
  return [pc, full].filter(Boolean).join(', ')
}

/* Edit Schedule's week: a seat pressed in the day card itself (the crew panel follows the armed seat) */
export async function weekArm(p, W, key, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const z = p.locator(`#eWeek [data-slot="${key}"]:visible`).first()
  if (!(await z.count())) return { armed: null, why: 'no seat in the week ' + key }
  await z.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  if (W.isPhone) { await z.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-warm-now-phone.png`) }).catch(() => {}) } else await z.click()
  await sleep(600)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown && await p.locator('#rosTab:visible').count()) { await W.press(p, '#rosTab', 'crew-tab'); await sleep(400) }
  }
  const c = await crewAll(p, '.ros-body')
  return { armed, c }
}
export async function weekPick(p, W, key, id, tag) {
  const l = p.locator(`.ros-body .rpuck[data-person="${id}"]:visible`).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) { await l.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-wpick-now-phone.png`) }).catch(() => {}) } else await l.click()
  await sleep(250)
  const note = await L.toastSaid(p)
  const notePic = await W.pic(p, tag + '-note')
  return { note, notePic, placed: await seatHolds(p, key) }
}

/* a real mouse drag from a locator to a locator (dbrA-W1-lib's recipe, copied): the hover read mid-drag */
export async function mouseDrag(p, src, dst, tag, W) {
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); await sleep(200)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) return { ok: false, why: 'no box ' + J({ a, b }) }
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  const b2 = await dst.boundingBox()
  await p.mouse.move(b2.x + Math.min(b2.width / 2, 30), b2.y + b2.height / 2, { steps: 14 })
  await sleep(400)
  const hover = await hoverRead(p)
  const hpic = await W.pic(p, tag + '-hover')
  await p.mouse.up()
  await sleep(250)
  const note = await L.toastSaid(p)
  const npic = await W.pic(p, tag + '-drop')
  return { ok: true, hover, hpic, note, npic }
}
/* a finger drag over CDP (Chromium only), held first as a person does; the hover read before the lift */
export async function fingerDrag(p, src, dst, tag, W) {
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); await sleep(200)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) return { ok: false, why: 'no box ' + J({ a, b }) }
  const c = await p.context().newCDPSession(p)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  const f = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, to = { x: b.x + Math.min(b.width / 2, 30), y: b.y + b.height / 2 }
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(f.x, f.y) })
  await sleep(500)
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(f.x + 2, f.y + 2) }); await sleep(60)
  for (let i = 1; i <= 14; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(f.x + (to.x - f.x) * i / 14, f.y + (to.y - f.y) * i / 14) }); await sleep(25) }
  await sleep(400)
  const hover = await hoverRead(p)
  const hpic = await W.pic(p, tag + '-hover')
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
  await sleep(80)
  await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-lift-now-phone.png`) }).catch(() => {})
  await sleep(200)
  const note = await L.toastSaid(p)
  const npic = await W.pic(p, tag + '-drop')
  return { ok: true, hover, hpic, note, npic }
}
/* what the drag shows while it hovers: any drawn caption near the ghost, and the outlined targets */
export const hoverRead = p => p.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0 }
  const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
  const caps = [...document.querySelectorAll('[class*="ghost"], [class*="drag"], [class*="dgcap"], [class*="dcap"], [id*="ghost"], [id*="drag"]')].filter(vis).map(e => (e.id ? '#' + e.id : '.' + String(e.className).split(' ').join('.')) + ': "' + t(e).slice(0, 140) + '"').slice(0, 8)
  const tg = [...document.querySelectorAll('[class*="dz-"], [class*="droptarget"], [class*="dzwarn"], [class*="dzok"], .dragover, .dz')].filter(vis).map(e => (e.dataset.slot || e.dataset.fill || '?') + ' ' + String(e.className)).slice(0, 8)
  return { caps, tg }
})

/* a drag that stops over several places before it lets go: mouse on a desktop, a CDP finger in Chromium's phone ('pc');
   at each stop the hover is read and pictured; `release` 'last' lets go at the last stop, a {x,y} point lets go there */
export async function dragPath(p, W, src, stops, tag, release = 'last', cdp = false) {
  /* the drop place brought on screen first, then the name (each sits in its own scroller) — dbrA-W1-lib's order */
  if (stops[0] && stops[0].evaluate) { await stops[0].evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {}); await sleep(200) }
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); await sleep(200)
  const a = await src.boundingBox()
  if (!a) return { ok: false, why: 'no source box' }
  const f = { x: a.x + a.width / 2, y: a.y + a.height / 2 }
  const c = cdp ? await p.context().newCDPSession(p) : null
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  let cur = f
  const moveTo = async (to, steps = 14) => {
    for (let i = 1; i <= steps; i++) {
      const x = cur.x + (to.x - cur.x) * i / steps, y = cur.y + (to.y - cur.y) * i / steps
      if (c) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, y) }); else await p.mouse.move(x, y)
      await sleep(c ? 25 : 10)
    }
    cur = to
  }
  if (c) { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(f.x, f.y) }); await sleep(500) }
  else { await p.mouse.move(f.x, f.y); await p.mouse.down() }
  await moveTo({ x: f.x + 6, y: f.y + 6 }, 3)
  const seen = []
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i]
    let to
    if (s.x != null) to = s
    else { const b = await s.boundingBox(); if (!b) { seen.push({ i, why: 'no box' }); continue } to = { x: b.x + Math.min(b.width / 2, 30), y: b.y + b.height / 2 } }
    await moveTo(to)
    await sleep(450)
    seen.push({ i, at: to, hover: await hoverRead(p), pic: await W.pic(p, `${tag}-stop${i + 1}`) })
  }
  if (release !== 'last') await moveTo(release)
  if (c) { await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(80); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-lift-now-phone.png`) }).catch(() => {}); await c.detach().catch(() => {}) }
  else await p.mouse.up()
  await sleep(250)
  const note = await L.toastSaid(p)
  const npic = await W.pic(p, tag + '-drop')
  return { ok: true, seen, note, npic }
}
export const hoverSay = h => h ? `caption ${JSON.stringify((h.caps || []).filter(x => /dragimg|tdghost|haswhy|why/.test(x)))} · targets ${JSON.stringify(h.tg)}` : 'none'
/* the flying seats (and a few other places) that wear the green "can take" ring after a man is tapped */
export const rings = (p, root, keys) => p.evaluate(([root, keys]) => Object.fromEntries(keys.map(k => { const e = [...document.querySelectorAll(`${root} [data-slot="${k}"], ${root} [data-fill="${k}"]`)].find(x => x.getBoundingClientRect().width > 0); return [k, e ? (/\boktake/.test(e.className) ? 'RING' : 'none') : 'absent'] })), [root, keys])
export async function sbUndo(p, W) { await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(500) }
export async function sbRedo(p, W) { await W.press(p, '#sbRedo:visible', 'sb-redo'); await sleep(500) }
/* the line's own boxes on the open board, by their key (cs, msn, r, b, to, ld …) */
export const bflds = (p, di, wi) => p.evaluate(([di, wi]) => [...document.querySelectorAll(`#schedBoard [data-bfld^="ff:${di}.${wi}.0."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.bfld + '=' + (e.value || '')), [di, wi])
/* Saber files SANS availability for a man on a day (the SANS calendar's "+ Commitment") — sud-w5-lib's commit */
export const commit = (p, W, iso, who, kinds, span, tag) => W5.commit(p, W, iso, who, kinds, span, tag)
/* the note box fits the phone's screen */
export const noteFits = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return 'no note'; const r = t.getBoundingClientRect(); return r.left >= -0.5 && r.right <= window.innerWidth + 0.5 && t.scrollWidth <= t.clientWidth + 1 ? 'fits' : `spills ${Math.round(r.left)}–${Math.round(r.right)} of ${window.innerWidth}` })

/* every passing note the page raises, logged in order by a watcher the walk adds (its own variable, never the app's) */
export const noteWatch = p => p.evaluate(() => {
  /* a reset forgets the note showing now, so the same words raised again by the next press are counted */
  /* every write of the note's words counts, even the same words written again (the note's text is replaced) */
  if (window.__snsA) { window.__snsA.length = 0; return 'reset' }
  window.__snsA = []
  const read = ms => {
    const t = document.getElementById('toastEl'); if (!t) return
    if (!ms.some(m => m.target === t || t.contains(m.target))) return
    const s = (t.textContent || '').replace(/\s+/g, ' ').trim()
    if (s && window.__snsA[window.__snsA.length - 1] !== s + '#' + (window.__snsAn || 0)) { window.__snsA.push(s) }
  }
  new MutationObserver(read).observe(document.body, { subtree: true, childList: true, characterData: true })
  return 'on'
})
export const notesSeen = p => p.evaluate(() => (window.__snsA || []).slice())

/* results of a run written to the raw log folder too */
export function saveRaw(name) {
  const dir = 'D:/raptor-work/c179-walk/A'
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, `results-${name}.json`), JSON.stringify(L.results, null, 1))
}
