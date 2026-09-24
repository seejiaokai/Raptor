/* The HOST's re-walk of the two final code reads' fixes (evidence sheet §11/§12), written as assertions of the
   RIGHT behaviour so a PASS means correct (bug-check order §5 "the re-walk"). Builds its own world through the
   app's own controls on a fresh (persisting) context.
   - Fable #1: a ground-programme reorder on a published day blanks the four sign-offs (AM10, AM11).
   - Astra #2: the ⓘ opened beside the view page's issued face describes the ISSUED version, not the working
     copy behind it; the viewer's Working-draft peek describes the working copy (AM5, AM24).
   Usage: node hr-02-reads.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/rewalk2/hr2-${W}`
const L = await import('./am-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishDay, head, shot, go } = L
const { dragTo, closeDayInfo } = W1
const { browser, page, errors } = await open({ ...SIZE })
let pass = 0, fail = 0
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  [${W}] ${name}${ok ? '' : '  — got ' + JSON.stringify(got)}`) }
const DI = 0
const blank = (h) => h.signs.every((s) => /name|none/i.test(s))

/* the "Ground items" line of the ⓘ panel opened from the view page, for day DI */
async function viewGroundItems() {
  const b = page.locator(`#vWeek .day[data-day="${DI}"] [data-dayinfo="${DI}"]:visible`).first()
  if (!(await b.count())) return 'no ⓘ'
  await b.evaluate((e) => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await b.click(); await page.waitForTimeout(500)
  const v = await page.evaluate(() => {
    const p = document.querySelector('#dayPop:not([hidden])'); if (!p) return 'panel did not open'
    const r = [...p.querySelectorAll('.dip-r')].find((x) => (x.querySelector('.k') || {}).textContent === 'Ground items')
    return r ? r.querySelector('.v').textContent : 'no line'
  })
  await shot(page, `hr2-info-${v}`, page.locator('#dayPop .airpop-box'))
  await closeDayInfo(page)
  return v
}

await editWeek(page)
await signDay(page, DI); await publishDay(page, DI)
check('setup: Monday published (ORIG)', (await head(page, DI)).tag === 'ORIG', await head(page, DI))

// ---- Astra #2: the ⓘ beside the issued face — before any change, the baseline -----------------
await go(page, 'viewsched')
const issued = await viewGroundItems()
check('Astra #2 setup: the view page ⓘ reads a ground count', /^\d+$/.test(issued), issued)

// ---- Fable #1: a ground reorder on the published day blanks the sign-offs ---------------------
await editWeek(page)
await board(page, DI)
await signDay(page, DI)
const h0 = await head(page, DI)
check('Fable #1 setup: all four signed on the published day, nothing to publish', !blank(h0) && !h0.pending, h0)
const g = (i) => page.locator(`#schedBoard [data-move="mv:g.${DI}.${i}"] .sb-grip:visible`).first()
const r = (i) => page.locator(`#schedBoard [data-move="mv:g.${DI}.${i}"]:visible`).first()
const nRows = await page.locator(`#schedBoard [data-move^="mv:g.${DI}."]:visible`).count()
check('Fable #1 setup: the day has at least two ground rows to reorder', nRows >= 2, nRows)
const d1 = await dragTo(page, g(0), r(1))
const h1 = await head(page, DI)
await shot(page, 'hr2-after-ground-reorder')
check('Fable #1: the reorder is pending', !!h1.pending, { drag: d1, h1 })
check('Fable #1: the four sign-offs are blank — it must be signed for again (AM10, AM11)', blank(h1), h1.signs)
check('Fable #1: no open Publish AL for it on the old signatures', !h1.alpub || h1.alpub.disabled, h1.alpub)

// ---- Astra #2: add a ground row to the WORKING copy; the issued face's ⓘ must not count it ----
const add = page.locator(`#schedBoard [data-gradd="${DI}"]:visible`).first()
check('Astra #2 setup: the board offers + Row on the ground programme', (await add.count()) > 0, await add.count())
if (await add.count()) { await add.evaluate((e) => e.scrollIntoView({ block: 'center' })); await add.click(); await page.waitForTimeout(600) }
await closeBoard(page)
await go(page, 'viewsched')
const onIssued = await viewGroundItems()
check('Astra #2: beside the issued face the ⓘ counts the ISSUED ground items', onIssued === issued, { issued, onIssued })
const pick = page.locator(`#vWeek select[data-vwork="${DI}"]:visible`).first()
if (await pick.count()) { await pick.selectOption('working'); await page.waitForTimeout(600) }
const onWorking = await viewGroundItems()
check('Astra #2: beside the Working-draft peek it counts the working copy (one more)', /^\d+$/.test(issued) && +onWorking === +issued + 1, { issued, onWorking })
if (await pick.count()) { await pick.selectOption({ index: 0 }); await page.waitForTimeout(400) }

check('no console errors', errors.length === 0, errors)
console.log(`\n[${W}] ${pass} PASS · ${fail} FAIL`)
await browser.close()
