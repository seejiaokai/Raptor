// scc-w1B-lib — walker B's helpers for the crew list's SANS words and F / O / A column (his D2584 Q2, D2581, D2582,
// D2750, D2751), chat 207, 27 Nov 26. Built on swl-w1B-lib (chat 203's helpers, and through it the w14 / sah / sud / asp
// recipes), imported, never edited. Every staging step is the app's own controls; window.* is only READ (and window.go,
// the recipes' own page switch). Pictures: none unless asked for — the case's deciding crop only (the brief's "keep
// pictures to what decides a case"), each phone press able to take the picture right after it.
import './scc-w1B-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
export const Z = await import('./swl-w1B-lib.mjs')
export const { T, L, W5, A, X, RANGER, J, sleep, postR, asR, asS, noteWatch, notesSeen, noteBox } = Z
export const OUT = L.OUT
export { path }
export const ID = { Bolt: 'yeti', Rebel: 'romeo', Jester: 'ipman', Kraken: 'krait', Zenith: 'vinci', Marlin: 'cards', Otter: 'wrangler', Pixel: 'badger', Ranger: 'bane' }
export const FRI = '2026-07-17', SAT = '2026-07-18', SUN = '2026-07-19'
export const WK = '2026-07-13'
export const R17N = 'SANS from Fri 17 Jul: no availability filed'
export const clean = s => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const p2 = n => String(n).padStart(2, '0')

/* the walker's press with no picture of its own (the shared one pictures every phone tap); `now` takes the one right
   after the press, on the phone, into OUT/now */
export function quiet(W) {
  let n = 0
  W.press = async (p, loc, label = 'press', now = false) => {
    const l = typeof loc === 'string' ? p.locator(loc).first() : loc
    await l.waitFor({ state: 'visible', timeout: 8000 })
    await l.scrollIntoViewIfNeeded().catch(() => {})
    if (W.isPhone) { await l.tap({ timeout: 5000 }); if (now) await nowPic(p, W, label + '-' + p2(++n)) } else await l.click({ timeout: 5000 })
    await sleep(350)
  }
  return W
}
export async function nowPic(p, W, tag) {
  mkdirSync(path.join(OUT, 'now'), { recursive: true })
  const f = path.join(OUT, 'now', `${W.scn}-${tag}-now-${W.sz.name}.png`)
  await sleep(60); await p.screenshot({ path: f }).catch(() => {})
  return path.relative(OUT, f).replace(/\\/g, '/')
}

/* the board of day di opened from Edit Schedule (asp-w2 openBoard, without its tap picture) */
export async function openB(p, W, di) {
  if (await p.locator('#schedBoard').count()) {
    if ((await p.evaluate(() => window.SBDAY)) === di) return
    await L.closeBoard(p, W)
  }
  await L.go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  if (W.isPhone) await d.tap(); else await d.click()
  await p.waitForSelector('#schedBoard'); await sleep(800)
}
export const closeB = (p, W) => L.closeBoard(p, W)

/* Saber (or the signed-in man, who = null) files on the SANS tab — sah-w10 file, without its pictures: the day's
   window, "+ Commitment", the man, the events, the hours (or a half: 'AM' / 'PM'), a remark */
