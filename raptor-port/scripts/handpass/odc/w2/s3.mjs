// W2 scenario 3 — Give access, "New person", its Post in. VERSION 1
// usage: node s3.mjs desktop|phone
import { chromium } from '@playwright/test'
import { URL0, SIZES, tools, adminCategory, login } from './lib.mjs'
const WHICH = process.argv[2] || 'desktop'
console.log(`s3 VERSION 1 — ${WHICH}`)
const [W, H, TOUCH] = SIZES[WHICH]
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: TOUCH, hasTouch: TOUCH })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
const world = { page, W, H, TOUCH }
const t = tools(world, `${WHICH}-s3`)
const NAME = WHICH === 'desktop' ? 'newdesk' : 'newphone'
const CS = WHICH === 'desktop' ? 'Gizmo' : 'Pixie'
await page.goto(URL0); await page.waitForSelector('#luser')
await page.fill('#luser', NAME); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accCs')
await page.fill('#accCs', CS); await page.fill('#accIni', CS.slice(0, 2).toUpperCase())
await page.selectOption('#accSeat', { label: 'Pilot' }); await page.selectOption('#accCat', 'C')
await t.press('#accSend'); await page.waitForTimeout(600)
console.log('after request:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 200))
await t.shot('s3-requested')
await t.press('#accOut'); await page.waitForSelector('#luser')
await login(page, 'ad', 'a')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await adminCategory(page, '^Users')
const line = page.locator(`[data-approve]`)
console.log('waiting lines (Give access buttons):', await line.count())
if (!(await line.count())) { t.rec('3', WHICH, 'NOT WALKED', 'the waiting line did not appear after the request on Admin → Users', ''); await t.shot('s3-no-line'); console.log(JSON.stringify(t.results)); await browser.close(); process.exit(0) }
await line.first().scrollIntoViewIfNeeded()
await t.press('[data-approve]')
console.log('apv form ids:', await page.$$eval('[id^="apv"]', es => es.filter(e => e.getBoundingClientRect().width > 0).map(e => e.tagName + '#' + e.id + ' [' + (e.innerText || '').trim().slice(0, 25).replace(/\s+/g, ' ') + ']')))
await t.shot('s3-give-access-open')
const modeNew = page.locator('[id$="ModeNew"]').first()
await modeNew.scrollIntoViewIfNeeded(); await t.press('[id$="ModeNew"]')
const idp = await modeNew.evaluate(e => e.id.replace('ModeNew', ''))
console.log('mode prefix:', idp)
console.log('apv form ids after New person:', await page.$$eval('[id^="apv"]', es => es.filter(e => e.getBoundingClientRect().width > 0).map(e => e.tagName + '#' + e.id + ' [' + (e.innerText || '').trim().slice(0, 25).replace(/\s+/g, ' ') + ']')))
const post = `#${idp}PostIn`
console.log('post-in box present:', await page.locator(post).count())
await page.locator(post).scrollIntoViewIfNeeded()
const before = await t.text(post), bv = await t.val(post)
console.log(`S3 Post in reads "${before.replace(/\s+/g, ' ')}" (${bv}); it is a button: ${await page.locator(post).evaluate(e => e.tagName)}`)
const fit = await t.boxFits(post, '#admUsers', 'Give access Post in')
await t.shot('s3-new-person-form')
await t.press(post)
const c = await t.cardOnTop('Give access Post in')
await t.shot('s3-calendar-open')
const pickIso = t.addDays(10)
await t.pick(pickIso)
const after = await t.text(post), av = await t.val(post), gone = !(await t.vis('[data-testid="dcal-card"]'))
console.log(`S3 after the tap: "${after.replace(/\s+/g, ' ')}" (${av}); calendar gone ${gone}`)
await page.locator(post).scrollIntoViewIfNeeded()
await t.shot('s3-picked')
const toast = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.top > innerHeight * 0.6 && (e.innerText || '').trim() && e.children.length < 4 }).map(e => e.innerText.trim().replace(/\s+/g, ' ')).join(' | '))
t.rec('3', WHICH, fit.ok && c.wholly && c.onTop && av === pickIso && gone ? 'PASS' : 'CHECK', `Post in reads "${before.replace(/\s+/g, ' ')}" before; same DateBox kind (a button); box inside form=${fit.ok}; card wholly=${c.wholly} onTop=${c.onTop}; after the tap "${after.replace(/\s+/g, ' ')}" (${av}), calendar gone=${gone}`, `${WHICH}-s3-new-person-form.png / s3-calendar-open.png / s3-picked.png`)
console.log('RESULTS', JSON.stringify(t.results, null, 1))
console.log('errors', JSON.stringify(errors))
await browser.close()
