/* [LW-DRAG-BELOW-ZERO] walk (29 Sep 26) — his ruling D418 ("Drag asks too"): a drag across days that would take someone
   below zero asks once first, as a one-day bid does. Drives the BUILT app, desktop 1440 x 900 by mouse and phone
   390 x 844 by finger (CDP touch), through the app's own controls only. The pictures are the evidence
   (docs/handpass/2026-09-29-lw-drag-below-zero.md).

     D1  one man, a three-day drag of FCL from a balance of 0: the first tap only asks (nothing written), the same
         leave again writes, and his FCL reads -3 on his figures sheet
     D2  the other order — ask, then a DIFFERENT leave (LL, which his balance covers): written at once, no ask
     D3  a block over two men: ONE ask, naming both
     D4  ask, then Delete: Delete's own confirm takes the note; the leave tapped next asks afresh, writes nothing
     D5  the one-day sheet on a Saturday: FCL costs nothing on a weekend, so it no longer asks; a weekday still does
     D6  a member (Ranger), his own row: the drag asks him too
     D7  an afternoon beside a morning already held asks, counting the morning (Astra F1)
     D8  a man already in the red: a weekend that costs nothing does not ask (Astra F4)
     P1  the phone: hold-and-drag by finger, the ask reads whole on a phone, the second tap writes

   Serve the build first:  npm run build && npx vite preview --port 4193 --strictPort
   Run:                    node scripts/handpass/lwdz-walk.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= `${ROOT0}/docs/img/handpass/2026-09-29-lw-drag-below-zero`
process.env.AB_WHO ||= 'lwdz'
const L = await import('./ab/w4-lib.mjs')
const { openW4, lwOpen, sheetNow, sheetPress, closeSheets, rowRun, figSheet, shot, resultBook, tapCell } = L

const R = resultBook('LWDZ', `${ROOT0}/docs/handpass/parts/2026-09-29-lw-drag-below-zero.txt`)
let page
async function step(name, fn) {
  try { await fn() } catch (e) {
    R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300))
    await shot(page, `THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {})
  }
}
const ASK = /^That takes .+ to -\d+(\.5)? FCL(, .+)?\. Tap the same leave again to go ahead\.$/
const note = () => page.locator('[data-testid="sel-note"]:visible').first().innerText().catch(() => '')

/** Mouse drag from one man's day to another (same row, or another row for a block). */
async function mouseDrag(from, to) {
  await lwOpen(page, from[1])
  const a0 = page.locator(`[data-testid="cell-${from[0]}-${from[1]}"]`).first()
  await a0.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  const a = (await a0.boundingBox())
  const b = (await page.locator(`[data-testid="cell-${to[0]}-${to[1]}"]`).first().boundingBox())
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(600)
  return sheetNow(page)
}
const fcl = async id => (await figSheet(page, id)).fcl
/** The row drawn under a man's row, by the grid's own order. */
const rowAfter = id => page.evaluate(p => {
  const rows = [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4))
  return rows[rows.indexOf(p) + 1] ?? null
}, id)

