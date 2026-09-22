/* G2 follow-up — the member's view read off the VISIBLE surface, and the pucks
   that carry the green-bar class but paint no stripe. */
import { open, board, shot, go } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const PUB = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat-published.json'
const R = {}

const look = (page) => page.evaluate(() => {
  const P = window.PEOPLE
  const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
  const where = e => e.closest('#schedBoard') ? 'board' : e.closest('#vWeek') ? 'view week' : e.closest('#eWeek') ? 'edit week' : 'elsewhere'
  const pucks = [...document.querySelectorAll('.puck[data-person]')].filter(e => vis(e) && !e.closest('#sbRoster') && !e.closest('#eRoster'))
  const barred = pucks.filter(e => /oilbar-(fo|ho)/.test(e.className)).map(e => {
    const cs = getComputedStyle(e)
    return { who: (P[e.dataset.person] || {}).cs || e.dataset.person, where: where(e),
      kind: e.className.match(/oilbar-(fo|ho)/)[1] === 'fo' ? 'FULL' : 'HALF',
      painted: cs.backgroundSize.startsWith('4px'), size: cs.backgroundSize,
      title: (e.getAttribute('title') || '').slice(0, 95) }
  })
  return {
    page: window.CURPAGE,
    visiblePucks: pucks.length,
    barred: barred.length, unpainted: barred.filter(b => !b.painted),
    byPlace: barred.reduce((a, b) => { a[b.where] = (a[b.where] || 0) + 1; return a }, {}),
    sample: barred.slice(0, 8),
    chips: [...document.querySelectorAll('.oilcount, [data-oilsent]')].filter(vis).map(e => ({ where: where(e), t: e.innerText.trim(), title: e.getAttribute('title') })),
    oilButtons: [...document.querySelectorAll('[data-oilmode], #sbOil')].filter(vis).map(e => e.innerText.trim()),
    modeChrome: [...document.querySelectorAll('[data-oilitem], [data-oilp], [data-oilblank]')].filter(vis).length,
    noOil: (document.body.innerText || '').includes('NO OIL'),
    tabs: [...document.querySelectorAll('.nav a, .nav button, header a, header button')].filter(vis).map(e => e.innerText.trim()).filter(Boolean).slice(0, 14),
  }
})

/* member, desktop */
{
  const { browser, page, errors } = await open({ who: 'user', state: PUB })
  R.tabs = await page.evaluate(() => [...document.querySelectorAll('a,button')].filter(e => e.getBoundingClientRect().width > 0)
    .map(e => e.innerText.trim()).filter(t => /schedule|sched|inputs|quals|logic|leave|tracker|admin|help/i.test(t)).slice(0, 14))
  R.memberLanding = await look(page)
  await shot(page, 'G-G2-08-member-landing')
  for (const p of ['viewsched', 'editsched']) {
    await go(page, p).catch(() => {})
    await page.waitForTimeout(800)
    R['member_' + p] = await look(page)
    await shot(page, 'G-G2-09-member-' + p)
  }
  /* open a day from whatever week the member can see */
  const d = page.locator('[data-sbday]:visible, #vWeek .day .dhead:visible').first()
  R.memberDayDoors = await page.locator('[data-sbday]:visible').count()
  if (await d.count()) { await d.click().catch(() => {}); await page.waitForTimeout(900) }
  R.memberAfterDayClick = await look(page)
  await shot(page, 'G-G2-10-member-after-day-click')
  /* the chip, tapped */
  const c = page.locator('.oilcount:visible').first()
  if (await c.count()) {
    await c.scrollIntoViewIfNeeded().catch(() => {})
    await c.click({ force: true }).catch(() => {})
    await page.waitForTimeout(900)
    R.chipTap = await page.evaluate(() => {
      const vis = e => e.getBoundingClientRect().width > 0
      const pops = [...document.querySelectorAll('[role=dialog], .sheet, [class*=pop], [class*=sheet]')].filter(vis)
        .map(e => (e.innerText || '').replace(/\n+/g, ' | ').slice(0, 240))
      const opened = [...document.querySelectorAll('.oilcount')].filter(vis).length
      return { pops: pops.slice(0, 3), chipsStill: opened }
    })
    await shot(page, 'G-G2-11-member-chip-tapped')
  }
  R.errD = errors.slice(0, 6)
  await browser.close()
}
/* member, phone */
{
  const { browser, page, errors } = await open({ who: 'user', width: 390, height: 844, state: PUB })
  R.memberPhone = await look(page)
  await shot(page, 'G-G2-12-member-phone-landing')
  await go(page, 'viewsched').catch(() => {})
  await page.waitForTimeout(800)
  R.memberPhoneView = await look(page)
  await shot(page, 'G-G2-13-member-phone-viewonly')
  R.errP = errors.slice(0, 6)
  await browser.close()
}
/* the admin's own board, to list the unpainted bars */
{
  const { browser, page } = await open({ state: PUB })
  await board(page, 5)
  R.adminBoard = await look(page)
  await shot(page, 'G-G2-14-admin-board-bars')
  await browser.close()
}

writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g2b.json', JSON.stringify(R, null, 1))
const pr = (n, o) => { if (!o) return; console.log(`--- ${n} (page ${o.page}) ---`)
  console.log('  visible pucks=' + o.visiblePucks + '  with a green bar=' + o.barred + ' ' + JSON.stringify(o.byPlace) + '  unpainted=' + o.unpainted.length)
  console.log('  chips=' + JSON.stringify(o.chips) + '  OIL buttons=' + JSON.stringify(o.oilButtons) + '  mode chrome=' + o.modeChrome + '  "NO OIL"=' + o.noOil)
  console.log('  sample: ' + JSON.stringify(o.sample.slice(0, 4)))
  if (o.unpainted.length) console.log('  UNPAINTED: ' + JSON.stringify(o.unpainted)) }
console.log('member tabs:', JSON.stringify(R.tabs))
pr('member landing', R.memberLanding); pr('member View-only Sched', R.member_viewsched); pr('member Edit Schedule', R.member_editsched)
console.log('member day doors:', R.memberDayDoors)
pr('member after clicking a day', R.memberAfterDayClick)
console.log('chip tap:', JSON.stringify(R.chipTap))
pr('member phone landing', R.memberPhone); pr('member phone View-only', R.memberPhoneView)
pr('ADMIN board', R.adminBoard)
console.log('errors:', JSON.stringify({ d: R.errD, p: R.errP }))
