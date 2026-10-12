// Walker A: shared flow helpers for worlds after the first (a bundle of readings, undo/redo, pickLines)
import { shot, inpBrief, toastMark, toastsSince, OUT, SAT, SAT_DI, WIN } from './or-A-lib.mjs'
import { readWeek, readBoard, openBoard, closeBoard, toWeek, weekDayLoc, oilRead, oilOn, oilOff, readInputsPage } from './or-A-read.mjs'
import { join } from 'node:path'

export function flow(page, tagPrefix, di = SAT_DI, iso = SAT) {
  const pics = []
  const picEl = async (loc, name) => { await loc.scrollIntoViewIfNeeded().catch(() => {}); await loc.screenshot({ path: join(OUT, name + '.png') }); pics.push(name + '.png') }
  const picPage = async name => { await shot(page, name); pics.push(name + '.png') }
  async function boardPics(name) {
    for (const [sel, suf] of [['.sb-panel.grnd', 'ground'], ['.sb-panel.pinp', 'personal']]) {
      const el = page.locator(`#schedBoard ${sel}:visible`).first()
      if (await el.count()) { await el.scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(120); await el.screenshot({ path: join(OUT, `${name}-${suf}.png`) }); pics.push(`${name}-${suf}.png`) }
    }
  }
  async function bundle(tag, iid, { oil = true } = {}) {
    tag = tagPrefix + tag
    const out = {}
    await toWeek(page)
    out.week = await readWeek(page, di)
    await picEl(weekDayLoc(page, di).locator('.sec-grnd'), `${tag}-week-ground`)
    await openBoard(page, di)
    out.board = await readBoard(page)
    await boardPics(`${tag}-board`)
    if (oil) { await oilOn(page); out.oil = await oilRead(page, iid); await boardPics(`${tag}-board-oil`); await oilOff(page) }
    out.inputsPage = await readInputsPage(page, iso, iid, { shots: tag })
    ;['month', 'card', 'list'].forEach(s => pics.push(`${tag}-${s}.png`))
    out.inputs = await inpBrief(page, iid)
    await toWeek(page); out.week2 = await readWeek(page, di)
    return out
  }
  const pickLines = o => ({ wk: o.week.ground.map(g => g.txt + ' [' + g.pucks.map(p => p.n + (p.cls ? '~' + p.cls : '')).join(',') + '] ctr=' + g.counters.join(',')), wkPI2: o.week2.inputs.map(g => g.txt), bd: o.board.ground.map(g => g.vals.join('|') + ' [' + g.pucks.map(p => p.n).join(',') + '] ctr=' + g.counters.join(',')), bdPI: o.board.inputs.map(g => g.txt), oil: o.oil, bars: o.inputsPage.cell.bars.map(b => b.txt + ' ## ' + b.title), card: o.inputsPage.card && o.inputsPage.card.txt, list: o.inputsPage.list.map(l => l.txt), inputs: o.inputs })
  const U = async w => { await toWeek(page); const m = await toastMark(page); const bt = page.locator(w === 'undo' ? '#undoBtn' : '#redoBtn').first(); const dis = await bt.isDisabled(); await bt.click(); await page.waitForTimeout(700); return { dis, toast: await toastsSince(page, m) } }
  /* the input's own window, opened from the opened day's card; its people (pressed pucks) and text */
  async function windowOf(iid) {
    await closeBoard(page)
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal').waitFor()
    if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').click(); await page.waitForTimeout(250) }
    await page.waitForSelector(`[data-icday="${iso}"]`)
    await page.locator(`[data-icday="${iso}"]`).focus(); await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]'); await page.waitForTimeout(300)
    await page.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`).first().click(); await page.waitForTimeout(600)
    const f = await page.evaluate(W => { const w = document.querySelector(W); if (!w) return null; const cs = id => (window.PEOPLE[id] && window.PEOPLE[id].cs) || id; return { text: (w.innerText || '').replace(/\s+/g, ' ').slice(0, 700), pressed: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => cs(b.getAttribute('data-pp'))), ph: [...w.querySelectorAll('[data-ph][aria-pressed="true"]')].map(b => b.getAttribute('data-ph')) } }, WIN)
    await shot(page, `${tagPrefix}window-${iid.slice(-4)}`); pics.push(`${tagPrefix}window-${iid.slice(-4)}.png`)
    await page.locator('#inpEditCancel, #inpEditClose').first().click().catch(() => {})
    await page.waitForTimeout(250)
    await page.locator('[data-testid="win-inputsday-x"]').click().catch(() => {})
    await page.waitForTimeout(250)
    return f
  }
  const aaWin = async (tag) => {
    await openBoard(page, di); await oilOn(page)
    await page.locator('#schedBoard .oilcount:visible').first().click(); await page.waitForTimeout(800)
    const f = await page.evaluate(() => { const w = document.querySelector('.availwin'); if (!w) return null; const names = [...w.querySelectorAll('.rpuck')].map(e => e.textContent.trim().replace(/\s+/g, ' ')); return { head: w.innerText.replace(/\s+/g, ' ').slice(0, 130), n: names.length, offs: names.filter(x => /—/.test(x)), names: names.slice().sort().join(',') } })
    if (tag && f) { await page.locator('.availwin').screenshot({ path: join(OUT, tagPrefix + tag + '-aawin.png') }); pics.push(tagPrefix + tag + '-aawin.png') }
    return f
  }
  const aaClose = async () => { await page.locator('.availwin [title="Close"], .availwin .win-x').first().click().catch(async () => { await page.keyboard.press('Escape') }); await page.waitForTimeout(300); await oilOff(page) }
  return { bundle, pickLines, U, windowOf, aaWin, aaClose, pics, picEl, picPage }
}
