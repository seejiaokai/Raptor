/* b3-01b — ITEM 4 (D96), the LOOK of a refused template row: "every template is drawn disabled" means a reader can
   tell it from one that applies. Compares the computed style of the same template row on a published day (Tue,
   refused) and a draft day (Fri, applies), at rest and under the pointer; close-up pictures at DPR 2.
   Usage (from raptor-port/): node scripts/handpass/am/b3-01b-template-look.mjs */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, check, note, summary, installToasts, takeToasts, STATE, DESK, RESULTS } = L
import { writeFileSync } from 'node:fs'
const { browser, page, errors } = await openHi({ ...DESK, state: STATE, dpr: 2 })
await installToasts(page); await editWeek(page)
async function open(di) {
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-daytplopen="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(500)
}
async function close() { await page.keyboard.press('Escape'); await page.waitForTimeout(200); if (await page.locator('.wavemenu').count()) { await page.mouse.click(5, 895); await page.waitForTimeout(300) } }
const style = () => page.evaluate(() => {
  const b = document.querySelector('.wavemenu [data-daytplpick]'); if (!b) return null
  const c = getComputedStyle(b)
  return { disabled: b.disabled, color: c.color, opacity: c.opacity, cursor: c.cursor, border: c.borderColor, bg: c.backgroundColor }
})
/* a template to show: save Tue */
await open(1); await page.locator('.wavemenu [data-daytplsave]').click(); await page.waitForTimeout(600)
const x = page.locator('#daytplClose:visible'); if (await x.count()) { await x.click(); await page.waitForTimeout(300) }
await takeToasts(page)
await open(4); const draftRest = await style()
const menuF = page.locator('.wavemenu').last()
await menuF.screenshot({ path: `${process.env.HP_SHOTS}/d-T6-fri-draft-template-row-enabled.png` })
await close()
await open(1); const pubRest = await style()
const menuT = page.locator('.wavemenu').last()
await menuT.screenshot({ path: `${process.env.HP_SHOTS}/d-T6-tue-published-template-row-disabled.png` })
await page.locator('.wavemenu [data-daytplpick]').first().hover(); await page.waitForTimeout(250)
const pubHover = await style()
await menuT.screenshot({ path: `${process.env.HP_SHOTS}/d-T6-tue-published-template-row-hovered.png` })
await close()
note('d.T6 computed style', JSON.stringify({ draftRest, pubRest, pubHover }))
const differs = pubRest && draftRest && (pubRest.color !== draftRest.color || pubRest.opacity !== draftRest.opacity || pubRest.bg !== draftRest.bg)
check('d.T6 a refused (disabled) template row LOOKS different from one that applies (colour, fade or fill)', differs, JSON.stringify({ pub: pubRest, draft: draftRest }))
check('d.T6 a refused row does not show the pointer hand', pubRest && pubRest.cursor !== 'pointer', pubRest && pubRest.cursor)
check('d.T6 a refused row does not light up under the pointer like a live choice', pubHover && pubRest && pubHover.color === pubRest.color && pubHover.border === pubRest.border, JSON.stringify({ rest: pubRest, hover: pubHover }))
check('d.T6 no browser errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
const f = summary('b3-01b-template-look')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-01b.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = f ? 1 : 0
