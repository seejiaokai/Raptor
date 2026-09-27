/* W6 (26 Sep 26) — the FIRST walk of the roll-call rows nobody reached, on the world w6-01-build.mjs saved (read it
   for the cast): R12 manning, R17 the board's panels, R18 View-only Sched's working draft, R19 the crew picker and
   ALL AVAIL, R22 the schedule's CSV, R27 the war's clash strip, R30 the pending list, R32 the OIL question sheet,
   R36 print. For each: does it SHOW the absence, can the person ACT on it there, is anything PAINTED over it.
   Written as assertions of the RIGHT behaviour (plan §4 / §9, the register §11–§12); a PASS is what the picture shows.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w6-02-walk.mjs [desktop|phone] [admin|member] */
const W = process.argv[2] || 'desktop', WHO = process.argv[3] || 'admin'
const PH = W === 'phone', ADM = WHO === 'admin'
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const W4 = await import('./w4-lib.mjs')
const { readFileSync } = await import('node:fs')
const { go, board, closeBoard, editWeek, tap, put, shot, toastSpy, toasts, resultBook, ROOT, closeSheets, sheetNow, readUnav, frame, relogin } = L
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const K = JSON.parse(readFileSync(`${SCR}/cast.json`, 'utf8'))
const { cast, cs, away, dbl, awarded } = K
const TAG = `${W}-${WHO}`
const R = resultBook(`W6-${TAG}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-02-${TAG}.txt`)
const THU = 3, FRI = 4, SAT = 5
const FRIISO = '2026-07-17', SATISO = '2026-07-18', D29 = '2026-07-29'
const pic = n => `w6-${TAG}-${n}`
const o = await W4.openW4({ phone: PH, who: ADM ? 'a' : 'm', state: `${SCR}/world.json` })
const page = o.page, errors = o.errors
/* the saved world comes back signed in as the admin who built it: the member signs in as himself */
const signedAs = await page.evaluate(() => (document.querySelector('.rolebadge, .who-badge, #whoami, .topbar .badge') || {}).innerText || document.body.innerText.match(/(SABER|RANGER)\s*·\s*(ADMIN|MEMBER)/i)?.[0] || '')
if (!ADM && !/RANGER/i.test(signedAs)) await relogin(page, 'm')
await toastSpy(page)
const who = await page.evaluate(() => document.body.innerText.match(/(SABER|RANGER)\s*·\s*(ADMIN|MEMBER)/i)?.[0] || '?')
R.note('signed-in', who)
const bundle = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
R.ck('bundle', /index-KbvILaPW\.js/.test(bundle), 'the rebuilt bundle', bundle)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, pic(`THREW-${name}`)).catch(() => {}); await closeSheets(page).catch(() => {}); await page.keyboard.press('Escape').catch(() => {}) } }
/** Is each visible element matching `sel` what a finger at its centre would land on? Returns the covered ones. */
const covered = (sel, within = null) => page.evaluate(([s, w]) => {
  const root = w ? document.querySelector(w) : document
  if (!root) return ['NO ROOT ' + w]
  const out = []
  for (const e of root.querySelectorAll(s)) {
    if (!(e.offsetWidth || e.offsetHeight)) continue
    const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue
    const x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y)
    if (!h || !(h === e || e.contains(h) || h.contains(e))) out.push(`${(e.innerText || e.getAttribute('data-person') || e.className).toString().replace(/\s+/g, ' ').slice(0, 30)} ← ${h ? (h.tagName + '.' + String(h.className).slice(0, 40)) : 'nothing'}`)
  }
  return out
}, [sel, within])
/** Tap an element the way this width's person does: a finger on the phone, the mouse on the desktop. */
async function press(sel) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return { ok: false, why: 'absent ' + sel }
  if (PH) return W4.fingerTap(page, sel)
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  await el.click(); await page.waitForTimeout(500)
  return { ok: true }
}
const sideScroll = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)

