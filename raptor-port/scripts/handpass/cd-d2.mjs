/* D2 — previewing an issued version, and loading it back onto the working
   copy.  F23 / C14. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, bars, modeSnap, tapOilPerson, warCells, publishAL, planMenu, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))

/* ORIG is out. Deny Saber on OCU REVIEW and issue AL1. */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
say('MODE Saber pucks:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await tapOilPerson(page, 'Saber', 0)
say('MODE Saber after the tap:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p1 = await publishAL(page, di)
say('AL1:', p1.label, '->', p1.head && p1.head.headRow)
say('WAR Saber after AL1:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

/* 1 — the versions list */
const pm = await planMenu(page, di)
say('PLANS MENU:', JSON.stringify(pm.text))
say('  items:', JSON.stringify(pm.items))
await shot(page, 'CD-D2-01-plans-menu')

/* 2 — preview the ORIGINAL */
const pv = await page.evaluate(() => {
  const b = [...document.querySelectorAll('[data-planpv]')].filter(e => e.offsetParent)
  return b.map(e => ({ v: e.dataset.planpv, t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60) }))
})
say('previewable versions:', JSON.stringify(pv))
if (pv.length) {
  await page.locator(`[data-planpv="${pv[0].v}"]:visible`).first().click()
  await page.waitForTimeout(1200)
}
say('HEAD in the preview:', JSON.stringify(await dayHead(page, di)))
const inPv = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  return {
    banner: [...b.querySelectorAll('*')].filter(e => e.offsetParent && /read-only|preview|issued/i.test(e.innerText || '') && (e.innerText || '').length < 120).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).slice(0, 4),
    oilBtn: (() => { const o = document.querySelector('#sbOil'); return o ? { vis: !!o.offsetParent, disabled: o.disabled, t: (o.innerText || '').trim() } : null })(),
    barCount: [...b.querySelectorAll('.puck[data-person]')].filter(e => /oilbar/.test(e.className)).length,
  }
})
say('IN THE PREVIEW:', JSON.stringify(inPv))
say('Saber bar in the ORIGINAL preview:', JSON.stringify((await bars(page)).filter(b => b.who === 'Saber')))
await shot(page, 'CD-D2-02-preview-orig')

/* can anything be changed in a preview? */
const tried = await page.evaluate(() => {
  const o = document.querySelector('#sbOil')
  if (o && !o.disabled) { o.click(); return 'OIL Earn was clickable' }
  return 'OIL Earn is ' + (o ? (o.disabled ? 'disabled' : 'missing') : 'absent')
})
await page.waitForTimeout(800)
say('trying to enter the mode inside a preview:', tried, '| items now:', await page.evaluate(() => document.querySelectorAll('#schedBoard [data-oilitem]').length))
await shot(page, 'CD-D2-03-preview-mode-attempt')

/* 3 — load the ORIGINAL back onto the working copy */
const pm2 = await planMenu(page, di)
say('PLANS MENU while previewing:', JSON.stringify(pm2.text))
say('  items:', JSON.stringify(pm2.items))
const load = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button,[role=button]')].filter(e => e.offsetParent && /load|onto the working|restore|recover/i.test(e.innerText || ''))
  return b.map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60), d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') }))
})
say('LOAD-ONTO-WORKING-COPY doors:', JSON.stringify(load))
await shot(page, 'CD-D2-04-load-door')
if (load.length) {
  const btn = page.locator('button,[role=button]').filter({ hasText: /load|onto the working|restore|recover/i }).first()
  await btn.click(); await page.waitForTimeout(1000)
  const cf = await page.evaluate(() => [...document.querySelectorAll('.sheet,.pop,[role=dialog],.modal')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 400)))
  say('the confirm says:', JSON.stringify(cf))
  await shot(page, 'CD-D2-05-load-confirm')
  const yes = page.getByRole('button', { name: /^(Load|Yes|Confirm|Discard|Replace)/ }).first()
  if (await yes.count() && await yes.isVisible()) { await yes.click(); await page.waitForTimeout(1200) }
}
say('HEAD after the load:', (await dayHead(page, di)).headRow)
await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber after the load:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await shot(page, 'CD-D2-06-after-load')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('HEAD:', (await dayHead(page, di)).headRow)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', p2.head && p2.head.headRow, '| why:', p2.why)
say('WAR Saber at the end:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)
say('HISTORY:', JSON.stringify(await history(page)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
