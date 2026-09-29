/* J12 — let people in, add a person: the Add a person form, then a sign-in for a man already on the roster. */
export default async function ({ fresh, go, shot, find }) {
  const page = await fresh()
  await go(page, 'admin')
  await page.evaluate(() => document.getElementById('accAddBlock').scrollIntoView({ block: 'center' }))
  await page.fill('#accAddCs', 'Nova'); await page.fill('#accAddIni', 'NV')
  await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
  await page.fill('#accAddName', 'nova@mail'); await page.waitForTimeout(300)
  await shot(page, 'people-1', { x: 540, y: 385, w: 620, h: 465 }, [
    { n: 1, sel: '#accAddCs' }, { n: 2, sel: '#accAddSeat' }, { n: 3, sel: '#accAddName' }, { n: 4, sel: '#accAdd' },
  ])
  await page.click('#accAdd'); await page.evaluate(() => scrollTo(0, 0)); await find(page, 'nova')
  await shot(page, 'people-2', { x: 540, y: 190, w: 640, h: 360 }, [{ see: true, sel: '#accList [data-person]' }])
  await find(page, 'ace')
  await page.click('#accList [data-person="dj"] .acc-tap'); await page.fill('#accGiveName', 'dj@mail')
  await shot(page, 'people-3', { x: 540, y: 190, w: 640, h: 360 }, [
    { n: 5, sel: '#accList [data-person="dj"] .acc-tap', pos: 'tr' }, { n: 6, sel: '#accGiveName' }, { n: 7, sel: '#accGive' },
  ])
  await page.click('#accGive'); await page.waitForTimeout(400)
  await shot(page, 'people-4', { x: 540, y: 190, w: 640, h: 360 }, [
    { see: true, sel: '[data-testid="dot-signin-dj"]' }, { see: true, sel: '#accList [data-person="dj"] .acc-sub' },
  ])
  await page.context().close()
}
