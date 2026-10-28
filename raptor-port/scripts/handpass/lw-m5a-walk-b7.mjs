// Walker B, script 7: scroll bars judged with --hide-scrollbars taken off (lesson 6). A non-mobile 402-wide Chromium context draws classic bars.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, openBalances, vis } = B
import { chromium } from '@playwright/test'
console.log('[lw-m5a-walk-b7 v1 scrollbars]')
const bw = await chromium.launch({ ...L.launchOptions, ignoreDefaultArgs: ['--hide-scrollbars'] })
const ctx = await bw.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
const w = { ctx, page, cdp: null, errs, phone: false, size: 'phone' }
const P = page
await L.signIn(w, 'admin'); await openBalances(w)
await shot(w, 'z-bars-balances')
const m = await P.evaluate(() => {
  const s = document.querySelector('[data-testid="bal-scroll"]')
  const bars = { vBar: s.offsetWidth - s.clientWidth, hBar: s.offsetHeight - s.clientHeight, docV: innerWidth - document.documentElement.clientWidth, docH: innerHeight - document.documentElement.clientHeight }
  const cs = getComputedStyle(s)
  return { ...bars, scrollbarWidth: cs.scrollbarWidth, overflowX: cs.overflowX, overflowY: cs.overflowY, sbRule: [...document.styleSheets].flatMap(ss => { try { return [...ss.cssRules] } catch { return [] } }).filter(r => /scrollbar/.test(r.cssText) && /bp-|balances/.test(r.cssText)).map(r => r.cssText.slice(0, 160)).slice(0, 4) }
})
console.log(JSON.stringify(m))
await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(225, 300) }); await P.waitForTimeout(400)
await shot(w, 'z-bars-slid')
const who = await P.evaluate(() => { const who = document.querySelector('.bp-row .bp-who')?.getBoundingClientRect(); const s = document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect(); return { whoL: Math.round(who?.left ?? -1), scrollRight: Math.round(s.right), vw: innerWidth } })
rec('6 classic scroll bars (Chromium, bars not hidden) on the Balances page', '402', 'NOTE', `vertical bar ${m.vBar}px, horizontal bar ${m.hBar}px, window bars ${m.docV}/${m.docH}; scrollbar-width ${m.scrollbarWidth}; the page's own bar rules ${JSON.stringify(m.sbRule)}; names left ${who.whoL}; scroller right edge ${who.scrollRight} of ${who.vw}`, ['z-bars-balances', 'z-bars-slid'])
await L.openGrid(w)
await B.press(w, T('my-leave')).catch(() => {}); await P.waitForTimeout(700)
await shot(w, 'z-bars-window')
const pwm = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); if (!pw) return null; const sc = [pw, ...pw.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)).map(e => ({ cls: (e.className || '').toString().slice(0, 30), bar: e.offsetWidth - e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight })); return { scrollers: sc } })
rec('6 classic scroll bars on the person window', '402', 'NOTE', JSON.stringify(pwm), ['z-bars-window'])
console.log(errs)
L.writeResults('b7')
await ctx.close(); await bw.close(); await L.closeBrowser()
