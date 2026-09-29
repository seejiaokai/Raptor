/* J1 — sign in, or ask for access: a name on no list asks; the admin lets him in. ONE tab throughout — the
   request lives in memory, so a new ?fresh=1 would lose it. */
export default async function ({ fresh, shot, signIn, signOut }) {
  const page = await fresh(null)
  await page.fill('#luser', 'viper@mail'); await page.fill('#lpass', 'x')
  await shot(page, 'signin-1', { x: 400, y: 180, w: 640, h: 480 }, [
    { n: 1, sel: '#luser' }, { n: 2, sel: '#lpass' }, { n: 3, sel: '#loginForm button[type=submit]' },
  ])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', 'Viper'); await page.fill('#accIni', 'VP')
  await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C')
  await shot(page, 'signin-2', { x: 360, y: 210, w: 720, h: 540 }, [
    { n: 4, sel: '#accCs' }, { n: 5, sel: '#accSeat' }, { n: 6, sel: '#accSend' }, { see: true, sel: '#accName' },
  ])
  await page.click('#accSend'); await page.waitForSelector('#accessWaiting')
  await shot(page, 'signin-3', { x: 400, y: 250, w: 640, h: 480 }, [
    { see: true, sel: '#accessWaiting .acc-h' }, { see: true, sel: '#accAsked' },
  ])
  await signOut(page)
  await signIn(page, 'ad', 'a'); await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.click('.nav a[data-page="admin"]'); await page.waitForFunction(() => window.CURPAGE === 'admin')
  await page.waitForTimeout(600)
  await shot(page, 'signin-4', { x: 520, y: 0, w: 640, h: 480 }, [
    { n: 7, sel: '.nav a[data-page="admin"]' }, { n: 8, sel: '#admWaiting [data-approve]' },
    { see: true, sel: '#admWaiting [data-req]' },
  ])
  await page.context().close()
}
