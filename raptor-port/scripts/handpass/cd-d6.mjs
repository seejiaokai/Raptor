/* D6 — a desk with no times at publish, and an undecided leave bid on the
   same day.  F28 / C17. */
import { open, board, shot, tap, go, type } from './lib.mjs'
import { warCells, dayWarn, signAndPublish, publishAL, BASE_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

/* catch every toast/snack that appears from now on */
async function watchToasts(page) {
  await page.evaluate(() => {
    window.__toasts = []
    const grab = n => {
      if (!(n instanceof HTMLElement)) return
      const hits = [n, ...n.querySelectorAll('*')].filter(e => /toast|snack/i.test(e.className || ''))
      hits.forEach(e => { const t = (e.innerText || '').replace(/\s+/g, ' ').trim(); if (t && !window.__toasts.includes(t)) window.__toasts.push(t) })
    }
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(grab))).observe(document.body, { childList: true, subtree: true })
  })
}
const toasts = p => p.evaluate(() => window.__toasts || [])

async function press(page, sel) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return 'no ' + sel
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  const b = await el.boundingBox(); if (!b) return 'no box'
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up()
  await page.waitForTimeout(1100)
  return 'pressed'
}


const { browser, page, errors } = await open({ state: BASE_STATE })
await board(page, di)
const FAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Fable'))
const TOR = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Torch'))
say('Saturday is unpublished; its warning list says:')
;(await dayWarn(page)).forEach(l => say('   - ' + l))
await shot(page, 'CD-D6-01-warning-list')

/* 1 — put an undecided leave bid on the SDO's Saturday */
await go(page, 'leavewar'); await page.waitForTimeout(1000)
say(await press(page, `[data-testid="cell-${FAB}-${SAT}"]`))
say('his cell sheet:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 300)))).slice(0, 700))
const ll = page.locator('[class*=sheet] button').filter({ hasText: /^LL$/ }).first()
if (await ll.count() && await ll.isVisible()) { await ll.click(); await page.waitForTimeout(1100) } else say('no LL button in the sheet')
await page.keyboard.press('Escape'); await page.waitForTimeout(600)
say('his Saturday cell now:', JSON.stringify(await warCells(page, [[FAB, SAT], [TOR, SAT]])))
await shot(page, 'CD-D6-02-bid-filed')

/* 2 — publish the day and read every toast it throws */
await board(page, di)
await watchToasts(page)
const r = await signAndPublish(page, di)
say('PUBLISH ->', (r.head || {}).headRow || r.why)
await page.waitForTimeout(1200)
say('TOASTS AT PUBLISH:')
;(await toasts(page)).forEach(t => say('   * ' + t))
await shot(page, 'CD-D6-03-publish-toasts')
say('the warning list after publishing:')
;(await dayWarn(page)).forEach(l => say('   - ' + l))
say('WAR after the publish (Fable, Torch):', JSON.stringify(await warCells(page, [[FAB, SAT], [TOR, SAT]])))
await shot(page, 'CD-D6-04-war-after-publish')

/* his day detail — does the bid survive beside the credit? */
say(await press(page, `[data-testid="cell-${FAB}-${SAT}"]`))
say('HIS DAY DETAIL:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500)))).slice(0, 1400))
await shot(page, 'CD-D6-05-day-detail')
await page.keyboard.press('Escape'); await page.waitForTimeout(500)

/* 3 — give the blind desk real times and amend */
await board(page, di)
await watchToasts(page)
const sxo = await page.evaluate(i => {
  const rows = window.DAYS[i].dutywaves.flatMap((b, bi) => b.rows.map((r, ri) => ({ bi, ri, role: r.role, str: r.str, end: r.end })))
  return rows.find(r => /SXO/i.test(r.role || ''))
}, di)
say('the blind desk is:', JSON.stringify(sxo))
if (sxo) {
  await type(page, `[data-bfld="dr:${di}.${sxo.bi}.${sxo.ri}.str"]`, '08:00')
  await type(page, `[data-bfld="dr:${di}.${sxo.bi}.${sxo.ri}.end"]`, '12:00')
}
await page.waitForTimeout(700)
say('the warning list now:')
;(await dayWarn(page)).forEach(l => say('   - ' + l))
const p2 = await publishAL(page, di)
say('AMEND ->', p2.label, await headTxt(page))
await page.waitForTimeout(1000)
say('TOASTS AT THE AMENDMENT:')
;(await toasts(page)).forEach(t => say('   * ' + t))
await shot(page, 'CD-D6-06-after-times')
const WAR = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Warden'))
say('WAR: the man on the once-blind desk:', JSON.stringify(await warCells(page, [[WAR, SAT], [FAB, SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
