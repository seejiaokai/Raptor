/* W5 RE-WALK (26 Sep 26) — W5-F3's fix across EVERY Leave War sheet, not only the bid sheet (the first walk's (d) left
   "the tap list, the drag selection, the posting sheets, the read-only sheet" unproved). Register §12: "Every Leave War
   sheet holds the keyboard (Tab / Shift+Tab stay in the topmost sheet), and a war switch closes the open cell — its
   sheet, tap list and note editor — and the event sheet."
   For each sheet: open it the way a person does → Tab ×40 and Shift+Tab ×40, noting every stop outside the sheet →
   switch the war (JAN–DEC 27) on the Period picker (the driver's own select, since no person can reach it) → is the
   sheet gone? → back to JAN–DEC 26.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w5-06d-sheet-hold.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const Q = await import('./rw-w5-lib.mjs')
const W3 = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, bidOn } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W5-06d-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-06d-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `rw-w5-06d-${W}-${n}`
const P = 'bane'
const opts = () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? [...s.options].map(o => ({ v: o.value, t: o.text, on: o.selected })) : [] })
const setWar = async (re) => { const o = await opts(); const x = o.find(y => re.test(y.t)); if (x && !x.on) { await page.locator('[data-testid="war-picker"]').selectOption(x.v); await page.waitForTimeout(900) } return (await opts()).filter(y => y.on).map(y => y.t)[0] }

async function walkKeys() {
  const walk = []
  for (const k of ['Tab', 'Shift+Tab']) for (let i = 0; i < 40; i++) {
    await page.keyboard.press(k)
    walk.push(await page.evaluate(() => { const e = document.activeElement; if (!e) return 'none'; const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop(); return (e.getAttribute('data-testid') || e.tagName) + (d && d.contains(e) ? '@sheet' : '') }))
  }
  return walk
}
async function probe(tag, open) {
  let s
  try { s = await open() } catch (e) { s = { open: 'THREW ' + String(e.message || e).slice(0, 120) } }
  if (!s || !s.open || /nothing|THREW|NO CELL|COVERED/.test(s.open)) { R.ck(tag, false, 'the sheet opens', s); await closeSheets(page); return }
  await shot(page, pic(`${tag}-1-open`))
  const walk = await walkKeys()
  const outside = [...new Set(walk.filter(x => !/@sheet/.test(x)))]
  const still = await sheetNow(page)
  const war = await setWar(/27/)
  const after = await sheetNow(page)
  await shot(page, pic(`${tag}-2-after-war-switch`))
  R.ck(`${tag}-tab-held`, outside.length === 0 && still.open === s.open, `${s.open}: Tab / Shift+Tab (40 each) stay in the sheet`, { outside, visited: [...new Set(walk)].slice(0, 12) })
  R.ck(`${tag}-switch-closes`, /27/.test(war || '') && after.open === 'nothing', `${s.open}: a war switch closes it`, { war, after: after.open })
  await closeSheets(page)
  await setWar(/26/)
}

/* the set-up, through the app's own controls */
await fileInput(page, { person: P, type: 'LL', from: '2026-02-16', remarks: 'W5 rw whole day' })                  // → read-only sheet
const b = await bidOn(page, P, '2026-02-17', 'LL', { portion: 'pm' })                                             // → a bid …
await fileInput(page, { person: P, type: 'LL', from: '2026-02-17', span: 'am', remarks: 'W5 rw morning' })        // … and a filed morning: the tap list
const po = await Q.postOutBid(page, 'taipan', '2026-11-20', '2026-12-15', true)                                  // → the posting sheet (mid-month: a phone draws his December)
R.note('setup', { bidPM: b.placed, po })

await probe('bid-sheet', async () => { await lwOpen(page, '2026-02-18'); return tapCell(page, P, '2026-02-18') })
await probe('read-only', async () => { await lwOpen(page, '2026-02-16'); return tapCell(page, P, '2026-02-16') })
await probe('tap-list', async () => { await lwOpen(page, '2026-02-17'); return tapCell(page, P, '2026-02-17') })
await probe('posting', async () => { await lwOpen(page, '2026-12-20'); return tapCell(page, 'taipan', '2026-12-20') })
await probe('event', async () => {
  await lwOpen(page, '2026-02-18')
  const c = page.locator('[data-testid="event-1-2026-02-18"]').first()
  if (!(await c.count())) return { open: 'NO CELL' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  await c.click(); await page.waitForTimeout(600)
  return sheetNow(page)
})
await probe('selection', async () => { await lwOpen(page, '2026-02-23'); return W3.dragRect(page, P, '2026-02-23', P, '2026-02-24') })

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
