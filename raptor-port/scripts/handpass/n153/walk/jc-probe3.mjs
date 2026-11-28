// jc-probe3 - what the page holds after a reload on Admin → Users, read before any press.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, state, admCat } from './jlib.mjs'
import { reload, toUsers, rowText } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-probe3 v1', SZ)
picsFor('jc-probe3-' + SZ)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('reload', async () => {
    await toUsers(s); note('row before ' + (await rowText(s, 'prowler')))
    await reload(s); await page.waitForTimeout(1200)
    const st = await state(s); note('after reload page=' + st.page + ' bar=' + st.barMark)
    note('tiles ' + (await page.locator('#page-admin button.adm-cat').count()) + ' rows ' + (await page.locator('#page-admin [data-person]').count()))
    await pic(s, '01-after-reload')
    await toUsers(s); await page.waitForTimeout(700); await pic(s, '02-after-toUsers')
    note('after toUsers page=' + (await state(s)).page + ' tap count ' + (await page.locator('[data-person="prowler"] .acc-tap').count()) + ' row ' + (await rowText(s, 'prowler')))
    note('all people rows drawn ' + (await page.evaluate(() => [...document.querySelectorAll('[data-person="prowler"]')].map(e => `${e.tagName}.${e.className}:${Math.round(e.getBoundingClientRect().height)}`))))
  })
  await s.ctx.close()
} finally { finish('jc-probe3-' + SZ); await closeAll() }
