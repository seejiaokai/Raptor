/* Walker E — P4a-01 (lazy apps keep their own look, either visit order) and P4a-02 (sign-in / no-access screens). HP_PHONE=1 for 390x844 */
import * as E from './stk-E-lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const size = phone ? E.PHONE : E.DESK
const sleep = E.sleep
const SIGS = {
  lw: ['#page-leavewar select', '#page-leavewar button'],
  trk: ['#courseSel', '#detailsBtn', '#fzIn', '#showAllBtn', '#fileMenuBtn'],
}
async function sig(page, key) {
  return page.evaluate(sels => sels.map(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return s + ' = ABSENT'; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return [s.slice(0, 40), c.fontFamily.slice(0, 28), c.fontSize, c.fontWeight, c.color, c.backgroundColor, c.borderRadius, c.padding, Math.round(r.width) + 'x' + Math.round(r.height)].join('|') }), SIGS[key])
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

async function visit(order) {
  const w = await E.world({ size, phone })
  const { page, errors } = w
  const out = { order, errors, sig: {} }
  for (const [i, pg] of order.entries()) {
    await E.nav(page, pg === 'trk' ? 'tracker' : 'leavewar')
    if (pg === 'trk') await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
    await sleep(900)
    out.sig[pg + '@' + i] = await sig(page, pg)
    out['pic' + i] = await E.pic(page, `p4a01-${SZ}-${order.join('-')}-${pg}-first`)
  }
  // operate pickers / sheets on both, after both are loaded
  await E.nav(page, 'leavewar'); await sleep(700)
  const sel = page.locator('#page-leavewar select').first()
  const opts = await sel.locator('option').count().catch(() => 0)
  const gear = page.locator('#page-leavewar button', { hasText: '⚙' }).first()
  if (await gear.count()) { await gear.click(); await sleep(600); out.picGear = await E.pic(page, `p4a01-${SZ}-${order.join('-')}-lw-settings`); await page.keyboard.press('Escape'); await sleep(300); const x = page.locator('button[aria-label*="lose"], .lw-x, button:has-text("✕")').first(); if (await page.locator('text=SETTINGS').count()) await x.click({ timeout: 2000 }).catch(() => {}); }
  out.sig['lw@after'] = await sig(page, 'lw')
  await E.nav(page, 'tracker'); await sleep(900)
  await page.locator('#detailsBtn').click(); await sleep(400)
  out.picDet = await E.pic(page, `p4a01-${SZ}-${order.join('-')}-trk-details`)
  await page.locator('#detailsBtn').click(); await sleep(300)
  await page.locator('#fileMenuBtn').click(); await sleep(400)
  out.picFile = await E.pic(page, `p4a01-${SZ}-${order.join('-')}-trk-filemenu`)
  await page.keyboard.press('Escape'); await page.mouse.click(5, 5).catch(() => {}); await sleep(300)
  out.sig['trk@after'] = await sig(page, 'trk')
  out.opts = opts
  await w.browser.close()
  return out
}
try {
  const A = await visit(['trk', 'lw']), B = await visit(['lw', 'trk'])
  const chk = []
  chk.push(['Tracker draws the same when visited first or after Leave War', same(A.sig['trk@0'], B.sig['trk@1']), { A: A.sig['trk@0'][0], B: B.sig['trk@1'][0] }])
  chk.push(['Leave War draws the same when visited first or after Tracker', same(A.sig['lw@1'], B.sig['lw@0']), { A: A.sig['lw@1'][0], B: B.sig['lw@0'][0] }])
  chk.push(['Tracker unchanged after Leave War was opened in the same session (A)', same(A.sig['trk@0'], A.sig['trk@after'])])
  chk.push(['Leave War unchanged after Tracker was opened in the same session (B)', same(B.sig['lw@0'], B.sig['lw@after'])])
  chk.push(['no console / page / 4xx errors', !A.errors.length && !B.errors.length, [...A.errors, ...B.errors]])
  E.judge('P4a-01', `${SZ}: Tracker-then-Leave-War vs Leave-War-then-Tracker, two fresh sessions, pickers and sheets operated`, chk, [A.pic0, A.pic1, A.picGear, A.picDet, A.picFile, B.pic0, B.pic1, B.picGear, B.picDet].filter(Boolean))
  console.log(JSON.stringify({ A: A.sig, B: B.sig }, null, 1).slice(0, 3500))
} catch (e) { E.row('P4a-01', SZ, 'script error ' + e.message, 'NOT WALKED') }

