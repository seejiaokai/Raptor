// swl-w1A-lib — walker A's helpers for the warning list's SANS lines walk (his D2579, D2584 Q3 / 2a / 3b, D2583), chat 203,
// 26 Nov 26. Built on chat 182's walker-A library (sss-w1A-lib, and under it the c174 recipes' helpers) — imported, never
// edited; their folders set by swl-w1A-env first (||=). window.* is only READ here (and window.go, the recipes' own page
// switch). Every staging step is the app's own controls. Readers copied from wh-lib / wh-a-lib (the day's list, the board's
// panel, the ⓘ popup), each proved again on this build by swl-w1A-probe2.
import './swl-w1A-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
const X = await import('./sss-w1A-lib.mjs')
export { X }
export const { A, Z, T, L, W5, RANGER, D, sleep, J, addLine, crewAll, who, say1, sayAll, crewPics, disarm, noteWatch, notesSeen,
  dragPath, hoverSay, sbUndo, sbRedo, commit, noteFits, need, run, NW, addSimRow, simRow, armAt, pickNow, holdsAt } = X
export const OUT = L.OUT
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
export const RAW = 'D:/raptor-work/c203-walk/A'
mkdirSync(RAW, { recursive: true })

/* the demo's people by id: the four SANS men with nothing filed (their on-screen callsigns differ from their ids) */
export const BOLT = 'yeti', MARLIN = 'cards', OTTER = 'wrangler', PIXEL = 'badger', ACE = 'dj'
export const NAME = { yeti: 'Bolt', cards: 'Marlin', wrangler: 'Otter', badger: 'Pixel', dj: 'Ace', bane: 'Ranger', ipman: 'Jester', krait: 'Kraken', romeo: 'Rebel', vinci: 'Zenith' }
export const ISO = { 13: '2026-07-13', 14: '2026-07-14', 15: '2026-07-15', 16: '2026-07-16', 17: '2026-07-17', 18: '2026-07-18', 19: '2026-07-19' }
export const NF = 'SANS: no availability filed for today. Planned on '
export const CHECK = 'SANS availability — not filed, or planned outside it'
export const LEGEND = 'advisory — shift, ground or SANS availability'
const t = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
export const norm = t

/* ---- Edit Schedule's (#eWeek) or View-only Sched's (#vWeek) list of one day: its bar and every line, as painted ---- */
export async function dayList(p, W, surf, di, open = true) {
  const pg = surf === '#vWeek' ? 'viewsched' : 'editsched'
  if (await p.locator('#schedBoard').count()) await L.closeBoard(p, W)
  if ((await p.evaluate(() => window.CURPAGE)) !== pg) await L.go(p, pg)
  const d = p.locator(`${surf} .day[data-day="${di}"]`).first()
  if (!(await d.count())) return { none: 'no such day on ' + surf }
  await d.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(300)
  if (open) {
    const st = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
    if (st === false) { await W.press(p, `${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`, 'daywarn-' + di); await sleep(350) }
  }
  return readDay(p, surf, di)
}
export const readDay = (p, surf, di) => p.evaluate(([s, i]) => {
  const t = x => (x ? x.textContent || '' : '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  const day = document.querySelector(`${s} .day[data-day="${i}"]`); if (!day) return { none: 'no such day' }
  const box = day.querySelector(`[data-dwbox="${i}"]`)
  if (!box) return { bar: '(no bar)', barCls: '', lines: [], open: null, clean: t(day.querySelector('.dayok, .dwok, .okbar')) }
  const bar = box.querySelector('.daywarn')
  const vw = innerWidth
  const lines = [...box.querySelectorAll('.witem')].filter(e => e.getBoundingClientRect().width > 0).map(e => {
    const x = e.querySelector('.wtx') || e.children[1] || e, cs = getComputedStyle(x), b = e.querySelector('button')
    const r = e.getBoundingClientRect(), xr = x.getBoundingClientRect()
    let top = null
    if (b) { const q = b.getBoundingClientRect(); const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); top = !!hit && (hit === b || b.contains(hit)); if (!(q.width > 0 && q.top >= 0 && q.bottom <= innerHeight)) top = 'off-screen'; if (q.right > vw + 0.5) top = 'past the screen edge' }
    return { ix: e.dataset.wix != null ? +e.dataset.wix : null, sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), color: cs.color,
      btn: b ? t(b) : '', btnTop: top, sig: t(e.querySelector('.wcode')), text: t(x).replace(t(e.querySelector('.wcode')), '').trim(), all: t(e), html: e.outerHTML.slice(0, 600), cut: x.scrollWidth > x.clientWidth + 1 && cs.textOverflow !== 'clip' ? 'scrolls/cut' : '', wraps: Math.round(xr.height) > 22 ? 'wraps' : 'one line', inScreen: r.left >= -0.5 && r.right <= vw + 0.5 }
  })
  const heads = [...box.querySelectorAll('.wgh, .wgroup-h, .wsec, .wcat, h4, h5')].filter(e => e.getBoundingClientRect().width > 0).map(t)
  return { bar: t(bar), barCls: bar ? bar.className : '', open: box.classList.contains('open'), lines, heads, other: [...box.querySelectorAll('.dwlist > :not(.witem)')].filter(e => e.getBoundingClientRect().width > 0).map(t).slice(0, 8) }
}, [surf, di])
/* a line's ✕ / ↺ on Edit Schedule's list, by its index */
export async function dayLineBtn(p, W, surf, di, ix, label = 'woff') {
  const b = p.locator(`${surf} .day[data-day="${di}"] [data-woff="${di}.${ix}"]`).first()
  if (!(await b.count())) return 'no button on that line'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await W.press(p, b, label); await sleep(400)
  return 'pressed'
}

