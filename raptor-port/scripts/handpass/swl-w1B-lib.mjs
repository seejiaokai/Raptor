// swl-w1B-lib — walker B's helpers for the warning list's SANS lines walk (his D2579, D2584 Q3 / 2a / 3b, D2583), chat 203,
// 26 Nov 26. Built on sss-w1B-lib (chat 182's passing helpers), imported, never edited; the warning-list readers copied from
// wh-lib / wh-a-lib ([WARN-HIDE-KEPT], 1 Oct 26) and proved on this build by swl-w1B-probe2 before use. window.* is only READ
// here (and window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './swl-w1B-env.mjs'
import path from 'node:path'
export const Z = await import('./sss-w1B-lib.mjs')
export const { Y, K, X, T, L, W5, A, RANGER, IPMAN, D, WK1, WK2, J, sleep, need, asR, asS, bell, sayB, tapAndRead, OUT, postR, listOf,
  meSay, blank, fileFor, armE, disarmE, seatHas, disarm, armAt, look, pickNow, place, dayHold, seated, seatSay, ambered, setBox, boardUndo, lineDel, simDel, idOf, remDays, scene } = Z
export const pickE = Z.Y.pickE
export { path }
export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const NF = 'SANS: no availability filed for today. Planned on '
export const CHECK = 'SANS availability — not filed, or planned outside it'