/* ================================================================ DESKTOP, admin */
{
  const o = await openW4({ phone: false, who: 'a' })
  page = o.page
  const { browser, errors } = o
  const ID = 'slipway'
  const D = ['2026-01-06', '2026-01-07', '2026-01-08']   // Tue–Thu

  await step('D1', async () => {
    await lwOpen(page, D[0])
    const f0 = await fcl(ID)
    const s = await mouseDrag([ID, D[0]], [ID, D[2]])
    R.ck('D1-sheet', s.open === 'select-sheet' && /3 days/.test(s.text || ''), 'the drag opens the selection sheet for three days', { open: s.open, text: (s.text || '').slice(0, 100) })
    await sheetPress(page, 'sel-FCL')
    const n = await note()
    const cells = await rowRun(page, ID, D)
    await shot(page, 'D1-ask')
    R.ck('D1-asks', ASK.test(n) && /-3 FCL/.test(n) && cells.every(c => /·$/.test(c)), 'the first tap only asks — "That takes <him> to -3 FCL…" — and nothing is written', { note: n, cells, fclBefore: f0 })
    await sheetPress(page, 'sel-FCL')
    const after = await sheetNow(page)
    const cells2 = await rowRun(page, ID, D)
    await shot(page, 'D1-written')
    const f1 = await fcl(ID)
    R.ck('D1-second-tap-writes', after.open === 'nothing' && cells2.every(c => /FCL/.test(c)) && /^-3/.test(String(f1).replace('−', '-')), 'the same leave again writes the three days and closes the sheet; his FCL reads -3', { sheet: after.open, cells: cells2, fcl: [f0, f1] })
  })

  const D2 = ['2026-01-13', '2026-01-14', '2026-01-15']
  await step('D2', async () => {
    await mouseDrag([ID, D2[0]], [ID, D2[2]])
    await sheetPress(page, 'sel-FCL')
    const n = await note()
    await sheetPress(page, 'sel-LL')
    const after = await sheetNow(page)
    const cells = await rowRun(page, ID, D2)
    await shot(page, 'D2-other-leave-writes')
    R.ck('D2-other-leave', ASK.test(n) && after.open === 'nothing' && cells.every(c => /LL/.test(c)), 'after the ask, a different leave his balance covers (LL) writes at once — the ask belongs to the leave it was raised for', { note: n, sheet: after.open, cells })
  })

  await step('D3', async () => {
    const next = await rowAfter(ID)
    R.note('D3-rows', { first: ID, second: next })
    const E = ['2026-02-03', '2026-02-04']
    const s = await mouseDrag([ID, E[0]], [next, E[1]])
    R.ck('D3-sheet', s.open === 'select-sheet', 'a drag over two men opens one selection sheet', { open: s.open, text: (s.text || '').slice(0, 120) })
    await sheetPress(page, 'sel-FCL')
    const n = await note()
    await shot(page, 'D3-one-ask-two-men')
    R.ck('D3-one-ask', ASK.test(n) && (n.match(/ to -/g) || []).length === 2 && / and /.test(n), 'ONE ask naming both men, each with where his FCL would go', { note: n })
    await closeSheets(page)
    const cells = [...await rowRun(page, ID, E), ...await rowRun(page, next, E)]
    R.ck('D3-closed-writes-nothing', cells.every(c => /·$/.test(c)), 'closing the sheet after the ask writes nothing', { cells })
  })

  await step('D4', async () => {
    await mouseDrag([ID, D2[0]], [ID, D2[2]])            // the LL block from D2
    await sheetPress(page, 'sel-FCL')
    const n1 = await note()
    await sheetPress(page, 'sel-delete')
    const n2 = await note()
    await sheetPress(page, 'sel-FCL')
    const n3 = await note()
    const cells = await rowRun(page, ID, D2)
    await shot(page, 'D4-ask-delete-ask')
    R.ck('D4-delete-then-leave', ASK.test(n1) && /Tap Delete again/.test(n2) && ASK.test(n3) && cells.every(c => /LL/.test(c)), 'ask → Delete shows Delete\'s own confirm → the leave tapped next asks afresh; the LL stays untouched', { n1, n2, n3, cells })
    await closeSheets(page)
  })

  await step('D5', async () => {
    const SAT = '2026-01-10', MON = '2026-01-12'
    const who = 'prowler'
    const f0 = await fcl(who)
    const t = await tapCell(page, who, SAT)
    await sheetPress(page, 'bid-FCL')
    const s = await sheetNow(page)
    await shot(page, 'D5-saturday-no-ask')
    const sat = await rowRun(page, who, [SAT])
    const f1 = await fcl(who)
    R.ck('D5-saturday', t.open === 'bid-picker' && s.open === 'nothing' && /FCL/.test(sat[0]) && f1 === f0, 'one day of FCL on a Saturday costs nothing, so it writes with no ask and his FCL does not move', { open: t.open, after: s.open, cell: sat, fcl: [f0, f1], note: (s.text || '').slice(0, 160) })
    await tapCell(page, who, MON)
    await sheetPress(page, 'bid-FCL')
    const m = await sheetNow(page)
    await shot(page, 'D5-monday-asks')
    R.ck('D5-monday', m.open === 'bid-picker' && /That takes .+ to -1 FCL\. Tap the same leave again/.test(m.text || ''), 'the Monday still asks, -1 FCL', { text: (m.text || '').slice(0, 200) })
    await closeSheets(page)
  })

  /* Astra's final read (29 Sep 26), walked after the fix. D7: an afternoon beside a morning already held — the first cut
     dropped the morning and let the fill reach -0.5 unasked. D8: a man already in the red, a weekend that costs nothing —
     the first cut asked "takes him to -1" of a fill that left him at -1. */
  await step('D7', async () => {
    const who = 'prowler', DAY = '2026-01-20'
    await tapCell(page, who, DAY)
    await sheetPress(page, 'portion-am')
    await sheetPress(page, 'bid-FCL')
    const a1 = await sheetNow(page)
    await sheetPress(page, 'bid-FCL')                        // go ahead: the morning of FCL, -0.5
    const cellAm = await rowRun(page, who, [DAY])
    const s = await mouseDrag([who, DAY], [who, DAY])
    await sheetPress(page, 'sel-portion-pm')
    await sheetPress(page, 'sel-FCL')
    const n = await note()
    await shot(page, 'D7-afternoon-beside-morning')
    R.ck('D7-half-beside-half', /-0\.5 FCL/.test(a1.text || '') && /FCL/.test(cellAm[0]) && s.open === 'select-sheet' && /to -1 FCL/.test(n), 'with a morning of FCL held (-0.5), an afternoon of FCL asks, "to -1 FCL" — the morning is counted', { first: (a1.text || '').match(/That takes[^.]*\./)?.[0], cell: cellAm, sheet: s.open, note: n })
    await closeSheets(page)
  })

  await step('D8', async () => {
    const who = 'prowler', SAT = '2026-01-24'
    const f0 = await fcl(who)                                // prowler is in the red on FCL after D5 and D7
    const s = await mouseDrag([who, SAT], [who, SAT])
    await sheetPress(page, 'sel-FCL')
    const after = await sheetNow(page)
    const f1 = await fcl(who)
    await shot(page, 'D8-red-weekend-no-ask')
    R.ck('D8-red-weekend', /^-/.test(String(f0).replace('−', '-')) && s.open === 'select-sheet' && after.open === 'nothing' && f1 === f0, 'a man already in the red: a Saturday of FCL costs nothing, so it writes with no ask and his FCL stands', { fcl: [f0, f1], after: after.open })
  })

  R.ck('D-errors', errors.length === 0, 'no console errors, page errors or 4xx on the desktop walk', errors.slice(0, 8))
  await browser.close()
}

