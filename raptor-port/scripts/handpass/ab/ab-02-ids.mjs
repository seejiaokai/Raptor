process.env.AB_WHO = 'survey'
const L = await import('./ab-lib.mjs')
const { browser, page } = await L.open({ width: 1440, height: 900, who: 'a' })
await L.lwOpen(page, '2026-07-15')
const r = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4))
  return rows.map(k => `${k}=${(window.PEOPLE[k] || {}).cs}/${(window.PEOPLE[k] || {}).seat}/${(window.PEOPLE[k] || {}).cat || ''}`).join('  ')
})
console.log(r)
await browser.close()
