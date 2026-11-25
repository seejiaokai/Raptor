// sns-w1B-lib — walker B's helpers for the D2573 walk (chat 179, 25 Nov 26). Built on the passing w14 helpers
// (swd-w14c-lib → swd-w14b-lib → swd-w14a-lib → swd-w12/w11 → sah-w10 / asp-w2 / sud-w5), imported, never edited. window.* is only
// READ here (and window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './sns-w1B-env.mjs'
import path from 'node:path'
const Z = await import('./swd-w14c-lib.mjs')
export const { K, X, T, L, W5, RANGER, HEX, D, ISO, DI, WK1, WK2, bell, say, sayB, need, asR, asS, scene, sleep, J, addLine, lineOff, moveTo, tapAndRead, calSays } = Z
export { Z }
export const A = await import('./swd-w14a-lib.mjs')
export const OUT = L.OUT
export const IPMAN = 'ipman' // callsign "Jester", SANS by tick in the seed, no date
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }   // the brief's desktop size
export const R17 = "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."
export const TODAYW = 'SANS — no availability filed for today'
export const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* Ranger posted out as SANS from Fri 17 Jul through the Leave War (the recipe) */
export const postR = (p, W, sid = 'post') => K.post(p, W, RANGER, D[17], sid)

/* the crew list under `root`: the SANS Avail heading, each man's puck in it in order — struck, title, printed reason, the
   reason's box inside the panel — and one man's puck wherever it stands */
export const listOf = (p, root, id = RANGER) => p.evaluate(([root, id]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.left < window.innerWidth - 4 && r.right > 4 }
  const t = e => e ? (e.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : ''
  const R = document.querySelector(root); if (!R) return { root: 'none' }
  const P = window.PEOPLE
  const sec = [...R.querySelectorAll('.rsans')].find(vis)
  const head = sec ? t(sec.querySelector('.rh2')) : 'no SANS Avail section'
  /* the reason line is judged against the SANS Avail section's own box (the drawer or the crew panel), not the whole board */
  const panel = (sec || R).getBoundingClientRect()
  const sans = sec ? [...sec.querySelectorAll('.rpuck[data-person]')].filter(vis).map(e => {
    const rw = e.querySelector('.rwhy'); const rb = rw && vis(rw) ? rw.getBoundingClientRect() : null
    return { id: e.dataset.person, cs: (P[e.dataset.person] || {}).cs, struck: /(^|\s)no(\s|$)/.test(e.className), title: e.getAttribute('title') || '',
      printed: rb ? t(rw) : '', inside: rb ? (rb.left >= panel.left - 0.5 && rb.right <= Math.min(panel.right, window.innerWidth) + 0.5) : null,
      rw: rb ? `${Math.round(rb.left)}–${Math.round(rb.right)}` : '' }
  }) : []
  const me = [...R.querySelectorAll(`.rpuck[data-person="${id}"]`)].filter(e => !e.closest('.availwin')).map(e => {
    const rw = e.querySelector('.rwhy')
    return { shown: vis(e), where: e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? t(e.closest('.rcol').querySelector('.rh')) || 'col' : '?', struck: /(^|\s)no(\s|$)/.test(e.className), title: e.getAttribute('title') || '', printed: rw && vis(rw) ? t(rw) : '', faded: /(^|\s)(busy|tasked|dim|fade)/.test(e.className), cls: e.className }
  }).filter(x => x.shown)
  return { head, sans, me, panel: `${Math.round(panel.left)}–${Math.round(panel.right)} of ${window.innerWidth}` }
}, [root, id])
export const meSay = l => l && l.me ? (l.me.map(x => `[${x.where}${x.struck ? ', STRUCK' : ', plain'}] title "${x.title}"${x.printed ? ` printed "${x.printed}"` : ' (no reason printed)'}`).join(' + ') || 'not shown') : J(l)
export const listSay = l => l && l.sans ? `"${l.head}" · ` + l.sans.map(x => `${x.cs}${x.struck ? '(struck)' : ''}${x.printed ? ' "' + x.printed + '"' : ''}`).join(', ') : J(l)
export const struckWith = (l, words) => !!(l && l.me && l.me.some(x => x.struck && (words == null || x.printed === words)))
export const plainIn = l => !!(l && l.me && l.me.length && l.me.every(x => !x.struck && !x.printed))
export const freeN = l => { const m = /(\d+)\s*free/.exec((l && l.head) || ''); return m ? +m[1] : null }

