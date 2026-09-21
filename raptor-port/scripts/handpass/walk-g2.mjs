/* G2 — a member, not a scheduler (Fable S37, Codex 21).  Publishes the
   everything-Saturday as the scheduler, saves that world, then opens it again
   logged in as a squadron member and looks at every surface, both widths.
   Also measures the green bar itself (it is a 4px background stripe). */
import { open, board, shot, publish, go } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const PUB = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat-published.json'
const R = {}

/* ---- as the scheduler: publish, and measure the bars ---- */
{
  const { browser, ctx, page, errors } = await open({ state: STATE })
  await board(page, di)
  R.pub = await publish(page, di)
  await page.waitForTimeout(800)
  R.barsDesktop = await page.evaluate(() => {
    const P = window.PEOPLE
    const out = []
    for (const e of document.querySelectorAll('#schedBoard .puck[data-person]')) {
      if (!e.offsetParent || e.closest('#sbRoster')) continue
      const kind = /oilbar-fo/.test(e.className) ? 'FULL' : /oilbar-ho/.test(e.className) ? 'HALF' : null
      if (!kind) continue
      const cs = getComputedStyle(e)
      out.push({ who: (P[e.dataset.person] || {}).cs, kind, size: cs.backgroundSize, pos: cs.backgroundPosition, title: (e.getAttribute('title') || '').slice(0, 80) })
    }
    return out
  })
  R.barCount = { onBoard: R.barsDesktop.length, fo: R.barsDesktop.filter(b => b.kind === 'FULL').length, ho: R.barsDesktop.filter(b => b.kind === 'HALF').length }
  await shot(page, 'G-G2-01-admin-published-board')
  /* does the word "NO OIL" appear anywhere? */
  R.noOilAdmin = await page.evaluate(() => (document.body.innerText || '').includes('NO OIL'))
  await ctx.storageState({ path: PUB })
  R.errAdmin = errors.slice(0, 6)
  await browser.close()
}

/* ---- as the member, desktop ---- */
const look = async (page, tag) => {
  const r = await page.evaluate(() => {
    const P = window.PEOPLE
    const vis = e => !!(e.offsetParent || e.getClientRects().length)
    const scope = document.querySelector('#schedBoard') ? '#schedBoard' : (document.querySelector('#vWeek') ? '#vWeek' : '#eWeek')
    const root = document.querySelector(scope) || document.body
    const bars = [...root.querySelectorAll('.puck[data-person]')].filter(e => vis(e) && !e.closest('#sbRoster'))
      .filter(e => /oilbar-(fo|ho)/.test(e.className))
      .map(e => ({ who: (P[e.dataset.person] || {}).cs, kind: /fo/.test(e.className.match(/oilbar-(fo|ho)/)[1]) ? 'FULL' : 'HALF', title: (e.getAttribute('title') || '').slice(0, 90) }))
    const chips = [...document.querySelectorAll('.oilcount, [data-oilsent]')].filter(vis)
      .map(e => ({ where: e.closest('#schedBoard') ? 'board' : e.closest('#vWeek') ? 'view week' : 'edit week', t: e.innerText.trim(), title: e.getAttribute('title') }))
    return {
      scope,
      bars: bars.slice(0, 12), nbars: bars.length,
      chips,
      oilEarnButtons: [...document.querySelectorAll('[data-oilmode], #sbOil')].filter(vis).map(e => e.innerText.trim()),
      oilModeChrome: document.querySelectorAll('[data-oilitem], [data-oilp], [data-oilblank]').length,
      noOil: (document.body.innerText || '').includes('NO OIL'),
      navTabs: [...document.querySelectorAll('.nav a, .nav button, nav a, nav button')].filter(vis).map(e => e.innerText.trim()).filter(Boolean).slice(0, 12),
    }
  })
  return { tag, ...r }
}

