// sss-w1A-lib — walker A's helpers for the chat 182 walk (standby lines never ask a SANS man; an untimed sim strikes him;
// struck at once where his filing misses; no "file it" on the crew list — his D2584 Q4/Q5, D2586, D2585, D2587), 25 Nov 26.
// Built on the passing recipes of D:/raptor-work/c174-walk/recipes.md and chat 179's walker A library (sns-w1A-lib, under it
// swd-w14a-lib, swd-w12-lib, sah-w10-lib, asp-w2-lib, sud-w5-lib) — imported, never edited; their folders are set by
// sss-w1A-env first (||=). window.* is only READ here (and window.go, the recipes' own page switch).
import './sss-w1A-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
const A = await import('./sns-w1A-lib.mjs')
export { A }
export const { Z, T, L, W5, RANGER, IPMAN, D, sleep, J, addLine, boardArm, boardPick, crewAll, who, say1, sayAll, weekArm, weekPick,
  crewPics, disarm, noteWatch, notesSeen, dragPath, hoverSay, rings, sbUndo, sbRedo, bflds, commit, noteFits, seatHolds, need, run, NW } = A
export const OUT = L.OUT
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
/* D2587: the crew list's reason for Ranger, posted out as SANS from Fri 17, nothing filed — no full stop, no "File it" */
export const RNEW = 'SANS from Fri 17 Jul: no availability filed'
export const TODAYW = 'SANS — no availability filed for today'
export const NOFF = k => `SANS — not offering ${k}`
export const ONLY = (a, b) => `SANS — available ${a}–${b} only`

/* a sim row on the open board: + on OFT / AMT, label and (optional) times typed through its own boxes */
export async function addSimRow(p, W, di, kind, label, str = '', end = '') {
  await L.openBoard(p, W, di)
  const n0 = await p.evaluate(([i, k]) => (window.DAYS[i].sims[k] || []).length, [di, kind])
  await W.press(p, L.B(`[data-sradd="${di}.${kind}"]`), 'sradd-' + kind); await sleep(400)
  const ri = await p.evaluate(([i, k]) => window.DAYS[i].sims[k].length - 1, [di, kind])
  if (ri !== n0) return { ri: -1, n0 }
  await L.typeBox(p, W, `[data-bfld="sr:${di}.${kind}.${ri}.label"]`, label).catch(() => {})
  if (str) await L.typeBox(p, W, `[data-bfld="sr:${di}.${kind}.${ri}.str"]`, str)
  if (end) await L.typeBox(p, W, `[data-bfld="sr:${di}.${kind}.${ri}.end"]`, end)
  return { ri, r: await simRow(p, di, kind, ri) }
}
export const simRow = (p, di, kind, ri) => p.evaluate(([i, k, n]) => { const x = window.DAYS[i].sims[k][n]; return x ? JSON.parse(JSON.stringify(x)) : null }, [di, kind, ri])
/* the places of a sim row drawn on the open board (each seat's own box, and the "+" extras zone) */
export const simZones = (p, di, kind, ri) => p.evaluate(([di, kind, ri]) => [...new Set([...document.querySelectorAll(`#schedBoard [data-slot^="s:${di}.${kind}.${ri}."], #schedBoard [data-fill^="s:${di}.${kind}.${ri}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.slot ? `slot=${e.dataset.slot}` : `fill=${e.dataset.fill}`))], [di, kind, ri])
export const zsel = z => z.startsWith('slot=') ? `[data-slot="${z.slice(5)}"]` : `[data-fill="${z.slice(5)}"]`
export const zkey = z => z.slice(5)

/* arm any place on the open board (a seat's own box, or a zone at its "+ add" mark), read the whole crew list; left armed */
export async function armAt(p, W, di, sel, tag) {
  await L.openBoard(p, W, di)
  const zone = p.locator(L.B(sel)).first()
  if (!(await zone.count())) return { armed: null, why: 'no place ' + sel, c: null }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const addz = zone.locator('.addz:visible').first()
  let ab = (await addz.count()) ? await addz.boundingBox() : null
  if (ab && (ab.width < 2 || ab.height < 2)) ab = null
  const zb = await zone.boundingBox()
  /* a sim row with both seats full: its "+" place has no ".addz" mark, and its centre is a seated man's puck (run F4-p2:
     the tap picked Ace) — aim at the drawn "+" box inside the place, a leaf whose own words are "+" */
  if (!ab) ab = await zone.evaluate(z => { const e = [...z.querySelectorAll('*')].filter(x => !x.children.length && (x.textContent || '').trim() === '+' && x.getBoundingClientRect().width > 0).pop(); if (!e) return null; const r = (e.closest('.sb-slot, [class*="add"]') || e).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await zone.tap({ position: pos }); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-arm-now-phone.png`) }).catch(() => {}) }
  else await zone.click({ position: pos })
  await sleep(500)
  let armed = await p.evaluate(() => window.ARM && window.ARM.key), retry = ''
  if (!armed) {
    /* run F4-p: on the phone a tap-to-plan left the man picked (green rings) and the next tap on a place did not arm it —
       pictured, recorded, and the place tapped once more, as a person would */
    const ringsLeft = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .oktake')].filter(e => e.getBoundingClientRect().width > 0).length)
    const pic = await W.pic(p, tag + '-notarmed')
    /* probe5: on the phone a tap at the middle of an empty extra place right under a seated man picks that man (blue);
       a tap at the place's lower edge arms it — the picked man let go first (a tap on empty board), then the lower edge */
    await disarmPick(p, W)
    const t = ab || zb
    const at = { x: Math.round(t.x + t.width / 2), y: Math.round(t.y + t.height - 2) }
    if (W.isPhone) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y)
    await sleep(500)
    armed = await p.evaluate(() => window.ARM && window.ARM.key)
    retry = `first tap (middle of the place) did not arm — it picked a seated man (green rings ${ringsLeft}; ${pic}); a tap at the place's lower edge ${J(at)} armed: ${armed || 'no'}`
  }
  if (await p.locator('#schedBoard .sb-ros .ros-tab:visible').count()) await W5.boardDrawer(p, W, true)
  const c = await crewAll(p, '#schedBoard')
  return { armed, c, retry }
}
/* a picked man (blue, green rings) let go: a tap on the board's empty left gutter, then read back */
export async function disarmPick(p, W) {
  const n = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .oktake')].filter(e => e.getBoundingClientRect().width > 0).length)
  if (!(await n())) return 'none picked'
  if (W.isPhone) await p.touchscreen.tap(6, 400); else await p.mouse.click(6, 400)
  await sleep(400)
  return (await n()) ? 'still picked' : 'let go'
}
/* Edit Schedule's week: a place pressed in the day card by its selector (an empty sim row shows only its "+" there —
   probe2), at its "+ add" mark where it has one; the crew panel read */