/* ================================================================= R12 — the war's manning rows, the sheet, the list */
await step('R12', async () => {
  await W4.lwOpen(page, D29)
  const m28 = await W4.manningOn(page, '2026-07-28'), m29 = await W4.manningOn(page, D29), m30 = await W4.manningOn(page, '2026-07-30')
  R.note('R12-manning', { '28 Jul': m28, '29 Jul': m29, '30 Jul': m30 })
  const d = W4.manningDelta(m28, m29)
  R.ck('R12-iwso-once', m29.iwso === m28.iwso - away.length && m29.iwso === m30.iwso - away.length,
    `IWSO on 29 Jul is the day beside it less exactly ${away.length} — six men away, the one with a leave AND a medical counted ONCE, the man with an award counted present (N13, N17)`, { iwso: [m28.iwso, m29.iwso, m30.iwso], delta: d })
  const cls = await page.evaluate(d => { const c = document.querySelector(`[data-testid="count-iwso-${d}"]`); return c ? { txt: c.innerText.trim(), cls: c.className, title: c.title } : null }, D29)
  R.ck('R12-iwso-red', cls && /red/.test(cls.cls), 'the IWSO cell on 29 Jul turns red (below its red line of 2)', cls)
  await page.locator(`[data-testid="count-iwso-${D29}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(400)
  await shot(page, pic('R12-01-manning-29jul'))
  const cov = await covered(`[data-testid^="count-"][data-testid$="-${D29}"]`)
  R.ck('R12-counts-not-covered', cov.length === 0, "nothing sits over 29 Jul's manning figures", cov)
  /* the two men the count is about, as their own day tells it */
  const tD = await W4.tapDay(page, PH, dbl, D29)
  await shot(page, pic('R12-02-double-man-daylist'))
  R.note('R12-double-man-sheet', { open: tD.open, lines: tD.lines, text: (tD.text || '').slice(0, 300) })
  R.ck('R12-double-man-shows-both', ADM ? (tD.open === 'daylist-sheet' && tD.lines.some(l => /LL/.test(l)) && tD.lines.some(l => /ATT C/.test(l))) : (tD.open !== 'COVERED'),
    ADM ? "the man with a leave and a medical on 29 Jul: his day's list names BOTH (LL morning, ATT C afternoon)" : 'a member taps another man\'s day: whatever opens, nothing is covered', { open: tD.open, lines: tD.lines })
  await closeSheets(page)
  const cA = await W4.cellOf(page, awarded, D29)
  R.ck('R12-award-drawn', /FO/.test(cA.box), 'the awarded man\'s 29 Jul box reads FO (the award) — and he still counts present (above)', cA)
  /* the row's name opens what it counts */
  const t = await press('[data-testid="manning-info-iwso"]')
  const sh = await page.evaluate(() => { const s = document.querySelector('[data-testid="manning-sheet"]'); return s ? { text: s.innerText.replace(/\s+/g, ' ').slice(0, 400), amber: !!s.querySelector('[data-testid="thresh-amber"]'), edit: !!s.querySelector('[data-testid="counter-edit-open"]'), box: (() => { const r = s.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] })() } : null })
  await shot(page, pic('R12-03-manning-sheet'))
  R.ck('R12-sheet', t.ok && sh && /IWSO/.test(sh.text) && (ADM ? sh.amber && sh.edit : !sh.amber && !sh.edit),
    ADM ? 'the IWSO row\'s name opens "what this row counts" with its red line, and the admin\'s Amber / Red boxes and Edit counter…' : 'the member reads "what this row counts" with no boxes to change (the lines are management\'s)', { t, sh })
  R.ck('R12-sheet-fits', sh && sh.box[0] >= 0 && sh.box[2] <= (PH ? 390 : 1440) + 1, 'the sheet sits inside the screen', sh && sh.box)
  const x = page.locator('[data-testid="manning-info-close"]').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(300) } else await closeSheets(page)
  /* the under-manned list: the chip, its list, and the jump */
  const chip = await page.evaluate(() => { const c = document.querySelector('[data-testid="undermanned"]'); return c ? { txt: c.innerText.trim(), disabled: c.disabled, vis: !!(c.offsetWidth || c.offsetHeight) } : null })
  R.ck('R12-undermanned-chip', chip && chip.vis && !chip.disabled && /\d+ day/.test(chip.txt) && !/^0 /.test(chip.txt), 'the Under-manned chip counts at least one day and can be pressed', chip)
  /* move the grid away first, so the jump has somewhere to go */
  await W4.lwOpen(page, '2026-03-02')
  const u = await press('[data-testid="undermanned"]')
  const list = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="undermanned-day-"]')].map(e => e.getAttribute('data-testid').slice(16) + ': ' + e.innerText.replace(/\s+/g, ' ').trim()))
  await shot(page, pic('R12-04-undermanned-list'))
  const row = list.find(l => l.startsWith(D29))
  R.ck('R12-undermanned-names-29', u.ok && !!row && /IWSO 1/.test(row), 'the list names 29 Jul and why: "IWSO 1"', { list })
  const lcov = await covered('[data-testid^="undermanned-day-"]')
  R.ck('R12-undermanned-list-clear', lcov.length === 0, 'nothing sits over the list\'s rows', lcov)
  const j = await press(`[data-testid="undermanned-day-${D29}"]`)
  await page.waitForTimeout(900)
  const inView = await page.evaluate(d => { const h = document.querySelector(`[data-testid="head-${d}"]`); if (!h) return 'NO HEAD'; const r = h.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, inside: r.right > 0 && r.left < innerWidth } }, D29)
  await shot(page, pic('R12-05-after-jump'))
  R.ck('R12-undermanned-jumps', j.ok && inView && inView.inside, 'a tap on 29 Jul in the list brings 29 Jul on screen', inView)
})

/* ================================================================= R27 — the war's clash strip (admin only) */
await step('R27', async () => {
  await W4.lwOpen(page, SATISO)
  const strip = await page.evaluate(() => { const s = document.querySelector('[data-testid="sync-clashes"]'); return s ? { text: s.innerText.replace(/\s+/g, ' '), vis: !!(s.offsetWidth || s.offsetHeight), box: (() => { const r = s.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] })() } : null })
  if (strip) await page.locator('[data-testid="sync-clashes"]').first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await shot(page, pic('R27-01-clash-strip'))
  const sdo = cs[cast.SDO]
  if (ADM) {
    R.ck('R27-strip-shows', strip && strip.vis && new RegExp(`${sdo}: weekend/PH work earns (FO|HO) but 18 Jul( 26)? holds LL`).test(strip.text), `the admin's strip names the clash: "${sdo}: weekend/PH work earns FO but 18 Jul holds LL — resolve on the sheet"`, strip)
    R.ck('R27-strip-fits', strip && strip.box[2] <= (PH ? 390 : 1440) + 1 && (await sideScroll()) <= 0, 'the strip fits the width; the page does not scroll sideways', { box: strip && strip.box, side: await sideScroll() })
    const scov = await covered('[data-testid="sync-clashes"] .row')
    R.ck('R27-strip-clear', scov.length === 0, 'nothing sits over the strip\'s lines', scov)
  } else R.ck('R27-member-none', !strip || !strip.vis, 'a member sees no clash strip (the resolution is an admin\'s)', strip)
  /* where the strip sends him: the day on the sheet */
  const c = await W4.cellOf(page, cast.SDO, SATISO)
  const t = await W4.tapDay(page, PH, cast.SDO, SATISO)
  await shot(page, pic('R27-02-sdo-saturday-sheet'))
  R.note('R27-sdo-day', { cell: c, open: t.open, lines: t.lines, buttons: t.buttons, text: (t.text || '').slice(0, 400) })
  R.ck('R27-day-shows-both', c.amber && t.open !== 'COVERED' && /FO|OIL/.test((t.text || '') + (t.lines || []).join(' ')) && /LL/.test((t.text || '') + (t.lines || []).join(' ')),
    `the SDO's Saturday box is amber and its sheet names both — the credit and the leave`, { cell: c, open: t.open, lines: t.lines })
  await closeSheets(page)
})

