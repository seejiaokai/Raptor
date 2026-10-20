/* The re-walk's R3b, read on a build: where the Cancel sheet's edit list puts its first name box, against the reason box
   (21 Oct 26 — the list given room for the keyboard ring must not move). HP_URL=<build> node scripts/handpass/lk-cxedit-left.mjs */
console.log('lk-cxedit-left v1')
const { open, go } = await import('./lib.mjs')
const { browser, page } = await open({ width: 1440, height: 900 })
await go(page, 'editsched')
await page.click('#eWeek [data-sbday="1"]:visible')
await page.waitForSelector('#schedBoard:not([hidden])')
await page.locator('#schedBoard [data-pcx]:visible').first().click()
await page.locator('#cxQuick [data-cxedit]').click()
const m = await page.evaluate(() => {
  const L = (s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10] }
  return { reason: L('#cxReason'), list: L('#cxEdit .cxedit-list'), firstName: L('#cxEdit .cxedit-list .cxedit-name'), firstDel: L('#cxEdit .cxedit-del'), add: L('#cxEdit .cxedit-add .cxedit-name') }
})
console.log(process.env.HP_URL, JSON.stringify(m))
await browser.close()