export async function weekArmAt(p, W, sel, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  /* run F22-p: the phone's crew panel left open by the step before covered the day card */
  if (W.isPhone) await A.S.crewPanelClose(p, W).catch(() => {})
  const z = p.locator(`#eWeek ${sel}:visible`).first()
  if (!(await z.count())) return { armed: null, why: 'no place in the week ' + sel }
  await z.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const addz = z.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await z.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await z.tap({ position: pos }); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-warm-now-phone.png`) }).catch(() => {}) } else await z.click({ position: pos })
  await sleep(600)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown && await p.locator('#rosTab:visible').count()) { await W.press(p, '#rosTab', 'crew-tab'); await sleep(400) }
  }
  return { armed, c: await crewAll(p, '.ros-body') }
}
/* a crew puck pressed with a place armed: the note watched from the press, where he landed read by the caller */
export async function pickNow(p, W, id, tag) {
  await noteWatch(p)
  const l = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) { await l.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-pick-now-phone.png`) }).catch(() => {}) } else await l.click()
  await sleep(650)
  const seen = await notesSeen(p)
  const notePic = await W.pic(p, tag + '-note')
  /* after the press: still a place armed? any green "can take" rings left (a man still picked)? */
  const after = await p.evaluate(() => ({ armed: (window.ARM && window.ARM.key) || null, rings: [...document.querySelectorAll('#schedBoard .oktake')].filter(e => e.getBoundingClientRect().width > 0).length }))
  return { seen, note: await L.toastSaid(p), fits: await noteFits(p), notePic, after }
}
/* who stands in a place, by its key: a flying seat (di.wi.fi.ai.s), a sim seat (s:di.kind.ri.s) or a sim's extras (s:…+) */
export const holdsAt = (p, key) => p.evaluate(k => {
  if (k.startsWith('s:')) { const [di, kind, ri, s] = k.slice(2).split('.'); const x = (window.DAYS[+di].sims[kind] || [])[+ri]; if (!x) return 'no row'; if (s === '+') return JSON.stringify(x.more || x.pax || x.who || ''); return JSON.stringify(x[s] != null ? x[s] : x) }
  const [di, wi, fi, ai, s] = k.split('.'); const a = (((window.DAYS[+di] || {}).waves || [])[+wi] || {}).formations; const x = a && a[+fi] && a[+fi].aircraft[+ai]; return x ? x[s] || '' : 'no seat'
}, key)
/* the warning list of the open board's day, every row, the SANS ones and the named man's */
export async function warnsOf(p, W, di, tag, name) {
  const w = await Z.warns(p, W, di, tag)
  return { ...w, his: w.rows.filter(x => x.includes(name)) }
}
export const wSay = (w, name) => `head "${w.head}" · ${w.rows.length} row(s) · SANS rows: ${w.sans.join(' | ') || 'none'} · ${name}'s: ${w.his.join(' | ') || 'none'}`
/* the puck(s) of a man on the open board: class, any chip, ring colour (the amber "A") */
export const puckOn = (p, id) => p.evaluate(id => [...document.querySelectorAll(`#schedBoard [data-slot] .puck, #schedBoard [data-fill] .puck`)].filter(e => e.getBoundingClientRect().width > 0 && ((e.closest('[data-person]') || {}).dataset || {}).person === id || (e.dataset && e.dataset.person === id)).map(e => { const cs = getComputedStyle(e); const z = e.closest('[data-slot],[data-fill]'); return { at: z && (z.dataset.slot || z.dataset.fill), cls: e.className, txt: (e.textContent || '').replace(/\s+/g, ' ').trim(), ring: cs.outlineColor + ' ' + cs.outlineStyle + ' / ' + cs.boxShadow, chips: [...e.querySelectorAll('*')].map(x => String(x.className)).filter(Boolean) } }), id)