export async function fileS(p, W, iso, who, kinds, span, o = {}) {
  await T.closeAll(p, W)
  await W5.sansDay(p, W, iso)
  const add = p.locator('[data-testid="win-sansday"] [data-testid="sd-add"]').first()
  if (await add.isDisabled().catch(() => true)) return { iid: null, refused: 'the + Commitment button is greyed: ' + clean(await p.locator('[data-testid="sd-addwhy"]').first().textContent().catch(() => '')) }
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, add, 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 })
  if (who) {
    const opts = await p.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value)).catch(() => [])
    if (!opts.includes(who)) return { iid: null, refused: 'not offered in the Person box: ' + who }
    await p.selectOption('#inpEditPerson', who); await sleep(200)
  }
  await setKinds(p, W, kinds)
  await setSpan(p, W, span)
  if (o.rmk) await p.fill('#inpEditRmk', o.rmk)
  const read = clean(await p.locator('#inpEditPop .rc-read').first().textContent().catch(() => ''))
  if (o.beforeSave) await o.beforeSave()
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0] || null
  let refused = ''
  if (!iid) {
    refused = clean((await L.toastSaid(p)) + ' | ' + await p.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); if (!w) return 'the window closed, nothing made'; return [...w.querySelectorAll('[role="alert"], .inped-err, .inped-bad, .note.warn, .err')].map(e => e.textContent).join(' | ') || 'window still open, no words found' }))
    const x = p.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await W.press(p, x, 'inpedit-x'); const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard') }
  }
  await T.closeAll(p, W)
  return { iid, refused, read, made: iid ? await T.inp(p, iid) : null }
}
export async function setKinds(p, W, kinds) {
  for (const k of ['fly', 'oft', 'amt']) {
    const label = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }[k]
    const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
  }
}
export async function setSpan(p, W, span) {
  if (Array.isArray(span)) {
    await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
    await p.fill('#inpEditStart', span[0]); await p.fill('#inpEditEnd', span[1])
  } else if (span === 'AM' || span === 'PM' || span === 'all') {
    const b = p.locator(`#inpEditSpan [data-span="${span === 'all' ? 'all' : span.toLowerCase()}"]`).first()
    if (await b.count()) await W.press(p, b, 'span-' + span)
    else return 'no ' + span + ' choice in the window: ' + J(await p.evaluate(() => [...document.querySelectorAll('#inpEditSpan [data-span]')].map(e => e.dataset.span + ':' + e.textContent.trim())))
  }
}
/* a saved filing opened from its SANS day's line, changed and saved, or deleted */
export async function editS(p, W, iso, iid, how) {
  await T.closeAll(p, W)
  await W5.sansDay(p, W, iso)
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`).first()
  if (!(await row.count())) { await T.closeAll(p, W); return { ok: false, why: 'its line is not on the SANS day' } }
  await W.press(p, row, 'sd-open'); await p.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(400)
  if (how.del) { await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(800) }
  else {
    if (how.kinds) await setKinds(p, W, how.kinds)
    if (how.span) await setSpan(p, W, how.span)
    await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
    const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
  }
  const toast = await L.toastSaid(p)
  await T.closeAll(p, W)
  return { ok: true, toast, now: await T.inp(p, iid) }
}
/* the SANS day's own lines (what the calendar says each man filed) */
export async function sansDayRows(p, W, iso) {
  const r = await T.sansRead(p, W, iso, 'sday').catch(e => ({ err: String(e).slice(0, 120) }))
  await T.closeAll(p, W)
  return r && r.day ? T.rowsLine(r.day) : J(r)
}

/* a place pressed: on the board ('B', the open board of di) or on Edit Schedule's week ('W') — a seat's own box, or a
   row's "+ add" place at its mark; the phone's crew drawer (B) or crew tab (W) then opened. LEFT ARMED. */
export async function arm(p, W, surf, di, sel, o = {}) {
  let zone
  if (surf === 'B') { await openB(p, W, di); await unarm(p, W, 'B'); zone = p.locator(L.B(sel)).first() }
  else { await L.closeBoard(p, W); await L.go(p, 'editsched'); await unarm(p, W, 'W'); zone = p.locator(`#eWeek ${sel}:visible`).first() }
  if (!(await zone.count())) return { armed: null, why: 'no such place ' + sel }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  let now = ''
  if (W.isPhone) { await zone.tap({ position: pos }); if (o.now) now = await nowPic(p, W, (o.tag || 'arm') + '-press') } else await zone.click({ position: pos })
  await sleep(500)
  let armed = await p.evaluate(() => window.ARM && window.ARM.key)
  let via = W.isPhone ? 'tap' : 'click'
  if (!armed && W.isPhone) { via = 'the tap armed nothing — a script click used'; await zone.evaluate(e => e.click()); await sleep(500); armed = await p.evaluate(() => window.ARM && window.ARM.key) }
  await showList(p, W, surf)
  return { armed, via, now }
}
/* the crew list shown: the board's drawer (phone) or Edit Schedule's crew tab (phone); desktop: always shown */
export async function showList(p, W, surf, open = true) {
  if (!W.isPhone) return
  if (surf === 'B') return W5.boardDrawer(p, W, open)
  const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
  if (shown !== open && await p.locator('#rosTab:visible').count()) { await W.press(p, '#rosTab:visible', 'crew-tab'); await sleep(450) }
}
export async function unarm(p, W, surf) {
  if (await p.evaluate(() => !!(window.ARM && window.ARM.key))) { await p.keyboard.press('Escape'); await sleep(300) }
  await showList(p, W, surf, false)
  return p.evaluate(() => !!(window.ARM && window.ARM.key))
}
/* Edit Schedule's crew panel turned to a weekday with nothing armed (the week's day header) */
export async function listW(p, W, dow) {
  await L.closeBoard(p, W); await L.go(p, 'editsched'); await unarm(p, W, 'W')
  const day = await T.S.crewPanelTo(p, W, dow).catch(e => 'crewPanelTo failed: ' + String(e).slice(0, 80))
  return day
}

