/* [WARN-HIDE-KEPT] walker A — probe 8 (own worlds, nothing recorded): a WSO dragged into a front seat; one man put on
   a programme item, ground items, sims and a duty desk; the lower blocks of the day. */
import { world, L, W, pic, toastNow, warnsOf, pk, sum } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const short = (w, id) => w.filter(x => x.who.includes(id)).map(x => `${x.ix} ${x.sev} ${x.code} @${x.key} :: ${x.msg.slice(0, 80)}`).join('\n   ')
{
  const { browser, p } = await world(); p.setDefaultTimeout(6000)
  try {
    await L.go(p, 'editsched'); await W.boardOn(p, 1)
    const plus = p.locator('#schedBoard [data-lac="1.0.1"]').first(); await plus.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await plus.click(); await L.sleep(600)
    const armed = await handPut(p, '1.0.1.2.p', 'psy'); console.log('(a) armed pick of a WSO for FCP:', JSON.stringify(armed))
    if (!armed.took) {
      const src = p.locator('#sbRoster .rpuck[data-person="psy"]:visible').first(), dst = p.locator('#schedBoard [data-slot="1.0.1.2.p"]').first()
      await W.drag(p, src, dst); console.log('(a) drag: seat holds', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot="1.0.1.2.p"] [data-person]')].map(e => e.dataset.person)), '| toast:', await toastNow(p))
    }
    console.log('(a) warnings naming Cutter:\n   ' + short(await warnsOf(p, 1), 'psy'))
    console.log('(a) board', sum(await pk(p, '#schedBoard', 'psy')))
  } catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
  await browser.close()
}
{
  const { browser, p } = await world(); p.setDefaultTimeout(6000)
  try {
    await L.go(p, 'editsched'); await W.boardOn(p, 1)
    console.log('\n(b) fills:', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill]')].map(e => { const r = e.closest('.sb-arow, .sb-line, [class*=row]'); const nm = r ? [...r.querySelectorAll('input')].slice(0, 3).map(i => i.value).join('/') : ''; return e.dataset.fill + '=' + nm }).join('  ')))
    for (const k of ['a:1.1.+', 'g:1.2.+', 'g:1.3.+', 's:1.oft.1.+', 's:1.amt.1.+', 'd:1.1.0.+']) { const r = await handPut(p, k, 'shaft'); console.log('(b) put Anvil', k, r.took, '|', (r.msg || '').slice(0, 110)) }
    console.log('(b) warnings naming Anvil:\n   ' + short(await warnsOf(p, 1), 'shaft'))
    console.log('(b) board', sum(await pk(p, '#schedBoard', 'shaft')))
    await W.boardOff(p)
    console.log('(b) week ', sum(await pk(p, '#eWeek .day[data-day="1"]', 'shaft')))
    /* (c) the lower blocks */
    await p.locator('#eWeek .day[data-day="1"] [data-pitog="1"]').first().click(); await L.sleep(400)
    console.log('\n(c) Personal Inputs block:', await p.evaluate(() => { const s = document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.inputs"]'); return s.innerText.replace(/\n+/g, ' | ').slice(0, 500) + ' PUCKS ' + [...s.querySelectorAll('.puck[data-person]')].map(e => e.dataset.person + ':' + e.className).join(', ') }))
    console.log('(c) SANS block:', await p.evaluate(() => { const s = document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.sans"]'); return s.innerText.replace(/\n+/g, ' | ').slice(0, 300) + ' PUCKS ' + [...s.querySelectorAll('.puck[data-person]')].map(e => e.dataset.person + ':' + e.className).join(', ') }))
    console.log('(c) Unavailable block:', await p.evaluate(() => { const s = document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.unav"]'); return s.innerText.replace(/\n+/g, ' | ').slice(0, 300) + ' PUCKS ' + [...s.querySelectorAll('.puck[data-person]')].map(e => e.dataset.person + ':' + e.className).join(', ') }))
    console.log('(c) Available block:', await p.evaluate(() => { const s = document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.avail"]'); return s.innerText.replace(/\n+/g, ' | ').slice(0, 200) + ' FLAGGED ' + [...s.querySelectorAll('.puck.warn[data-person]')].map(e => e.dataset.person + ':' + e.className).join(', ') }))
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.inputs"]').scrollIntoView({ block: 'start', inline: 'nearest' })); await L.sleep(300)
    await pic(p, 'probe8-lower-blocks')
  } catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
  await browser.close()
}