/* ================================================================ DESKTOP, member */
{
  const o = await openW4({ phone: false, who: 'us' })
  page = o.page
  const { browser, errors } = o
  await step('D6', async () => {
    await lwOpen(page, '2026-01-20')
    const me = await page.evaluate(() => {
      const c = [...document.querySelectorAll('[data-testid^="person-"]')].find(e => /ranger/i.test(e.innerText || ''))
      return c ? c.getAttribute('data-testid').slice(7) : null
    })
    R.note('D6-row', { me })
    const E = ['2026-01-20', '2026-01-21']
    const s = await mouseDrag([me, E[0]], [me, E[1]])
    await sheetPress(page, 'sel-FCL')
    const n = await note()
    await shot(page, 'D6-member-ask')
    R.ck('D6-member', s.open === 'select-sheet' && ASK.test(n) && /Ranger/i.test(n), 'the member dragging his own row is asked too, by his own callsign', { open: s.open, note: n })
    await sheetPress(page, 'sel-FCL')
    const cells = await rowRun(page, me, E)
    R.ck('D6-member-writes', cells.every(c => /FCL/.test(c)), 'and his second tap writes', { cells })
  })
  R.ck('D6-errors', errors.length === 0, 'no console errors on the member walk', errors.slice(0, 8))
  await browser.close()
}

/* ================================================================ PHONE, admin, by finger */
{
  const o = await openW4({ phone: true, who: 'a' })
  page = o.page
  const { browser, errors } = o
  const cdp = await page.context().newCDPSession(page)
  const ID = 'wolf'
  const P = ['2026-03-03', '2026-03-04', '2026-03-05']
  await step('P1', async () => {
    await lwOpen(page, P[0])
    const c0 = page.locator(`[data-testid="cell-${ID}-${P[0]}"]`).first()
    await c0.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await page.waitForTimeout(400)
    const a = await c0.boundingBox()
    const b = await page.locator(`[data-testid="cell-${ID}-${P[2]}"]`).first().boundingBox()
    const A = { x: Math.round(a.x + a.width / 2), y: Math.round(a.y + a.height / 2) }, B = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: A.x, y: A.y, id: 7 }] })
    await page.waitForTimeout(280)
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(A.x + (B.x - A.x) * i / 10), y: Math.round(A.y + (B.y - A.y) * i / 10), id: 7 }] }); await page.waitForTimeout(30) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(700)
    const s = await sheetNow(page)
    R.ck('P1-sheet', s.open === 'select-sheet' && /3 days/.test(s.text || ''), 'a hold-and-drag by finger opens the selection sheet for three days', { open: s.open, text: (s.text || '').slice(0, 100) })
    const chip = page.locator('[data-testid="sel-FCL"]:visible').first()
    const cb = await chip.boundingBox()
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2)
    await page.waitForTimeout(500)
    const n = await note()
    const fits = await page.locator('[data-testid="sel-note"]:visible').first().evaluate(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight })
    await shot(page, 'P1-phone-ask')
    R.ck('P1-asks', ASK.test(n) && fits, 'the ask shows whole on the phone, inside the screen, nothing written yet', { note: n, fits, cells: await rowRun(page, ID, P) })
    const cb2 = await chip.boundingBox()
    await page.touchscreen.tap(cb2.x + cb2.width / 2, cb2.y + cb2.height / 2)
    await page.waitForTimeout(600)
    const cells = await rowRun(page, ID, P)
    await shot(page, 'P1-phone-written')
    R.ck('P1-writes', cells.every(c => /FCL/.test(c)) && (await sheetNow(page)).open === 'nothing', 'the second tap writes the three days and the sheet closes', { cells })
  })
  R.ck('P-errors', errors.length === 0, 'no console errors on the phone walk', errors.slice(0, 8))
  await browser.close()
}

const rows = R.save()
const fails = rows.filter(r => r.startsWith('FAIL'))
console.log(`\n${rows.filter(r => r.startsWith('PASS')).length} passed, ${fails.length} failed`)
process.exit(fails.length ? 1 : 0)
