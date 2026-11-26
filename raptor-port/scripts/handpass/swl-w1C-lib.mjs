// swl-w1C-lib — walker C's helpers for the warning list's SANS lines walk (his D2579, D2584 Q3 / 2a / 3b, D2583), chat 203,
// 26 Nov 26. Built on chat 182's walker-A library (sss-w1A-lib, and under it the c174 recipes' helpers) — imported, never
// edited; their folders set by swl-w1C-env first (||=). window.* is only READ here (and window.go, the recipes' own page
// switch). Every staging step is the app's own controls; each borrowed helper's first step was proved on this build by
// swl-w1C-probe / -probe2.
import './swl-w1C-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
export const X = await import('./sss-w1A-lib.mjs')
export const { A, Z, T, L, W5, RANGER, D, sleep, J, addLine, crewAll, who, say1, sayAll, noteWatch, notesSeen, need, run, NW,
  commit, noteFits, addSimRow, armAt, pickNow, holdsAt, sbUndo, sbRedo, disarmPick } = X
export const OUT = L.OUT
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
export const NAME = { bane: 'Ranger', yeti: 'Bolt', cards: 'Marlin', wrangler: 'Otter', badger: 'Pixel', ipman: 'Jester', krait: 'Kraken', romeo: 'Rebel', vinci: 'Zenith', waldo: 'Scribe', nick: 'Tally', bullet: 'Zulu', dj: 'Ace' }
export const ISO = { 13: '2026-07-13', 14: '2026-07-14', 15: '2026-07-15', 16: '2026-07-16', 17: '2026-07-17', 18: '2026-07-18', 19: '2026-07-19', 20: '2026-07-20' }
export const NOFILE = 'SANS: no availability filed for today. Planned on '
export const noFile = (name, tail) => `${name} — ${NOFILE}${tail}`
export const offered = (name, what, tail) => `${name} — SANS: offered ${what} only today. Planned on ${tail}`
export const hours = (name, a, b, tail) => `${name} — SANS: available ${a}–${b} only. Planned on ${tail}`
/* a warning-list row's words as drawn, the ✕ / reset glyph at its end left off */
export const clean = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').replace(/\s*[✕↺↻⟲]\s*$/u, '').trim()

/* the day's warning list on the Scheduler Board (opened on that day): heading, every row, the SANS rows, the named man's
   rows, a picture cut to the list; on the phone the list's fold is opened first (Z.warns) */
export async function wl(p, W, di, tag, name = '') {
  const w = await Z.warns(p, W, di, tag)
  const rows = w.rows.map(clean)
  const hid = await p.evaluate(() => [...document.querySelectorAll('#sbWarn .wln.hid')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()))
  const sp = tag && rows.some(r => /SANS/.test(r) || (name && r.startsWith(name + ' '))) ? await rowsPic(p, W, tag, name) : ''
  return { head: w.head, rows, sans: rows.filter(r => /SANS/.test(r)), his: name ? rows.filter(r => r.startsWith(name + ' ')) : [], hid, pic: [w.pic, sp].filter(Boolean).join(', ') }
}
/* a picture cut round the list's SANS rows (and the named man's rows), each brought into view first — the list is taller
   than the screen on a busy day, and its own clip shows only the top (walk-scripts §5) */
/* the rows pictured: the SANS rows where there are any, else the named man's (run F19-d: his conflict rows at the top of a
   list that scrolls inside its own panel pushed the SANS rows out of the picture) */
export async function rowsPic(p, W, tag, name = '') {
  const first = await p.evaluate(name => { const all = [...document.querySelectorAll('#sbWarn .wln')]; const s = all.filter(e => /SANS/.test(e.textContent || '')); const r = s.length ? s : all.filter(e => name && (e.textContent || '').trim().startsWith(name + ' ')); if (!r.length) return false; r[0].scrollIntoView({ block: 'center' }); return true }, name)
  if (!first) return ''
  await sleep(250)
  const box = await p.evaluate(name => {
    const all = [...document.querySelectorAll('#sbWarn .wln')]; const s = all.filter(e => /SANS/.test(e.textContent || ''))
    const r = (s.length ? s : all.filter(e => name && (e.textContent || '').trim().startsWith(name + ' '))).map(e => e.getBoundingClientRect()).filter(b => b.bottom > 0 && b.top < innerHeight)
    if (!r.length) return null
    const x0 = Math.min(...r.map(b => b.left)), x1 = Math.max(...r.map(b => b.right)), y0 = Math.min(...r.map(b => b.top)), y1 = Math.max(...r.map(b => b.bottom))
    return { x: Math.max(0, x0 - 16), y: Math.max(0, y0 - 24), width: Math.min(innerWidth, x1 + 16) - Math.max(0, x0 - 16), height: Math.min(innerHeight, y1 + 24) - Math.max(0, y0 - 24) }
  }, name)
  if (!box || box.width < 4 || box.height < 4) return ''
  const f = path.join(OUT, `${W.scn}-${tag}-sansrows-${W.sz.name}.png`)
  await p.screenshot({ path: f, clip: box })
  return path.basename(f)
}
export const wSay = w => `head "${w.head}" · ${w.rows.length} row(s) · SANS rows: ${w.sans.join(' | ') || 'none'}${w.hid.length ? ' · hidden: ' + w.hid.join(' | ') : ''}`
/* the number at the head ("⚠ 5 issues · 2 warnings" → 5; "No conflicts flagged" → 0) */
export const headN = h => { const m = /(\d+)\s+issue/.exec(h || ''); return m ? +m[1] : (/No conflicts|No issues/.test(h || '') ? 0 : NaN) }

