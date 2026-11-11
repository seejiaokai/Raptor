/* pdl-rw-r1-phone v1 — R1 on the phone (402x874, isMobile, hasTouch, TAP). The fixture is built in a desktop world (published Tue 28 Jul,
   Ranger 12:00-13:00, BRIEFING 14:30-15:00 with ALL AVAIL, debrief -> 3h), its saved browser storage carried to a phone context on the same address. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL = 'http://localhost:4292'
process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/rewalk/r1-phone')
console.log('pdl-rw-r1-phone v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic } = P
const FX = await import('../rcf/rcf-w2-fx.mjs')
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { to: '1200', ld: '1300', who: w.ID('Ranger') })
const g = await P.ground(w, 1, { prog: 'BRIEFING', str: '1430', end: '1500', who: null })
const from = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
await from.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
const to = page.locator(`#schedBoard [data-fill="g:1.${g.ri}.+"]:visible`).first()
await to.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
await FX.dragBox(page, from, to)
const gr = await page.evaluate(() => JSON.stringify(window.DAYS[1].ground.map(x => x.prog + ' ' + x.str + '-' + x.end + ' ' + x.who)))
check('R1P.0 fixture: ground row holds ALL AVAIL', /allavail/.test(gr), gr)
await L.closeBoard(page)
const sp = await X.signAndPublish(w, 1)
console.log('publish', JSON.stringify({ p: sp.p, tag: sp.h.tag }))
await L.closeBoard(page)
const lg = await P.setLogic(w, 'debrief', '3h')
console.log('debrief', JSON.stringify(lg))
await sleep(600)
const state = await w.ctx.storageState()
console.log('storage origins', JSON.stringify(state.origins.map(o => o.origin + ':' + o.localStorage.length)))
const desktopErrors = w.errors.slice()
await w.browser.close()

/* phone */
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, storageState: state })
const ph = await ctx.newPage()
const errors = []
ph.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
ph.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
ph.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
await ph.goto(process.env.HP_URL + '/')
await ph.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
const signedIn = await ph.locator('#luser:visible').count() ? 'login card shown' : 'no login card'
console.log('phone start', signedIn)
if (await ph.locator('#luser:visible').count()) await L.login(ph, 'a')
await sleep(800)
const phone = { page: ph, phone: true, errors }
const shot = n => ph.screenshot({ path: `${P.SHOTS}/${n}.png` })
console.log('phone week nav', JSON.stringify(await P.toWeek(ph, '2026-07-27')))
await sleep(500)
const dbg = await ph.evaluate(() => ({ week: window.CURWEEK, d1: window.DAYS && window.DAYS[1].dt, lines: window.DAYS && window.DAYS[1].ground.map(x => x.prog + ' ' + x.who).join(';'), debrief: window.VCONF && window.VCONF.debrief }))
console.log('phone world', JSON.stringify(dbg))
check('R1P.1 phone world holds the fixture (ground row ALL AVAIL on Tuesday 28 Jul)', /allavail/.test(dbg.lines || '') && dbg.d1 === '2026-07-28', JSON.stringify(dbg))
await L.board(ph, 1).catch(e => console.log('board err', e.message)); await sleep(800)
await shot('r1p-01-board-open')
const chip = ph.locator('#schedBoard .oilcount:visible').first()
check('R1P.2 the ALL AVAIL chip is on the phone board', (await chip.count()) > 0, String(await chip.count()))
await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
await shot('r1p-02-before-tap')
await ph.evaluate(() => { window.__seen = new WeakSet([...document.querySelectorAll('body *')]) })
await chip.tap(); await sleep(60); await shot('r1p-03-60ms-after-tap'); await sleep(900); await shot('r1p-04-settled')
const win = await ph.evaluate(() => {
  const fresh = [...document.querySelectorAll('body *')].filter(e => !window.__seen.has(e) && e.offsetWidth)
  return fresh.filter(e => !fresh.includes(e.parentElement)).map(e => ({ cls: String(e.className).slice(0, 60), text: e.innerText.replace(/[\s ]+/g, ' ').slice(0, 2500) }))
})
console.log('WIN', JSON.stringify(win))
const txt = win.map(x => x.text).join(' | ')
const reason = (txt.match(/Not enough time to attend[^(]*\(land \+ \d+h\)/) || ['(no reason shown)'])[0]
note('R1P phone reason (RECORD)', reason)
check('R1P.3 phone published Tuesday: Ranger reason reads (land + 2h)', /land \+ 2h/.test(reason), reason)
await shot('r1p-05-final')
console.log('ERRORS desktop', JSON.stringify(desktopErrors), 'phone', JSON.stringify(errors))
const { writeFileSync } = await import('node:fs')
writeFileSync(P.SHOTS + '/results.json', JSON.stringify({ results: X.RESULTS, desktopErrors, errors, win }, null, 1))
await browser.close()