/* ---- the Scheduler Board's issues panel (#sbWarn) of the open board's day ---- */
export async function boardList(p, W, di) {
  await L.openBoard(p, W, di)
  const folded = await p.evaluate(() => { const r = document.querySelector('#schedBoard .sb-warn .wln[data-wix]'); return r ? r.getBoundingClientRect().height === 0 || getComputedStyle(r).display === 'none' : false })
  if (folded && await p.locator('#schedBoard [data-sbwtog]').count()) { await W.press(p, '#schedBoard [data-sbwtog]', 'sbw-open'); await sleep(350) }
  return readBoard(p)
}
export const readBoard = p => p.evaluate(() => {
  const t = x => (x ? x.textContent || '' : '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  const w = document.querySelector('#schedBoard .sb-warn'); if (!w) return { none: 'no board panel' }
  const h = w.querySelector('.wh'), vw = innerWidth
  return { head: t(h), headCls: h ? h.className : '',
    lines: [...w.querySelectorAll('.wln[data-wix]')].map(e => {
      const x = e.querySelector('.wln-t') || e, b = e.querySelector('button'), cs = getComputedStyle(x), r = e.getBoundingClientRect()
      let top = null
      if (b) { const q = b.getBoundingClientRect(); const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); top = !!hit && (hit === b || b.contains(hit)); if (!(q.width > 0)) top = 'not drawn'; if (q.right > vw + 0.5) top = 'past the screen edge' }
      return { ix: +e.dataset.wix, sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), shown: r.height > 0 && getComputedStyle(e).display !== 'none', btn: b ? t(b) : '', btnTop: top, text: t(x), wraps: x.getBoundingClientRect().height > 22 ? 'wraps' : 'one line', inScreen: r.left >= -0.5 && r.right <= vw + 0.5 }
    }),
    other: [...w.querySelectorAll('.wln:not([data-wix]), .wmuted-h')].map(t) }
})
export async function boardLineBtn(p, W, di, ix, label = 'sb-woff') {
  await L.openBoard(p, W, di)
  const b = p.locator(`#schedBoard [data-woff="${di}.${ix}"]`).first()
  if (!(await b.count())) return 'no button on that line'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await W.press(p, b, label); await sleep(400)
  return 'pressed'
}