/* ================================================================= R32 — the OIL question sheet (a duty & commitments input on a weekend) */
await step('R32', async () => {
  const person = ADM ? cast.G : 'bane'
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const fill = async () => {
    await go(page, 'inputs'); await page.waitForSelector('#inAdd')
    if (ADM && await page.locator('#inPerson').count()) await page.selectOption('#inPerson', person)
    await page.selectOption('#inType', 'Duty')
    const iso = '2026-07-19'
    for (let i = 0; i < 36 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
      const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
      await page.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click(); await page.waitForTimeout(80)
    }
    await page.locator(`#inCal [data-cal="${iso}"]`).first().click(); await page.waitForTimeout(120)
    if ((await page.locator('#inDates').textContent()).includes('→')) { await page.locator(`#inCal [data-cal="${iso}"]`).first().click(); await page.waitForTimeout(120) }
    if (await page.locator('#inSpan').count()) await page.locator('#inSpan [data-span="custom"]').click().catch(() => {})
    if (await page.locator('#inStartT').count()) { await page.locator('#inStartT').fill('08:00'); await page.locator('#inEndT').fill('16:00') }
    await page.locator('#inRemarks').fill('W6 Sunday duty')
    const n = await page.evaluate(() => window.INPUTS.length)
    await page.locator('#inAdd').click(); await page.waitForTimeout(700)
    return n
  }
  const sheetState = () => page.evaluate(() => {
    const s = document.querySelector('[data-testid="oilconf"]'); if (!s || !(s.offsetWidth || s.offsetHeight)) return null
    const box = s.querySelector('.sheet, .modal, [role="dialog"]') || s
    const r = box.getBoundingClientRect()
    const btns = [...s.querySelectorAll('button')].filter(b => b.offsetWidth || b.offsetHeight).map(b => { const q = b.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)
      return `${(b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24)}${b.disabled ? '(off)' : ''}${h && (h === b || b.contains(h)) ? '' : '[COVERED]'}${q.bottom > innerHeight || q.right > innerWidth ? '[OFF-SCREEN]' : ''}` })
    return { text: s.innerText.replace(/\s+/g, ' ').slice(0, 400), btns, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], vw: innerWidth, vh: innerHeight }
  })
  /* 1. it asks, before anything is written; Save waits for an answer; Cancel writes nothing */
  let n0 = await fill()
  let s1 = await sheetState()
  await shot(page, pic('R32-01-oil-sheet'))
  const n1 = await page.evaluate(() => window.INPUTS.length)
  R.ck('R32-asks-first', !!s1 && n1 === n0 && /OIL|FO|off in lieu/i.test(s1.text), 'saving a Duty input on Sunday opens the OIL question BEFORE anything is written', { s1, n0, n1 })
  R.ck('R32-save-waits', !!s1 && s1.btns.some(b => /^Save\(off\)/.test(b)), 'Save is off until an answer is picked (no default)', s1 && s1.btns)
  R.ck('R32-fits', !!s1 && s1.box[0] >= 0 && s1.box[2] <= s1.vw + 1 && s1.box[3] <= s1.vh + 1 && !s1.btns.some(b => /COVERED|OFF-SCREEN/.test(b)), 'the sheet and every button sit inside the screen, nothing over them', s1 && { box: s1.box, btns: s1.btns })
  const cancel = page.locator('[data-testid="oilconf"] button').filter({ hasText: /^Cancel$/ }).first()
  if (await cancel.count()) await cancel.click(); else await page.locator('[data-testid="oilconf"] .x').first().click()
  await page.waitForTimeout(500)
  const n2 = await page.evaluate(() => window.INPUTS.length)
  R.ck('R32-cancel-writes-nothing', n2 === n0 && !(await sheetState()), 'Cancel closes it and writes nothing', { n0, n2 })
  /* 2. Escape: the same */
  n0 = await page.evaluate(() => window.INPUTS.length)
  await page.locator('#inAdd').click(); await page.waitForTimeout(700)
  const s2 = await sheetState()
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  const n3 = await page.evaluate(() => window.INPUTS.length)
  R.ck('R32-escape-writes-nothing', !!s2 && n3 === n0 && !(await sheetState()), 'the form still filled, Save again asks again; Escape closes it and writes nothing', { asked: !!s2, n0, n3 })
  /* 3. Yes, then Save: written, one row, with its answer */
  await page.locator('#inAdd').click(); await page.waitForTimeout(700)
  const conf = page.locator('[data-testid="oilconf"]')
  await conf.locator('button').filter({ hasText: /^Yes/ }).first().click(); await page.waitForTimeout(300)
  const s3 = await sheetState()
  await shot(page, pic('R32-02-oil-sheet-answered'))
  await conf.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(700)
  const rows = await page.evaluate(p => window.INPUTS.filter(x => x.person === p && /W6 Sunday duty/.test(x.remarks || '')).map(x => ({ type: x.type, date: x.date, oil: x.oil })), person)
  R.ck('R32-yes-saves-once', rows.length === 1 && rows[0].oil && Object.keys(rows[0].oil).length > 0, 'Yes then Save writes the ONE input, carrying its OIL answer', { s3: s3 && s3.btns, rows })
  R.note('R32-toasts', await toasts(page))
})