/* the SANS section of a crew list read on screen: each row's name, strike, reason (its words, lines and ends), its
   letters (the badge, its letter line and its hours line, their places and looks), cut or past the edge; the column's
   spread and its gap after the widest reason; any line telling the scheduler to file; sideways scroll */
export const ROOT = { B: '#schedBoard', W: '.ros-body' }
export const readSec = (p, surf) => p.evaluate(root => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0.5 && r.height > 0.5 && getComputedStyle(e).visibility !== 'hidden' }
  const t = e => e ? (e.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : ''
  const rd = x => x == null ? null : Math.round(x * 10) / 10
  const R = [...document.querySelectorAll(root)].filter(vis).pop() || document.querySelector(root)
  if (!R) return { none: 'no ' + root }
  const sec = [...R.querySelectorAll('.rsans')].filter(vis).pop()
  if (!sec) return { none: 'no SANS section shown in ' + root }
  const sb = sec.getBoundingClientRect()
  const ink = e => { if (!e || !vis(e)) return null; const rg = document.createRange(); rg.selectNodeContents(e); const rs = [...rg.getClientRects()].filter(r => r.width > 0); if (!rs.length) return null; return { l: Math.min(...rs.map(r => r.left)), r: Math.max(...rs.map(r => r.right)), t: Math.min(...rs.map(r => r.top)), b: Math.max(...rs.map(r => r.bottom)), lines: new Set(rs.map(r => Math.round(r.top))).size } }
  const font = e => { const s = getComputedStyle(e); return `${s.fontFamily.split(',')[0]}|${s.fontSize}|${s.fontWeight}|${s.color}|${s.opacity}` }
  const cutOf = e => !!e && [e, ...e.querySelectorAll('*')].some(x => { const s = getComputedStyle(x); return x.clientWidth > 0 && x.scrollWidth > x.clientWidth + 0.5 && (s.overflow !== 'visible' || s.textOverflow === 'ellipsis') })
  const edge = Math.min(sb.right, innerWidth)
  const rows = [...sec.querySelectorAll('.rsans-row')].filter(vis).map(r => {
    const pk = r.querySelector('.rpuck'), pu = pk && pk.querySelector('.puck'), w = r.querySelector('.rwhy'), b = r.querySelector('.rsans-b')
    const l = b && b.querySelector('.rsans-l'), h = b && b.querySelector('.rsans-h')
    const wI = ink(w), bI = ink(b), lI = ink(l), hI = ink(h)
    const others = [...r.querySelectorAll('*')].filter(c => vis(c) && !c.closest('.rpuck') && !(b && (c === b || b.contains(c))) && c.children.length === 0 && t(c)).map(c => ({ cls: String(c.className), text: t(c), cut: cutOf(c), right: rd(c.getBoundingClientRect().right), title: c.getAttribute('title') || '' }))
    return {
      id: pk && pk.dataset.person, cs: pk && (window.PEOPLE[pk.dataset.person] || {}).cs, struck: !!pk && pk.classList.contains('no'), cls: pk ? String(pk.className) : '',
      title: pk ? (pk.getAttribute('title') || '') : '', why: wI ? t(w) : '', whyLines: wI ? wI.lines : 0, whyL: wI && rd(wI.l), whyR: wI && rd(wI.r), whyT: wI && rd(wI.t),
      pkL: pk && rd(pk.getBoundingClientRect().left), pkR: pk && rd(pk.getBoundingClientRect().right), pkT: pk && rd(pk.getBoundingClientRect().top), pkB: pk && rd(pk.getBoundingClientRect().bottom),
      rowT: rd(r.getBoundingClientRect().top), rowB: rd(r.getBoundingClientRect().bottom),
      puckR: pu && rd(pu.getBoundingClientRect().right), puckW: pu && rd(pu.getBoundingClientRect().width), puckT: pu && rd(pu.getBoundingClientRect().top),
      badge: bI ? t(b) : '', bL: bI ? rd(b.getBoundingClientRect().left) : null, bInkL: bI && rd(bI.l), bInkR: bI && rd(bI.r), bLines: bI ? bI.lines : 0,
      l: lI ? t(l) : null, h: hI ? t(h) : null, hMinusL: hI && lI ? rd(hI.l - lI.l) : null, hTopMinusLBot: hI && lI ? rd(hI.t - lI.b) : null,
      sameLook: hI && lI ? font(h) === font(l) : null, hLook: hI ? font(h) : null, lLook: lI ? font(l) : null,
      rowH: rd(r.getBoundingClientRect().height), cut: cutOf(b) || cutOf(w), past: [wI, bI, hI].some(x => x && x.r > edge + 0.5), others,
    }
  })
  const lefts = rows.filter(r => r.bL != null).map(r => r.bL)
  const widestEnd = rows.length ? Math.max(...rows.map(r => r.whyR || r.puckR || 0)) : null
  const widest = rows.find(r => (r.whyR || r.puckR || 0) === widestEnd)
  const colL = lefts.length ? Math.min(...lefts) : null
  const scrollers = [...R.querySelectorAll('*'), R].filter(e => { const s = getComputedStyle(e); return /auto|scroll/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1 }).map(e => (e.id ? '#' + e.id : '.' + String(e.className).split(' ')[0]) + ` ${e.scrollWidth}>${e.clientWidth}`)
  const all = t(R) + ' ' + [...R.querySelectorAll('[title]')].map(e => e.getAttribute('title')).join(' ')
  return {
    head: t(sec.querySelector('.rh2')), rows, spread: lefts.length ? rd(Math.max(...lefts) - colL) : null, colL, widestEnd, widest: widest ? widest.cs + (widest.why ? ': ' + widest.why : ' (his name)') : null,
    gap: colL != null && widestEnd != null ? rd(colL - widestEnd) : null, secL: rd(sb.left), secR: rd(sb.right), vw: innerWidth,
    sideways: scrollers, pageWide: document.documentElement.scrollWidth > innerWidth + 1, toFile: (all.match(/[^.]{0,40}(File it|Tap to file|file it on|on the Inputs page)[^.]{0,40}/gi) || []),
    armed: (window.ARM && window.ARM.key) || null,
  }
}, ROOT[surf] || surf)
export const rowOf = (s, id) => s && s.rows ? s.rows.find(r => r.id === id) : null
export const rowSay = r => r ? `${r.cs}${r.struck ? ' struck' : ' plain'}${r.why ? ` "${r.why}"${r.whyLines > 1 ? ' (' + r.whyLines + ' lines)' : ''}` : ''} [${r.badge || 'no letters'}]${r.h ? ' hours under: "' + r.h + '"' : ''}${r.cut ? ' CUT' : ''}${r.past ? ' PAST EDGE' : ''}${r.others.length ? ' + ' + r.others.map(o => `"${o.text}"${o.cut ? '(cut)' : ''}`).join(' ') : ''}` : 'NOT IN THE SANS SECTION'
export const secSay = s => s && s.rows ? `"${s.head}" · ${s.rows.map(rowSay).join(' · ')} · column spread ${s.spread}px, gap after the widest (${s.widest}) ${s.gap}px${s.sideways.length ? ' · SIDEWAYS ' + s.sideways.join(',') : ''}${s.pageWide ? ' · PAGE WIDER THAN SCREEN' : ''}${s.toFile.length ? ' · TELLS TO FILE: ' + s.toFile.join(' | ') : ''}` : J(s)
/* the column judged: one start (0.5px), straight after the widest reason (no more than `near` px after it, never before) */
export const colJudge = (s, near = 14) => {
  if (!s || !s.rows) return { ok: false, why: 'no section' }
  if (s.spread == null) return { ok: true, why: 'no letters on any row' }
  const ok = s.spread <= 0.5 && s.gap >= -0.5 && s.gap <= near
  return { ok, why: `spread ${s.spread}px, column at ${s.colL} (section ${s.secL}–${s.secR}), widest end ${s.widestEnd} (${s.widest}), gap ${s.gap}px` }
}