/* a man's seated pucks on the open board (not the crew list): where, amber / red, the small letter chips (sss-w1B-lib's
   `seated`, copied) */
export const seated = (p, id) => p.evaluate(id => {
  const R = document.querySelector('#schedBoard'); if (!R) return []
  return [...R.querySelectorAll(`.puck[data-person="${id}"]`)].filter(e => !e.closest('.rpuck') && !e.closest('.sb-ros') && !e.closest('.availwin') && e.getBoundingClientRect().width > 0).map(e => {
    const s = e.closest('[data-slot],[data-fill]')
    return { at: s ? (s.dataset.slot || s.dataset.fill) : '?', cls: String(e.className), chips: [...e.querySelectorAll('.lchip')].map(c => (c.textContent || '').trim()), ring: getComputedStyle(e).boxShadow.slice(0, 80) }
  })
}, id)
export const seatSay = s => s.length ? s.map(x => `${x.at} [${x.cls.replace(/\bpuck\b/, '').trim()}]${x.chips.length ? ' chips[' + x.chips.join(',') + ']' : ' no chip'}`).join(' · ') : 'no seated puck'
export const hasA = s => s.some(x => x.chips.includes('A'))
/* a picture cut round the man's first seated puck on the open board */
export async function puckPic(p, W, id, tag) {
  const l = p.locator(`#schedBoard [data-slot] .puck[data-person="${id}"]:visible, #schedBoard [data-fill] .puck[data-person="${id}"]:visible`).first()
  if (!(await l.count())) return ''
  await l.scrollIntoViewIfNeeded().catch(() => {})
  return W5.clip(p, W, l, tag + '-puck', 40)
}
/* one man on one day: the list, his rows, his pucks (picture of each), in one read */
export async function look(p, W, di, id, tag) {
  const w = await wl(p, W, di, tag, NAME[id] || id)
  const s = await seated(p, id)
  const pp = await puckPic(p, W, id, tag)
  return { w, s, pic: [w.pic, pp].filter(Boolean).join(', ') }
}
export const lookSay = (l, name) => `${wSay(l.w)} · ${name}'s rows: ${l.w.his.join(' | ') || 'none'} · his pucks: ${seatSay(l.s)}`