/* ================================================================= R19 — the crew picker and ALL AVAIL (admin: the board) */
if (ADM) await step('R19', async () => {
  await board(page, THU)
  const P = [cast.A, cast.B, cast.C, 'sufa', 'pike']
  const pal = (armed) => page.evaluate(([ids]) => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const root = [...document.querySelectorAll('#sbRoster')].find(vis) || document.querySelector('#sbRoster')
    if (!root) return { err: 'NO PALETTE' }
    const one = id => { const e = [...root.querySelectorAll(`.rpuck[data-person="${id}"]`)].find(vis) || root.querySelector(`.rpuck[data-person="${id}"]`); return e ? { cls: e.className.replace('rpuck', '').trim(), why: e.getAttribute('data-why') || '', shown: vis(e), rwhy: (e.querySelector('.rwhy') || {}).innerText || '' } : 'NOT LISTED' }
    return { heads: [...root.querySelectorAll('.rh, .rh2')].map(h => h.innerText.trim()), men: Object.fromEntries(ids.map(id => [id, one(id)])) }
  }, [P])
  /* on a phone the crew palette is the drawer the arm opens — so read it armed; on the desktop read it both ways */
  let un = null
  if (!PH) { un = await pal(false); R.note('R19-palette-unarmed', un) }
  const arm = '[data-fill="a:3.0.+"]'
  await tap(page, arm); await page.waitForTimeout(500)
  const armed = await page.evaluate(() => !!(window.ARM && window.ARM.key))
  const ar = await pal(true)
  await shot(page, pic('R19-01-palette-armed-sodb'))
  R.note('R19-palette-armed', { armed, ar })
  const barred = id => ar.men && ar.men[id] && typeof ar.men[id] === 'object' && /\bno\b/.test(ar.men[id].cls)
  R.ck('R19-picker-bars-absent', armed && P.every(barred), 'with the 07:45 SODB row armed on Thursday, the palette strikes every man away then — A (LL), B (LL morning), C (ATT C), Grit (ATT C), Nomad (OD) — each with its reason', ar.men)
  if (un) R.ck('R19-palette-free-count', !(un.err) && [cast.A, cast.C, 'sufa', 'pike'].every(id => typeof un.men[id] === 'object' && /\bno\b/.test(un.men[id].cls)), 'unarmed, the whole-day absences are struck and out of the "N free" count', un)
  if (!PH) {
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    const dis = page.locator('#schedBoard [data-disarm]:visible').first(); if (await dis.count()) { await dis.click(); await page.waitForTimeout(300) }
  }
  /* ALL AVAIL on the same row: the count and its window */
  /* a phone places it the way a finger does — tap the row, tap the puck in the drawer (the driver's mouse put() misses
     on a touch phone: a driver artefact, w6-04-phone-allavail-probe.mjs) */
  let got
  if (PH) {
    /* the row is still armed from the read above (its drawer open): tap it only if it is not */
    if (!(await page.evaluate(() => !!(window.ARM && window.ARM.key)))) await W4.fingerTap(page, `#schedBoard ${arm}`)
    await W4.fingerTap(page, '#sbRoster .rpuck[data-person="allavail"]:visible')
    await page.waitForTimeout(500)
    got = (await page.evaluate(() => { const w = window.DAYS[3].allhands[0].who; return Array.isArray(w) ? w.includes('allavail') : w === 'allavail' })) ? 'allavail' : 'FAILED by finger'
  } else got = await put(page, arm, ['allavail'])
  R.note('R19-allavail-placed', got)
  const chip = page.locator('#schedBoard .oilcount[data-oilsent]:visible').first()
  const ctext = (await chip.count()) ? (await chip.innerText()).trim() : 'NO CHIP'
  if (await chip.count()) { if (PH) await W4.fingerTap(page, '#schedBoard .oilcount[data-oilsent]:visible'); else { await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await chip.click() } await page.waitForTimeout(800) }
  const win = await page.evaluate(([ids]) => {
    const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); if (!w) return { open: false }
    const men = [...w.querySelectorAll('[data-person]')].map(e => e.getAttribute('data-person'))
    const r = w.getBoundingClientRect()
    return { open: true, title: (w.querySelector('.win-ttl') || {}).innerText || '', n: new Set(men).size, absent: ids.filter(id => men.includes(id)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], text: w.innerText.replace(/\s+/g, ' ').slice(0, 300) }
  }, [P])
  await shot(page, pic('R19-02-allavail-window'))
  const num = +((/(\d+)/.exec(ctext) || [])[1] || NaN)
  R.ck('R19-allavail-excludes', got === 'allavail' && win.open && win.absent.length === 0, 'ALL AVAIL on the SODB row: its window lists nobody who is away then (A, B, C, Grit, Nomad all absent from it)', { got, ctext, win })
  R.ck('R19-allavail-count-matches', win.open && num === win.n, 'the count on the chip is the number of men in the window', { chip: ctext, inWindow: win.n })
  R.ck('R19-window-fits', win.open && win.box[0] >= 0 && win.box[2] <= (PH ? 390 : 1440) + 1, 'the window sits inside the screen', win.box)
  const x = page.locator('.availwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(300) }
  await closeBoard(page)
})