/* a seat on the open board armed (its own box), the drawer opened on the phone, the list read; left ARMED */
export async function armB(p, W, di, key, tag, id = RANGER) {
  await L.openBoard(p, W, di)
  const z = p.locator(L.B(`[data-slot="${key}"]`)).first()
  if (!(await z.count())) return { armed: null, l: null, pic: await W.pic(p, tag + '-noseat') }
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  if (W.isPhone) { await z.tap(); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-arm-now-phone.png`) }).catch(() => {}) } else await z.click()
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  await W5.boardDrawer(p, W, true)
  const l = await listOf(p, '#schedBoard', id)
  const clip = await W5.clip(p, W, p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first(), tag + '-armed')
  const sec = await W5.clip(p, W, p.locator('#schedBoard .rsans:visible').first(), tag + '-sans', 20)
  const full = await W.pic(p, tag + '-armed')
  return { armed, l, pic: [clip, sec, full].filter(Boolean).join(', ') }
}
/* the man's crew puck pressed while a seat is armed: the note read at once and settled, the seat read back */
export async function pickB(p, W, key, tag, id = RANGER) {
  await L.hideToast(p).catch(() => {})
  const pk = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first()
  if (!(await pk.count())) return { placed: false, toast: '', why: 'no puck' }
  await pk.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) { await pk.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-pick-now-phone.png`) }).catch(() => {}) } else await pk.click()
  await sleep(250)
  const toast = await L.toastSaid(p)
  const tpic = await W5.clip(p, W, '#toastEl', tag + '-note', 30)
  const full = await W.pic(p, tag + '-picked')
  const placed = await seatHas(p, key, id)
  return { placed, toast, pic: [tpic, full].filter(Boolean).join(', ') }
}
export const seatHas = (p, key, id) => p.evaluate(([k, id]) => { const [di, wi, fi, ai, s] = k.split('.'); const w = window.DAYS[+di].waves[+wi]; const a = w && w.formations[+fi] && w.formations[+fi].aircraft[+ai]; return a ? a[s] === id : false }, [key, id])
export async function disarm(p, W) {
  if (await p.evaluate(() => !!(window.ARM && window.ARM.key))) { await p.keyboard.press('Escape'); await sleep(300) }
  await W5.boardDrawer(p, W, false)
  return p.evaluate(() => !!(window.ARM && window.ARM.key))
}