/* a crop of the SANS section (and, with `with`, other selectors), pad px round it, inside the screen */
export async function secPic(p, W, surf, tag, o = {}) {
  const box = await p.evaluate(([root, o]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0.5 && r.height > 0.5 }
    const R = [...document.querySelectorAll(root)].filter(vis).pop(); if (!R) return null
    const sec = [...R.querySelectorAll('.rsans')].filter(vis).pop(); if (!sec) return null
    if (!o.noScroll) sec.scrollIntoView({ block: 'center', inline: 'nearest' })
    const rs = [sec.getBoundingClientRect()]
    for (const q of (o.with || [])) { const e = [...document.querySelectorAll(q)].filter(vis).pop(); if (e) rs.push(e.getBoundingClientRect()) }
    const pad = o.pad ?? 8
    let x = Math.min(...rs.map(r => r.left)) - pad, y = Math.min(...rs.map(r => r.top)) - pad, x2 = Math.max(...rs.map(r => r.right)) + pad, y2 = Math.max(...rs.map(r => r.bottom)) + pad
    if (o.fullWidth) { x = 0; x2 = innerWidth }
    x = Math.max(0, x); y = Math.max(0, y); x2 = Math.min(innerWidth, x2); y2 = Math.min(innerHeight, y2)
    return { x, y, width: x2 - x, height: y2 - y }
  }, [ROOT[surf] || surf, o])
  await sleep(250)
  if (!box || box.width < 4 || box.height < 4) return ''
  const f = path.join(OUT, `${W.scn}-${tag}-${W.sz.name}.png`)
  await p.screenshot({ path: f, clip: box })
  return path.basename(f)
}
export async function crop(p, W, sels, tag, pad = 10) {
  const box = await p.evaluate(([sels, pad]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0.5 && r.height > 0.5 }
    const rs = sels.map(q => [...document.querySelectorAll(q)].filter(vis).pop()).filter(Boolean).map(e => e.getBoundingClientRect())
    if (!rs.length) return null
    let x = Math.min(...rs.map(r => r.left)) - pad, y = Math.min(...rs.map(r => r.top)) - pad, x2 = Math.max(...rs.map(r => r.right)) + pad, y2 = Math.max(...rs.map(r => r.bottom)) + pad
    x = Math.max(0, x); y = Math.max(0, y); x2 = Math.min(innerWidth, x2); y2 = Math.min(innerHeight, y2)
    return { x, y, width: x2 - x, height: y2 - y }
  }, [sels, pad])
  if (!box || box.width < 4 || box.height < 4) return ''
  const f = path.join(OUT, `${W.scn}-${tag}-${W.sz.name}.png`)
  await p.screenshot({ path: f, clip: box })
  return path.basename(f)
}

