/* w4 · follow-up of S10 — un-accept then RE-accept an input whose row was ISSUED, on a published day; and the
   same after "Load onto working copy".
   The rules: AM20 — a pending mark means "differs from what was issued", not "was touched": change a thing and
   change it back and the mark clears. AM21 — a removal is a real amendment item only when something issued is
   really gone. AM11 — putting the content back restores the sign-offs. Fable's door list — loading a version
   replaces the CONTENT only; the filing state stays.
   Tuesday 14 Jul (issued Original). Hex (rocky) files an "Other" 10:00-11:00; it lands; AL1 issues it.
   A. Undo (un-accept) → → Ground (re-accept): the day should read as issued (nothing pending).
   B. Undo (un-accept) → Load AL1 onto the working copy → → Ground: the day must hold ONE row for the input.
   Usage: node w4-10-reaccept.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, editWeek, board, closeBoard, openInputs, head, signDay, publishAL, shot, toastNow, clearToast,
  checker, frame, alPanel, fileInput, planMenuItems, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('REACCEPT ' + w)
const TUE = 1, REM = 'W4 REACCEPT ' + w
const pic = s => `reacc-${w}-${s}`
const rows = () => page.evaluate(r => {
  const i = window.INPUTS.find(x => (x.remarks || '') === r); if (!i) return { acc: 'NO INPUT' }
  const key = window.DAYS[1].ground.filter(g => g.src && (g.rmks || '') === r)
  return { acc: i.acc || 'fresh', groundRows: key.length, rids: key.map(g => g.rid) }
}, REM)
async function acc(which, label) {
  await board(page, TUE); await openInputs(page, TUE)
  const iid = await page.evaluate(r => String((window.INPUTS.find(x => (x.remarks || '') === r) || {}).iid || ''), REM)
  const b = page.locator(`#schedBoard [data-acc="${which}"][data-acck="${iid}"]:visible`).first()
  const n = await b.count()
  if (n) { await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await clearToast(page); await b.click(); await page.waitForTimeout(700) }
  await shot(page, pic(label))
  const t = await toastNow(page)
  await closeBoard(page)
  note(label + ' — ' + which, { found: n, toast: t, now: await rows() })
}
async function day(label) {
  await editWeek(page)
  const h = await head(page, TUE)
  const p = await alPanel(page)
  await frame(page, `#eWeek .day[data-day="${TUE}"]`)
  await shot(page, pic(label + '-edit'))
  const r = { pending: h.pending || '(none)', signs: h.signs.join('/'), line: h.signState, alpub: h.alpub ? h.alpub.text + (h.alpub.disabled ? ' (locked)' : '') : '(none)',
    panelTue: w === 'desktop' ? ((p.match(/Tue ·[^A-Z]*/) || [''])[0]) : '(hidden on a phone)', rows: await rows() }
  note(label, r)
  return r
}

/* set up: file, land, sign, AL1 */
note('file', await fileInput(page, { person: 'rocky', type: 'Other', from: '2026-07-14', start: '10:00', end: '11:00', remarks: REM }))
await editWeek(page); await signDay(page, TUE); await clearToast(page)
note('Publish AL1', { ...(await publishAL(page, TUE)), toast: await toastNow(page) })
const r0 = await day('0-al1-issued')
ck('set-up: the input\'s row went out in AL1, nothing pending', !/pending/.test(r0.pending) && r0.rows.groundRows === 1, 'one row; nothing pending', r0)

/* A — sign on AL1, then un-accept and re-accept */
await editWeek(page); await clearToast(page)
note('sign on AL1 (nothing to publish)', await signDay(page, TUE))
await acc('x', 'A1-unaccept')
const a1 = await day('A1-after-unaccept')
ck('A1: un-accepting the issued row is a real amendment (a removal), the four cleared', /pending/.test(a1.pending) && a1.signs.split('/').every(s => /name/.test(s)), 'pending; four blank', a1)
await acc('g', 'A2-reaccept')
const a2 = await day('A2-after-reaccept')
ck('AM20: re-accepting puts the day back EXACTLY as issued — nothing pending', !/pending/.test(a2.pending), 'nothing pending, no Publish AL2', a2)
ck('AM20: the re-accepted row is the issued row (same identity), not a new one beside a removal', a2.rows.groundRows === 1 && !/removal/.test(a2.panelTue), 'one row; no "removal" in the panel', { rows: a2.rows, panel: a2.panelTue })
ck('AM11 + AM14 agree: the restored names never sit beside an open Publish button for a phantom change', !(a2.signs.split('/').every(s => !/name/.test(s)) && /Publish AL2$/.test(a2.alpub)), 'not both', { signs: a2.signs, alpub: a2.alpub, line: a2.line })

/* B — un-accept, load AL1 onto the working copy, then accept again */
await acc('x', 'B1-unaccept')
await editWeek(page)
await planMenuItems(page, TUE)
const row = page.locator('.wm[data-planpv="2026-07-14#1"]:visible').first()
if (await row.count()) {
  await row.click(); await page.waitForTimeout(700)
  for (let i = 0; i < 2; i++) {
    const ld = page.locator(`#eWeek [data-restore="${TUE}"]:visible`).first()
    if (!(await ld.count())) break
    await clearToast(page); await ld.click(); await page.waitForTimeout(700)
  }
  note('load AL1 onto the working copy', await toastNow(page))
}
const b1 = await day('B1-after-load')
ck('Fable door list: the load replaces the content only — the filing stays (row back, input still un-accepted)', b1.rows.groundRows === 1 && b1.rows.acc === 'r', 'one row (AL1\'s); the input still dormant', b1.rows)
await acc('g', 'B2-accept-after-load')
const b2 = await day('B2-after-accept')
ck('accepting after the load never leaves TWO rows for one input', b2.rows.groundRows <= 1, 'one row for the input', b2.rows)
ck('and the day reads as issued again', !/pending/.test(b2.pending), 'nothing pending', b2)

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
