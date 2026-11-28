// sss-w1B-lib — walker B's helpers for the standby / untimed-sim walk (his D2584 Q4/Q5, D2585, D2586, D2587), chat 182,
// 25 Nov 26. Built on sns-w1B-lib (chat 179's passing helpers: armB, pickB, listOf, blank, fileFor…) and the w14 recipes,
// imported, never edited; their first steps proved on this build by sss-w1B-probe / -probe2. window.* is only READ here
// (and window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './sss-w1B-env.mjs'
import path from 'node:path'
export const Y = await import('./sns-w1B-lib.mjs')
export const { K, X, T, L, W5, A, RANGER, IPMAN, D, WK1, WK2, J, sleep, need, asR, asS, scene, bell, say, sayB, tapAndRead, OUT,
  postR, listOf, meSay, struckWith, blank, fileFor, armB, pickB, armE, disarmE, seatHas, disarm } = Y
export { path }
export const R17N = 'SANS from Fri 17 Jul: no availability filed'   // D2587: no full stop, no "File it…"
export const TODAYW = 'SANS — no availability filed for today'
export const MARLIN = 'cards'
export const remDays = l => l ? ((/You're planned on (.*) with nothing filed/.exec(l.body) || [])[1] || '') : ''

/* a place on the open board of day di armed (a seat's own box, or a row's "+ add" place at its mark), the crew list read
   for each of `ids`; LEFT ARMED, the phone's drawer left open */
export async function armAt(p, W, di, sel, tag, ids = [RANGER, IPMAN]) {
  await L.openBoard(p, W, di)
  await disarm(p, W)
  const zone = p.locator(L.B(sel)).first()
  if (!(await zone.count())) return { armed: null, ls: {}, head: 'NO SUCH PLACE ' + sel, pic: await W.pic(p, tag + '-noplace') }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await zone.tap({ position: pos }); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-arm-now-phone.png`) }).catch(() => {}) }
  else await zone.click({ position: pos })
  await sleep(500)
  let armed = await p.evaluate(() => window.ARM && window.ARM.key)
  /* probe4: in the test browser's WebKit a finger's tap on a sim's extra place ("+", instructor / observer) arms nothing,
     where Chromium's touch and the desktop's click do — a lead put to the host. The phone walk then picks it by a script
     click and says so (via) */
  let via = W.isPhone ? 'tap' : 'click'
  if (!armed && W.isPhone && /\.x\d+"\]$/.test(sel)) {
    via = 'tap did NOT arm it — script click used'
    await zone.evaluate(e => e.click()); await sleep(500)
    armed = await p.evaluate(() => window.ARM && window.ARM.key)
  }
  await W5.boardDrawer(p, W, true)
  const ls = {}
  for (const id of ids) ls[id] = await listOf(p, '#schedBoard', id)
  const head = ((ls[ids[0]] && ls[ids[0]].head) || '') + (via.startsWith('tap did') ? ' [' + via + ']' : '')
  const clip = await W5.clip(p, W, p.locator(`#schedBoard .rpuck[data-person="${ids[0]}"]:visible`).first(), tag + '-armed')
  const sec = await W5.clip(p, W, p.locator('#schedBoard .rsans:visible').first(), tag + '-sans', 20)
  const full = await W.pic(p, tag + '-armed')
  return { armed, ls, head, via, pic: [clip, sec, full].filter(Boolean).join(', ') }
}
/* Edit Schedule: a place on the week (a seat box, or a row's "+ add" — the week draws a sim row as one "+ add") pressed,
   the crew panel read for each of `ids`; then disarmed and the phone's crew tab closed */
export async function armEAt(p, W, wk, sel, tag, ids = [RANGER, IPMAN]) {
  await T.gotoWeek(p, W, wk)
  const z = p.locator(`#eWeek ${sel}:visible`).first()
  if (!(await z.count())) return { armed: null, ls: {}, head: 'NO SUCH PLACE ON THE WEEK ' + sel, pic: await W.pic(p, tag + '-noweek') }
  await z.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  const addz = z.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await z.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await z.tap({ position: pos }); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-warm-now-phone.png`) }).catch(() => {}) } else await z.click({ position: pos })
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown && await p.locator('#rosTab:visible').count()) { await W.press(p, '#rosTab:visible', 'crew-tab'); await sleep(400) }
  }
  const day = ((await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')) || '').trim()
  const ls = {}
  for (const id of ids) ls[id] = await listOf(p, '.ros-body', id)
  const clip = await W5.clip(p, W, p.locator(`.ros-body .rpuck[data-person="${ids[0]}"]:visible`).first(), tag + '-earmed')
  const sec = await W5.clip(p, W, p.locator('.ros-body .rsans:visible').first(), tag + '-esans', 20)
  const full = await W.pic(p, tag + '-earmed')
  await disarmE(p, W)
  return { armed, day, ls, head: (ls[ids[0]] && ls[ids[0]].head) || '', pic: [clip, sec, full].filter(Boolean).join(', ') }
}
/* armed, read, then disarmed */
export async function look(p, W, di, sel, tag, ids) { const r = await armAt(p, W, di, sel, tag, ids); await disarm(p, W); return r }
/* the man's crew puck pressed while a place is armed: the note at once (phone: a picture within ~100ms) and settled */
export async function pickNow(p, W, tag, id = RANGER) {
  await L.hideToast(p).catch(() => {})
  await W5.boardDrawer(p, W, true)
  const pk = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first()
  if (!(await pk.count())) return { toast: '', why: 'no puck', pic: '' }
  await pk.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) { await pk.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-pick-now-phone.png`) }).catch(() => {}) } else await pk.click()
  await sleep(300)
  const toast = await L.toastSaid(p)
  const tpic = await W5.clip(p, W, '#toastEl', tag + '-note', 30)
  const full = await W.pic(p, tag + '-picked')
  await disarm(p, W)
  return { toast, pic: [tpic, full].filter(Boolean).join(', ') }
}
/* arm + pick in one, the placement read by what the man holds that day before and after */
export async function place(p, W, di, sel, tag, id = RANGER) {
  const before = await dayHold(p, di, id)
  const a = await armAt(p, W, di, sel, tag, [id])
  if (!a.armed) return { placed: false, a, toast: '', pic: a.pic }
  const k = await pickNow(p, W, tag, id)
  const after = await dayHold(p, di, id)
  return { placed: after.length > before.length || after.join() !== before.join(), before, after, a, toast: k.toast, pic: a.pic + ', ' + k.pic }
}
export const dayHold = (p, di, id) => p.evaluate(([i, id]) => {
  const out = []
  const walk = (o, at) => { if (o == null) return; if (typeof o === 'string') { if (o === id) out.push(at); return } if (Array.isArray(o)) { o.forEach((x, n) => walk(x, at + '[' + n + ']')); return } if (typeof o === 'object') for (const k of Object.keys(o)) if (k !== 'by') walk(o[k], at + '.' + k) }
  walk(window.DAYS[i], '')
  return out
}, [di, id])
/* a man's seated pucks on the open board (not the crew list): where, the warning classes, the small letter chips */
export const seated = (p, id = RANGER) => p.evaluate(id => {
  const R = document.querySelector('#schedBoard'); if (!R) return []
  return [...R.querySelectorAll(`.puck[data-person="${id}"]`)].filter(e => !e.closest('.rpuck') && !e.closest('.sb-ros') && !e.closest('.availwin') && e.getBoundingClientRect().width > 0).map(e => {
    const s = e.closest('[data-slot],[data-fill]')
    return { at: s ? (s.dataset.slot || s.dataset.fill) : '?', warn: /(^|\s)warn(\s|$)/.test(e.className), err: /(^|\s)(err|clash|bad)(\s|$)/.test(e.className), chips: [...e.querySelectorAll('.lchip')].map(c => (c.textContent || '').trim()), title: (e.getAttribute('title') || '').slice(0, 220) }
  })
}, id)
export const seatSay = s => s.length ? s.map(x => `${x.at}${x.warn ? ' AMBER' : ''}${x.err ? ' RED' : ''}${x.chips.length ? ' chips[' + x.chips.join(',') + ']' : ''}`).join(' · ') : 'no seated puck'
/* the SANS amber mark is the "A" (Advisory) chip — "planned outside SANS availability" is one of its two meanings; an
   amber puck for another rule (try2: Jester's "L", a long day on AVALON) is not it, and is recorded, not judged */