/* ================================================================= R17 — the board's Unavailable and Personal Inputs panels (admin) */
if (ADM) await step('R17', async () => {
  await board(page, FRI)
  const unav = () => page.evaluate(() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const p = [...document.querySelectorAll('#schedBoard .sb-panel.unav')].find(vis); if (!p) return 'NO PANEL'
    return [...p.querySelectorAll('.sb-arow.inprow, .sbi-row')].filter(vis).map(r => ({ who: (r.querySelector('[data-person]') || {}).dataset?.person || '?', type: ((r.querySelector('.inpty, .sbi-ty') || {}).innerText || '').trim(),
      rmk: ((r.querySelector('[data-ifld$=".rmks"]') || {}).value || (r.querySelector('.rmkin') || {}).innerText || '').trim().slice(0, 40), late: !!r.querySelector('.latechip, .latetag'), alp: !!r.querySelector('[data-alp]'), alpOn: [...r.querySelectorAll('[data-alp]')].map(e => e.getAttribute('data-ifld') || e.className.split(' ')[0]).join(',') }))
  })
  const rows = await unav()
  await page.locator('#schedBoard .sb-panel.unav:visible').first().evaluate(e => e.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(300)
  await shot(page, pic('R17-01-board-fri-unavailable'))
  R.note('R17-unavailable-rows', rows)
  const want = [cast.A, cast.B, cast.C, cast.E, cast.P1, 'sufa', 'pike']
  R.ck('R17-shows-every-absence', Array.isArray(rows) && want.every(id => rows.some(r => r.who === id)) && !rows.some(r => r.who === cast.D),
    "Friday's Unavailable panel (the working copy) lists A, B (morning), C (ATT C), E (war-approved), the LATE F, Grit and Nomad — and not the course (it lands on the Ground Programme)", rows)
  const F = Array.isArray(rows) && rows.find(r => r.who === cast.P1)
  R.note('R17-late-F-row', F)
  const cov = await covered('#schedBoard .sb-panel.unav .inprow .puck, #schedBoard .sb-panel.unav .inprow .inpedit, #schedBoard .sb-panel.unav .inprow input')
  R.ck('R17-unav-not-covered', cov.length === 0, 'nothing sits over a row\'s puck, type or boxes', cov)
  /* act: F's type opens his input; + Add opens the unavailability dialog */
  const fIid = await page.evaluate(p => (window.INPUTS.find(x => x.person === p && /W6 F late/.test(x.remarks || '')) || {}).iid, cast.P1)
  const e1 = await press(`#schedBoard .sb-panel.unav [data-inpedit="${fIid}"]`)
  const pop = await page.evaluate(() => { const p = document.querySelector('#inpEditPop'); return p && !p.hidden ? { title: (document.querySelector('#inpEditTitle') || {}).innerText, btns: [...p.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.innerText.trim().slice(0, 16) + (b.disabled ? '(off)' : '')) } : null })
  await shot(page, pic('R17-02-edit-late-F'))
  R.ck('R17-act-edit', e1.ok && pop && new RegExp(cs[cast.P1]).test(pop.title || ''), "a tap on the late leave's type opens its edit window (Save / Delete there)", { e1, pop })
  if (await page.locator('#inpEditClose:visible').count()) { await page.locator('#inpEditClose').click(); await page.waitForTimeout(300) }
  const e2 = await press('#schedBoard [data-inpadd="4.u"]')
  const pop2 = await page.evaluate(() => { const p = document.querySelector('#inpEditPop'); return p && !p.hidden ? { title: (document.querySelector('#inpEditTitle') || {}).innerText, types: [...(document.querySelector('#inpEditType') || { options: [] }).options].map(o => o.value) } : null })
  await shot(page, pic('R17-03-plus-add'))
  R.ck('R17-act-add', e2.ok && pop2 && /New input/.test(pop2.title || '') && pop2.types.includes('LL') && pop2.types.includes('ATT C'), '+ Add opens a new unavailability (leave / medical / overseas duty)', { e2, pop2 })
  if (await page.locator('#inpEditClose:visible').count()) { await page.locator('#inpEditClose').click(); await page.waitForTimeout(300) }
  /* Personal Inputs: folded, then open (the course D landed on the programme) */
  const pi0 = await page.evaluate(() => { const p = [...document.querySelectorAll('#schedBoard .sb-panel.pinp')].find(e => e.offsetWidth); return p ? p.innerText.replace(/\s+/g, ' ').slice(0, 160) : 'NO PANEL' })
  const fo = await press('#schedBoard [data-pitog="4"]')
  await page.waitForTimeout(300)
  const pi1 = await page.evaluate(() => { const p = [...document.querySelectorAll('#schedBoard .sb-panel.pinp')].find(e => e.offsetWidth); return p ? { text: p.innerText.replace(/\s+/g, ' ').slice(0, 300), rows: [...p.querySelectorAll('.inprow, .sbi-row')].map(r => (r.querySelector('[data-person]') || {}).dataset?.person + ':' + ((r.querySelector('.inpty, .sbi-ty') || {}).innerText || '').trim()) } : 'NO PANEL' })
  await page.locator('#schedBoard .sb-panel.pinp:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
  await shot(page, pic('R17-04-personal-inputs-open'))
  R.ck('R17-personal-fold', /1 input|inputs/.test(pi0) && fo.ok && pi1.rows && pi1.rows.some(r => r.startsWith(cast.D + ':CSE')), 'Personal Inputs is folded to a count, and a tap on its header opens it on the course (D, CSE, on the programme)', { pi0, pi1 })
  const pcov = await covered('#schedBoard .sb-panel.pinp .inprow .puck, #schedBoard .sb-panel.pinp .inprow .inpedit')
  R.ck('R17-personal-not-covered', pcov.length === 0, 'nothing sits over the open panel\'s rows', pcov)
  R.ck('R17-no-side-scroll', (await sideScroll()) <= 0, 'the page does not scroll sideways', await sideScroll())
  await closeBoard(page)
})
if (!ADM) await step('R17-member', async () => {
  /* a phone keeps the pages behind the menu button: open it and read what it offers */
  let menu = null
  if (PH) { const m = page.locator('.hamb:visible, #hamb:visible, button[aria-label*="menu" i]:visible').first(); if (await m.count()) { await m.click(); await page.waitForTimeout(500); menu = 'opened' } else menu = 'NO MENU BUTTON' }
  const nav = await page.evaluate(() => [...document.querySelectorAll('nav a, nav button, .topbar a, .topbar button, .navtab, .tabs button, [role="menu"] button, [role="menu"] a, [class*="drawer"] button, [class*="drawer"] a, [class*="menu"] button')].filter(e => e.offsetWidth).map(e => e.innerText.trim()).filter(Boolean))
  await shot(page, pic('R17-member-nav'))
  R.note('R17-member-nav', { menu, nav })
  /* close the menu the way a finger does: a tap on the shade beside its panel */
  if (PH) {
    const at = await page.evaluate(() => { const d = document.querySelector('#drawer.open'); if (!d) return null; const p = d.querySelector('.drawer-panel').getBoundingClientRect(); return p.right + 12 < innerWidth ? { x: p.right + 12, y: 400 } : { x: Math.max(4, p.left - 12), y: 400 } })
    if (at) { await page.touchscreen.tap(at.x, at.y); await page.waitForTimeout(500) }
    R.note('R17-member-menu-closed', !(await page.locator('#drawer.open').count()))
  }
  R.ck('R17-member-no-board', !nav.some(t => /^Edit Schedule$/i.test(t)), 'a member has no Edit Schedule (the board is the scheduler\'s — must not)', nav)
})

/* ================================================================= R30 — the pending list (admin) */
if (ADM) await step('R30', async () => {
  await editWeek(page)
  await frame(page, `#eWeek .day[data-day="${FRI}"]`)
  const chip = `#eWeek .day[data-day="${FRI}"] [data-pendlist="${FRI}"]`
  const ct = await page.locator(`${chip}:visible`).count() ? (await page.locator(`${chip}:visible`).first().innerText()).trim() : 'NO CHIP'
  const p = await press(`${chip}:visible`)
  const pl = await page.evaluate(() => { const b = document.querySelector('#pendList'); if (!b) return null; const r = b.getBoundingClientRect(); return { text: b.innerText.replace(/\s+/g, ' ').slice(0, 400), items: [...b.querySelectorAll('.pl-item, .pl-sub')].map(e => (e.tagName === 'BUTTON' ? '[tap] ' : '') + e.innerText.replace(/\s+/g, ' ').trim()), box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] } })
  await shot(page, pic('R30-01-pending-list-week'))
  R.ck('R30-names-input', p.ok && /1\s*pending/.test(ct.replace(/\u00a0/g, ' ')) && pl && pl.items.length === 1 && new RegExp(cs[cast.P1]).test(pl.items[0]) && /LL/.test(pl.items[0]),
    `"1 pending" on published Friday opens the list, and its one line names the late input (${cs[cast.P1]}'s LL)`, { ct, pl })
  R.ck('R30-list-fits', pl && pl.box[0] >= 0 && pl.box[2] <= (PH ? 390 : 1440) + 1, 'the list sits inside the screen', pl && pl.box)
  const tapItem = pl && pl.items[0] && pl.items[0].startsWith('[tap]')
  const still = await page.evaluate(() => { const e = document.querySelector('#pendList .pl-item.still'); return e ? e.title : '' })
  R.note('R30-line', { tappable: tapItem, stillTitle: still })
  if (tapItem) await press('#pendList [data-plix="0"]')
  else { const r = await page.locator('#pendList .pl-item').first().boundingBox(); if (r) { if (PH) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2) } }
  await page.waitForTimeout(250)
  const fl = await page.evaluate(() => [...document.querySelectorAll('.chgflash')].map(e => ({ cls: e.className.slice(0, 50), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60), per: (e.querySelector('[data-person]') || e.closest('[data-person]') || {}).dataset?.person || '', inView: (() => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth })() })))
  await shot(page, pic('R30-02-after-jump-week'))
  R.ck('R30-jumps', tapItem && fl.length > 0 && fl.some(f => f.inView), 'a tap on the line takes the week to that input on Friday and marks it for a moment (D99: "if they click on that area, it brings the view to that pending area")', { tapItem, still, fl, toasts: await toasts(page) })
  /* where the input's place is, all the same: its Unavailable row on Friday's working copy */
  const fIid = await page.evaluate(p => (window.INPUTS.find(x => x.person === p && /W6 F late/.test(x.remarks || '')) || {}).iid, cast.P1)
  const place = await page.evaluate(([d, iid]) => { const e = [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .sec-unav .pl-row`)].find(r => r.querySelector(`[data-person]`) && /W6 F late/.test(r.innerText)); if (!e) return 'NO ROW'; e.scrollIntoView({ block: 'center', inline: 'center' }); return e.innerText.replace(/\s+/g, ' ').slice(0, 80) }, [FRI, fIid])
  await page.waitForTimeout(300)
  await shot(page, pic('R30-02b-the-row-it-could-go-to'))
  R.note('R30-the-place-exists', place)
  /* the same on the board */
  await board(page, FRI)
  const bp = await press(`#schedBoard [data-pendlist="${FRI}"]`)
  const bl = await page.evaluate(() => { const b = document.querySelector('#pendList'); return b ? [...b.querySelectorAll('.pl-item, .pl-sub')].map(e => (e.tagName === 'BUTTON' ? '[tap] ' : '') + e.innerText.replace(/\s+/g, ' ').trim()) : null })
  await shot(page, pic('R30-03-pending-list-board'))
  if (bl && bl[0] && bl[0].startsWith('[tap]')) await press('#pendList [data-plix="0"]')
  await page.waitForTimeout(250)
  const bfl = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .chgflash')].map(e => ({ txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60), inView: (() => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight })() })))
  const tb = await toasts(page)
  await shot(page, pic('R30-04-after-jump-board'))
  R.ck('R30-board', bp.ok && bl && bl.length === 1 && (bfl.some(f => f.inView) || tb.length > 0), 'on the board the same list; its tap goes to the input (or says where it is shown)', { bl, bfl, tb })
  await closeBoard(page)
})
if (!ADM) await step('R30-member', async () => {
  await go(page, 'viewsched')
  const n = await page.locator('#vWeek [data-pendlist]:visible').count()
  R.ck('R30-member-none', n === 0, 'View-only Sched carries no pending list — "pending" is the admin\'s working copy (D177, must not)', n)
})

/* ================================================================= R18 — View-only Sched: the issued face and the working draft */
await step('R18', async () => {
  await go(page, 'viewsched'); await page.waitForTimeout(400)
  const day = `#vWeek .day[data-day="${FRI}"]`
  const face = await readUnav(page, day)
  const has = (u, id) => Array.isArray(u) && u.some(r => r.endsWith(':' + id))
  const sel = page.locator(`#vWeek select[data-vwork="${FRI}"]:visible`).first()
  const opts = (await sel.count()) ? await sel.evaluate(s => [...s.options].map(o => (o.selected ? '*' : '') + o.text)) : 'NO PICKER'
  await page.locator(`${day} .sec-unav`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  await shot(page, pic('R18-01-fri-issued-face'))
  R.ck('R18-face-as-issued', has(face, cast.A) && has(face, cast.B) && has(face, cast.C) && has(face, cast.E) && !has(face, cast.P1), 'the issued face lists A, B, C, E as it went out — and not the late F', face)
  R.ck('R18-picker', Array.isArray(opts) && opts.some(t => /as issued/.test(t)) && opts.some(t => /Working draft — not issued/.test(t)), 'the published day offers "… — as issued" and "Working draft — not issued"', opts)
  if (await sel.count()) { await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sel.selectOption('working'); await page.waitForTimeout(700) }
  const work = await readUnav(page, day)
  const bar = await page.evaluate(d => { const s = document.querySelector(d); return s ? { bar: (s.querySelector('.dprev-bar') || {}).innerText?.replace(/\s+/g, ' ') || '', stamp: [...s.querySelectorAll('.dbeak')].map(b => b.innerText.trim()).join('|') } : null }, day)
  await page.locator(`${day} .sec-unav`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  await shot(page, pic('R18-02-fri-working-draft'))
  R.ck('R18-draft-shows-input', has(work, cast.P1) && has(work, cast.A), 'the working draft shows the late F beside the others', work)
  R.ck('R18-draft-says-so', bar && /Working draft/.test(bar.bar + bar.stamp) && /not issued/.test(bar.bar + bar.stamp + (Array.isArray(opts) ? opts.join() : '')), 'the draft says it is the working draft, not what was issued', bar)
  const cov = await covered(`${day} .sec-unav .pl-row .puck, ${day} .sec-unav .pl-row .nm`)
  R.ck('R18-not-covered', cov.length === 0, 'nothing sits over the Unavailable rows (the week\'s scroll arrows included)', cov)
  if (await sel.count()) { await sel.selectOption('issued'); await page.waitForTimeout(500) }
  const back = await readUnav(page, day)
  R.ck('R18-back-to-issued', !has(back, cast.P1), 'back on "as issued" the face is as it went out', back)
})

/* ================================================================= R22 — the schedule's CSV;  R36 — print */
await step('R22-R36', async () => {
  await (ADM ? editWeek(page) : go(page, 'viewsched'))
  /* "shown" = laid out AND not hidden by a parent's visibility (the Edit Schedule page stays mounted, hidden, while
     View-only Sched is up — its buttons keep a size there: w6-05-export-probe.mjs) */
  const vis = await page.evaluate(() => { const shown = e => (e.offsetWidth || e.offsetHeight) && e.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true })
    return { csv: [...document.querySelectorAll('#exportSched')].some(shown), pdf: [...document.querySelectorAll('#exportPdf')].some(shown), page: window.CURPAGE } })
  R.note('R22-R36-buttons', vis)
  if (!ADM) {
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
    await shot(page, pic('R22-member-no-export'))
    R.ck('R22-R36-member-none', !vis.csv && !vis.pdf, 'a member has no schedule CSV or print (they sit on Edit Schedule — the export is a scheduler\'s, owner 17 Sep 26 in [FLAG-EXPORT])', vis)
    return
  }
  const xb = page.locator('#exportSched:visible').first()
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }).catch(() => null), xb.click()])
  let csv = ''
  if (dl) { const f = `${SCR}/w6-${TAG}.csv`; await dl.saveAs(f); csv = readFileSync(f, 'utf8').replace(/^\uFEFF/, '') }
  const lines = csv.split(/\r?\n/)
  const fri = lines.filter(l => /Friday/.test(l))
  R.note('R22-csv', { name: dl && dl.suggestedFilename(), head: lines[0], friday: fri })
  R.ck('R22-friday-as-issued', fri.length === 1 && /W6LINE/.test(fri[0]) && new RegExp(cs[cast.P1]).test(fri[0]), 'the CSV carries Friday\'s line as issued — W6LINE with P1 on it (the late leave changes nothing in it)', fri)
  const abs = [cast.A, cast.B, cast.C, cast.E].map(k => cs[k]).filter(n => csv.includes(n))
  R.ck('R22-no-unavailable', !/Unavailable|W6 F late|W6 A leave/.test(csv), 'the schedule CSV carries no Unavailable list at all — flying lines only (plan R22 promises "the schedule\'s Unavailable as issued": a known gap, [FLAG-EXPORT])', { absentNamesInFile: abs })
  const pb = page.locator('#exportPdf:visible').first()
  await pb.click(); await page.waitForTimeout(1200)
  const html = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe')].pop(); return f ? (f.srcdoc || '') : '' })
  const txt = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const a = txt.indexOf('Friday'), fsec = a < 0 ? 'NO FRIDAY' : txt.slice(a, a + 300)
  R.note('R36-friday', fsec)
  R.ck('R36-friday-as-issued', /Published — Original/.test(fsec) && /W6LINE/.test(fsec) && new RegExp(cs[cast.P1]).test(fsec) && !/Working draft/.test(fsec), 'the print names Friday "Published — Original" and prints W6LINE with P1, as issued', fsec)
  R.ck('R36-no-unavailable', !/W6 F late|Unavailable/.test(txt), 'the print carries no Unavailable list (flying lines only — the same known gap as the CSV)', { hasUnav: /Unavailable/.test(txt) })
  const pp = await page.context().newPage()
  await pp.setViewportSize(PH ? { width: 390, height: 844 } : { width: 1440, height: 900 })
  await pp.setContent(html); await pp.waitForTimeout(400)
  await pp.screenshot({ path: `${process.env.HP_SHOTS}/${pic('R36-01-print-page')}.png`, fullPage: true })
  await pp.close()
  R.note('R22-R36-toasts', await toasts(page))
})

R.note('errors', errors.slice(0, 20))
R.ck('no-console-errors', errors.length === 0, 'no console errors', errors.slice(0, 5))
R.save()
await o.browser.close()
