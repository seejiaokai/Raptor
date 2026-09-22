import { open, go } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await go(page, 'inputs')
await page.selectOption('#inPerson', 'shaft'); await page.selectOption('#inType', 'Training')
await page.click('[data-cal="2026-07-17"]'); await page.waitForTimeout(200)
await page.click('[data-cal="2026-07-19"]'); await page.waitForTimeout(350)
await page.click('#inAdd'); await page.waitForTimeout(1000)
const oil = page.locator('[data-testid="oilconf"]')
await oil.getByRole('button', { name: /Only some days/ }).click(); await page.waitForTimeout(500)
console.log(JSON.stringify(await oil.evaluate(e => {
  const ds = [...e.querySelectorAll('.rc-d')]
  return ds.map(x => ({ txt: (x.innerText||'').trim(), cls: (x.className||'').toString(),
                        title: x.title||'', clickable: !!x.onclick }))
}), null, 0))
await browser.close()