/* Edit Schedule: the week's own seat box pressed (the week shown first), the crew panel read; left ARMED */
export async function armE(p, W, wk, key, tag, id = RANGER) {
  await T.gotoWeek(p, W, wk)
  const di = +key.split('.')[0]
  const z = p.locator(`#eWeek [data-slot="${key}"]:visible`).first()
  if (!(await z.count())) return { armed: null, l: null, pic: await W.pic(p, tag + '-noweekseat') }
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  if (W.isPhone) { await z.tap(); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-warm-now-phone.png`) }).catch(() => {}) } else await z.click()
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown && await p.locator('#rosTab:visible').count()) { await W.press(p, '#rosTab:visible', 'crew-tab'); await sleep(400) }
  }
  const day = ((await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')) || '').trim()
  const l = await listOf(p, '.ros-body', id)
  const clip = await W5.clip(p, W, p.locator(`.ros-body .rpuck[data-person="${id}"]:visible`).first(), tag + '-earmed')
  const sec = await W5.clip(p, W, p.locator('.ros-body .rsans:visible').first(), tag + '-esans', 20)
  const full = await W.pic(p, tag + '-earmed')
  return { armed, day, l, pic: [clip, sec, full].filter(Boolean).join(', '), di }
}
export async function pickE(p, W, key, tag, id = RANGER) {
  await L.hideToast(p).catch(() => {})
  const pk = p.locator(`.ros-body .rpuck[data-person="${id}"]:visible`).first()
  if (!(await pk.count())) return { placed: false, toast: '', why: 'no puck' }
  await pk.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) { await pk.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-epick-now-phone.png`) }).catch(() => {}) } else await pk.click()
  await sleep(250)
  const toast = await L.toastSaid(p)
  const tpic = await W5.clip(p, W, '#toastEl', tag + '-enote', 30)
  const full = await W.pic(p, tag + '-epicked')
  return { placed: await seatHas(p, key, id), toast, pic: [tpic, full].filter(Boolean).join(', ') }
}
export async function disarmE(p, W) {
  if (await p.evaluate(() => !!(window.ARM && window.ARM.key))) { await p.keyboard.press('Escape'); await sleep(300) }
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (shown && await p.locator('#rosTab:visible').count()) await W.press(p, '#rosTab:visible', 'crew-tab-close')
  }
}
/* the unpicked crew panel of a weekday on Edit Schedule (nothing armed) */
export async function listE(p, W, wk, dow, tag, id = RANGER) {
  await T.gotoWeek(p, W, wk)
  await disarmE(p, W)
  const day = await T.S.crewPanelTo(p, W, dow)
  const l = await listOf(p, '.ros-body', id)
  const clip = await W5.clip(p, W, p.locator(`.ros-body .rpuck[data-person="${id}"]:visible`).first(), tag + '-elist')
  const full = await W.pic(p, tag + '-elist')
  await T.S.crewPanelClose(p, W)
  return { day, l, pic: [clip, full].filter(Boolean).join(', ') }
}

/* a blank flying line on the board of day di (+ Wave → Flying wave, nothing typed); its FCP key */
export async function blank(p, W, di, sid, o = {}) {
  const a = await addLine(p, W, di, o)
  need(W, sid, `a new flying line on ${DOWS[di]} (+ Wave → ${o.kind || 'Flying wave'})${o.to ? ' ' + o.to + '–' + (o.ld || '') : ', no times typed'}`, a.wi >= 0, J(a.f))
  return { ...a, fcp: `${di}.${a.wi}.0.0.p`, rcp: `${di}.${a.wi}.0.0.w` }
}
/* the line's take-off / landing typed (either may be '' to clear) on the open board */
export async function times(p, W, di, wi, to, ld) {
  await L.openBoard(p, W, di)
  if (to != null) await clearOrType(p, W, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld != null) await clearOrType(p, W, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  return p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { to: x.to, ld: x.ld } }, [di, wi])
}
async function clearOrType(p, W, sel, v) {
  if (v) return L.typeBox(p, W, sel, v)
  const el = p.locator(L.B(sel)).first()
  await el.scrollIntoViewIfNeeded()
  if (W.isPhone) await el.tap(); else await el.click()
  await sleep(150)
  await p.keyboard.press('Control+A').catch(() => {})
  await p.keyboard.press('Backspace')
  await el.fill('')
  await p.keyboard.press('Enter').catch(() => {})
  await el.evaluate(e => e.blur())
  await sleep(300)
}
/* a SANS filing for a man on a day, by Saber, through + Commitment on the SANS day (sah-w10 file) */
export async function fileFor(p, W, iso, who, kinds, span, sid) {
  const f = await T.file(p, W, iso, who, kinds, span, sid)
  need(W, sid, `Saber files SANS ${kinds.join('+')}${Array.isArray(span) ? ' ' + span.join('–') : ' all day'} for ${Array.isArray(who) ? who.join('+') : who} on ${iso}`, !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  return f
}
export { path }
