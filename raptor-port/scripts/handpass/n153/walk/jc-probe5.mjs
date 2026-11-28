// jc-probe5 - the controls of Admin → Squadrons' rows, the new-squadron form, Add a person, an accountless row: read only (forms opened, never saved).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, admCat } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-probe5 v1', SZ)
picsFor('jc-probe5-' + SZ)
const dump = (s, sel) => s.page.evaluate(sel => {
  const root = document.querySelector(sel); if (!root) return null
  return [...root.querySelectorAll('button,input,select,textarea,details,summary')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' ? '.' + e.className.split(/\s+/)[0] : ''}${e.getAttribute('aria-label') ? '{' + e.getAttribute('aria-label') + '}' : ''} "${(e.value || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 26)}"`)
}, sel)
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('squadrons', async () => {
    await admCat(s, 'Squadrons')
    const rowsel = '#page-admin .sq-row, #page-admin [data-sq], #page-admin [data-unit]'
    note('row-ish ' + JSON.stringify(await page.evaluate(sel => [...document.querySelectorAll(sel)].map(e => `${e.tagName}.${e.className}|${e.dataset.sq || e.dataset.unit || ''}|${e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)}`), rowsel)))
    const r142 = page.locator('#page-admin button', { hasText: /^142/ }).filter({ visible: true }).first()
    if (s.desk) await r142.click(); else await r142.tap(); await page.waitForTimeout(350)
    await pic(s, '01-sq-open'); note('sq open ' + JSON.stringify(await dump(s, '#page-admin')))
    const c = page.locator('#page-admin button', { hasText: /^Cancel$/ }).filter({ visible: true })
    if (await c.count()) { await c.first().click(); await page.waitForTimeout(250) }
    const pl = page.locator('#page-admin button', { hasText: /^Home base/ }).filter({ visible: true })
    note('home base buttons ' + (await pl.count()))
    if (await pl.count()) { await pl.last().click(); await page.waitForTimeout(350); await pic(s, '02-place-open'); note('place open ' + JSON.stringify(await dump(s, '#page-admin'))) }
    const c2 = page.locator('#page-admin button', { hasText: /^Cancel$/ }).filter({ visible: true }); if (await c2.count()) await c2.first().click()
    await page.locator('#sqNew').filter({ visible: true }).first().click(); await page.waitForTimeout(300)
    await pic(s, '03-new-sq'); note('new squadron form ' + JSON.stringify(await dump(s, '#page-admin')))
  })
  await step('users', async () => {
    await admCat(s, 'Users')
    const ids = await page.evaluate(() => [...document.querySelectorAll('#page-admin [data-person]')].filter(e => e.getBoundingClientRect().height > 0).slice(0, 2).map(e => `${e.dataset.person}:${e.innerText.replace(/\s+/g, ' ').slice(0, 30)}`)); note('first rows ' + JSON.stringify(ids))
    const first = await page.evaluate(() => [...document.querySelectorAll('#page-admin [data-person]')].find(e => /no sign-in/.test(e.innerText))?.dataset.person); note('accountless ' + first)
    const r = page.locator(`[data-person="${first}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForTimeout(350)
    await pic(s, '04-accountless'); note('accountless row ' + JSON.stringify(await page.evaluate(p => { const e = document.querySelector(`[data-person="${p}"]`); return [...e.querySelectorAll('button,input,select')].filter(x => x.getBoundingClientRect().width > 0).map(x => `${x.tagName}#${x.id} "${(x.value || x.textContent || '').trim().slice(0, 18)}"`) }, first)))
    note('add block ' + JSON.stringify(await dump(s, '#accAddBlock')))
    note('archived group ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#page-admin summary, #page-admin button')].filter(e => /Archived/.test(e.textContent) && e.getBoundingClientRect().width > 0).map(e => e.tagName + ':' + e.textContent.trim().slice(0, 24)))))
  })
  await s.ctx.close()
} finally { finish('jc-probe5-' + SZ); await closeAll() }