/* bring a day of a week surface to the front (the week scrolls sideways) — copied from dbrA-W1-lib showDay */
export async function showDay(p, di, surf = '#eWeek') {
  await p.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`)
    if (!d) return
    const sc = d.closest('.week') || d.parentElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0)
    window.scrollTo(0, 0)
  }, [surf, di])
  await sleep(350)
}
/* a day's list on Edit Schedule ('#eWeek') or View-only Sched ('#vWeek'), opened by its own bar — copied from wh-lib */
export async function openList(p, W, surf, di) {
  await L.closeBoard(p, W)
  const want = surf === '#vWeek' ? 'viewsched' : 'editsched'
  if ((await p.evaluate(() => window.CURPAGE)) !== want) await L.go(p, want)
  await showDay(p, di, surf)
  const st = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
  if (st === false) { await W.press(p, `${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`, 'bar-' + di); await sleep(350) }
  return st !== null
}
export async function closeList(p, W, surf, di) {
  const st = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
  if (st === true) { await W.press(p, `${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`, 'bar-shut-' + di); await sleep(350) }
}
/* the bar and every line AS PAINTED: struck (computed text-decoration), colour, its button and whether the button is the topmost
   thing at its own centre — copied from wh-lib readList */
export async function readList(p, surf, di) {
  return p.evaluate(([s, i]) => {
    const day = document.querySelector(`${s} .day[data-day="${i}"]`); if (!day) return { none: 'no such day on this page', lines: [] }
    const box = day.querySelector(`[data-dwbox="${i}"]`)
    if (!box) return { bar: '(no bar)', barCls: '', lines: [], other: [] }
    const bar = box.querySelector('.daywarn')
    const lines = [...box.querySelectorAll('.witem')].map(e => {
      const t = e.querySelector('.wtx') || e.children[1] || e, cs = getComputedStyle(t), b = e.querySelector('button')
      let top = null
      if (b) { const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); top = !!hit && (hit === b || b.contains(hit)); if (!(r.width > 0 && r.top >= 0 && r.bottom <= innerHeight)) top = 'off-screen' }
      const er = e.getBoundingClientRect()
      return { ix: e.dataset.wix == null ? null : +e.dataset.wix, gone: e.classList.contains('gone') || e.dataset.wix == null, sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), color: cs.color,
        btn: b ? ((b.innerText || b.textContent || '').trim() || (b.querySelector('svg') ? '[drawn icon: ' + (b.getAttribute('title') || b.getAttribute('aria-label') || '') + ']' : '[button]')) : '', btnTitle: b ? (b.getAttribute('title') || b.getAttribute('aria-label') || '') : '', btnTop: top, text: (e.innerText || '').replace(/\s+/g, ' ').trim(), w: Math.round(er.width), h: Math.round(er.height), right: Math.round(er.right) }
    })
    return { bar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : '(no bar)', barCls: bar ? bar.className : '', barColor: bar ? getComputedStyle(bar).color + ' / ' + getComputedStyle(bar).backgroundColor : '', lines,
      other: [...box.querySelectorAll('.dwlist > :not(.witem)')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)) }
  }, [surf, di])
}
/* the list read after opening it by its bar (a shut list draws no lines — probe8) */
export async function readOpen(p, W, surf, di) { await openList(p, W, surf, di); return readList(p, surf, di) }
export const listSay = l => `bar "${l.bar}" [${(l.barCls || '').replace('daywarn', '').trim()}] · ${l.lines.length} line(s)${l.lines.length ? ': ' + l.lines.map(x => `[${x.sev}${x.gone ? ' FROZEN' : ''}${x.hid ? ' HIDDEN' : ''}${x.struck ? ' struck' : ''}${x.btn ? ' ' + x.btn : ''}] ${x.text}`).join(' || ') : ''}${l.other && l.other.length ? ' · other ' + J(l.other) : ''}`
export const sansOf = l => l.lines.filter(x => /SANS/.test(x.text))
/* ✕ or ↺ on line ix of a day's list — the app's own button */
export async function tapLine(p, W, surf, di, ix, tag = 'woff') {
  await openList(p, W, surf, di)   /* the list opened by its bar first: a shut list's buttons take no press */
  const b =p.locator(`${surf} .day[data-day="${di}"] [data-woff="${di}.${ix}"]`).first()
  if (!(await b.count())) return 'no button on that line'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  if (W.isPhone) { await b.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-now-phone.png`) }).catch(() => {}) } else await b.click()
  await sleep(500)
  return 'pressed'
}
/* the board's panel: fold opened on a phone, read as painted — copied from wh-lib readBoard */
export async function boardList(p, W, di) {
  await L.openBoard(p, W, di)
  const o = await p.evaluate(() => { const w = document.querySelector('#schedBoard .sbwrap'); return w ? w.classList.contains('open') : null })
  const folded = await p.evaluate(() => { const r = document.querySelector('#schedBoard .sb-warn .wln[data-wix]'); return r ? getComputedStyle(r).display === 'none' : false })
  if (o === false && folded) { await W.press(p, '#schedBoard [data-sbwtog]', 'sbwtog'); await sleep(300) }
  return p.evaluate(() => {
    const w = document.querySelector('#schedBoard .sb-warn'); if (!w) return { head: 'no board panel', lines: [], other: [] }
    const h = w.querySelector('.wh')
    return { head: h ? h.innerText.replace(/\s+/g, ' ').trim() : '', headCls: h ? h.className : '',
      lines: [...w.querySelectorAll('.wln[data-wix]')].map(e => {
        const t = e.querySelector('.wln-t') || e, b = e.querySelector('button'), cs = getComputedStyle(t)
        return { ix: +e.dataset.wix, hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), shown: getComputedStyle(e).display !== 'none', btn: b ? ((b.innerText || '').trim() || (b.querySelector('svg') ? '[drawn icon: ' + (b.getAttribute('title') || '') + ']' : '[button]')) : '', text: (e.innerText || '').replace(/\s+/g, ' ').trim() }
      }),
      other: [...w.querySelectorAll('.wln.ok, .wmuted-h')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
  })
}
export const boardSay = b => `head "${b.head}" · ${b.lines.length} line(s)${b.lines.length ? ': ' + b.lines.map(x => `[${x.hid ? 'HIDDEN ' : ''}${x.struck ? 'struck ' : ''}${x.btn}] ${x.text}`).join(' || ') : ''}${b.other && b.other.length ? ' · other ' + J(b.other) : ''}`
export async function tapBoardLine(p, W, di, ix, tag = 'sbwoff') {
  const b = p.locator(`#schedBoard [data-woff="${di}.${ix}"]`).first()
  if (!(await b.count())) return 'no button on that line'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  if (W.isPhone) { await b.tap(); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-now-phone.png`) }).catch(() => {}) } else await b.click()
  await sleep(500)
  return 'pressed'
}
/* the day's ⓘ popup on a week surface, read as painted, then closed — copied from wh-a-lib dayInfo */
export async function dayInfo(p, W, surf, di, tag) {
  await showDay(p, di, surf)
  const b = p.locator(`${surf} .day[data-day="${di}"] [data-dayinfo="${di}"]`).first()
  if (!(await b.count())) return { none: 'no ⓘ on that day', lines: [] }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  await W.press(p, b, 'dayinfo'); await sleep(600)
  const out = await p.evaluate(() => {
    const m = document.querySelector('#dayPop'); if (!m || !m.getBoundingClientRect().width) return { none: 'the popup did not open', lines: [] }
    const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''
    return { title: t(m.querySelector('#dayPopTitle')), stat: t(m.querySelector('.dip-stat')), sev: t(m.querySelector('.dip-sev')),
      lines: [...m.querySelectorAll('.dip-list .witem')].map(e => { const x = e.querySelector('.wtx') || e.children[1] || e; const cs = getComputedStyle(x); return { hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), btn: (e.querySelector('button') || {}).innerText || '', text: t(e) } }) }
  })
  if (tag) { await p.evaluate(() => { const h = [...document.querySelectorAll('#dayPop .dip-h')].find(e => /issues/i.test(e.innerText)); if (h) h.scrollIntoView({ block: 'start' }) }); await sleep(250); out.pic = await W5.clip(p, W, '#dayPop', tag + '-ipop', 10).catch(() => '') || await W.pic(p, tag + '-ipop') }
  const x = p.locator('#dayPopDone:visible, #dayPopClose:visible').first()
  if (await x.count()) await W.press(p, x, 'dayinfo-x'); else await p.keyboard.press('Escape')
  await sleep(400)
  out.closed = !(await p.evaluate(() => { const m = document.querySelector('#dayPop'); return !!m && m.getBoundingClientRect().width > 0 }))
  return out
}
export const infoSay = i => i.none ? i.none : `"${i.title}" · ${i.stat} · ${i.sev} · ${i.lines.length} line(s)${i.lines.length ? ': ' + i.lines.map(x => `[${x.hid ? 'HIDDEN ' : ''}${x.struck ? 'struck ' : ''}${x.btn}] ${x.text}`).join(' || ') : ''}`
/* every VISIBLE puck of `id` inside `scope`, as PAINTED: where, ring colour (computed box-shadow), chip letters — copied from wh-a-lib pk */
export async function pk(p, scope, id) {
  return p.evaluate(([s, who]) => {
    const col = c => !c || c === 'none' || /inset/.test(c) || /240, 182, 255/.test(c) ? '' : /240, 85, 95/.test(c) ? 'red' : /229, 168, 59/.test(c) ? 'amber' : /138, 150, 163/.test(c) ? 'grey' : c.replace(/ 0px.*/, '')
    const where = e => {
      if (e.closest('.availwin, .aw-win, [data-availwin]')) return 'ALL AVAIL window'
      if (e.closest('#eRoster, .ros-body')) return 'crew list (week)'
      if (e.closest('#sbRoster, .sb-ros')) return 'crew list (board)'
      if (e.closest('.rpuck')) return 'crew list'
      const sec = e.closest('[data-secmove]'); const n = sec ? sec.dataset.secmove.split('.')[1] : ''
      if (e.closest('.availpuck')) return 'Available crew'
      if (e.closest('.sanscards, .sb-panel.sansav, .rsans')) return 'SANS'
      if (e.closest('[data-inprow], .sb-panel.unav')) return 'Unavailable'
      return ({ waves: 'flying line', duty: 'duty', sims: 'sim', ground: 'ground', prog: 'programme', inputs: 'Personal Inputs', avail: 'Available crew', sans: 'SANS', unav: 'Unavailable' })[n] || n || 'other'
    }
    return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null && e.getBoundingClientRect().width > 0).map(e => {
      const cs = getComputedStyle(e), d = e.closest('.day[data-day]'), sl = e.closest('[data-slot]')
      /* the ring as painted: any of the box-shadow, the outline or the border in the warning colours (amber 229,168,59; red 240,85,95) */
      const paint = [cs.boxShadow, cs.outlineStyle !== 'none' ? cs.outlineColor : '', cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0 ? cs.borderTopColor : ''].join(' | ')
      const ring = /240, 85, 95/.test(paint) ? 'red' : /229, 168, 59/.test(paint) ? 'amber' : col(cs.boxShadow) === 'grey' ? 'grey' : ''
      return { where: where(e), day: d ? +d.dataset.day : null, slot: sl ? sl.dataset.slot : '', ring, chip: [...e.querySelectorAll('.lchip')].map(c => (c.innerText || '').trim()).join(''), cls: e.className, paint: paint.slice(0, 160) }
    })
  }, [scope, id])
}
export const pkSay = ps => ps.length ? ps.map(x => `${x.where}${x.day != null ? '@' + DOW[x.day] : ''}${x.slot ? '(' + x.slot + ')' : ''}:${x.ring || 'no ring'}${x.chip ? '/' + x.chip : ''}`).join(' ; ') : 'no puck drawn'
/* the app's own warnings of a day (read only, to RECORD — never judged by) */
export const held = (p, di) => p.evaluate(i => ((((window.WARN || {}).byDay || {})[i] || {}).warns || []).map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${String(w.msg || '').slice(0, 120)}`), di)
/* a clipped picture of a day's list box on a week surface */
export async function listPic(p, W, surf, di, tag) {
  await showDay(p, di, surf)
  const sel = `${surf} .day[data-day="${di}"] [data-dwbox="${di}"]`
  return (await W5.clip(p, W, sel, tag + '-list', 12).catch(() => '')) || await W.pic(p, tag + '-list')
}

/* ---------- fixtures, every one through the app's own controls ---------- */
/* + Wave → Flying wave on the board of day di, then CS / MSN / T/O / LD typed (each only when given); its seat keys */
export async function mkLine(p, W, di, o = {}) {
  const a = await A.addLine(p, W, di, { cs: o.cs, to: o.to, ld: o.ld })
  if (a.wi < 0) return { wi: -1 }
  if (o.msn) await L.typeBox(p, W, `[data-bfld="ff:${di}.${a.wi}.0.msn"]`, o.msn)
  const f = await p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { cs: x.cs, msn: x.msn, to: x.to, ld: x.ld } }, [di, a.wi])
  return { wi: a.wi, f, fcp: `${di}.${a.wi}.0.0.p`, rcp: `${di}.${a.wi}.0.0.w` }
}
/* every note the page showed from now on (a watcher on the note's box), read back by notesSeen */
export const noteWatch = p => p.evaluate(() => { window.__swlN = []; if (window.__swlObs) return; window.__swlObs = new MutationObserver(() => { const t = document.getElementById('toastEl'); const s = t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : ''; if (s && window.__swlN[window.__swlN.length - 1] !== s) window.__swlN.push(s) }); window.__swlObs.observe(document.body, { childList: true, subtree: true, characterData: true }) })
export const notesSeen = p => p.evaluate(() => window.__swlN || [])
/* the note's box as drawn: inside the screen, cut or wrapped, how many lines */
export const noteBox = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return 'no note box'; const r = t.getBoundingClientRect(), cs = getComputedStyle(t); const lh = parseFloat(cs.lineHeight) || 18; return { left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, h: Math.round(r.height), lines: Math.round((r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh), cut: t.scrollWidth > t.clientWidth + 1, opacity: cs.opacity, n: document.querySelectorAll('#toastEl').length } })
/* desktop: a man's crew-list puck dragged onto a seat with the mouse (the press, a 6px start, a glide to the seat's middle) */
export async function dragIn(p, W, di, key, id, tag) {
  await L.openBoard(p, W, di)
  await noteWatch(p)
  const src = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first(), dst = p.locator(`#schedBoard [data-slot="${key}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await sleep(200)
  const sa = await src.boundingBox(), db = await dst.boundingBox()
  if (!sa || !db) return { placed: false, toast: '', why: 'source or seat not drawn' }
  await p.mouse.move(sa.x + sa.width / 2, sa.y + sa.height / 2); await p.mouse.down()
  await p.mouse.move(sa.x + sa.width / 2 + 6, sa.y + sa.height / 2 + 6, { steps: 3 })
  await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 14 }); await sleep(150)
  await p.mouse.up(); await sleep(300)
  const toast = await L.toastSaid(p), box = await noteBox(p)
  const tpic = await W5.clip(p, W, '#toastEl', tag + '-note', 30)
  const full = await W.pic(p, tag + '-dropped')
  return { placed: await seatHas(p, key, id), toast, box, seen: await notesSeen(p), pic: [tpic, full].filter(Boolean).join(', ') }
}
/* a man tapped into a seat (arm the seat, tap his crew-list puck) on the board; the note read at once */
export const plan = (p, W, di, key, id, tag) => place(p, W, di, `[data-slot="${key}"]`, tag, id)
/* a saved SANS filing deleted: the SANS day's line opened, Delete pressed; gone read back by its id */
export async function unfile(p, W, iso, iid, tag) {
  await T.closeAll(p, W)
  /* the SANS tab opened on the day (sud-w5 sansDay), the filing's own line opened (sah-w8 openLine's press) */
  await W5.sansDay(p, W, iso)
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`).first()
  const o = { ok: !!(await row.count()), pic: '' }
  if (o.ok) { await W.press(p, row, 'sd-open'); await p.waitForSelector('#inpEditPop', { timeout: 5000 }).catch(() => {}); await sleep(400); o.pic = await W.pic(p, tag + '-open') }
  if (o.ok) { await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700) }
  const toast = await L.toastSaid(p)
  const gone = !(await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), iid))
  const pic = await W.pic(p, tag + '-deleted')
  return { ok: o.ok && gone, toast, pic: [o.pic, pic].filter(Boolean).join(', ') }
}
/* the top bar's Undo / Redo (the page's own, not the board's) */
export async function topDoor(p, W, which, tag) {
  const sel = which === 'redo' ? '#redoBtn:visible' : '#undoBtn:visible'
  /* the SANS day window stands over the top bar on a phone (D648): a person closes it by its ✕ first (run1-p2's s29) */
  if (await p.locator('[data-testid="win-sansday-x"]:visible').count()) { await W.press(p, '[data-testid="win-sansday-x"]:visible', 'sansday-x'); await sleep(400) }
  const b = p.locator(sel).first()
  if (!(await b.count())) return { title: 'not drawn', toast: '', pic: await W.pic(p, tag + '-' + which + '-none') }
  const title = await b.getAttribute('title').catch(() => '')
  if (await b.isDisabled()) return { title, disabled: true, toast: '', pic: await W.pic(p, tag + '-' + which + '-greyed') }
  await W.press(p, b, which); await sleep(700)
  return { title, toast: await L.toastSaid(p), pic: await W.pic(p, tag + '-' + which) }
}
/* every place the day's warnings are told, read together (lesson 32): Edit Schedule's list, the ⓘ popup, the board's panel, and
   each man's pucks on the week and on the board */