/* the drag hover: a desktop mouse drag of a man's crew-list puck held over a place, the ghost's words and the place's
   own words read while held; then dropped there (drop) or let go off the board; the note read */
export async function dragHold(p, W, surf, id, dstSel, tag, { drop = false, pic = false } = {}) {
  const root = ROOT[surf]
  await noteWatch(p)
  const dst = p.locator(`${surf === 'B' ? '#schedBoard' : '#eWeek'} ${dstSel}:visible`).first()
  const src = p.locator(`${root} .rpuck[data-person="${id}"]:visible .puck`).first()
  if (!(await dst.count()) || !(await src.count())) return { ok: false, why: `source ${await src.count()} / place ${await dst.count()}` }
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); await sleep(200)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) return { ok: false, why: 'no box' }
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
  await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps: 16 }); await sleep(500)
  const hover = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0 }
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    const g = [...document.querySelectorAll('.dragimg, .tdghost')].filter(vis).pop()
    const w = g && g.querySelector('.dwhy')
    return { ghost: !!g, ghostWords: g ? t(g) : null, why: w ? t(w) : null, over: [...document.querySelectorAll('.dragover-why')].filter(vis).map(t) }
  })
  const hpic = pic ? await crop(p, W, ['.dragimg, .tdghost', `${surf === 'B' ? '#schedBoard' : '#eWeek'} ${dstSel}`], tag + '-hover', 24) : ''
  if (drop) { await p.mouse.up(); await sleep(700) } else { await p.mouse.move(3, 3, { steps: 6 }); await p.mouse.up(); await sleep(400) }
  const note = await L.toastSaid(p)
  return { ok: true, hover, hpic, note, seen: await notesSeen(p) }
}
/* the press of a man's crew-list puck while a place is armed: the note at once (and the picture right after, on the
   phone), and whether the place now holds him */
export async function pickMan(p, W, surf, id, tag, o = {}) {
  await L.hideToast(p).catch(() => {})
  await noteWatch(p)
  await showList(p, W, surf)
  const pk = p.locator(`${ROOT[surf]} .rpuck[data-person="${id}"]:visible`).first()
  if (!(await pk.count())) return { toast: '', why: 'no puck' }
  await pk.scrollIntoViewIfNeeded().catch(() => {})
  let now = ''
  if (W.isPhone) { await pk.tap(); if (o.now) now = await nowPic(p, W, tag + '-pick') } else await pk.click()
  await sleep(300)
  const toast = await L.toastSaid(p)
  const tpic = o.pic ? await crop(p, W, ['#toastEl'], tag + '-note', 16) : ''
  return { toast, seen: await notesSeen(p), now, tpic }
}
/* the day's holdings of a man (what he is planned on), read from the day */
export const holds = (p, di, id) => p.evaluate(([i, id]) => { const s = JSON.stringify(window.DAYS[i]); const n = (s.match(new RegExp('"' + id + '"', 'g')) || []).length; return n }, [di, id])

export function saveJ(name, data) { mkdirSync(OUT, { recursive: true }); writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1)) }
