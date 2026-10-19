import { launch, ctxOpen, SIZES, sleep, go, shot, rec, errors, reload } from './lib.mjs'
console.log('sc20 v2')
const b = await launch()
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
  const peek = await p.evaluate(() => { const days = [...document.querySelectorAll('#eWeek .day')]; const pk = days.slice(7); const d = pk[0]; const g = d.querySelector('.go'); const heads = [...g.querySelectorAll('*')].filter(e => /^Rs*B$|^TOs*LD$/.test((e.innerText || '').trim()) && e.children.length <= 3).map(e => (e.innerText || '').trim().replace(/s+/g, '/')); const f = g.querySelector('.form'); const tx = f ? [...f.querySelectorAll('.fcell.bto *, .fcell.ld *')].filter(e => e.children.length === 0).map(e => e.textContent.trim()) : []; d.scrollIntoView({ block: 'start' }); return { heads: [...new Set(heads)], formCells: tx, inPeek: !!d.closest('[class*=peek], #peekWrap, .peekw') } })
  await sleep(400)
  rec('20', 'desk', 'type R 08:00 on next week Monday, return to this week, look at the next-week peek', 'peek headed R/B and TO/LD; shows next week values: R 08:00 above B', peek, peek.heads.length >= 2 && peek.formCells[0] === '08:00' ? 'PASS' : 'FAIL', await shot(p, 'A20-peek-view'))
  console.log('errors', JSON.stringify(errors))
  await ctx.close()
}
await b.close()