/* ---- the day's ⓘ popup (#dayPop) on Edit Schedule or View-only Sched; left OPEN for the picture, closed by infoClose ---- */
export async function dayInfo(p, W, surf, di) {
  const pg = surf === '#vWeek' ? 'viewsched' : 'editsched'
  if (await p.locator('#schedBoard').count()) await L.closeBoard(p, W)
  if ((await p.evaluate(() => window.CURPAGE)) !== pg) await L.go(p, pg)
  const b = p.locator(`${surf} .day[data-day="${di}"] [data-dayinfo="${di}"]`).first()
  if (!(await b.count())) return { none: 'no ⓘ on that day' }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  await W.press(p, b, 'dayinfo-' + di); await sleep(500)
  return p.evaluate(() => {
    const t = x => (x ? x.textContent || '' : '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
    const m = document.querySelector('#dayPop'); if (!m || !m.getBoundingClientRect().width) return { none: 'the popup did not open' }
    const vw = innerWidth
    return { title: t(m.querySelector('#dayPopTitle')), stat: t(m.querySelector('.dip-stat')), sev: t(m.querySelector('.dip-sev')), heads: [...m.querySelectorAll('.dip-h')].map(t),
      lines: [...m.querySelectorAll('.dip-list .witem, .dip-list li')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const x = e.querySelector('.wtx') || e; const cs = getComputedStyle(x); const r = e.getBoundingClientRect(); return { sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), btn: t(e.querySelector('button')), sig: t(e.querySelector('.wcode')), text: t(x).replace(t(e.querySelector('.wcode')), '').replace(/^(Advisory|Warning|Note|Conflict) · /, '').trim(), all: t(e), html: e.outerHTML.slice(0, 600), inScreen: r.left >= -0.5 && r.right <= vw + 0.5 } }),
      all: t(m).slice(0, 1500) }
  })
}
export async function infoClose(p, W) {
  const c = p.locator('#dayPopDone:visible, #dayPopClose:visible').first()
  if (await c.count()) { await W.press(p, c, 'daypop-close'); await sleep(350) } else { await p.keyboard.press('Escape'); await sleep(300) }
  return !(await p.locator('#dayPop:visible').count())
}

/* ---- every visible puck of a man under `scope`: where, the warning classes, the small letter chip(s) ---- */
export const pucksOf = (p, scope, id) => p.evaluate(([s, who]) => {
  const t = x => (x ? x.textContent || '' : '').replace(/\s+/g, ' ').trim()
  return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => {
    const z = e.closest('[data-slot],[data-fill]')
    const where = e.closest('.rpuck') || e.closest('.sb-ros') ? 'crew list' : e.closest('.availwin') ? 'ALL AVAIL window' : e.closest('.rsans, .sanscards, .sansav') ? 'SANS card' : z ? (z.dataset.slot || z.dataset.fill) : (e.closest('[class]') || e).parentElement.className.split(' ')[0]
    const cs = getComputedStyle(e)
    return { where, warn: e.classList.contains('warn'), sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', chips: [...e.querySelectorAll('.lchip')].map(t), lit: /(^|\s)(hl|lit|focus|jump|pulse|flash)/.test(e.className), dim: /(^|\s)(dim|faded)/.test(e.className), cls: e.className, ring: cs.boxShadow === 'none' ? (cs.outlineStyle !== 'none' ? cs.outlineColor : 'none') : cs.boxShadow.slice(0, 60), title: (e.getAttribute('title') || '').slice(0, 160) }
  })
}, [scope, id])
export const puckSay = ps => ps.length ? ps.map(x => `${x.where}${x.sev ? ' ' + x.sev.toUpperCase() : ''}${x.chips.length ? ' chip[' + x.chips.join(',') + ']' : ' no chip'}`).join(' · ') : 'no puck drawn'

/* a clip round an element (scrolled into view first) */
export async function clipOf(p, W, sel, tag, pad = 16) {
  const l = typeof sel === 'string' ? p.locator(sel).first() : sel
  if (!(await l.count())) return ''
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {}); await sleep(200)
  return W5.clip(p, W, l, tag, pad)
}

/* the SANS lines in a read list */
export const sansOf = lines => (lines || []).filter(x => /SANS/.test(x.text))
export const lineSay = l => l ? `${l.sig ? '{' + l.sig + '} ' : ''}"${l.text}"${l.sev ? ' [' + l.sev + ']' : ''}${l.struck ? ' STRUCK' : ''}${l.hid ? ' hid' : ''}${l.btn ? ' btn ' + l.btn : ''}${l.btnTop === false ? ' (button COVERED)' : l.btnTop && l.btnTop !== true ? ' (button ' + l.btnTop + ')' : ''}${l.wraps ? ' ' + l.wraps : ''}${l.inScreen === false ? ' OUT OF SCREEN' : ''}` : 'none'
export const listSay = r => r.none ? r.none : `bar "${r.bar || r.head || r.stat}" · ${r.lines.length} line(s): ${r.lines.map(lineSay).join(' | ')}`

