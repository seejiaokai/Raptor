// jc-probe - a first look at Admin → Users' Filter, a row's controls, Squadrons and the sign-up form: reads only.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, admCat, openRow, note, facts } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-probe v1', SZ)
picsFor('jc-probe-' + SZ)
const dump = (s, sel) => s.page.evaluate(sel => {
  const root = document.querySelector(sel); if (!root) return null
  return [...root.querySelectorAll('button,input,select,textarea,a,label')].filter(e => e.getBoundingClientRect().width > 0).map(e =>
    `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.dataset.testid ? '[t=' + e.dataset.testid + ']' : ''}${e.dataset.line ? '[l=' + e.dataset.line + ']' : ''}${e.getAttribute('aria-pressed') !== null ? '[p=' + e.getAttribute('aria-pressed') + ']' : ''}${e.getAttribute('aria-label') ? '{' + e.getAttribute('aria-label') + '}' : ''} "${(e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34)}"`)
}, sel)
try {
  const s = await newPage(SZ); const { page } = s
  await step('signup form', async () => {
    await page.goto(`http://localhost:${process.env.MQ_PORT}/`); await page.waitForSelector('#luser')
    note('login: ' + JSON.stringify(await dump(s, '#loginForm')))
    note('login page words: ' + (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400))))
    await pic(s, '00-login')
  })
  await signIn(s, 'ad', 'a')
  await step('users', async () => {
    await admCat(s, 'Users'); await pic(s, '01-users')
    note('filter: ' + JSON.stringify(await page.evaluate(() => { const b = document.querySelector('#accFilter'); return b && { t: b.textContent, h: b.getBoundingClientRect().height, cls: b.className } })))
    await page.locator('#accFilter').click(); await page.waitForTimeout(300)
    note('panel: ' + JSON.stringify(await dump(s, '#accFilterPanel'))); await pic(s, '02-filter-open')
    await page.keyboard.press('Escape'); await page.waitForTimeout(250)
    note('panel after Escape: ' + (await page.locator('#accFilterPanel').count()))
    await openRow(s, 'prowler'); await pic(s, '03-row')
    note('row: ' + JSON.stringify(await page.evaluate(() => { const a = document.querySelector('#accEdSave'); let r = a; for (let i = 0; i < 8 && r && !r.matches('[data-person]'); i++) r = r.parentElement; return r ? [...r.querySelectorAll('button,input,select,textarea')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.dataset.line ? '[l=' + e.dataset.line + ']' : ''}${e.getAttribute('aria-label') ? '{' + e.getAttribute('aria-label') + '}' : ''} "${(e.value || e.textContent || '').trim().slice(0, 26)}"`) : null })))
    await page.locator('#accEdCancel').click(); await page.waitForTimeout(300)
  })
  await step('squadrons', async () => {
    await admCat(s, 'Squadrons'); await pic(s, '04-squadrons')
    note('squadrons: ' + JSON.stringify(await dump(s, '#page-admin')))
  })
  await s.ctx.close()
} finally { finish('jc-probe-' + SZ); await closeAll() }
