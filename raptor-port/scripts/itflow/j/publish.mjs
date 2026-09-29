/* J3 — publish a day: Edit Schedule → the week → four sign-off names → Publish day → ORIG, seen by everyone. */
export default async function ({ fresh, go, shot }) {
  const page = await fresh()
  const C = { x: 0, y: 0, w: 560, h: 420 }
  await go(page, 'editsched')
  await shot(page, 'publish-1', C, [
    { n: 1, sel: '.nav a[data-page="editsched"]' },
    { n: 2, sel: page.locator('button.wk.on:visible').first(), pos: 'bl' },
  ])
  for (const k of ['cur', 'sked', 'plan', 'appr']) {
    const s = `select[data-sign="${k}"][data-signday="0"]`
    const v = await page.$eval(s, el => [...el.options].find(o => o.value)?.value)
    await page.selectOption(s, v)
    await page.waitForTimeout(250)
  }
  await shot(page, 'publish-2', { x: 0, y: 225, w: 560, h: 420 }, [
    { n: 3, sel: '[data-signbar="0"] .signoff, [data-signbar="0"]' },
    { n: 4, sel: 'button[data-beak="0"]', pos: 'tr' },
  ])
  await page.click('button[data-beak="0"]')
  await page.waitForTimeout(900)
  await shot(page, 'publish-3', C, [{ see: true, sel: '.dhver:visible' }, { see: true, sel: 'button.dunpub:visible' }])
  await go(page, 'viewsched')
  await shot(page, 'publish-4', C, [{ see: true, sel: '.dhver:visible' }, { see: true, sel: 'select.dver:visible' }])
  await page.context().close()
}
