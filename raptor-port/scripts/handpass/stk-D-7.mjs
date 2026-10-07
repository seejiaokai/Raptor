/* Walker D, world 7: P4c-14 follow-up — the published Remarks / Blue-Red door on the latest-published preview, kept apart from text traversal. */
import * as H from './stk-D-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
const { open, nav, openBoard, boxList, clickBox, caret, label, sleep, pic, row, savePart, scopeSel, snap, same, tap, type } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false })
page.setDefaultTimeout(9000)
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }
await nav(page, 'logic'); await page.locator('#lgEdit').click().catch(() => {}); await sleep(300); await page.locator('#lgMissionMix').check().catch(() => {}); await sleep(400)
await openBoard(page, 0)
await H.typeInto(page, page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]:visible').first(), 'ACM')
if (await page.locator('[data-role-side="later"]').count()) await page.locator('[data-role-side="later"]').first().click()
await H.typeInto(page, page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first(), 'DS FOR RU')
await sleep(400)
const asked = await page.locator('.mission-role-question').count()
if (asked) { await page.locator('[data-role-side="later"]').first().click(); await sleep(400) }   // leave it UNANSWERED so the published door has something to answer
await W.signDay(page, 0)
await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
let pub = null; for (let t = 0; t < 8; t++) { await sleep(900); pub = await W.publishDay(page, 0); if (pub.pressed) break }
await sleep(1500)
const ver = await page.evaluate(() => window.dayCurVer(0))
console.log('published', JSON.stringify(pub), ver, 'question asked', asked)
// the working copy, with the published day showing: read the Remarks box on the LIVE board of a published day
const live = await page.evaluate(() => { const e = document.querySelector('#sbBoard [data-bfld="fr:0.0.0.0"]'); return e ? { tag: e.tagName, ro: e.readOnly, dis: e.disabled, val: e.value } : null })
console.log('live remarks box', JSON.stringify(live))
// focus it: does a role button show
await clickBox(page, '#sbBoard', (await boxList(page, '#sbBoard')).findIndex(b => b.key === 'fr:0.0.0.0'))
await sleep(500)
const liveBtn = await page.evaluate(() => ({ choose: [...document.querySelectorAll('[data-role-choose]')].map(e => e.innerText), q: document.querySelectorAll('.mission-role-question').length }))
console.log('focus remarks on LIVE published day:', JSON.stringify(liveBtn))
const pics = [await pic(page, 'P4c-14-live-published-remarks-focus')]
await page.keyboard.press('Tab'); await sleep(400)
const afterTab = { q: await page.locator('.mission-role-question').count(), choose: await page.locator('[data-role-choose]').count(), c: label(await caret(page)) }
console.log('after Tab:', JSON.stringify(afterTab))
// the version menu: which versions are offered
await page.locator('#schedBoard [data-planmenu]').first().click(); await sleep(300)
const menu = await page.evaluate(() => [...document.querySelectorAll('.wavemenu [data-planpv], .wavemenu button')].map(e => (e.getAttribute('data-planpv') || '') + '|' + e.innerText.trim().slice(0, 30)))
console.log('version menu:', JSON.stringify(menu))
await page.locator(`.wavemenu [data-planpv="${ver}"]`).first().click(); await sleep(800)
const pv = await page.evaluate(() => {
  const root = document.querySelector('#sbBoard'); const hits = []
  for (const e of root.querySelectorAll('*')) { const t = (e.childElementCount === 0 && (e.innerText || '').includes('DS FOR RU')); if (t) hits.push({ tag: e.tagName, cls: String(e.className).slice(0, 30), tab: e.tabIndex, attrs: [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 20)).join(' ').slice(0, 120) }) }
  return hits
})
console.log('preview remarks element(s):', JSON.stringify(pv))
pics.push(await pic(page, 'P4c-14-preview-latest-remarks'))
const s0 = await snap(page)
if (pv.length) { await page.locator('#sbBoard').getByText('DS FOR RU').first().click({ force: true }).catch(() => {}); await sleep(500) }
const prevBtn = await page.evaluate(() => ({ choose: [...document.querySelectorAll('[data-role-choose]')].map(e => e.innerText), q: document.querySelectorAll('.mission-role-question').length, active: document.activeElement ? document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0, 20) : null }))
console.log('after pressing the Remarks text in the preview:', JSON.stringify(prevBtn))
pics.push(await pic(page, 'P4c-14-preview-remarks-pressed'))
await page.keyboard.type('QQQ', { delay: 10 }); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await sleep(300)
const s1 = await snap(page)
const roleBtn = await page.locator('[data-role-choose]').count()
let answered = null
if (roleBtn) { await page.locator('[data-role-choose]').first().click(); await sleep(500); const redBtn = page.locator('[data-role-side="red"]').first(); if (await redBtn.count()) { const before = JSON.stringify(await page.evaluate(() => [window.DAYS, window.pendCount(0), window.dayCurVer(0)])); await redBtn.click(); await sleep(700); answered = { before: before.slice(0, 60), pend: await page.evaluate(() => window.pendCount(0)), ver: await page.evaluate(() => window.dayCurVer(0)), head: await W.head(page, 0) } } }
pics.push(await pic(page, 'P4c-14-preview-after-role-answer'))
row('P4c-14-published-remarks-door', 'Tracking on, ACM + "DS FOR RU" left unanswered, Monday signed and published; looked at the Remarks box on the live published day and on the latest-published preview: focus, role button, Tab, typing QQQ', JSON.stringify({ live, liveBtn, afterTab, menu, previewRemarksElements: pv, prevBtn, typedWrote: !same(s0, s1), roleButtonsAfter: roleBtn, answered }).slice(0, 2400), 'RECORDED', pics)
console.log('errors', errors)
savePart('world7', { errors })
await browser.close()
