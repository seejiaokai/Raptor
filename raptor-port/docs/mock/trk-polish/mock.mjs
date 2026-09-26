/* MOCK-UP DRIVER (26 Sep 26) — the design improvements proposed after [TRK-PALETTE-ASK] (D157), drawn on the REAL
   Tracker: it signs in to the preview, makes a world through the app's own controls (marks, a failure, dates that
   raise amber and red flex bars, an unsaved chart edit), then photographs each place as it is today and with
   after.css laid on top. Nothing is stored or built. Run from raptor-port/ against a preview:
     node docs/mock/trk-polish/mock.mjs [http://localhost:4180]
   Writes before/after pictures and the two comparison sheets into this folder. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const BASE = process.argv[2] || 'http://localhost:4180'
const CSS = readFileSync(resolve(HERE, 'after.css'), 'utf8')
const part = name => { const m = CSS.match(new RegExp(`/\\* ${name} \\*/([\\s\\S]*?)/\\* /${name} \\*/`)); return m ? m[1] : '' }
const COMMON = CSS.slice(0, CSS.indexOf('/* FLEX-A */')).replace(/\/\* ---- flex-a[\s\S]*$/, '')
const VARIANT = { before: '', a: COMMON + part('FLEX-A'), b: COMMON + part('FLEX-B'), bw: COMMON + part('FLEX-B') + part('WEDGE') }
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
const out = n => resolve(HERE, n)

async function world(size, touch) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 2, ...(touch ? { hasTouch: true, isMobile: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(BASE + '/?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.evaluate(() => window.setPage('tracker'))
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await sleep(900)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.evaluate(() => { const s = document.createElement('style'); s.id = 'mockcss'; document.head.appendChild(s) })
  return { ctx, page }
}
const setCss = (page, css) => page.evaluate(css => { document.getElementById('mockcss').textContent = css }, css)
const iso = (page, n) => page.evaluate(n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }, n)
async function tapBall(page, id) {
  const g = page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
  await g.scrollIntoViewIfNeeded(); const b = await g.boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(400)
}
async function grade(page, id, label, fails = 0) {
  await tapBall(page, id); await page.waitForSelector('#pop', { state: 'visible' })
  for (let i = 0; i < fails; i++) { await page.locator('#pop .fails button', { hasText: '+' }).click(); await sleep(200) }
  await page.locator('#pop .opts button', { hasText: label }).first().click(); await sleep(400)
  if (await page.locator('#pop:visible').count()) { await page.keyboard.press('Escape'); await sleep(200) }
}
async function shots(page, tag, list) {
  const files = {}
  for (const v of Object.keys(VARIANT)) {
    if (!list.variants.includes(v)) continue
    await setCss(page, VARIANT[v]); await sleep(250)
    files[v] = out(`${tag}-${v}.png`)
    if (list.el) await page.locator(list.el).first().screenshot({ path: files[v] })
    else await page.screenshot({ path: files[v], clip: list.clip })
  }
  await setCss(page, '')
  return files
}

const rows = { desk: [], phone: [] }
/* ---------------- desktop ---------------- */
{
  const { ctx, page } = await world({ width: 1440, height: 900 })
  await grade(page, 'ST-01', 'DCO'); await grade(page, 'ACG-01', 'DPCO', 2); await grade(page, 'ST-02', 'Marginal')
  await page.fill('#lastSyll', await iso(page, 10)); await page.locator('#lastSyll').blur()
  await page.fill('#lastCurr', await iso(page, 10)); await page.locator('#lastCurr').blur(); await sleep(400)
  const styles = await page.evaluate(() => [...document.querySelectorAll('#page-tracker .flexbar, #page-tracker .legend .sw')].map(e => e.getAttribute('style')))
  console.log('inline styles seen:', JSON.stringify(styles))
  await page.locator('#page-tracker .c-curr').first().scrollIntoViewIfNeeded()
  rows.desk.push(['1. Currency & Flex — the bars read as a status, and their words can be read', await shots(page, 'd1-flex', { el: '#page-tracker .c-curr', variants: ['before', 'a', 'b'] })])
  const box = sel => page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
  const lg = await box('#page-tracker .legend')
  rows.desk.push(['2. The colour key — the black DCO and white "not done" dots get a ring so both show', await shots(page, 'd2-key', { clip: { x: 0, y: lg.y, width: 900, height: lg.h }, variants: ['before', 'b'] })])
  await tapBall(page, 'ST-02'); await page.waitForSelector('#pop', { state: 'visible' })
  rows.desk.push(['2. …and the grade pop-up\'s dots', await shots(page, 'd2-pop', { el: '#pop', variants: ['before', 'b'] })])
  await page.keyboard.press('Escape'); await sleep(250)
  await page.locator('#page-tracker .c-students').first().scrollIntoViewIfNeeded()
  rows.desk.push(['5. The Students card — the gold centre becomes Raptor\'s grey, the student\'s name leads', await shots(page, 'd5-key-ball', { el: '#page-tracker .c-students', variants: ['before', 'b'] })])
  await page.locator('#addStu:visible').first().click(); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(250)
  rows.desk.push(['3. A window\'s main button is Raptor\'s solid "do it" button, not the "switched on" look', await shots(page, 'd3-dialog', { el: '#dlgModal', variants: ['before', 'b'] })])
  await page.locator('#dlgModal button', { hasText: /^Cancel/ }).first().click(); await sleep(250)
  await page.click('#sylMenuBtn'); await page.click('#arrangeBtn'); await sleep(300)
  await page.locator('#arrTools button', { hasText: '+ Acad' }).first().click(); await page.waitForSelector('#dlgModal', { state: 'visible' })
  await page.fill('#dlgInput', 'NEW-1'); await page.locator('#dlgOk').click(); await sleep(400)
  await page.click('#sylMenuBtn'); await page.click('#arrangeBtn'); await sleep(400)
  const sv = await box('#saveChanges')
  rows.desk.push(['4. Unsaved chart edits — Save changes becomes the one button you cannot miss', await shots(page, 'd4-save', { clip: { x: Math.max(0, sv.x + sv.w - 420), y: sv.y - 8, width: 430, height: sv.h + 16 }, variants: ['before', 'b'] })])
  await page.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = 0 }); await sleep(300)
  const u = await page.evaluate(() => { const rs = ['ST-01', 'ACG-01', 'ST-02', 'ACG-02', 'ACG-03', 'ACG-04'].map(id => document.querySelector('#flowSvg .ball[data-id="' + id + '"]')).filter(Boolean).map(g => g.getBoundingClientRect())
    const x0 = Math.min(...rs.map(r => r.left)) - 40, y0 = Math.min(...rs.map(r => r.top)) - 30, x1 = Math.max(...rs.map(r => r.right)) + 40, y1 = Math.max(...rs.map(r => r.bottom)) + 30
    return { x: Math.max(0, x0), y: Math.max(0, y0), width: x1 - Math.max(0, x0), height: y1 - Math.max(0, y0) } })
  rows.desk.push(['6. (Optional) The empty part of each ring in soft grey, so a MARK is the brightest thing on the chart', await shots(page, 'd6-chart', { clip: u, variants: ['b', 'bw'] })])
  await ctx.close()
}
/* ---------------- phone ---------------- */
{
  const { ctx, page } = await world({ width: 390, height: 844 }, true)
  await grade(page, 'ST-01', 'DCO'); await grade(page, 'ACG-01', 'DPCO', 2); await grade(page, 'ST-02', 'Marginal')
  await page.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = 0 }); await sleep(300)
  rows.phone.push(['The chart on a phone (6 is optional)', await shots(page, 'p1-chart', { clip: { x: 0, y: 0, width: 390, height: 844 }, variants: ['before', 'b', 'bw'] })])
  await page.locator('#viewtabs [data-view="info"]').click(); await sleep(500)
  await page.fill('#lastSyll', await iso(page, 10)); await page.locator('#lastSyll').blur()
  await page.fill('#lastCurr', await iso(page, 10)); await page.locator('#lastCurr').blur(); await sleep(400)
  rows.phone.push(['The Info half on a phone', await shots(page, 'p2-info', { clip: { x: 0, y: 0, width: 390, height: 844 }, variants: ['before', 'a', 'b'] })])
  await ctx.close()
}

/* ---------------- the two comparison sheets ---------------- */
const LABEL = { before: 'Today', a: 'Improved — A: solid bars, dark words', b: 'Improved — B: tinted status bars (recommended)', bw: 'Improved + optional 6 (soft grey ring)' }
const LABEL_PLAIN = { before: 'Today', b: 'Improved', bw: 'Improved + optional 6 (soft grey ring)' }
/* show each picture at its real on-screen size (they were taken at 2x) */
const cssW = f => Math.round(readFileSync(f).readUInt32BE(16) / 2)
async function sheet(name, list, colW) {
  const ctx = await browser.newContext({ viewport: { width: 1560, height: 400 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const body = list.map(([title, files]) => { const L = 'a' in files ? LABEL : LABEL_PLAIN; return `<section><h2>${title}</h2><div class="row">${Object.entries(files).map(([v, f]) =>
    `<figure><figcaption>${L[v]}</figcaption><img style="width:${Math.min(colW, cssW(f))}px" src="data:image/png;base64,${readFileSync(f).toString('base64')}"></figure>`).join('')}</div></section>` }).join('')
  await page.setContent(`<html><body style="margin:0;background:#fff;font:15px/1.4 system-ui;color:#111;padding:24px">
    <style>h2{font-size:17px;margin:26px 0 10px}.row{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}figure{margin:0}
    figcaption{font-weight:600;margin:0 0 6px;font-size:13px}img{display:block;border:1px solid #999;height:auto}</style>${body}</body></html>`)
  await page.screenshot({ path: out(name), fullPage: true })
  await ctx.close()
}
await sheet('compare-desktop.png', rows.desk, 900)
await sheet('compare-phone.png', rows.phone, 360)
await browser.close()
writeFileSync(out('done.txt'), new Date().toISOString())
console.log('done')
