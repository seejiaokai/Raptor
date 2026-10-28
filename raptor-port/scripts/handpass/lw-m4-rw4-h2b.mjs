// Re-walk 4, H2: a month's chip comes with its first request and goes with its last (D1444 B), phone 402, by finger. Chromium.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk4'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw4-h2b v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const DAY = '2026-03-10'
const chips = () => P.evaluate(() => ({ months: [...document.querySelectorAll('[data-testid^="appr-m-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.trim() + (/on|lit|sel|active/.test(String(e.className)) ? '*' : '') + '[' + String(e.className).replace(/appr-f\s*/, '') + ']'), rows: [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70)), sub: document.querySelector('[data-testid="appr-sub"]')?.innerText.trim(), tab: document.querySelector('[data-testid="lw-approvals-count"]')?.innerText.trim() }))
const top = async name => { const g = await P.evaluate(() => { const r = document.querySelector('[data-testid="approvals-page"] .appr-card').getBoundingClientRect(); const c = document.querySelector('[data-testid="approvals-page"] .appr-cols').getBoundingClientRect(); return { y: Math.max(0, r.top - 10), h: c.top - r.top + 160 } }); await shot(w, name, { clip: { x: 0, y: g.y, width: 402, height: g.h } }) }
const clearBid = async () => { await L.openCell(w, 'bane', DAY); await B.press(w, T('bid-clear')); await B.sleep(w, 500); if (await B.vis(P, T('bid-picker'))) { await B.press(w, T('bid-clear')); await B.sleep(w, 600) } }
const body = () => P.evaluate(() => document.querySelector('[data-testid="approvals-page"]').innerText.replace(/\s+/g, ' ').slice(0, 400))
try {
  await B.signIn(w, 'admin'); await B.switchTo(w, 'member')
  await L.openCell(w, 'bane', DAY); await L.placeLeave(w, 'LL'); await B.sleep(w, 400)
  await B.switchTo(w, 'admin')
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0))
  await B.press(w, T('appr-m-2026-03'), null); await B.sleep(w, 500); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 200)
  console.log('picked', JSON.stringify(await chips())); await top('h2b-1-picked')
  const r = await P.evaluate(d => window.lwSetCell('bane', d, ''), DAY); await B.sleep(w, 600)
  const c = await chips(); console.log('cleared while Mar picked: cleared', r, JSON.stringify(c)); console.log('page text:', await body()); await top('h2b-2-deleted-while-picked')
  rec('H2 deleted its last request while its chip is picked (the bid cleared with Approvals open; not by a screen control)', 'phone', 'SEE', `chips ${JSON.stringify(c.months)}; lines ${JSON.stringify(c.rows)}; sub ${c.sub}`, ['h2b-1-picked.png', 'h2b-2-deleted-while-picked.png'])
  await B.press(w, T('appr-all'), null); await B.sleep(w, 500); await P.evaluate(() => window.scrollTo(0, 0))
  const c2 = await chips(); console.log('then All tapped', JSON.stringify(c2.months)); await top('h2b-3-all')
} catch (e) { console.log('ERR', String(e).slice(0, 400)) }
if (w.errs.length) console.log('errs', w.errs)
await w.ctx.close(); await B.closeAll()
