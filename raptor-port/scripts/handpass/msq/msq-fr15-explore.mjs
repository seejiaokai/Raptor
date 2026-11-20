/* msq-fr15-explore v8 — W4: scope "Outlaw" to the page that holds it */
process.env.FR15_SC = 'explore'
const L = await import('./msq-fr15-lib.mjs')
const { X, say, sleep, tapIt, openAt, FIND } = L
const w = await openAt('ad2')
const p = w.page
const ctx = () => p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => !e.children.length && /Outlaw/i.test(e.textContent || '')).map(e => {
  const r = e.getBoundingClientRect()
  const pg = e.closest('[id^="page-"], #eWeek, #vWeek, [data-page]')
  const tr = e.closest('tr')
  const vis = (() => { let n = e; while (n) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; n = n.parentElement } return true })()
  return `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.top)} vis=${vis} page=${pg ? (pg.id || pg.tagName) : 'none'} tr="${tr ? tr.innerText.replace(/\s+/g, ' ').slice(0, 70) : ''}"`
}))
say('page ids', await p.evaluate(() => [...document.querySelectorAll('[id^="page-"]')].map(e => e.id + ':' + (getComputedStyle(e).display)).join(' ')))
await X.L.go(p, 'admin'); await sleep(1200)
await p.locator(FIND).fill('Outlaw'); await sleep(700)
await tapIt(p.locator('.acc-row[data-person="casper"] .acc-tap').first()); await sleep(900)
await tapIt(p.locator('#accEdDel')); await sleep(700); await tapIt(p.locator('#accEdDel')); await sleep(1500)
await X.L.go(p, 'quals'); await sleep(1800)
say('after delete, no reload:\n' + (await ctx()).filter(s => !/vis=false/.test(s)).join('\n'))
await p.reload(); await sleep(1500)
if (await p.locator('#luser').count()) await X.login(p, 'ad2')
await X.L.go(p, 'quals'); await sleep(1800)
say('after reload:\n' + (await ctx()).filter(s => !/vis=false/.test(s)).join('\n'))
say('page now', await p.evaluate(() => window.CURPAGE + ' ' + [...document.querySelectorAll('[id^="page-"]')].map(e => e.id + ':' + getComputedStyle(e).display).join(' ')))
const el = p.locator('.whoedit', { hasText: 'Outlaw' }).first()
say('whoedit count', await p.locator('.whoedit', { hasText: 'Outlaw' }).count())
say('chain', await el.evaluate(e => { const c = []; let n = e; for (let i = 0; i < 12 && n; i++, n = n.parentElement) c.push(n.tagName + (n.id ? '#' + n.id : '') + '.' + String(n.className).split(' ').slice(0, 2).join('.')); return c.join(' < ') }))
await el.scrollIntoViewIfNeeded(); await sleep(500)
await X.pic(w, 'x8-outlaw-where')
await X.fin(w)
