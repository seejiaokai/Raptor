// jc-probe6 - the Inputs window's controls, opened from the list's + Input and from a calendar day; nothing saved.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, go, shut } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-probe6 v1', SZ)
picsFor('jc-probe6-' + SZ)
const dump = s => s.page.evaluate(() => {
  const w = [...document.querySelectorAll('[role=dialog], .modal, .win, #inModal, #inWin')].find(e => e.getBoundingClientRect().width > 0); const root = w || document.querySelector('#page-inputs')
  return { root: w ? `${w.tagName}#${w.id}.${w.className}` : 'page', ctl: [...root.querySelectorAll('button,input,select,textarea')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.getAttribute('aria-label') ? '{' + e.getAttribute('aria-label') + '}' : ''} "${(e.value || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 22)}"`) }
})
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await step('list', async () => {
    await go(s, 'inputs'); await shut(s); await page.waitForTimeout(400)
    await page.locator('#inListBtn').filter({ visible: true }).first().click(); await page.waitForTimeout(350)
    note('list rows ' + (await page.evaluate(() => [...document.querySelectorAll('[data-iid]')].filter(e => e.getBoundingClientRect().height > 0).length)) + ' first ' + (await page.evaluate(() => { const e = [...document.querySelectorAll('[data-iid]')].find(x => x.getBoundingClientRect().height > 0); return e ? `${e.tagName} ${e.dataset.iid} ${e.innerText.replace(/\s+/g, ' ').slice(0, 80)}` : null })))
    await pic(s, '01-list')
    await page.locator('#inNew').filter({ visible: true }).first().click(); await page.waitForTimeout(400); await pic(s, '02-new'); note('new window ' + JSON.stringify(await dump(s)))
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    note('after Escape: ' + JSON.stringify((await dump(s)).root))
  })
  await step('calendar', async () => {
    await page.locator('#inCalBtn').filter({ visible: true }).first().click(); await page.waitForTimeout(350)
    note('day cells: ' + (await page.evaluate(() => { const e = document.querySelector('[data-iso], [data-date]'); return e ? `${e.tagName}.${e.className} iso=${e.dataset.iso || e.dataset.date}` : null })) + ' count ' + (await page.evaluate(() => document.querySelectorAll('[data-iso], [data-date]').length)))
  })
  await s.ctx.close()
} finally { finish('jc-probe6-' + SZ); await closeAll() }
