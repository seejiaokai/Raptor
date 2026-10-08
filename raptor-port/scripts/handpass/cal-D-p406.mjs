import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDayWin, fileCommit, press, isTouch } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const sizes = process.argv.slice(2).length ? process.argv.slice(2) : ['desk', 'phone', 'short', 'side']
async function rename(page, id, cs) {
  await page.evaluate(() => window.go('quals')); await page.waitForTimeout(600)
  await page.click('#qViewA').catch(() => {}); await page.click('#qEdit'); await page.waitForTimeout(250)
  const b = page.locator(`input.qcs[data-cs="${id}"]`); await b.scrollIntoViewIfNeeded(); await b.fill(cs); await b.dispatchEvent('change'); await b.press('Tab'); await page.waitForTimeout(250)
  await page.click('#qSave'); await page.waitForTimeout(400)
}
const puckInfo = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const cs = getComputedStyle(e); const af = getComputedStyle(e, '::after'); const r = e.getBoundingClientRect(); return { html: e.outerHTML.replace(/\s+/g, ' ').slice(0, 420), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor, bs: cs.boxShadow.slice(0, 90), bR: cs.borderRightWidth + ' ' + cs.borderRightColor, afContent: af.content, afBg: af.backgroundColor, cut: e.scrollWidth > e.clientWidth + 1 } })()`
for (const size of sizes) {
  const { ctx, page, errors } = await world(browser, size)
  await rename(page, 'vinci', 'Maximilianus14'); await rename(page, 'cards', 'Wwwwwwwwwwwwww')
  // the SCHEDULE's own pucks for Zenith-renamed man: find in Edit Schedule
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
  const sched = await page.evaluate(() => { const ps = [...document.querySelectorAll('.puck')].filter(p => /Maximilianus14/.test(p.textContent)); const p = ps[0]; if (!p) return { n: 0 }; const cs = getComputedStyle(p), af = getComputedStyle(p, '::after'), r = p.getBoundingClientRect(); return { n: ps.length, cls: p.className, html: p.outerHTML.replace(/\s+/g, ' ').slice(0, 500), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor, bs: cs.boxShadow.slice(0, 120), bR: cs.borderRightWidth + ' ' + cs.borderRightColor, af: af.content + ' ' + af.backgroundColor } })
  console.log(size, 'SCHEDULE puck', JSON.stringify(sched))
  await backToSans(page, size)
  await press(size, cell(page, '2026-07-22'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
  for (const [id, l] of [['vinci', { f: true }], ['cards', { f: true, o: true }], ['yeti', { o: true }], ['ipman', { a: true }], ['wrangler', { f: true }]]) { await fileCommit(page, size, id, l); await page.click('#inpEditSave'); await page.waitForTimeout(350) }
  const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-sansday"] [data-testid^="sd-row-"]')].map(r => { r.scrollIntoView({ block: 'nearest' }); const p = r.querySelector('.puck'); const cs = p ? getComputedStyle(p) : null, af = p ? getComputedStyle(p, '::after') : null; const rr = p ? p.getBoundingClientRect() : null; const row = r.getBoundingClientRect(); const open = r.querySelector('[data-testid="sd-open"]'); const cx = rr ? Math.round(rr.left + rr.width / 2) : 0, cy = rr ? Math.round(rr.top + rr.height / 2) : 0; const hit = rr ? document.elementFromPoint(cx, cy) : null; return { text: r.innerText.replace(/\s+/g, ' ').slice(0, 50), cls: p && p.className, html: p ? p.outerHTML.replace(/\s+/g, ' ').slice(0, 400) : null, pw: rr && Math.round(rr.width), ph: rr && Math.round(rr.height), fs: cs && cs.fontSize, bs: cs && cs.boxShadow.slice(0, 80), bR: cs && cs.borderRightWidth + ' ' + cs.borderRightColor, af: af && af.content + ' ' + af.backgroundColor, cut: p && p.scrollWidth > p.clientWidth + 1, nmCut: p && (() => { const n = p.querySelector('.nm'); return n ? [n.scrollWidth, n.clientWidth, getComputedStyle(n).textOverflow] : null })(), rowW: Math.round(row.width), hitOpen: !!(hit && hit.closest('[data-testid="sd-open"]')), hitTag: hit && hit.tagName + '.' + hit.className } }))
  for (const r of rows) console.log(size, 'SANS row', JSON.stringify(r))
  await shot(page, `p406-${size}-day`)
  // the Highlight menu
  await tid(page, 'win-sansday-x').click().catch(() => {})
  await press(size, tid(page, 'sc-hl')); await page.waitForTimeout(250)
  const menu = await page.evaluate(() => { const m = document.querySelector('[data-testid="sc-hl-menu"]'); const mr = m.getBoundingClientRect(); return { menu: [Math.round(mr.left), Math.round(mr.top), Math.round(mr.right), Math.round(mr.bottom)], vw: innerWidth, vh: innerHeight, scrolls: m.scrollHeight > m.clientHeight, items: [...m.querySelectorAll('[data-testid^="sc-hl-"]')].filter(e => e.getAttribute('data-testid') !== 'sc-hl-none').map(b => { const p = b.querySelector('.puck'); const r = b.getBoundingClientRect(); const pr = p && p.getBoundingClientRect(); const hit = pr ? document.elementFromPoint(Math.round(pr.left + pr.width / 2), Math.round(pr.top + pr.height / 2)) : null; return { id: b.getAttribute('data-testid'), t: b.innerText.replace(/\s+/g, ' '), bw: Math.round(r.width), bh: Math.round(r.height), pw: pr && Math.round(pr.width), cut: p && p.scrollWidth > p.clientWidth + 1, hit: !!(hit && b.contains(hit)) } }) } })
  console.log(size, 'MENU', JSON.stringify(menu))
  await shot(page, `p406-${size}-menu`)
  console.log(size, 'errors', errors.join('|'))
  await ctx.close()
}
await browser.close()
