import { browser, fresh, go, cap, center, around, mid, menuDump, toastOf, typeIn, modals, mdrag, errors, SP } from './lib.mjs'
const log = (...a) => console.log(...a)
const cell = (page, sel) => page.locator(sel).first().innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => 'ABSENT')
const ONLY = process.argv[2]
const run = async (name, fn) => { if (ONLY && !ONLY.split(',').includes(name)) return; log('\n=== ' + name); const page = await fresh(); await go(page, 'editsched'); try { await fn(page) } catch (e) { log('ERR', e.message.split('\n')[0]) } await page.context().close() }

// B2 tap-to-arm on the week: tap empty + ADD, then tap a name
await run('arm-week', async (page) => {
  await page.click('#eWeek [data-fill="a:0.0.+"]'); await page.waitForTimeout(500)
  log('ARM', await page.evaluate(() => window.ARM ? JSON.stringify(window.ARM) : 'none'))
  log('armed classes', await page.evaluate(() => [...document.querySelectorAll('#eWeek .armed, #eWeek [class*=arm]')].slice(0, 3).map(e => e.className + ' ' + (e.dataset.fill || e.dataset.slot))))
  log('roster reasons/strikes', await page.evaluate(() => ({ struck: document.querySelectorAll('#eRoster .rpuck.strike, #eRoster .rpuck.x, #eRoster .rpuck[class*=strike]').length, ring: document.querySelectorAll('#eRoster .rpuck.ok, #eRoster .rpuck[class*=elig], #eRoster .rpuck.green').length, why: [...document.querySelectorAll('#eRoster .rwhy, #eRoster [class*=why]')].slice(0, 3).map(e => e.innerText.slice(0, 50)), head: document.querySelector('#eRoster .ros-arm, #eRoster [class*=armhd], #eRoster .ros-head')?.innerText?.replace(/\s+/g, ' ').slice(0, 120) })))
  await cap(page, 'b2-armed-week', { x: 240, y: 150, w: 1200, h: 750 }, [{ n: 1, sel: '#eWeek [data-fill="a:0.0.+"]' }, { n: 2, sel: '#eRoster .rpuck[data-person="beams"]' }])
  await page.screenshot({ path: `${SP}/b2-armed-week-full.png` })
  await page.click('#eRoster .rpuck[data-person="beams"]'); await page.waitForTimeout(600)
  log('SODB now', await cell(page, '#eWeek [data-fill="a:0.0.+"]'), 'ARM', await page.evaluate(() => window.ARM ? 'still armed' : 'none'), 'toast', await toastOf(page))
  // tap a second name — does it plant again (arm stays)?
  await page.click('#eRoster .rpuck[data-person="boosh"]').catch(() => {}); await page.waitForTimeout(600)
  log('SODB after 2nd name', await cell(page, '#eWeek [data-fill="a:0.0.+"]'))
})
// B3 tap a name first, then a seat
await run('name-first', async (page) => {
  await page.click('#eRoster .rpuck[data-person="beams"]'); await page.waitForTimeout(500)
  log('selection', await page.evaluate(() => ({ sel: window.SEL || window.SELP || null, lit: document.querySelectorAll('.puck.sel, .puck.on, .selp, [class*=psel]').length })))
  await page.click('#eWeek [data-fill="a:0.0.+"]'); await page.waitForTimeout(500)
  log('after seat tap: SODB', await cell(page, '#eWeek [data-fill="a:0.0.+"]'), 'ARM', await page.evaluate(() => window.ARM ? window.ARM.key : 'none'))
})
// B4 placeholders
await run('placeholders', async (page) => {
  await mdrag(page, '#eRoster .rpuck[data-person="allavail"]', '#eWeek [data-fill="a:0.0.+"]')
  log('ALL AVAIL on SODB', await cell(page, '#eWeek [data-fill="a:0.0.+"]'), 'toast', await toastOf(page))
  await cap(page, 'b4-allavail', { x: 0, y: 190, w: 560, h: 420 }, [{ see: true, sel: '#eWeek [data-fill="a:0.0.+"] [data-person="allavail"]' }])
  // tap the placeholder → arms; then tap a real name → replaces
  await page.click('#eWeek [data-fill="a:0.0.+"] [data-person="allavail"]'); await page.waitForTimeout(500)
  log('ARM after tapping placeholder', await page.evaluate(() => window.ARM ? window.ARM.key : 'none'))
  await page.click('#eRoster .rpuck[data-person="beams"]'); await page.waitForTimeout(600)
  log('SODB after name', await cell(page, '#eWeek [data-fill="a:0.0.+"]'))
  // ALL placeholder onto a flying seat on the board (cockpit refusal?)
  await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800)
  await center(page, '#schedBoard [data-slot="0.0.0.0.p"]')
  await mdrag(page, '#sbRoster .rpuck[data-person="all"]', '#schedBoard [data-slot="0.0.0.0.p"]')
  log('ALL on FCP', await cell(page, '#schedBoard [data-slot="0.0.0.0.p"]'), 'toast', await toastOf(page))
})
// B5 seat to seat / cross-day / off
await run('seat-moves', async (page) => {
  log('before MET', await cell(page, '#eWeek [data-fill="a:0.1.+"]'), '| FSSD', await cell(page, '#eWeek [data-fill="a:0.2.+"]'))
  const warden = '#eWeek [data-fill="a:0.1.+"] .seat[data-slot]', ranger = '#eWeek [data-fill="a:0.2.+"] .seat[data-slot]'
  log('seat keys', await page.locator(warden).first().getAttribute('data-slot'), await page.locator(ranger).first().getAttribute('data-slot'))
  await mdrag(page, warden, ranger)
  log('after swap MET', await cell(page, '#eWeek [data-fill="a:0.1.+"]'), '| FSSD', await cell(page, '#eWeek [data-fill="a:0.2.+"]'), 'toast', await toastOf(page))
  // cross-day: Monday MET seat -> Tuesday SODB + ADD
  await mdrag(page, '#eWeek [data-fill="a:0.1.+"] .seat[data-slot]', '#eWeek [data-fill="a:1.0.+"]', { hold: true })
  await cap(page, 'b5-crossday', { x: 0, y: 190, w: 1120, h: 700 > 710 ? 710 : 700 }, [{ n: 1, sel: '#eWeek [data-fill="a:0.1.+"] .seat[data-slot]' }, { n: 2, sel: '#eWeek [data-fill="a:1.0.+"]' }])
  await page.mouse.up(); await page.waitForTimeout(800)
  log('after cross-day MET', await cell(page, '#eWeek [data-fill="a:0.1.+"]'), '| Tue SODB', await cell(page, '#eWeek [data-fill="a:1.0.+"]'), 'toast', await toastOf(page))
  // drag off onto the roster = remove
  await mdrag(page, '#eWeek [data-fill="a:1.0.+"] .seat[data-slot]', '#eRoster .rpuck[data-person="beams"]')
  log('after drag-off Tue SODB', await cell(page, '#eWeek [data-fill="a:1.0.+"]'), 'toast', await toastOf(page))
  // right-click remove
  const trident = '#eWeek [data-fill="a:0.3.+"] .seat[data-slot]'
  log('before rc', await cell(page, '#eWeek [data-fill="a:0.3.+"]'))
  await page.locator(trident).first().click({ button: 'right' }); await page.waitForTimeout(600)
  log('after right-click', await cell(page, '#eWeek [data-fill="a:0.3.+"]'), 'toast', await toastOf(page))
})
// B6 AVAILABLE CREW panel as a source
await run('avail-panel', async (page) => {
  log('avail pucks', await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .availpuck, #eWeek .day[data-day="0"] .sec-avail [data-person]')].slice(0, 4).map(e => `${e.tagName}.${e.className} p=${e.dataset.person} drag=${e.dataset.drag} @${Math.round(e.getBoundingClientRect().x)},${Math.round(e.getBoundingClientRect().y)}`)))
  const src = '#eWeek .day[data-day="0"] .sec-avail [data-person][data-drag]'
  const n = await page.locator(src).count(); log('draggable in avail', n)
  if (n) { await page.locator(src).first().evaluate(e => e.scrollIntoView({ block: 'center' })); const who = await page.locator(src).first().getAttribute('data-person'); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); log('who', who) }
})
console.log(errors)
await browser.close()
