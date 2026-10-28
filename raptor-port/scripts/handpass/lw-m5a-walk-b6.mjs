// Walker B, script 6: the same phone in WebKit (his iPhone's engine): tab row, Balances, the slide, typing, the padlock, the person window, the member's page.
// WebKit has no CDP: taps are mouse clicks on a touch-enabled mobile context; the slide is a scrollTo of the sliding block (a stand-in for a finger).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, balRow, pwRead, closePw, vis, typeInBox, lockViaBridge, where, tabRow, box } = B
import { webkit, devices } from '@playwright/test'
console.log('[lw-m5a-walk-b6 v1 webkit]')
const bw = await webkit.launch()
const ctx = await bw.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
const errs = []
page.on('console', m => { if (m.type() === 'error') errs.push('webkit console: ' + m.text().slice(0, 200)) })
page.on('pageerror', e => errs.push('webkit pageerror: ' + String(e).slice(0, 200)))
page.on('response', r => { if (r.status() >= 400) errs.push(`webkit http ${r.status()}: ` + r.url().slice(0, 100)) })
const w = { ctx, page, cdp: null, errs, phone: true, size: 'phone' }
const P = page
const W = (n) => 'w-' + n
const S = async (name, fn) => { try { await fn() } catch (e) { rec(name, '402 webkit', 'NOT WALKED', 'STOPPED: ' + String(e).slice(0, 250), []); await shot(w, 'err-' + name.replace(/\W+/g, '-')).catch(() => {}) } }
await S('wk-signin', async () => { await L.signIn(w, 'admin') })
await S('wk-tabs', async () => {
  for (const vw of [402, 375]) {
    await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(500)
    const tr = await tabRow(P)
    const one = tr.tabs.every(t => t.top === tr.tabs[0].top) && tr.gear && tr.tabs.every(t => t.right <= tr.gear.left)
    rec(`36 tab row ${vw} (WebKit)`, `${vw} webkit`, one && tr.tabs.every(t => t.icon === (vw === 402)) && tr.sw <= tr.vw ? 'PASS' : 'FAIL', `icons ${tr.tabs.map(t => t.icon ? 'Y' : 'n').join('')}; gear ${tr.gear?.left}-${tr.gear?.right}; tabs ${tr.tabs.map(t => t.left + '-' + t.right).join(' ')}; page width ${tr.sw}/${tr.vw}`, [W(`t1-tabs-${vw}`)])
    await P.screenshot({ path: `${L.OUT}/${W('t1-tabs-' + vw)}.png`, clip: { x: 0, y: 0, width: vw, height: 110 }, scale: 'css' })
  }
  await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(500)
})
await S('wk-balances', async () => {
  await openBalances(w); await shot(w, W('b1-rest'))
  const r = await balRow(P, 'bane')
  rec('2 Balances page at rest (WebKit)', '402 webkit', r.app === '15' && r.cf === '2' && /12\.5/.test(r.war) && r.boxes === 7 ? 'PASS' : 'FAIL', JSON.stringify(r), [W('b1-rest')])
  const g = () => P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); const who = document.querySelector('.bp-row .bp-who')?.getBoundingClientRect(); const cols = document.querySelector('.bp-cols')?.getBoundingClientRect(); return { sl: Math.round(s.scrollLeft), st: Math.round(s.scrollTop), whoL: Math.round(who?.left ?? -1), whoT: Math.round(who?.top ?? -1), colsT: Math.round(cols?.top ?? -1), colsL: Math.round(cols?.left ?? -1), win: Math.round(scrollY) } })
  const g0 = await g()
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo({ left: 225, top: 0 }) }); await P.waitForTimeout(500)
  const g1 = await g(); await shot(w, W('b2-slid'))
  rec('32 slid sideways: the names column stays, the headings follow the figures (WebKit)', '402 webkit', g1.sl === 225 && g1.whoL === 0 && g1.colsL === -225 ? 'PASS' : 'FAIL', `scrollLeft ${g0.sl}->${g1.sl}; names left ${g1.whoL}; heading row left ${g1.colsL} top ${g1.colsT} (was ${g0.colsT})`, [W('b2-slid')])
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo({ left: 225, top: 400 }) }); await P.waitForTimeout(500)
  const g2 = await g(); await shot(w, W('b2-slid-down'))
  rec('32 slid and scrolled down: the heading row held at the top, names at the left (WebKit)', '402 webkit', g2.colsT === g0.colsT && g2.whoL === 0 && g2.win === 0 ? 'PASS' : 'FAIL', `scroll ${g2.sl}/${g2.st}; heading top ${g2.colsT} (was ${g0.colsT}); names left ${g2.whoL}; window scroll ${g2.win}`, [W('b2-slid-down')])
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo({ left: 0, top: 0 }) }); await P.waitForTimeout(400)
  /* typing in WebKit */
  await typeInBox(w, T('bal-LVE-bane'), 16)
  const r1 = await balRow(P, 'bane'); await shot(w, W('b3-typed'))
  rec('3 typed 16 + Enter (WebKit)', '402 webkit', r1.app === '16' && /13\.5/.test(r1.war) ? 'PASS' : 'FAIL', `App bal ${r1.app}, War bal ${r1.war}`, [W('b3-typed')])
  await typeInBox(w, T('bal-LVE-bane'), '17.3')
  const er = await P.evaluate(() => { const e = document.querySelector('[data-testid="bal-LVE-bane-err"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.textContent.trim(), l: Math.round(r.left), r: Math.round(r.right), vw: innerWidth } })
  await shot(w, W('b3-refused'))
  rec('19 refused 17.3: its words in view (WebKit)', '402 webkit', er && er.l >= 0 && er.r <= er.vw ? 'PASS' : 'FAIL', JSON.stringify(er), [W('b3-refused')])
  await P.keyboard.press('Escape'); await L.undo(w)
  /* CL off screen */
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(0, 0) }); await P.waitForTimeout(300)
  await press(w, T('bal-CL-bane')); await P.waitForTimeout(700)
  const gb = await P.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); const who = document.querySelector('.bp-row .bp-who').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), whoR: Math.round(who.right), id: document.activeElement.dataset.testid, sl: Math.round(document.querySelector('[data-testid="bal-scroll"]').scrollLeft) } })
  await shot(w, W('b4-CL-tapped'))
  rec('29 a tap on CL: the box brought into sight sideways (WebKit)', '402 webkit', gb.id === 'bal-CL-bane' && gb.l >= gb.whoR && gb.r <= 402 ? 'PASS' : 'FAIL', JSON.stringify(gb), [W('b4-CL-tapped')])
  await P.keyboard.press('Escape')
  /* the padlock */
  await press(w, T('bal-lock')); await P.waitForTimeout(500); await shot(w, W('b5-lock-on'))
  const on = await P.locator(T('bal-lock')).getAttribute('aria-checked')
  await P.screenshot({ path: `${L.OUT}/${W('b5-lock-on-bar')}.png`, clip: { x: 0, y: 141, width: 402, height: 56 }, scale: 'css' })
  await press(w, T('bal-lock')); await P.waitForTimeout(500)
  rec('F padlock on then off (WebKit)', '402 webkit', on === 'true' && (await P.locator(T('bal-lock')).getAttribute('aria-checked')) === 'false' ? 'PASS' : 'FAIL', `after first press ${on}`, [W('b5-lock-on'), W('b5-lock-on-bar')])
})
await S('wk-pw', async () => {
  await press(w, T('bal-name-bane')); await P.waitForTimeout(800); await shot(w, W('c1-own-window'))
  const pw = await pwRead(P)
  rec('14 person window from a name on Balances, admin (WebKit)', '402 webkit', pw && /Ranger/.test(pw.name) && pw.box.left >= 0 && pw.box.right <= pw.vw && pw.box.top >= 0 && pw.box.bottom <= pw.vh ? 'PASS' : 'FAIL', JSON.stringify({ ...pw, lines: pw?.lines.length + ' lines' }), [W('c1-own-window')])
  rec('close', '402 webkit', 'NOTE', 'closed by ' + await closePw(w), [])
})
await S('wk-member', async () => {
  await L.switchTo(w, 'member'); await openBalances(w); await shot(w, W('m1-member'))
  const tr = await tabRow(P); const me = await balRow(P, 'bane'), other = await balRow(P, 'stiff')
  rec('1 member unlocked (WebKit): his row in boxes, others read only', '402 webkit', me.boxes === 7 && other.boxes === 0 && tr.tabs.length === 3 && !tr.gear ? 'PASS' : 'FAIL', `his boxes ${me.boxes}; Saber's ${other.boxes}; tabs ${tr.tabs.length}; gear ${!!tr.gear}`, [W('m1-member')])
  const lb = await lockViaBridge(w, true); await P.waitForTimeout(700); await shot(w, W('m2-locked'))
  const me2 = await balRow(P, 'bane'); const words = await P.evaluate(() => document.querySelector('[data-testid="bal-locked"]')?.textContent.trim())
  rec('1 member locked (WebKit)', '402 webkit', lb.ok && me2.boxes === 0 && /Locked by admin/.test(words || '') ? 'PASS' : 'FAIL', `helper ${JSON.stringify(lb)}; words "${words}"; boxes ${me2.boxes}`, [W('m2-locked')])
  await press(w, T('bal-name-bane')); await P.waitForTimeout(800); await shot(w, W('m3-locked-window'))
  const pw = await pwRead(P)
  rec('24/42 his own window locked (WebKit)', '402 webkit', pw && pw.boxes === 0 && /Locked by admin/.test(pw.lock || '') && pw.box.right <= pw.vw && pw.box.bottom <= pw.vh ? 'PASS' : 'FAIL', JSON.stringify({ ...pw, lines: pw?.lines.length + ' lines' }), [W('m3-locked-window')])
  await closePw(w)
  await lockViaBridge(w, false)
})
rec('errors (WebKit)', '402 webkit', errs.length ? 'FAIL' : 'PASS', errs.length ? errs.join(' || ').slice(0, 800) : 'no console error, page error or 4xx', [])
L.writeResults('b6')
await ctx.close(); await bw.close(); await L.closeBrowser()
