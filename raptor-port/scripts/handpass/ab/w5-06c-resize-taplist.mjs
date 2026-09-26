/* W5 — PHONE ↔ DESKTOP with the war's TAP LIST open (Astra 14), in a fresh world: a day holding two records (an Inputs-filed
   morning + an afternoon bid), the tap list opened at 390 px, then the window widened to 1440 and back to 390 WITHOUT closing
   it. Expected: the list stays open, every button on screen and on top (nothing painted over it), and a button still works
   after the round trip; the figures unchanged. Usage (from raptor-port/): node scripts/handpass/ab/w5-06c-resize-taplist.mjs */
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, shot, toastSpy, resultBook, ROOT, bidOn } = L
const R = resultBook('W5-06c', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-06c.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 2 })
await toastSpy(page)
const pic = n => `w5-06c-${n}`
const P = 'bane', D = '2026-08-03'
const fa = await fileInput(page, { person: P, type: 'LL', from: D, span: 'am', remarks: 'W5 morning' })
const fb = await bidOn(page, P, D, 'LL', { portion: 'pm' })
R.note('setup', { filed: fa.added, bid: fb.placed })
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(900)
await lwOpen(page, D)
const f0 = await X.snap(page, P, [D])
const t = await tapCell(page, P, D)
const box = () => page.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth)[0]; if (!s) return null
  const b = s.getBoundingClientRect()
  const btns = [...s.querySelectorAll('button')].filter(x => x.offsetWidth).map(x => { const r = x.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: (x.innerText || x.getAttribute('aria-label') || '').trim().slice(0, 14), inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, onTop: h === x || x.contains(h) } })
  return { w: innerWidth, top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), btns } })
const ok = b => b && b.btns.length > 0 && b.btns.every(x => x.inView && x.onTop)
const p1 = await box(); await shot(page, pic('1-phone-taplist-open'))
await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900)
const p2 = await box(); await shot(page, pic('2-desktop-same-taplist'))
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(900)
const p3 = await box(); await shot(page, pic('3-phone-again'))
const s3 = await sheetNow(page)
R.ck('taplist-survives-resize', t.open === 'daylist-sheet' && ok(p1) && ok(p2) && ok(p3) && s3.open === 'daylist-sheet',
  'the tap list stays open and every button stays on screen and on top through 390 → 1440 → 390', { open: t.open, lines: t.lines, phone: p1, desktop: p2, phoneAgain: p3 })
/* a button still works after the round trip: Ack the afternoon bid */
const ack = (s3.buttons || []).find(b => /^dl-ack-/.test(b))
const a = ack ? await sheetPress(page, ack.split(':')[0]) : { pressed: false, why: 'no Ack' }
await closeSheets(page)
const c = await L.lwCell(page, P, D)
await shot(page, pic('4-after-ack'))
R.ck('button-works-after-resize', a.pressed, 'after the round trip the list\'s Ack still works', { ack: a.pressed, cell: c })
const f1 = await X.snap(page, P, [D])
R.ck('figures-unchanged', JSON.stringify(f0.figs) === JSON.stringify(f1.figs), 'the figures are the same after the resizes (an Ack moves no money)', { before: f0.figs, after: f1.figs })
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
