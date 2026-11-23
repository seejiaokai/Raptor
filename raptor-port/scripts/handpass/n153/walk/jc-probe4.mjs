// jc-probe4 - the Inputs page's filter button on a phone and its panel, read only (a tick pressed to see the on-state).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, go } from './jlib.mjs'
const SZ = process.env.SZ || 'p'
console.log('jc-probe4 v1', SZ)
picsFor('jc-probe4-' + SZ)
const dump = (s, sel) => s.page.evaluate(sel => {
  const root = document.querySelector(sel); if (!root) return null
  return [...root.querySelectorAll('button,input,select')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.getAttribute('aria-pressed') !== null ? '[p=' + e.getAttribute('aria-pressed') + ']' : ''}${e.getAttribute('aria-label') ? '{' + e.getAttribute('aria-label') + '}' : ''} "${(e.value || e.textContent || '').trim().slice(0, 28)}"`)
}, sel)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('inputs', async () => {
    await go(s, 'inputs'); await page.waitForTimeout(600)
    if ((await page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open')))) { await page.touchscreen.tap(395, 500); await page.waitForTimeout(400) }
    await pic(s, '01-inputs')
    note('page buttons ' + JSON.stringify((await dump(s, '#page-inputs') || []).slice(0, 30)))
    note('fbtn ' + JSON.stringify(await page.evaluate(() => { const b = document.querySelector('#inFiltersBtn'); if (!b) return null; const r = b.getBoundingClientRect(), c = getComputedStyle(b); return { t: b.textContent.trim(), h: r.height, w: r.width, x: r.x, y: r.y, bg: c.backgroundColor, bd: c.borderTopColor, col: c.color, cls: b.className, kids: [...b.children].map(k => k.tagName + '.' + k.className) } })))
    const fb = page.locator('#inFiltersBtn').filter({ visible: true })
    if (await fb.count()) {
      await fb.first().click(); await page.waitForTimeout(350); await pic(s, '02-filters-open')
      note('panel ' + JSON.stringify(await dump(s, '#inFilters')))
      note('panel words ' + (await page.evaluate(() => document.querySelector('#inFilters')?.innerText.replace(/\s+/g, ' ').slice(0, 300))))
    }
  })
  await s.ctx.close()
} finally { finish('jc-probe4-' + SZ); await closeAll() }
