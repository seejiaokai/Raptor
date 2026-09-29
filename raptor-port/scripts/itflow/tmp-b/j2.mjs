import { browser, fresh, go, cap, mdrag, errors } from './lib.mjs'
const page = await fresh()
await go(page, 'editsched')
const toast = () => page.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.style.opacity !== '0' ? t.textContent.trim() : '' })
// M1 week: open the board by the date
await cap(page, 'j2-1', { x: 0, y: 190, w: 560, h: 420 }, [
  { n: 1, sel: '#eWeek [data-sbday="0"]' },
  { see: true, sel: '#eWeek [data-daywarn="0"]' },
])
await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800)
// M2 board: mid-drag
await mdrag(page, '#sbRoster .rpuck[data-person="beams"]', '#schedBoard [data-fill="a:0.0.+"]', { hold: true })
await cap(page, 'j2-2', { x: 460, y: 150, w: 940, h: 705 }, [
  { n: 1, sel: '#sbRoster .rpuck[data-person="beams"]' },
  { n: 2, sel: '#schedBoard [data-fill="a:0.0.+"]' },
])
await page.mouse.up(); await page.waitForTimeout(900)
await cap(page, 'j2-2b', { x: 0, y: 150, w: 940, h: 705 }, [
  { see: true, sel: '#schedBoard [data-fill="a:0.0.+"] [data-person="beams"]' },
  { see: true, sel: '#schedBoard .dpend' },
  { see: true, sel: '#sbUndo' },
])
// M3 + Wave menu and + Line
await page.locator('#schedBoard [data-wvadd="0"]').evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400)
await page.click('#schedBoard [data-wvadd="0"]'); await page.waitForTimeout(500)
await cap(page, 'j2-3', { x: 620, y: 315, w: 780, h: 585 }, [
  { n: 1, sel: '#schedBoard [data-wvadd="0"]' },
  { n: 2, sel: '.wavemenu [data-wmkind=""]' },
  { n: 3, sel: '#schedBoard [data-gline="0.0"]' },
])
// click Flying wave -> new wave
const waves0 = await page.locator('#schedBoard [data-gdel]').count()
await page.click('.wavemenu [data-wmkind=""]'); await page.waitForTimeout(800)
console.log('waves', waves0, '->', await page.locator('#schedBoard [data-gdel]').count(), 'toast', await toast())
// + Block
await page.locator('#schedBoard [data-dwadd="0"]').evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400)
const blk0 = await page.locator('#schedBoard [data-dwdel]').count()
await page.click('#schedBoard [data-dwadd="0"]'); await page.waitForTimeout(500)
const bb = await page.locator('#schedBoard [data-dwadd="0"]').boundingBox()
console.log('dwadd box', JSON.stringify(bb))
await cap(page, 'j2-4', { x: 620, y: Math.max(0, Math.round(bb.y) - 200), w: 780, h: 585 }, [
  { n: 1, sel: '#schedBoard [data-dwadd="0"]' },
  { n: 2, sel: '.wavemenu [data-blktpl="std"]' },
])
await page.click('.wavemenu [data-blktpl="std"]'); await page.waitForTimeout(800)
console.log('blocks', blk0, '->', await page.locator('#schedBoard [data-dwdel]').count(), 'toast', await toast())
// Templates on the board: save this day
await page.click('#sbTpl'); await page.waitForTimeout(500)
await cap(page, 'j2-5', { x: 560, y: 40, w: 560, h: 420 }, [
  { n: 1, sel: '#sbTpl' },
  { n: 2, sel: '.wavemenu [data-daytplsave]' },
])
await page.click('.wavemenu [data-daytplsave]'); await page.waitForTimeout(800)
console.log('toast', await toast(), 'modal', await page.locator('#daytplModal:not([hidden])').count())
await page.click('#daytplClose'); await page.waitForTimeout(400)
// go to Tuesday on the board via the day strip, apply
await page.click('#schedBoard button:has-text("Tue 14")'); await page.waitForTimeout(800)
console.log('SBDAY', await page.evaluate(() => window.SBDAY))
await page.click('#sbTpl'); await page.waitForTimeout(500)
await cap(page, 'j2-5b', { x: 560, y: 40, w: 560, h: 420 }, [
  { n: 1, sel: '#sbTpl' },
  { n: 2, sel: '.wavemenu [data-daytplpick]' },
])
await page.click('.wavemenu [data-daytplpick]'); await page.waitForTimeout(900)
console.log('apply toast', await toast())
await page.click('#sbDone'); await page.waitForTimeout(700)
console.log('board closed', await page.locator('#schedBoard:visible').count(), 'page', await page.evaluate(() => window.CURPAGE))
// week issues bar
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const dw = await page.locator('#eWeek [data-daywarn="0"]').boundingBox(); console.log('daywarn', JSON.stringify(dw))
await page.click('#eWeek [data-daywarn="0"]'); await page.waitForTimeout(500)
await cap(page, 'j2-6', { x: 0, y: Math.round(dw.y) - 60, w: 560, h: 420 }, [
  { n: 1, sel: '#eWeek [data-daywarn="0"]' },
  { n: 2, sel: '#eWeek [data-wdi="0"][data-wix="0"]' },
])
await page.click('#eWeek [data-wdi="0"][data-wix="0"]'); await page.waitForTimeout(1000)
console.log('selected', await page.evaluate(() => [...document.querySelectorAll('#eWeek .sel, #eWeek .psel, #eWeek [class*=selected], #eWeek .puck.on')].slice(0,5).map(e => e.tagName + '.' + e.className + ' ' + e.getAttribute('data-person') + ' ' + JSON.stringify(e.getBoundingClientRect()))))
console.log(errors)
await browser.close()
