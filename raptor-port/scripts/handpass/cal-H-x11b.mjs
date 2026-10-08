/* X-11 (jump half) — a jump from a SURVIVING shared item's lines goes to that man's row, not to an unrelated input */
import * as H from './cal-H-lib.mjs'
H.setTag('x11b')
const { browser, page, errors } = await H.world({})
const DI = 2
await H.toEdit(page); await H.showDay(page, DI); await H.signDay(page, DI); await H.publishDay(page, DI)
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-15', type: 'Meeting', people: ['Ranger', 'Drifter', 'Ace'], exclude: ['Saber'], remarks: 'X11b group' })
await H.toEdit(page); await H.showDay(page, DI)
const state = () => page.evaluate(() => {
  const sel = [...document.querySelectorAll('.flash, .jumpflash, .chg-flash, .hlflash, .jump, .cwjump, [class*=flash]')].filter(e => e.offsetParent).map(e => (e.className + ' | ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80)))
  return { cp: window.CURPAGE, sb: !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0, sbday: window.SBDAY, ed: (() => { const e = document.querySelector('[data-testid="win-inputedit"]'); return e ? e.querySelector('.win-ttl').innerText : null })(), flash: sel.slice(0, 5), win: !!document.querySelector('.chgwin:not([hidden])') }
})
const kinds = async () => page.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) button[title="Go to this change"], .chgwin:not([hidden]) .still[title]')].map(e => ({ still: e.classList.contains('still'), text: e.innerText.replace(/\s+/g, ' ').slice(0, 70) })))
const res = {}
for (const tab of ['To go out', 'All changes']) {
  await H.changesWin(page, DI); await H.changesTab(page, tab)
  res[tab] = { kinds: await kinds() }
  const l = page.locator('.chgwin:not([hidden]) button[title="Go to this change"]', { hasText: /Drifter/ }).first()
  if (await l.count()) {
    await l.click(); await H.sleep(1000)
    res[tab].after = await state()
    res[tab].pic = await H.pic(page, 'jump-' + tab.replace(/ /g, ''))
    // which row is lit? read the board / week for Drifter's meeting
    res[tab].lit = await page.evaluate(() => [...document.querySelectorAll('[class*=jump], [class*=flash], .glow, .pulse, .hl-target')].filter(e => e.offsetParent).slice(0, 4).map(e => e.className + ' | ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)))
  } else res[tab].after = 'no goable line'
}
console.log(JSON.stringify(res, null, 1))
const ok = ['To go out', 'All changes'].every(t => res[t].after && typeof res[t].after === 'object' && !(res[t].after.ed && !/Drifter|\+/.test(res[t].after.ed)))
H.judge('X-11 (7) jump', 'in the changes window pressed the "Drifter · Meeting" line of a surviving shared item (To go out, then All changes)', [
  ['a goable line existed in To go out', typeof res['To go out'].after === 'object', res['To go out'].kinds.slice(0, 4)],
  ['a goable line existed in All changes', typeof res['All changes'].after === 'object', res['All changes'].kinds.slice(0, 4)],
  ['no jump opened an unrelated input\'s editor', ok, { a: res['To go out'].after, b: res['All changes'].after }],
], [res['To go out'].pic, res['All changes'].pic].filter(Boolean), res)
H.save('x11b', { errors })
console.log(errors)
await browser.close()