/* place a man by tap: arm the place, press his crew-list name; the note, where he landed (sss-r1's placeTap, copied) */
export async function tapIn(p, W, di, key, id, tag) {
  const sel = /\+$/.test(key) ? `[data-fill="${key}"]` : `[data-slot="${key}"]`
  const r = await armAt(p, W, di, sel, tag)
  if (!r.armed) return { armed: null, placed: 'not armed', seen: [], note: '', c: r.c }
  const pk = await pickNow(p, W, id, tag)
  await W5.boardDrawer(p, W, false)
  return { ...pk, armed: r.armed, c: r.c, placed: await holdsAt(p, key) }
}
export const placedOk = (pk, id) => String(pk.placed || '').includes(id)
/* a timed or untimed flying line on the open board of day di (+ Wave → Flying wave), its name and times typed */
export async function flight(p, W, di, cs, to = '', ld = '') {
  const a = await addLine(p, W, di, { cs, to, ld })
  return { ...a, F: `${di}.${a.wi}.0.0.p`, R: `${di}.${a.wi}.0.0.w` }
}
/* the day bars on Edit Schedule's week: words and colour class of each day's "⚠ N issues" bar */
export async function weekBars(p, W, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const b = await p.evaluate(() => [0, 1, 2, 3, 4, 5, 6].map(di => {
    const sec = document.querySelector(`#eWeek section.day[data-day="${di}"]`) || document.querySelector(`#eWeek [data-day="${di}"]`)
    const e = (sec && sec.querySelector('.daywarn')) || document.querySelector(`#eWeek [data-daywarn="${di}"]`)
    return e ? `${di}:${(e.textContent || '').replace(/\s+/g, ' ').trim().replace(/[▼▲▸▾]/g, '').trim()} [${String(e.className).replace('daywarn', '').trim()}]` : `${di}:no bar`
  }))
  return { b, pic: tag ? await W.pic(p, tag + '-week') : '' }
}
/* the ⓘ popup of day di on Edit Schedule's week: opened by its own button, its words read, pictured; closed by Escape */
export async function infoPop(p, W, di, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const b = p.locator(`#eWeek [data-dayinfo="${di}"]:visible`).first()
  if (!(await b.count())) return { ok: false, words: 'no ⓘ button', pic: '' }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  await W.press(p, b, 'dinfo-' + di); await sleep(600)
  const words = await p.evaluate(() => {
    /* run PU-d: the popup is the smallest drawn box holding "Issues on this day" (its class is not a dialog's) */
    const c = [...document.querySelectorAll('div, section, aside')].filter(e => e.getBoundingClientRect().width > 200 && /issues on this day/i.test(e.innerText || '') && /tasking/i.test(e.innerText || ''))
    c.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)
    return c[0] ? (c[0].innerText || '').replace(/\s+\n/g, '\n').split('\n').map(s => s.trim()).filter(Boolean) : []
  })
  const pic = await W.pic(p, tag + '-info')
  return { ok: words.length > 0, words, pic }
}
/* the popup's own Close button (run PU-d's picture shows one); returns whether the popup is gone */
export async function infoClose(p, W) {
  const c = p.getByRole('button', { name: 'Close', exact: true }).locator('visible=true').first()
  if (await c.count()) await W.press(p, c, 'dinfo-close'); else await p.keyboard.press('Escape')
  await sleep(500)
  return p.evaluate(() => ![...document.querySelectorAll('div, section, aside')].some(e => e.getBoundingClientRect().width > 200 && /issues on this day/i.test(e.innerText || '') && /tasking/i.test(e.innerText || '')))
}
/* a filing for someone made by Saber on the SANS tab (W5.commit), the day window then closed */
export async function fileFor(p, W, iso, id, kinds, span, tag) {
  const f = await commit(p, W, iso, id, kinds, span, tag)
  await W5.closeSansWin(p, W)
  return f
}
/* a warning-list row hidden (its ✕) or flagged again (the same place's reset), by the man's name and some words in it */
export async function hideRow(p, W, di, name, has, tag) {
  await Z.warns(p, W, di, '')
  const k = await p.evaluate(([name, has]) => { const e = [...document.querySelectorAll('#sbWarn .wln[data-wix]')].find(x => { const t = (x.textContent || '').replace(/\s+/g, ' '); return t.startsWith(name + ' ') && t.includes(has) }); return e ? { wdi: e.dataset.wdi, wix: e.dataset.wix, hid: e.classList.contains('hid') } : null }, [name, has])
  if (!k) return { ok: false, why: 'no such row' }
  const b = p.locator(`#sbWarn [data-woff="${k.wdi}.${k.wix}"]:visible`).first()
  if (!(await b.count())) return { ok: false, why: 'no ✕ / reset on the row', k }
  await W.press(p, b, 'woff'); await sleep(500)
  const after = await p.evaluate(([wdi, wix]) => { const e = document.querySelector(`#sbWarn .wln[data-wdi="${wdi}"][data-wix="${wix}"]`); return e ? e.classList.contains('hid') : 'row gone' }, [k.wdi, k.wix])
  return { ok: true, was: k.hid, now: after, pic: await W5.clip(p, W, '#sbWarn', tag + '-hide', 20) }
}
/* the day's Available crew panel line on Edit Schedule (sfd-w1-lib's availCount) */
export const avail = (p, W, di, tag) => (L.closeBoard(p, W), A.S.availCount(p, W, di, tag))
/* the SANS calendar's cell of a day: need / F / O / A figures (sah-w10-lib's sansRead) */
export async function sansCell(p, W, iso, tag) {
  const r = await T.sansRead(p, W, iso, tag)
  await T.closeAll(p, W)
  return { line: T.cellLine(r.cell) + ' · ' + T.rowsLine(r.day), pic: r.pic, r }
}

export function saveRaw(name) {
  const dir = 'D:/raptor-work/c203-walk/C'
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, `results-${name}.json`), JSON.stringify(L.results, null, 1))
}