/* the four places' SANS lines for one man on one day, read in turn; pictures of each (left in place for the picture) */
export async function allPlaces(p, W, di, name, tag) {
  const out = {}, pics = []
  out.board = await boardList(p, W, di); pics.push(await clipOf(p, W, '#schedBoard .sb-warn', tag + '-board', 12))
  await L.closeBoard(p, W)
  out.es = await dayList(p, W, '#eWeek', di); pics.push(await clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-es', 12))
  out.info = await dayInfo(p, W, '#eWeek', di); pics.push(await clipOf(p, W, '#dayPop', tag + '-info', 8))
  await infoClose(p, W)
  out.view = await dayList(p, W, '#vWeek', di); pics.push(await clipOf(p, W, `#vWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-view', 12))
  await L.go(p, 'editsched')
  const mine = r => (r.lines || []).filter(x => x.text.includes(name) && /SANS/.test(x.text)).map(x => x.text)
  out.his = { board: mine(out.board), es: mine(out.es), info: mine(out.info), view: mine(out.view) }
  out.counts = { board: out.board.head, es: out.es.bar, info: out.info.stat || out.info.sev, view: out.view.bar }
  /* the check's name over each SANS line, where a place shows one (the board's panel shows none) */
  out.sigs = [...(out.es.lines || []), ...(out.view.lines || []), ...(out.info.lines || [])].filter(x => /SANS/.test(x.text)).map(x => x.sig.replace(/^(Advisory|Warning|Note) · /, ''))
  /* the number of lines each place draws (not struck) — the day's count must agree */
  out.n = { board: (out.board.lines || []).filter(x => !x.hid && x.shown !== false).length, es: (out.es.lines || []).filter(x => !x.hid).length, info: (out.info.lines || []).filter(x => !x.hid).length, view: (out.view.lines || []).filter(x => !x.hid).length }
  return { ...out, pics: pics.filter(Boolean) }
}
export const allSay = a => `board ${listSay(a.board)} || ES ${listSay(a.es)} || ⓘ ${a.info.none || `"${a.info.stat}" ${a.info.lines.length} line(s): ${a.info.lines.map(lineSay).join(' | ')}`} || view ${listSay(a.view)}`
/* do the four places name exactly these words for him (each list holds `want`, once per entry of want) */
export function agree(a, want) {
  if (!want) return { ok: true, each: {} }
  const w = [...want].sort().join('¦')
  const each = Object.fromEntries(Object.entries(a.his).map(([k, v]) => [k, [...v].sort().join('¦') === w]))
  return { ok: Object.values(each).every(Boolean), each }
}

/* the first number in a count bar ("⚠ 4 issues · 1 warning" → 4; "No conflicts…" → 0) */
export const nOf = s => { const m = /(\d+) issues?/.exec(s || ''); return m ? +m[1] : /No (conflicts|issues)|✓/.test(s || '') ? 0 : null }
/* the four places agree with one another and with the day's count */
export function counted(a) {
  /* a day with nothing flagged draws no bar on Edit Schedule or View-only Sched (run NEG-d, Fri 17): that is a count of 0 */
  const z = (s, n) => { const v = nOf(s); return v == null && s === '(no bar)' && n === 0 ? 0 : v }
  const nb = z(a.board.head, a.n.board), ne = z(a.es.bar, a.n.es), nv = z(a.view.bar, a.n.view)
  const ok = a.n.board === a.n.es && a.n.es === a.n.info && a.n.info === a.n.view && nb === a.n.board && ne === a.n.es && nv === a.n.view
  return { ok, say: `lines drawn board ${a.n.board} / ES ${a.n.es} / ⓘ ${a.n.info} / view ${a.n.view}; counts board ${nb} / ES ${ne} / view ${nv}` }
}
/* N7 / lesson 33: no line tells anyone to file */
export const tellsToFile = s => /file it|needs? to file|please file|must file|should file|file (his|their|your) /i.test(s || '')

/* a place on the open board armed and a man pressed (tap-to-plan); the note(s) the press raised, where he landed */
export async function place(p, W, di, key, id, tag) {
  const sel = key.endsWith('.+') ? `[data-fill="${key}"]` : `[data-slot="${key}"]`
  const r = await armAt(p, W, di, sel, tag)
  if (!r.armed) return { armed: null, placed: false, seen: [], note: '', c: r.c, pic: '' }
  const pk = await pickNow(p, W, id, tag)
  await W5.boardDrawer(p, W, false)
  /* a duty desk's place (d:di.bi.ri.+) is read from the duty rows (holdsAt reads seats and sims only) */
  const h = key.startsWith('d:') ? await p.evaluate(k => { const [di, bi, ri] = k.slice(2).split('.'); const r = ((window.DAYS[+di].dutywaves || [])[+bi] || { rows: [] }).rows[+ri]; return r ? r.id || '' : 'no row' }, key) : await holdsAt(p, r.armed.replace(/\.x\d+$/, '.+'))
  return { ...pk, armed: r.armed, c: r.c, retry: r.retry, holds: h, placed: String(h).includes(id), pic: pk.notePic }
}
/* a place reached by a real mouse drag of his crew-list name (desktop only); the notes raised */
export async function dragIn(p, W, di, key, id, tag) {
  await L.openBoard(p, W, di)
  await W5.boardDrawer(p, W, true)
  await noteWatch(p)
  const src = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first()
  const dst = p.locator(L.B(key.endsWith('.+') ? `[data-fill="${key}"]` : `[data-slot="${key}"]`)).first()
  const d = await dragPath(p, W, src, [dst], tag)
  const seen = await notesSeen(p)
  const h = await holdsAt(p, key)
  return { ...d, stops: d.seen, seen, holds: h, placed: String(h).includes(id), pic: d.npic }
}
/* a sim row's box or a line's box typed ('' clears it), read back */
export async function setBox(p, W, di, bfld, v) {
  await L.openBoard(p, W, di)
  const el = p.locator(L.B(`[data-bfld="${bfld}"]`)).first()
  if (!(await el.count())) return 'NO BOX ' + bfld
  await el.scrollIntoViewIfNeeded()
  if (W.isPhone) await el.tap(); else await el.click()
  await sleep(150)
  await p.keyboard.press('Control+A').catch(() => {})
  await el.fill('')
  if (v) await el.type(String(v), { delay: 10 })
  await p.keyboard.press('Enter').catch(() => {})
  await el.evaluate(e => e.blur()).catch(() => {})
  await sleep(400)
  return el.inputValue().catch(() => '?')
}
export const lineOf = (p, di, wi) => p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { cs: x.cs || '', msn: x.msn || '', to: x.to || '', ld: x.ld || '' } }, [di, wi])

/* Saber's filing opened from its SANS day, its ticks and hours changed, saved; the refusal words if it would not save */
export async function editFiling(p, W, iso, iid, kinds, span, tag) {
  await W5.sansDay(p, W, iso)
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`).first()
  if (!(await row.count())) return { ok: false, why: 'no such line on the day', pic: await W.pic(p, tag + '-noline') }
  await W.press(p, row, 'sd-open')
  await p.waitForSelector('#inpEditPop', { timeout: 5000 })
  await setTicks(p, W, kinds)
  if (Array.isArray(span)) {
    await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
    await p.fill('#inpEditStart', span[0]); await p.fill('#inpEditEnd', span[1])
  } else if (span === 'all' && await p.locator('#inpEditSpan [data-span="all"]').count()) await W.press(p, '#inpEditSpan [data-span="all"]', 'span-all')
  const form = await formRead(p)
  const pic0 = await W.pic(p, tag + '-form')
  const save = p.locator('#inpEditSave').first()
  const dis = await save.isDisabled().catch(() => null)
  if (!dis) { await W.press(p, '#inpEditSave:visible', 'save'); await sleep(700) }
  const stayed = !!(await p.locator('#inpEditPop:visible').count())
  const toast = await L.toastSaid(p)
  const words = stayed ? norm(await p.evaluate(() => { const w = document.querySelector('#inpEditPop'); return [...w.querySelectorAll('[role="alert"], .inped-err, .inped-bad, .note.warn, .err, .why, [class*="err"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent).join(' | ') })) : ''
  const pic = await W.pic(p, tag + '-after')
  if (stayed) {
    if (await p.locator('#inpEditCancel:visible').count()) await W.press(p, '#inpEditCancel:visible', 'cancel'); else await p.keyboard.press('Escape')
    await sleep(300); const g = p.locator('[data-testid="inped-escask-go"]:visible, button:has-text("Discard"):visible').first(); if (await g.count()) await W.press(p, g, 'discard')
  }
  await W5.closeSansWin(p, W)
  const rec = await p.evaluate(i => { const r = (window.INPUTS || []).find(x => x.iid === i); return r ? { sans: r.sans, allday: r.allday, s: r.s, e: r.e } : null }, iid)
  return { ok: !stayed, saveDisabled: dis, stayed, toast, words, form, rec, pic: pic0 + ', ' + pic }
}
export async function setTicks(p, W, kinds) {
  for (const k of ['fly', 'oft', 'amt']) {
    const label = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }[k]
    const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
  }
}
/* the SANS form's event boxes in the order drawn, each ticked or not; the Save button's state */
export const formRead = p => p.evaluate(() => {
  const t = x => (x ? x.textContent || '' : '').replace(/\s+/g, ' ').trim()
  const s = document.querySelector('#inpEditSans')
  const labels = s ? [...s.querySelectorAll('label')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const i = e.querySelector('input'); return t(e) + (i && i.checked ? ' ☑' : ' ☐') }) : []
  const sv = document.querySelector('#inpEditSave')
  return { labels, save: sv ? (sv.disabled ? 'Save greyed' : 'Save live') + (sv.title ? ' "' + sv.title + '"' : '') : 'no Save', hint: s ? t(s.parentElement).slice(0, 200) : '' }
})
/* a new filing's form opened and its ticks set, read, then Save pressed (or not, if greyed); for F9 */
export async function tryEmpty(p, W, iso, id, tag) {
  await W5.sansDay(p, W, iso)
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 5000 })
  await p.selectOption('#inpEditPerson', id).catch(() => {}); await sleep(200)
  await setTicks(p, W, [])
  const form = await formRead(p)
  const pic0 = await W.pic(p, tag + '-form')
  const dis = await p.locator('#inpEditSave').first().isDisabled().catch(() => null)
  if (!dis) { await W.press(p, '#inpEditSave:visible', 'save'); await sleep(700) }
  const stayed = !!(await p.locator('#inpEditPop:visible').count())
  const words = stayed ? norm(await p.evaluate(() => { const w = document.querySelector('#inpEditPop'); return [...w.querySelectorAll('[role="alert"], .inped-err, .inped-bad, .note.warn, .err, .why, [class*="err"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent).join(' | ') })) : ''
  const toast = await L.toastSaid(p)
  const pic = await W.pic(p, tag + '-after')
  const made = (await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))).filter(x => !before.includes(x))
  if (stayed) { await p.keyboard.press('Escape'); await sleep(300); const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard') }
  await W5.closeSansWin(p, W)
  return { saveDisabled: dis, stayed, words, toast, made, form, pic: pic0 + ', ' + pic }
}

/* what a press lights: the man's pucks focused (wfoc), others dimmed, the note under the list */
export const lit = p => p.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const ps = [...document.querySelectorAll('.puck')].filter(vis)
  const foc = ps.filter(e => /\bwfoc\b/.test(e.className)).map(e => { const z = e.closest('[data-slot],[data-fill]'); return e.dataset.person + '@' + (e.closest('.rpuck,.sb-ros') ? 'crew' : z ? (z.dataset.slot || z.dataset.fill) : 'card') + (/\becho\b/.test(e.className) ? '(echo)' : '') })
  return { focused: foc.sort(), dimmed: ps.filter(e => /\bdim\b/.test(e.className)).length, total: ps.length }
})

/* results written to the raw folder */
export function saveRaw(name) { writeFileSync(path.join(RAW, `results-${name}.json`), JSON.stringify(L.results, null, 1)) }