/* a drag that visits targets far apart on the board, as a person does: when the next target is off the screen the name is
   held at the screen's top or bottom edge (the app's own edge scroll, D895) until the target is in view, then carried
   onto it; at each target the hover is read and pictured. Mouse on a desktop, a CDP finger with `cdp`. `release`:
   'last' lets go on the last target, a {x,y} point lets go there. Run F17-d's first try (stop 2 measured off screen) is why. */
export async function dragVia(p, W, src, targets, tag, release = 'last', cdp = false) {
  await src.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(250)
  const a = await src.boundingBox()
  if (!a) return { ok: false, why: 'no source box', seen: [] }
  const vp = p.viewportSize()
  const c = cdp ? await p.context().newCDPSession(p) : null
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  let cur = { x: a.x + a.width / 2, y: a.y + a.height / 2 }
  const mv = async (x, y) => { if (c) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, y) }); else await p.mouse.move(x, y) }
  const moveTo = async (to, steps = 14) => { for (let i = 1; i <= steps; i++) { await mv(cur.x + (to.x - cur.x) * i / steps, cur.y + (to.y - cur.y) * i / steps); await sleep(c ? 25 : 10) } cur = to }
  if (c) { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(cur.x, cur.y) }); await sleep(500) }
  else { await p.mouse.move(cur.x, cur.y); await p.mouse.down() }
  await moveTo({ x: cur.x + 6, y: cur.y + 6 }, 3)
  const seen = []
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    /* the board scrolls while the pointer is within about 60–100px of its top or bottom (probe3: still at 940 of 1000), so a
       target is aimed at only once it sits clear of both zones (run F11-d2 let go at 934 and the board moved under it) */
    const clear = bb => bb && bb.y + bb.height / 2 <= vp.height - 160 && bb.y + bb.height / 2 >= 240
    let b = await t.boundingBox(), waited = 0
    for (let tries = 0; b && !clear(b) && tries < 4; tries++) {
      while (b && !clear(b) && waited < 15000) {
        const down = b.y + b.height / 2 > vp.height - 160
        const ex = Math.min(Math.max(cur.x, 40), vp.width - 40)
        if (Math.abs(cur.y - (down ? vp.height - 8 : 100)) > 3) await moveTo({ x: ex, y: down ? vp.height - 8 : 100 }, 8)
        await mv(ex + (waited / 100 % 2 ? 1 : -1), cur.y); await sleep(100); waited += 100
        b = await t.boundingBox()
      }
      /* out of the edge zone in one step before aiming, or the board goes on scrolling under the pointer (run F11-d overshot
         onto a ground row); then the target measured again */
      cur = { x: cur.x, y: Math.round(vp.height / 2) }; await mv(cur.x, cur.y); await sleep(600); b = await t.boundingBox()
    }
    if (!b) { seen.push({ i, why: 'no box' }); continue }
    const to = { x: b.x + Math.min(b.width / 2, 30), y: b.y + b.height / 2 }
    await moveTo(to)
    await sleep(450)
    seen.push({ i, at: to, edgeWait: waited, inView: to.y > 0 && to.y < vp.height, hover: await hoverRead(p), pic: await W.pic(p, `${tag}-stop${i + 1}`) })
  }
  if (release !== 'last') await moveTo(release)
  if (c) { await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(80); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-lift-now-phone.png`) }).catch(() => {}); await c.detach().catch(() => {}) }
  else await p.mouse.up()
  await sleep(300)
  return { ok: true, seen, note: await L.toastSaid(p), npic: await W.pic(p, tag + '-drop') }
}
export const hoverRead = A.hoverRead

/* results written to the raw folder */
export function saveRaw(name) {
  const dir = 'D:/raptor-work/c182-walk/A'
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, `results-${name}.json`), JSON.stringify(L.results, null, 1))
}