export const ambered = s => s.filter(x => x.chips.includes('A'))
/* the man's words in one read: no SANS reason of any kind (title or printed line); premise: he is drawn */
export const sansWords = l => l && l.me ? l.me.map(x => (x.title || '') + ' ' + (x.printed || '')).join(' ').match(/SANS[^·|]*/g) || [] : ['NOT READ']
export const noSans = l => !!(l && l.me && l.me.length) && !sansWords(l).length
export const printed = l => (l && l.me && l.me[0] && l.me[0].printed) || ''
export const struckW = (l, w) => struckWith(l, w)
export const sayRJ = r => `armed ${r.armed} · "${r.head}" · Ranger ${meSay(r.ls[RANGER])}${r.ls[IPMAN] ? ' · Jester ' + meSay(r.ls[IPMAN]) : ''}`
/* a board box set (typed, or cleared when v is '') */
export async function setBox(p, W, di, sel, v) {
  await L.openBoard(p, W, di)
  const el = p.locator(L.B(sel)).first()
  if (!(await el.count())) return 'NO BOX ' + sel
  await el.scrollIntoViewIfNeeded()
  if (W.isPhone) await el.tap(); else await el.click()
  await sleep(150)
  await p.keyboard.press('Control+A').catch(() => {})
  await el.fill('')
  if (v) await el.type(String(v), { delay: 10 })
  await p.keyboard.press('Enter').catch(() => {})
  await el.evaluate(e => e.blur()).catch(() => {})
  await sleep(350)
  return (await el.inputValue().catch(() => '?'))
}
export const formOf = (p, di, wi) => p.evaluate(([i, w]) => window.DAYS[i].waves[w].formations.map(f => ({ br: f.br || '', rl: f.rl || '', to: f.to || '', ld: f.ld || '', flies: f.aircraft.map(a => !!(a.flies || a.fly || (a.opts && a.opts.flies))), cx: f.aircraft.map(a => !!a.cx) })), [di, wi])
/* a standby row's FLIES ticked or unticked by its own button, read back from the button */
let fliesN = 0
export async function flies(p, W, di, key, want) {
  const n = String(++fliesN).padStart(2, '0')
  await L.openBoard(p, W, di)
  const b = p.locator(L.B(`[data-safly="${key}"]`)).first()
  if (!(await b.count())) return { ok: false, now: 'no FLIES button ' + key }
  const cur = await b.getAttribute('aria-pressed')
  if ((cur === 'true') !== want) { await W.press(p, b, 'flies-' + key); await sleep(500) }
  const now = await p.locator(L.B(`[data-safly="${key}"]`)).first().getAttribute('aria-pressed').catch(() => '?')
  return { ok: (now === 'true') === want, now, pic: await W5.clip(p, W, L.B(`[data-safly="${key}"]`), `flies${n}-${key.replace(/\./g, '')}-${want ? 'on' : 'off'}`, 30) }
}
/* Ranger's bell in the same tab (Saber out, Ranger in), then Saber back */
export async function rBell(p, W, tag) {
  await asR(p, W)
  const b = await bell(p, W, tag)
  await T.closeAll(p, W)
  await asS(p, W)
  return b
}
/* the "where can he go" rings: his crew puck selected with nothing armed, each named seat read (green or not), cleared */
export async function rings(p, W, di, keys, tag, id = RANGER) {
  await L.openBoard(p, W, di)
  await disarm(p, W)
  await W5.boardDrawer(p, W, true)
  const selNow = () => p.evaluate(id => !!document.querySelector(`#schedBoard .puck.sel[data-person="${id}"]`), id)
  if (await selNow()) { await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'unsel-' + id); await sleep(400) }
  await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'sel-' + id); await sleep(500)
  const selected = await selNow()
  await W5.boardDrawer(p, W, false)
  const r = await p.evaluate(ks => ks.map(k => { const e = [...document.querySelectorAll(`#schedBoard [data-slot="${k}"]`)].find(x => x.getBoundingClientRect().width > 0); return e ? `${k}:${/oktake/.test(e.className) ? 'GREEN RING' : 'no ring'}` : `${k}:not drawn` }), keys)
  const other = await p.evaluate(() => document.querySelectorAll('#schedBoard .oktake, #schedBoard .oktake-f').length)
  const pic = await W.pic(p, tag + '-rings')
  await W5.boardDrawer(p, W, true)
  if (await selNow()) { await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'unsel-' + id); await sleep(400) }
  await W5.boardDrawer(p, W, false)
  return { r, other, pic, selected }
}
/* the man's id by his callsign (read only) */
export const idOf = (p, cs) => p.evaluate(cs => (Object.entries(window.PEOPLE).find(([, q]) => q.cs === cs) || [])[0] || null, cs)
/* a line's ✕ ("Remove this line") on the board; the note read */
export async function lineDel(p, W, di, key, tag) {
  await L.openBoard(p, W, di)
  const b = p.locator(L.B(`[data-ldel="${key}"]`)).first()
  if (!(await b.count())) return { ok: false, toast: 'no ✕ ' + key }
  await W.press(p, b, 'ldel'); await sleep(600)
  return { ok: true, toast: await L.toastSaid(p), pic: await W.pic(p, tag + '-ldel') }
}
export async function simDel(p, W, di, kind, ri, tag) {
  await L.openBoard(p, W, di)
  const b = p.locator(L.B(`[data-srdel="${di}.${kind}.${ri}"]`)).first()
  if (!(await b.count())) return { ok: false, toast: 'no ✕' }
  await W.press(p, b, 'srdel'); await sleep(600)
  return { ok: true, toast: await L.toastSaid(p), pic: await W.pic(p, tag + '-srdel') }
}
export async function boardUndo(p, W, di, which, tag) {
  await L.openBoard(p, W, di)
  const sel = which === 'redo' ? '#sbRedo:visible' : '#sbUndo:visible'
  const title = await p.locator(sel).first().getAttribute('title').catch(() => '')
  await W.press(p, sel, which); await sleep(700)
  return { title, toast: await L.toastSaid(p), pic: await W.pic(p, tag + '-' + which) }
}
