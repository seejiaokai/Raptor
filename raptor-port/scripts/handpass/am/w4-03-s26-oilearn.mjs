/* w4 · S26 (Fable) — OIL Earn on the published Saturday: switch ONE man off → it is an amendment →
   publish it → on the Leave War only HIS box changes (every other man's Saturday, and every man's Friday
   and Sunday, stay exactly as they were).
   Rules: AM48a/D24 (crediting on a published day goes through an ordinary amendment), AM47/D2 (nothing moves
   until published), AM46 (the latest published version pays), AM48 (one day never moves another's OIL),
   AM25 (the Amendments panel says "what this day earns changed"), AM23 (every count agrees).
   Usage: node w4-03-s26-oilearn.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, SAT, lwOpen, lwCell, lwOilFig, lwCloseSheet, lwShot, editWeek, board, closeBoard, head,
  signDay, publishAL, shot, toastNow, clearToast, checker, go, frame, alPanel, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('S26 ' + w)
const P = 'plasma'
const pic = s => `s26-${w}-${s}`

/** Every man's box on Fri, Sat and Sun — the money, read off the war's own grid. */
async function allBoxes() {
  await lwOpen(page)
  return page.evaluate(() => {
    const o = {}
    for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
      const id = r.getAttribute('data-testid').slice(4)
      const b = d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '#' }
      o[id] = [b('2026-07-17'), b('2026-07-18'), b('2026-07-19')].join('|')
    }
    return o
  })
}
const before = await allBoxes()
await lwShot(page, pic('1-lw-before'), P)

/* ---- the board, OIL Earn on, Fable's puck on the SDO desk switched off ---- */
await board(page, SAT)
/* desktop: the board bar's OIL Earn (#sbOil); phone: the day's own control bar (data-oilmode, oilmode.ts dayBarHTML) */
const oilSel = `#schedBoard #sbOil:visible, #schedBoard [data-oilmode="${SAT}"]:visible`
const oilBtn = page.locator(oilSel).first()
ck('the OIL Earn button is on the published Saturday\'s board', (await oilBtn.count()) > 0, 'present', await oilBtn.count())
await oilBtn.evaluate(e => e.scrollIntoView({ block: 'center' }))
await oilBtn.click(); await page.waitForTimeout(800)
const puck = page.locator(`#schedBoard .oilpk[data-oilp="${P}"]:visible`).first()
const pk0 = await puck.evaluate(e => ({ item: e.dataset.oilitem, on: e.classList.contains('on'), title: e.getAttribute('title') })).catch(e => 'NO PUCK: ' + e.message)
note('Fable\'s OIL puck in the mode', pk0)
await puck.evaluate(e => e.scrollIntoView({ block: 'center' }))
await shot(page, pic('2-oilmode-before-tap'))
await clearToast(page)
await puck.click(); await page.waitForTimeout(700)
const pk1 = await page.locator(`#schedBoard .oilpk[data-oilp="${P}"]:visible`).first().evaluate(e => ({ on: e.classList.contains('on'), title: e.getAttribute('title') })).catch(e => 'gone')
note('after the tap', { puck: pk1, toast: await toastNow(page) })
ck('Fable switched off earning on the desk', pk1 && pk1.on === false, 'puck off', pk1)
await shot(page, pic('3-oilmode-after-tap'))
{ const b2 = page.locator(oilSel).first(); await b2.evaluate(e => e.scrollIntoView({ block: 'center' })); await b2.click(); await page.waitForTimeout(700) }   // leave the mode
const hb = await head(page, SAT)
note('the board head after leaving the mode', hb)
await shot(page, pic('4-board-after-mode'))
await closeBoard(page)

/* ---- the day as the week and the panel see it ---- */
await editWeek(page)
const h1 = await head(page, SAT)
const p1 = await alPanel(page)
note('edit week head', h1)
note('Amendments panel', p1)
await frame(page, `#eWeek .day[data-day="${SAT}"]`)
await shot(page, pic('5-edit-pending'))
ck('the switch-off is a pending amendment (AM48a / D24)', /1\s+pending/.test(h1.pending || ''), '1 pending', h1.pending)
if (w === 'desktop') ck('the Amendments panel names it (AM25)', /earns changed/i.test(p1), '"what this day earns changed"', p1)
/* the ⓘ day panel's own count (Fable S3 / Astra rank 4 — recorded; not in w4's list) */
await page.locator(`#eWeek [data-dayinfo="${SAT}"]:visible`).first().click().catch(() => {})
await page.waitForTimeout(600)
const info = await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 400) : 'NO PANEL' })
note('ⓘ day panel (AM23 — does it say 1 unpublished edit?)', info)
/* AM23: "N pending" agrees everywhere. Fable S3 / Astra rank 4 predicted the day panel misses an OIL-only
   change — belongs to another walker's list, recorded here because this walk passes right through it. */
ck('AM23: the ⓘ panel counts the OIL-only change too (Fable S3 / Astra 4)', /1 unpublished edit/i.test(info), '"1 unpublished edit"', info.slice(0, 160))
await shot(page, pic('6-dayinfo'))
await page.keyboard.press('Escape'); await page.mouse.click(3, 300); await page.waitForTimeout(300)

/* nothing moves on the war before the amendment goes out (AM47) */
const mid = await allBoxes()
const movedEarly = Object.keys(before).filter(id => before[id] !== mid[id])
ck('nothing moves on the war before publishing (AM47 / D2)', movedEarly.length === 0, 'no box changed', movedEarly.map(id => `${id}: ${before[id]} → ${mid[id]}`))

/* ---- sign + Publish AL1 ---- */
await editWeek(page)
note('sign', await signDay(page, SAT))
await clearToast(page)
const pub = await publishAL(page, SAT)
note('Publish AL1', { ...pub, toast: await toastNow(page) })
ck('Publish AL1 went out', pub.pressed && /AL1/.test(pub.label || ''), 'pressed "Publish AL1"', pub)
const h2 = await head(page, SAT)
note('head after AL1', h2)
await frame(page, `#eWeek .day[data-day="${SAT}"]`)
await shot(page, pic('7-edit-al1'))

const after = await allBoxes()
await lwShot(page, pic('8-lw-after-al1'), P)
const moved = Object.keys(before).filter(id => before[id] !== after[id])
note('boxes that changed (Fri|Sat|Sun)', moved.map(id => `${id}: ${before[id]} → ${after[id]}`))
ck('only Fable\'s box changed, and only on Saturday (AM48)', moved.length === 1 && moved[0] === P && before[P].split('|')[0] === after[P].split('|')[0] && before[P].split('|')[2] === after[P].split('|')[2],
  `only ${P} on Sat`, moved.map(id => `${id}: ${before[id]} → ${after[id]}`))
ck('Fable earns nothing for Saturday under AL1', after[P].split('|')[1] === '', 'empty Saturday box', after[P])
const fig = (await lwOilFig(page, P)).oil
await lwCloseSheet(page)
ck('Fable\'s OIL figure drops by the day', String(fig) === '0', '0', fig)

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
