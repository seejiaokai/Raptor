/* Survey 2 (26 Sep 26): what each war door opens on a fresh demo — an empty day (admin; member on his own row and on
   another's), a filed leave, a medical, an OIL day; the figures sheet; the Inputs calendar and medical views. Read only
   except where a sheet is opened and closed again. */
process.env.AB_WHO = 'survey'
const L = await import('./ab-lib.mjs')
const { open, go, lwOpen, tapCell, closeSheets, figures, inputsView, shot, sheetNow } = L
const out = {}
const J = '2026-07-'
{
  const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a' })
  await lwOpen(page, J + '15')
  out.admin_emptyRanger = await tapCell(page, 'ranger', J + '21'); await shot(page, 'd-admin-empty-ranger'); await closeSheets(page)
  out.admin_OL = await tapCell(page, 'taipan', J + '15'); await closeSheets(page)
  out.admin_ATTC = await tapCell(page, 'sufa', J + '14'); await shot(page, 'd-admin-attc'); await closeSheets(page)
  out.admin_OILbruise = await tapCell(page, 'bruise', J + '15'); await shot(page, 'd-admin-oil'); await closeSheets(page)
  out.admin_OD = await tapCell(page, 'pike', J + '16'); await closeSheets(page)
  out.figs_ranger = await figures(page, 'ranger')
  out.cal = await inputsView(page, 'cal'); await shot(page, 'd-inputs-cal')
  out.calDom = await page.evaluate(() => ({ cells: document.querySelectorAll('[data-calday], .ic-cell, .ic-day').length,
    sample: [...document.querySelectorAll('[class*="ic-"]')].slice(0, 12).map(e => e.className).join(' ; ') }))
  out.med = await inputsView(page, 'med'); await shot(page, 'd-inputs-med')
  out.adminErrors = errors.slice()
  await browser.close()
}
{
  const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'm' })
  await lwOpen(page, J + '15')
  out.member_viewing = await page.evaluate(() => (document.querySelector('[data-testid="lw-viewing"]') || {}).innerText)
  out.member_ownEmpty = await tapCell(page, 'ranger', J + '21'); await shot(page, 'd-member-own-empty'); await closeSheets(page)
  out.member_otherEmpty = await tapCell(page, 'saber', J + '21'); await shot(page, 'd-member-other-empty'); await closeSheets(page)
  out.member_otherOL = await tapCell(page, 'taipan', J + '15'); await closeSheets(page)
  out.memberErrors = errors.slice()
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