{
  const { browser, page, errors } = await open({ who: 'user', state: PUB })
  R.memberWeek = await look(page, 'member — edit/view week on landing')
  await shot(page, 'G-G2-02-member-week-desktop')
  /* the View-only schedule page */
  await go(page, 'viewsched').catch(async () => { await go(page, 'sched') })
  await page.waitForTimeout(700)
  R.memberViewPage = await look(page, 'member — View-only Sched')
  await shot(page, 'G-G2-03-member-viewonly-desktop')
  /* can a member open a board at all? */
  R.memberBoardDoor = await page.evaluate(() => {
    const vis = e => !!(e.offsetParent || e.getClientRects().length)
    return {
      editTabOffered: [...document.querySelectorAll('a, button')].filter(vis).some(e => /edit schedule/i.test(e.innerText || '')),
      boardDoors: document.querySelectorAll('[data-sbday]').length,
      canEdit: typeof window.HOOKS?.editMode === 'function' ? window.HOOKS.editMode() : null,
    }
  })
  const door = page.locator('[data-sbday]:visible').first()
  if (await door.count()) { await door.click().catch(() => {}); await page.waitForTimeout(900) }
  R.memberBoard = await look(page, 'member — board, if it opened')
  await shot(page, 'G-G2-04-member-board-attempt')
  /* tap the count chip */
  R.memberChipTap = await (async () => {
    const c = page.locator('.oilcount:visible, [data-oilsent]:visible').first()
    if (!await c.count()) return { chip: 'none visible' }
    const t = (await c.innerText()).trim(), ttl = await c.getAttribute('title')
    await c.click({ force: true }).catch(() => {})
    await page.waitForTimeout(800)
    const pop = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .sheet, .pop, [class*=pop]')]
      .filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\n+/g, ' | ').slice(0, 220)).slice(0, 3))
    await shot(page, 'G-G2-05-member-chip-tapped')
    return { text: t, title: ttl, popups: pop }
  })()
  R.errMemberDesktop = errors.slice(0, 6)
  await browser.close()
}

/* ---- as the member, phone ---- */
{
  const { browser, page, errors } = await open({ who: 'user', width: 390, height: 844, state: PUB })
  R.memberPhoneWeek = await look(page, 'member — week, phone')
  await shot(page, 'G-G2-06-member-week-phone')
  await go(page, 'viewsched').catch(() => {})
  await page.waitForTimeout(700)
  R.memberPhoneView = await look(page, 'member — View-only Sched, phone')
  await shot(page, 'G-G2-07-member-viewonly-phone')
  R.errMemberPhone = errors.slice(0, 6)
  await browser.close()
}

writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g2.json', JSON.stringify(R, null, 1))
console.log('publish:', JSON.stringify(R.pub), ' bars on the scheduler board:', JSON.stringify(R.barCount))
console.log('bar shape sample:', JSON.stringify(R.barsDesktop.slice(0, 4), null, 1))
console.log('"NO OIL" on the admin board:', R.noOilAdmin)
for (const k of ['memberWeek', 'memberViewPage', 'memberBoard', 'memberPhoneWeek', 'memberPhoneView']) {
  const o = R[k]; if (!o) continue
  console.log(`--- ${o.tag} (scope ${o.scope}) ---`)
  console.log('  bars=' + o.nbars + '  chips=' + JSON.stringify(o.chips) + '  OIL Earn buttons=' + JSON.stringify(o.oilEarnButtons) + '  mode chrome nodes=' + o.oilModeChrome + '  "NO OIL"=' + o.noOil)
  console.log('  sample bars: ' + JSON.stringify(o.bars.slice(0, 4)))
}
console.log('member board door:', JSON.stringify(R.memberBoardDoor))
console.log('member chip tap:', JSON.stringify(R.memberChipTap, null, 1))
console.log('errors:', JSON.stringify({ a: R.errAdmin, d: R.errMemberDesktop, p: R.errMemberPhone }))