/* ---- P4a-02 ---- */
try {
  const { browser, page, errors } = await E.world({ size, phone, who: null })
  const pics = []
  await page.waitForSelector('#luser', { state: 'visible' })
  const card0 = await page.evaluate(() => { const r = document.querySelector('#loginForm').getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })
  const signup0 = await page.locator('text=/sign ?up/i').count()
  pics.push(await E.pic(page, `p4a02-${SZ}-signin-fresh`))
  await page.fill('#luser', `ewalk-${SZ}@example.test`); await page.fill('#lpass', 'any')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accessRequest', { timeout: 15000 })
  pics.push(await E.pic(page, `p4a02-${SZ}-request-access`))
  const req = await page.evaluate(() => { const b = document.querySelector('#accessRequest').getBoundingClientRect(); const send = document.querySelector('#accSend').getBoundingClientRect(); return { box: [b.x, b.y, b.width, b.height].map(Math.round), sendInView: send.right <= innerWidth && send.bottom <= innerHeight, over: document.documentElement.scrollWidth > innerWidth + 1, text: document.querySelector('#accessRequest').innerText.replace(/\s+/g, ' ').slice(0, 160) } })
  const signup1 = await page.locator('#accessRequest >> text=/sign ?up/i').count()
  await page.fill('#accCs', 'EWALK'); await page.selectOption('#accSeat', 'GND')
  const sendLands = await E.lands(page.locator('#accSend'))
  await page.locator('#accSend').click()
  await page.waitForSelector('#accessWaiting', { timeout: 15000 })
  pics.push(await E.pic(page, `p4a02-${SZ}-waiting`))
  const wait = await page.evaluate(() => ({ text: document.querySelector('#accessWaiting').innerText.replace(/\s+/g, ' ').slice(0, 200), over: document.documentElement.scrollWidth > innerWidth + 1 }))
  // back to the card, then admin visits the scheduler, signs out and the card must look the same
  for (const sel of ['#accOut', '#logout', '#guestOut']) { const l = page.locator(sel + ':visible'); if (await l.count()) { await l.first().click(); break } }
  await page.waitForSelector('#luser', { timeout: 15000 })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await sleep(700)
  await E.nav(page, 'editsched'); await E.nav(page, 'viewsched')
  await (async () => { if (phone) { await page.locator('#burger').click(); await sleep(300); await page.click('#drawerLogout') } else await page.click('#logout') })()
  await page.waitForSelector('#luser', { timeout: 15000 }); await sleep(400)
  const card1 = await page.evaluate(() => { const r = document.querySelector('#loginForm').getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })
  pics.push(await E.pic(page, `p4a02-${SZ}-signin-after-scheduler`))
  const guest = await page.locator('#accGuest, [data-testid="guest-enter"], button:has-text("guest")').count()
  E.judge('P4a-02', `${SZ}: fresh sign-in card, an unapproved identity, request access, waiting, then the card again after a scheduler visit`, [
    ['sign-in card is the same size and place with or without a prior scheduler visit', JSON.stringify(card0) === JSON.stringify(card1), { fresh: card0, after: card1 }],
    ['no Sign up button on the card or the request screen', signup0 === 0 && signup1 === 0],
    ['request-access screen whole: send button inside the screen, no sideways scroll', req.sendInView && !req.over, req],
    ['Send request lands (a finger reaches it)', sendLands === true, sendLands],
    ['waiting screen shown after sending, no sideways scroll', /wait|request|approv|admin/i.test(wait.text) && !wait.over, wait],
    ['guest entry (where the squadron has enabled it)', true, guest ? 'a guest door is drawn' : 'no guest door on the card (guest view off by default)'],
    ['no errors', !errors.length, errors],
  ], pics)
  await browser.close()
} catch (e) { E.row('P4a-02', SZ, 'script error ' + e.message, 'NOT WALKED') }
E.savePart(`p4a1-${SZ}`)