export async function places(p, W, di, tag, ids = []) {
  await openList(p, W, '#eWeek', di)
  const e = await readList(p, '#eWeek', di)
  const ePic = await listPic(p, W, '#eWeek', di, tag + '-e')
  /* the week's pucks read with the list SHUT: an open list rings the pucks of every line it shows ("wfoc advf", probe6) */
  await closeList(p, W, '#eWeek', di)
  const wk = {}
  for (const id of ids) wk[id] = (await pk(p, '#eWeek', id)).filter(x => x.day === di)   /* that day's copies only */
  const i = await dayInfo(p, W, '#eWeek', di, tag)
  const b = await boardList(p, W, di)
  const bPic = (await W5.clip(p, W, '#schedBoard .sb-warn', tag + '-b', 10).catch(() => '')) || ''
  const bd = {}
  for (const id of ids) bd[id] = await pk(p, '#schedBoard', id)
  const full = await W.pic(p, tag + '-board')
  await L.closeBoard(p, W)
  const say = `EDIT ${listSay(e)} ·· INFO ${infoSay(i)} ·· BOARD ${boardSay(b)} ·· PUCKS ${ids.map(id => `${id} week[${pkSay(wk[id])}] board[${pkSay(bd[id])}]`).join(' / ')}`
  return { e, i, b, wk, bd, say, pic: [ePic, i.pic, bPic, full].filter(Boolean).join(', ') }
}
/* count of a bar's "N issue(s)" (0 when it reads no issues) */
export const nIss = s => { const m = /(\d+)\s+issues?/.exec(s || ''); return m ? +m[1] : (/no issues|no conflicts/i.test(s || '') ? 0 : null) }
/* lines that are SANS lines, shown (not hidden, not frozen) */
export const liveSans = lines => lines.filter(x => /SANS/.test(x.text) && !x.hid && !x.gone)
/* the man's puck copies that wear the amber ring AND the "A" chip */
export const amberA = ps => ps.filter(x => x.ring === 'amber' && x.chip.includes('A'))
