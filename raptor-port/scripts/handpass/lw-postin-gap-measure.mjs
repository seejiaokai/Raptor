// Chat 208 — his D2822 (27 Nov 26): on the DESKTOP Balances page "Only leave after post-in is deducted." should sit close
// above the column headings with the phone's small gap. This measures, on the built page, the gap from that line's foot
// to the first heading words below it, desktop and phone, as an admin, and takes a picture of each at 2x.
// Run from this folder: PORT=4757 LW_TODAY=2026-11-26 LW_OUT=../../docs/img/handpass/2026-11-27-lw-postin-gap TAG=before node lw-postin-gap-measure.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-gap'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
import { mkdirSync } from 'node:fs'
import path from 'node:path'
mkdirSync(L.OUT, { recursive: true })
const TAG = process.env.TAG || 'now'
const out = {}
try {
  for (const size of ['desk', 'phone']) {
    const b = await L.getBrowser()
    const phone = size === 'phone'
    const ctx = await b.newContext({ viewport: phone ? L.PHONE : L.DESK, deviceScaleFactor: 2, hasTouch: phone })
    const P = await ctx.newPage()
    const errs = []
    P.on('pageerror', e => errs.push(String(e).slice(0, 200)))
    P.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
    await P.goto(L.PLAIN); await P.waitForSelector('#luser')
    await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), L.LW_TODAY)
    await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a')
    await P.click('#loginForm button[type=submit]')
    await P.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 })
    await P.evaluate(() => window.go('leavewar'))
    await P.waitForSelector(L.T('lw-tab-balances'), { state: 'visible', timeout: 15000 }); await P.waitForTimeout(600)
    await P.click(L.T('lw-tab-balances')); await P.waitForSelector(L.T('bal-postin'), { state: 'visible' }); await P.waitForTimeout(600)
    const m = await P.evaluate(phone => {
      const pi = document.querySelector('[data-testid="bal-postin"]').getBoundingClientRect()
      /* the first heading WORDS under the line: a text node's own box, not its cell (a cell may be taller than its words) */
      const heads = phone ? [...document.querySelectorAll('[data-testid="balances-page"] .bp-cols > span')] : [...document.querySelectorAll('[data-testid="balances-page"] thead th')]
      let top = Infinity, which = ''
      for (const h of heads) {
        const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT)
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (!n.textContent.trim() || n.parentElement.closest('.bp-pi')) continue
          const r = document.createRange(); r.selectNodeContents(n); const rr = r.getBoundingClientRect()
          if (rr.height && rr.top < top) { top = rr.top; which = n.textContent.trim() }
        }
      }
      const firstRow = document.querySelector('[data-testid^="bal-row-"]').getBoundingClientRect()
      const headFoot = phone ? document.querySelector('[data-testid="balances-page"] .bp-cols').getBoundingClientRect().bottom : document.querySelector('[data-testid="balances-page"] thead').getBoundingClientRect().bottom
      /* the words straight under the line: NAME's (a desktop) or the first heading's (a phone) */
      const nameTh = [...heads].find(h => h.textContent.trim().startsWith('NAME'))
      const nr = document.createRange(); nr.selectNodeContents(nameTh); const nameTop = nr.getBoundingClientRect().top
      const lve = [...heads].find(h => h.textContent.trim() === 'LVE')
      const overlap = lve ? (() => { const a = document.querySelector('[data-testid="bal-postin"]').getBoundingClientRect(), b = lve.getBoundingClientRect(); return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom })() : false
      return { piTop: pi.top, piBottom: pi.bottom, piLeft: pi.left, nameLeft: nameTh.getBoundingClientRect().left, firstHeadWordsTop: top, firstHeadWords: which, gap: Math.round((top - pi.bottom) * 100) / 100, gapToName: Math.round((nameTop - pi.bottom) * 100) / 100, overlapsLve: overlap, headFoot, firstRowTop: firstRow.top }
    }, phone)
    out[size] = m
    console.log(size, JSON.stringify(m), 'errors:', errs.join(' | ') || 'none')
    const clip = { x: 0, y: Math.floor(m.piTop) - 40, width: phone ? L.PHONE.width : 900, height: Math.ceil(m.firstRowTop - m.piTop) + 100 }
    await P.screenshot({ path: path.join(L.OUT, `${size}-${TAG}.png`), clip, scale: 'device' })
    await ctx.close()
  }
  console.log('RESULT', JSON.stringify(out))
} catch (e) { console.log('STOPPED:', e.stack || e.message) } finally { await L.closeBrowser() }
