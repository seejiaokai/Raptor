import { launch, ctxOpen, SIZES, sleep, go, shot, rec, errors, reload } from './lib.mjs'
console.log('sc19 v1')
const b = await launch()
/* 19: the week's tab order, Shift+Tab, Enter on R */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '19')
  await go(p, 'editsched')
  const mk = (k) => `#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.${k}"]`
  const act = () => p.evaluate(() => { const a = document.activeElement; return (a.dataset && a.dataset.txt) || a.tagName })
  const first = p.locator(mk('cs')).first(); await first.evaluate(e => e.scrollIntoView({ block: 'center' })); await first.click(); await sleep(200)
  const order = [await act()]
  for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); await sleep(200); order.push(await act()) }
  const vals = await p.evaluate(() => ['rl', 'br'].map(k => ({ k, text: document.querySelector(`#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.${k}"]`).textContent, ph: document.querySelector(`#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.${k}"]`).dataset.ph })))
  const m = await p.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; return { rl: f.rl, br: f.br } })
  const exp = ['ff:0.0.0.cs', 'ff:0.0.0.msn', 'ff:0.0.0.rl', 'ff:0.0.0.br', 'ff:0.0.0.to', 'ff:0.0.0.ld']
  rec('19', 'desk', 'week: click CS then Tab x5', 'CS, MSN, R, B, TO, LD; nothing filled', { order, vals, model: m }, JSON.stringify(order) === JSON.stringify(exp) && !m.rl && !m.br ? 'PASS' : 'FAIL', await shot(p, 'A19-week-tab', p.locator('#eWeek .day[data-day="0"] .go').first()))
  const back = []
  for (let i = 0; i < 5; i++) { await p.keyboard.press('Shift+Tab'); await sleep(200); back.push(await act()) }
  rec('19', 'desk', 'week: Shift+Tab x5 from LD', 'TO, B, R, MSN, CS', back, JSON.stringify(back) === JSON.stringify(['ff:0.0.0.to', 'ff:0.0.0.br', 'ff:0.0.0.rl', 'ff:0.0.0.msn', 'ff:0.0.0.cs']) ? 'PASS' : 'FAIL')
  const m2 = await p.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; return { rl: f.rl, br: f.br } })
  rec('19', 'desk', 'week: after the Tab walk', 'still nothing filled', m2, !m2.rl && !m2.br ? 'PASS' : 'FAIL')
  /* click R: placed, Enter */
  const r = p.locator(mk('rl')).first(); await r.click(); await sleep(200)
  const placed = await r.evaluate(e => ({ text: e.textContent, sel: String(getSelection()), act: document.activeElement === e }))
  await p.keyboard.press('Enter'); await sleep(500)
  const afterEnter = await p.evaluate(() => ({ rl: window.DAYS[0].waves[0].formations[0].rl, active: (document.activeElement.dataset && document.activeElement.dataset.txt) || document.activeElement.tagName }))
  rec('19', 'desk', 'week: click R (suggestion placed), press Enter', 'RECORD: saves 09:40 and leaves (compare: typed value + Enter saves, per host look)', { placed, afterEnter }, 'RECORD', await shot(p, 'A19-week-enter', p.locator('#eWeek .day[data-day="0"] .go').first()))
  /* week: click R, Escape takes out */
  const r2 = p.locator(mk('rl')).first(); await p.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; f.rl = f.rl });
  await ctx.close()
}
/* 20: the next-week peek */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '20')
  await go(p, 'editsched')
  const tabs = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => /^Jul \d\d$/.test((e.innerText || '').trim())).map(e => e.innerText.trim() + '|' + [...e.attributes].map(a => a.name + '=' + a.value).join(',').slice(0, 80)))
  console.log('week tabs', JSON.stringify(tabs))
  const peekBefore = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day')].slice(7).map(d => ({ day: d.dataset.day, heads: [...d.querySelectorAll('.fhead, [class*=colh], .go-hd, .gohead')].map(e => e.innerText.replace(/\s+/g, ' ')).slice(0, 3), txt: (d.querySelector('.go') ? d.querySelector('.go').innerText.replace(/\s+/g, ' ').slice(0, 220) : '') })).slice(0, 2))
  console.log('peek before', JSON.stringify(peekBefore))
  await p.locator('button:visible', { hasText: /^Jul 20$/ }).first().click(); await sleep(1200)
  const r = p.locator('[data-txt="ff:0.0.0.rl"]').first(); await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await r.click(); await sleep(150); await p.keyboard.type('0800'); await p.keyboard.press('Enter'); await sleep(500)
  const typed = await p.evaluate(() => ({ rl: window.DAYS[0].waves[0].formations[0].rl, to: window.DAYS[0].waves[0].formations[0].to, cs: window.DAYS[0].waves[0].formations[0].cs }))
  console.log('typed on week Jul 20 Monday', JSON.stringify(typed))
  await p.locator('button:visible', { hasText: /^Jul 13$/ }).first().click(); await sleep(1200)
  const peek = await p.evaluate(() => { const days = [...document.querySelectorAll('#eWeek .day')]; const pk = days.slice(7); const d = pk[0]; const g = d && d.querySelector('.go'); return { n: pk.length, firstDayText: g ? g.innerText.replace(/\s+/g, ' ').slice(0, 400) : null, rBoxes: d ? [...d.querySelectorAll('.rl, [data-txt$=".rl"]')].map(e => e.textContent + '|' + e.tagName) : [], headRow: g ? [...g.querySelectorAll('div, span')].filter(e => e.children.length === 0 && /^(R|B|TO|LD)$/.test(e.textContent.trim())).map(e => e.textContent.trim()) : [] } })
  rec('20', 'desk', 'type R 08:00 on next week\'s Monday, return to this week, look at the next-week peek', 'the peek headed R/B and TO/LD, showing next week\'s R 08:00 above its brief', peek, peek.headRow.length >= 4 && /08:00/.test(peek.firstDayText || '') ? 'PASS' : 'FAIL', await shot(p, 'A20-peek', p.locator('#eWeek .day').nth(7)))
  console.log('errors', JSON.stringify(errors))
  await ctx.close()
}
await b.close()
