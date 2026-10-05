/* Walker E — P4a-03: dense schedule paint on the built Saturday (warnings, a hidden warning, amendment marks, OIL rings, long callsigns).
   Starts from the saved world file. HP_PHONE=1 for the phone. */
import * as E from './stk-E-lib.mjs'
import * as LIB from './lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const STATE = process.env.E_STATE_DIR + `/world-${SZ}.json`
const sleep = E.sleep
const { browser, ctx, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone, state: STATE })
const pics = []
async function paint(scope) {
  await page.evaluate(scope => { const e = [...document.querySelectorAll(scope + ' .puck')].find(x => x.offsetParent && !x.closest('#sbRoster,#eRoster,#crewPal')); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, scope)
  await sleep(300)
  return page.evaluate(scope => {
    const out = []
    for (const e of document.querySelectorAll(scope + ' .puck')) {
      if (!e.offsetParent || e.closest('#sbRoster,#eRoster,#crewPal')) continue
      const r = e.getBoundingClientRect(); if (r.width < 6 || r.top < 120 || r.bottom > innerHeight - 4 || r.left < 0 || r.right > innerWidth) continue
      const cs = getComputedStyle(e), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      out.push({ who: e.dataset.person, hit: !!h && (h === e || e.contains(h)), ring: cs.boxShadow !== 'none' || cs.outlineStyle !== 'none' || cs.borderTopStyle !== 'none', w: Math.round(r.width), tag: e.querySelector('.altag,.altg,.aln,[class*=altag]') ? 'tag' : '' })
    }
    return out
  }, scope)
}
const checks = []
try {
  await LIB.board(page, 5)
  await sleep(800)
  // a hidden warning: press the ✕ on the first line of the day's warning list on the board
  if (phone) { const t = page.locator('#schedBoard [data-sbwtog]').first(); if (await t.count()) { await t.click().catch(() => {}); await sleep(300) } }
  const muteBtn = page.locator('#schedBoard .sb-warn button.wln-mute').first()
  const nWarn = await page.locator('#schedBoard .sb-warn .wln[data-wix]').count()
  let hidden = 0
  if (await muteBtn.count()) { await muteBtn.scrollIntoViewIfNeeded(); await muteBtn.click(); await sleep(500); hidden = await page.locator('#schedBoard .sb-warn .wln.hid').count() }
  pics.push(await E.pic(page, `p4a03-${SZ}-board-warnings-hidden`))
  const p1 = await paint('#schedBoard')
  checks.push([`board: warning list has lines and one is now hidden (lines ${nWarn})`, nWarn > 0 && hidden >= 1, { nWarn, hidden }])
  checks.push([`board: every visible puck is what a finger lands on (${p1.length} pucks measured)`, p1.length >= 3 && p1.every(x => x.hit), p1.filter(x => !x.hit).slice(0, 4)])
  // select a puck
  const pk = page.locator('#schedBoard .puck[data-person]:visible').filter({ hasNot: page.locator('x-none') })
  const flying = page.locator('#schedBoard [data-slot="5.0.0.0.p"] .puck[data-person]').first()
  await flying.scrollIntoViewIfNeeded(); await flying.click(); await sleep(500)
  const sel = await page.evaluate(() => ({ n: document.querySelectorAll('#schedBoard .puck.sel, #schedBoard .puck.selected, #schedBoard .puck.hl, #schedBoard .puck.picked').length, sel: window.SEL ? JSON.stringify(window.SEL).slice(0, 80) : null }))
  pics.push(await E.pic(page, `p4a03-${SZ}-board-puck-selected`))
  // publish Saturday, then edit to make a pending change
  const pub = await LIB.publish(page, 5)
  await sleep(700)
  pics.push(await E.pic(page, `p4a03-${SZ}-board-published`))
  checks.push(['Saturday published through the sign-offs', pub.published === true, pub])
  await LIB.type(page, '[data-bfld="ff:5.0.0.msn"]', 'ACM')
  await sleep(600)
  const pend = await page.evaluate(() => ({ chip: (document.querySelector('#schedBoard .dpend') || {}).innerText || '', tag: (document.querySelector('#schedBoard .verchip') || {}).innerText || '' }))
  pics.push(await E.pic(page, `p4a03-${SZ}-board-pending-change`))
  checks.push(['an edit after publishing raises a pending count on the day', /pend|1/.test(pend.chip), pend])
  // the issued version, read only, then back to the working copy
  await page.locator('#schedBoard [data-planmenu]').first().click(); await sleep(400)
  const pv = page.locator('.wavemenu [data-planpv]').first()
  const havePv = await pv.count()
  if (havePv) { await pv.click(); await sleep(900) }
  const frozen = await page.locator('#schedBoard .pv-frozen').count()
  pics.push(await E.pic(page, `p4a03-${SZ}-board-issued-preview`))
  const pFrozen = await paint('#schedBoard')
  checks.push(['issued preview draws (frozen) and its pucks answer a press', havePv && frozen > 0 && pFrozen.length > 5 && pFrozen.every(x => x.hit), { havePv, frozen, n: pFrozen.length }])
  const live = page.locator('#schedBoard [data-golive="5"]'); if (await live.count()) { await live.first().click(); await sleep(800) }
  // OIL earn rings
  const oilDoor = phone ? '#sbBoard [data-oilmode="5"], #schedBoard [data-oilmode="5"]' : '#sbOil'
  let oil = page.locator(oilDoor + ':visible').first()
  if (!(await oil.count()) && phone) { await page.locator('#sbMore').click(); await sleep(300); oil = page.locator('#sbMoreOil:visible, [data-oilmode]:visible').first() }
  let rings = null
  if (await oil.count()) { await oil.click(); await sleep(900); rings = await page.evaluate(() => ({ bars: document.querySelectorAll('#schedBoard [class*="oilbar"]').length, items: document.querySelectorAll('#schedBoard [data-oilitem]').length })) }
  pics.push(await E.pic(page, `p4a03-${SZ}-board-oil-earn`))
  const pOil = await paint('#schedBoard')
  checks.push(['OIL Earn mode draws earned bars / items and pucks still answer a press', !!rings && (rings.bars > 0 || rings.items > 0) && pOil.length > 3 && pOil.every(x => x.hit), { rings, n: pOil.length }])
  if (await oil.count()) await oil.click().catch(() => {}); await sleep(500)
  // the week face of the same day
  await LIB.closeBoard(page); await sleep(500)
  await E.nav(page, 'editsched')
  await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); const sc = d.closest('.week') || d.parentElement; if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) })
  await sleep(500)
  const wl = page.locator('#eWeek .day[data-day="5"] [data-daywarn="5"]').first(); if (await wl.count()) { await wl.click().catch(() => {}); await sleep(500) }
  pics.push(await E.pic(page, `p4a03-${SZ}-week-saturday-warnings-open`))
  const pw = await paint('#eWeek .day[data-day="5"]')
  checks.push([`week face of the day: pucks answer a press (${pw.length} measured)`, pw.length > 3 && pw.every(x => x.hit), pw.filter(x => !x.hit).slice(0, 3)])
  checks.push(['no console / page / 4xx errors', !errors.length, errors])
  E.judge('P4a-03', `${SZ}: built Saturday - warnings, one hidden, selected puck, published, a pending edit, the issued preview, OIL Earn, the week face`, checks, pics)
} catch (e) {
  checks.push(['script ran to the end', false, String(e.message).split('\n')[0]])
  pics.push(await E.pic(page, `p4a03-${SZ}-FAILED`))
  E.judge('P4a-03', `${SZ}: built Saturday (stopped early)`, checks, pics)
}
await ctx.storageState({ path: process.env.E_STATE_DIR + `/world-${SZ}-pub.json` })
E.savePart(`p4a3-${SZ}`)
await browser.close()
