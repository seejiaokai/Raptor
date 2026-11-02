// The WALK of [LW-VIEWER-TAB] and [LW-OPENDATES-X-SIZE] (2 Nov 26, `claude/lw-viewer-tab-x-size`, pull request 614).
// Written as the RIGHT behaviour (a PASS means correct):
//   K — the keyboard, on a desktop (1536, Chromium; and 1440 WebKit): the document viewer opened over each Leave War window
//       it opens from (the bid window's held day, a bid window's own Document row with two files — its ‹ › — the person
//       window's paperclip, and a member's day's list) keeps Tab and Shift+Tab inside itself, every stop reached, none in the
//       window behind; Escape closes the viewer only, and the window behind then holds Tab again. Pictures carry the focus ring.
//   X — a finger, on a phone (390 × 844 and 360 × 740, Chromium touch and WebKit): the full page's ✕ — "Open for bidding" and
//       the Events list — tapped 14px left and 12px below its centre closes the page; a picture right after the tap (D1281)
//       and once settled; the ✕ drawn as before (its glyph's box under 26px, the touch area painting nothing). On a desktop
//       the floating windows' ✕ keeps no wider area (a press 14px off it is not the ✕).
// Fixtures through the app's own controls (§7.7): the seed's own document on Gambit's OML of 23 Jul; two files added through
// a bid window's Document row. The closing of the viewer by Close, ✕, surround and Escape is re-walked by `lw-nb-docclose.mjs`.
// Run from raptor-port: LW_PORT=<a served build> LW_OUT=2026-11-02-lw-viewer-tab-x-size node scripts/handpass/lw-tabx-walk.mjs
//   (PART=k,w,x,d for some)
process.env.LW_PORT ||= '4241'
process.env.LW_OUT ||= '2026-11-02-lw-viewer-tab-x-size'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
const parts = (process.env.PART || 'k,w,x,d').split(',')
for (const f of fs.readdirSync(H.OUT)) if (f.endsWith('.png') && parts.some(p => f.startsWith(p + '-'))) fs.unlinkSync(`${H.OUT}/${f}`)
console.log('[lw-tabx-walk v2] →', H.OUT, parts.join(' '), 'bundle on', process.env.LW_PORT)
const recs = []
const real = errs => errs.filter(e => !/requestfailed: blob:/.test(e))
const rec = (id, size, ok, said, pics = []) => { recs.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
const shot = async (w, name) => { await w.page.screenshot({ path: `${H.OUT}/${name}.png`, scale: 'css' }); return name + '.png' }
const viewerUp = P => P.evaluate(() => { const v = document.getElementById('docViewPop'); return !!v && !v.hidden && v.getBoundingClientRect().width > 0 })
const up = (P, sel) => P.evaluate(sel => { const e = document.querySelector(sel); return !!e && e.getBoundingClientRect().width > 0 && !e.closest('[hidden]') }, sel)
const ids = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
const putAway = async w => { for (let i = 0; i < 3; i++) { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(250) } }
/* where the keys stand: the element's id or test id, and whether it is inside the viewer or inside the window behind */
const at = (P, behind) => P.evaluate(behind => {
  const a = document.activeElement
  const name = a ? (a.id || a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.textContent?.trim().slice(0, 14) || a.tagName) : 'none'
  return { name, inViewer: !!a?.closest('#docViewPop'), inBehind: !!(a && document.querySelector(behind)?.contains(a)) }
}, behind)

/* open the viewer from `opener`, then walk the keys round it; `want` = the stops Tab must reach */
/* `holds` false for a window that leaves the page working (D641 — the person window): it never holds Tab, so after the viewer
   closes only "the viewer gone, the window still up" is asked */
async function keys(w, id, opener, behind, want, tag, holds = true) {
  const P = w.page, size = `desk ${P.viewportSize().width}/${w.engine}`
  if (!(await up(P, opener))) { rec(id, size, false, `NOT WALKED — nothing to open the viewer at ${opener}`, [await shot(w, `${tag}-no-opener`)]); return }
  await L.press(w, opener); await P.waitForTimeout(500)
  if (!(await viewerUp(P))) { rec(id, size, false, 'the viewer did not open', [await shot(w, `${tag}-no-viewer`)]); return }
  const seen = [], out = []
  for (let i = 0; i < 6; i++) {
    await P.keyboard.press('Tab'); await P.waitForTimeout(120)
    const a = await at(P, behind); seen.push(a.name); if (!a.inViewer) out.push(`Tab ${i + 1} → ${a.name}${a.inBehind ? ' (the window behind)' : ''}`)
  }
  const p1 = await shot(w, `${tag}-1-tab`)
  for (let i = 0; i < 3; i++) {
    await P.keyboard.press('Shift+Tab'); await P.waitForTimeout(120)
    const a = await at(P, behind); seen.push('⇧' + a.name); if (!a.inViewer) out.push(`Shift+Tab ${i + 1} → ${a.name}`)
  }
  const p2 = await shot(w, `${tag}-2-shift-tab`)
  const missing = want.filter(s => !seen.includes(s))
  rec(`${id} — Tab and Shift+Tab stay in the viewer, every stop reached`, size, !out.length && !missing.length, `stops: ${seen.join(' · ')}${out.length ? ' — LEFT THE VIEWER: ' + out.join('; ') : ''}${missing.length ? ' — never reached: ' + missing.join(', ') : ''}`, [p1, p2])
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const v = await viewerUp(P), b = await up(P, behind)
  const back = []
  for (let i = 0; i < 4; i++) { await P.keyboard.press('Tab'); await P.waitForTimeout(100); const a = await at(P, behind); back.push(a.inBehind ? 'in' : `OUT(${a.name})`) }
  const p3 = await shot(w, `${tag}-3-after-escape-tab`)
  rec(`${id} — Escape closes the viewer only${holds ? '; the window behind holds Tab again' : ' (a window that leaves the page working: Tab is not held, D641)'}`, size, !v && b && (!holds || back.every(x => x === 'in')), `viewer ${v ? 'STILL OPEN' : 'closed'}; window behind ${b ? 'up' : 'GONE'}; four Tabs: ${back.join(' ')}`, [p3])
}

async function keyboardRound(w, tagPre) {
  const P = w.page
  await L.signInPlain(w, 'admin', '2026-07-13')
  const id = await ids(P)
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  /* K1 the bid window of a whole day held (Gambit's OML 23 Jul — the seed's own document) */
  await L.openCellR(w, id.Gambit, '2026-07-23'); await P.waitForTimeout(300)
  await keys(w, 'K1 the bid window, a day held whole (Gambit 23 Jul)', '[data-testid="bid-picker"] .docchip', '[data-testid="bid-picker"]', ['docViewClose', 'docViewDone'], `${tagPre}-k1`)
  await putAway(w)
  /* K2 a bid window's own Document row holding two files: the viewer's ‹ › pager is reached by Tab too */
  await L.openCellR(w, id.Ranger, '2026-07-28'); await P.waitForTimeout(400)
  await L.setDoc(w, '[data-testid="bid-picker"]', 'first.pdf'); await P.waitForTimeout(300)
  await L.setDoc(w, '[data-testid="bid-picker"]', 'second.pdf'); await P.waitForTimeout(300)
  const n = await P.locator('[data-testid="bid-picker"] .docchip').count()
  if (n < 2) rec('K2 the bid window\'s own Document row, two files', `desk ${P.viewportSize().width}/${w.engine}`, false, `NOT WALKED — ${n} chip(s) after two files added`, [await shot(w, `${tagPre}-k2-chips`)])
  else await keys(w, 'K2 the bid window\'s own Document row, two files (the pager)', '[data-testid="bid-picker"] .docchip', '[data-testid="bid-picker"]', ['docViewNext', 'docViewDone', 'docViewClose'], `${tagPre}-k2`)
  await putAway(w)
  /* K3 the person window's paperclip, on Gambit's own leave (his OML is a medical: the paperclip of a leave line —
     Ranger's line carries none in the seed, so his line is given a document by the bid above only if it was placed) */
  await L.press(w, `[data-testid="row-${id.Gambit}"] .whoedit`); await P.waitForTimeout(800)
  if (await up(P, '[data-testid="person-window"] [data-testid^="pw-clip-"]')) await keys(w, 'K3 the person window, a leave line\'s paperclip', '[data-testid="person-window"] [data-testid^="pw-clip-"]', '[data-testid="person-window"]', ['docViewClose', 'docViewDone'], `${tagPre}-k3`, false)
  else H.note('K3', 'desk', 'Gambit\'s person window carries no paperclip line in the seed — walked as K3b on a leave placed with a document')
  await putAway(w)
  return id
}
/* K3b and K4 — a pending LL with a document placed on Ranger's 7 Apr (the admin, members' today 25 Jan 26), then his person
   window's paperclip; then a member (Ranger) on his own day's list */
async function keyboardRound2(w, tagPre) {
  const P = w.page
  await L.signInPlain(w, 'admin', '2026-01-25')
  await L.openCellR(w, 'bane', '2026-04-07'); await P.waitForTimeout(400)
  const tick = P.locator(T('bid-approve-tick')).first()
  if (await tick.count()) { const on = (await tick.getAttribute('aria-checked')) === 'true' || (await tick.getAttribute('aria-pressed')) === 'true'; if (on) { await L.press(w, T('bid-approve-tick')); await P.waitForTimeout(300) } }
  await L.setDoc(w, '[data-testid="bid-picker"]', 'leave-note.pdf')
  await L.placeLeave(w, 'LL'); await P.waitForTimeout(500); await putAway(w)
  await L.press(w, '[data-testid="row-bane"] .whoedit'); await P.waitForTimeout(800)
  await keys(w, 'K3b the person window, a leave line\'s paperclip (Ranger 7 Apr)', '[data-testid="person-window"] [data-testid^="pw-clip-"]', '[data-testid="person-window"]', ['docViewClose', 'docViewDone'], `${tagPre}-k3b`, false)
  await putAway(w)
  /* K4 the day's list: Ranger's 7 Apr holds his bid; a second entry (an OIL award) makes it a list (D1466) — the admin grants
     one there first, then the list's own chip */
  await L.openCellR(w, 'bane', '2026-04-07'); await P.waitForTimeout(400)
  const list = await up(P, '[data-testid="daylist-sheet"]')
  if (list && await up(P, '[data-testid="daylist-sheet"] .docchip')) await keys(w, 'K4 the day\'s list, its document chip', '[data-testid="daylist-sheet"] .docchip', '[data-testid="daylist-sheet"]', ['docViewClose', 'docViewDone'], `${tagPre}-k4`)
  else if (await up(P, '[data-testid="bid-picker"] .docchip')) await keys(w, 'K4 Ranger\'s own bid reopened, its Document chip', '[data-testid="bid-picker"] .docchip', '[data-testid="bid-picker"]', ['docViewClose', 'docViewDone'], `${tagPre}-k4`)
  else rec('K4 a reopened bid or day\'s list', `desk ${P.viewportSize().width}/${w.engine}`, false, 'NOT WALKED — no chip on reopening Ranger\'s 7 Apr', [await shot(w, `${tagPre}-k4-none`)])
  await putAway(w)
}

/* X — the full page's ✕ on a phone */
async function xRound(w, tagPre, width, height) {
  const P = w.page, size = `phone ${width}/${w.engine}`
  await P.setViewportSize({ width, height }); await P.waitForTimeout(300)
  await L.signInPlain(w, 'admin', '2026-01-25')
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  const pages = [
    ['open-dates', 'open-dates-close', async () => { await L.press(w, T('open-chip')); await P.waitForTimeout(500) }],
    ['events-sheet', 'events-close', async () => { await L.press(w, T('settings-open')); await P.waitForTimeout(500); await L.press(w, T('settings-events')); await P.waitForTimeout(600) }],
  ]
  for (const [win, x, open] of pages) {
    const tag = `${tagPre}-${width}-${win}`
    await open()
    if (!(await up(P, T(win)))) { rec(`X ${win}`, size, false, 'NOT WALKED — the page did not open', [await shot(w, `${tag}-not-open`)]); await putAway(w); continue }
    const m = await P.evaluate(([win, x]) => {
      const b = document.querySelector(`[data-testid="${x}"]`), r = b.getBoundingClientRect(), a = getComputedStyle(b, '::after')
      const full = !!document.querySelector(`[data-testid="${win}"].fullpage`)
      return { w: Math.round(r.width), h: Math.round(r.height), cx: r.left + r.width / 2, cy: r.top + r.height / 2, full, paint: `${a.backgroundColor} ${a.borderTopWidth} ${a.outlineStyle} ${a.boxShadow}`, aw: a.width, ah: a.height }
    }, [win, x])
    const crop = `${tag}-1-x-close-up`
    await P.screenshot({ path: `${H.OUT}/${crop}.png`, clip: { x: Math.max(0, m.cx - 60), y: Math.max(0, m.cy - 24), width: 120, height: 48 }, scale: 'css' })
    const p0 = await shot(w, `${tag}-0-open`)
    const paints = !/rgba\(0, 0, 0, 0\) 0px none none/.test(m.paint)
    rec(`X1 ${win}: a full page, its ✕ drawn the size it was, the touch area painting nothing`, size, m.full && m.w < 26 && m.h < 26 && !paints && m.aw === '44px' && m.ah === '44px', `full page ${m.full}; ✕ ${m.w} × ${m.h}; area ${m.aw} × ${m.ah}; area paints ${paints ? m.paint : 'nothing'}`, [p0, crop + '.png'])
    await L.finger(w, m.cx - 14, m.cy + 12, 0, `${tag}-2-tap-q`)
    await P.waitForTimeout(400)
    const gone = !(await up(P, T(win)))
    const p2 = await shot(w, `${tag}-3-after-tap`)
    rec(`X2 ${win}: a finger 14px left and 12px below the ✕'s centre closes the page`, size, gone, gone ? 'closed by the one tap' : 'STILL OPEN after the tap', [`${tag}-2-tap-q.png`, p2])
    if (!gone) await putAway(w)
  }
}

/* D — on a desktop the floating window's ✕ keeps no wider area (the change is the full page's only) */
async function deskRound(w, tagPre) {
  const P = w.page, size = `desk ${P.viewportSize().width}/${w.engine}`
  await L.signInPlain(w, 'admin', '2026-01-25')
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.press(w, T('open-chip')); await P.waitForTimeout(500)
  const m = await P.evaluate(() => {
    const b = document.querySelector('[data-testid="open-dates-close"]'), r = b.getBoundingClientRect()
    const e = document.elementFromPoint(r.left + r.width / 2 - 14, r.top + r.height / 2 + 12)
    return { full: !!document.querySelector('[data-testid="open-dates"].fullpage'), w: Math.round(r.width), h: Math.round(r.height), off: !!e && (e === b || b.contains(e)), on: (() => { const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!c && (c === b || b.contains(c)) })() }
  })
  const p = await shot(w, `${tagPre}-open-dates-floating`)
  rec('D1 the floating "Open for bidding" window on a desktop: its ✕ as before, no wider area', size, !m.full && m.on && !m.off, `full page ${m.full}; ✕ ${m.w} × ${m.h}; its centre ${m.on ? 'is' : 'is NOT'} the ✕; 14px off ${m.off ? 'IS the ✕ (an area leaked)' : 'is not the ✕'}`, [p])
  await putAway(w)
}

if (parts.includes('k')) {
  const w = await H.deskCtx()
  await keyboardRound(w, 'k')
  await w.ctx.close()
  const w2 = await H.deskCtx()
  await keyboardRound2(w2, 'k')
  rec('K-errors', 'desk 1536', !real(w.errs).length && !real(w2.errs).length, [...real(w.errs), ...real(w2.errs)].slice(0, 4).join(' | ') || 'none')
  await w2.ctx.close()
}
if (parts.includes('w')) {
  const w = await L.newCtx('desk', 'webkit')
  await keyboardRound(w, 'w')
  rec('W-errors', 'desk/webkit', !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}
if (parts.includes('x')) {
  for (const engine of ['chromium', 'webkit']) for (const [width, height] of [[390, 844], [360, 740]]) {
    const w = await H.phoneCtx(engine)
    await xRound(w, `x-${engine}`, width, height)
    rec('X-errors', `phone ${width}/${engine}`, !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
    await w.ctx.close()
  }
}
if (parts.includes('d')) {
  const w = await H.deskCtx()
  await deskRound(w, 'd')
  rec('D-errors', 'desk 1536', !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}
fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify(recs, null, 1))
console.log(`\n${recs.filter(r => r.verdict === 'PASS').length}/${recs.length} PASS`)
await H.closeBrowser()
