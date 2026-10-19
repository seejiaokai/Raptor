import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, wait, tapEl, typeBox, scrollTo, chips, weekTo, openWarn } from './sf-B-lib.mjs'
console.log('sf-B-bt v1')
await proveBundle()
const browser = await launch()
const rec = (id, ok, note) => console.log(ok === true ? 'PASS' : ok === false ? 'FAIL' : 'RECORD', id, '::', note)
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  const DI = 5, SEL = '#schedBoard'
  const av = await addWaveAndSeat(p, DI, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  const f = n => `${SEL} [data-bfld="ff:5.${av}.0.${n}"]`
  await openBoard(p, DI)
  const stored = n => p.evaluate(([av, n]) => window.DAYS[5].waves[av].formations[0][n], [av, n])
  const weekBadge = async () => {
    await p.evaluate(() => document.querySelector('#sbDone').click()); await wait(p, 700)
    await p.evaluate(() => window.go('editsched')); await wait(p, 600)
    await weekTo(p, ctx, 5)
    const b = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day')[5].querySelectorAll('.badge')].map(x => x.innerText.replace(/\s+/g, ' ')).join(' ; '))
    const wkRow = await p.evaluate(() => { const d = document.querySelectorAll('#eWeek .day')[5]; return [...d.querySelectorAll('.saflies')].map(x => x.innerText.trim()).join(',') + ' | R/START text: ' + (d.querySelector('.sa-avalon, .go')?.innerText || '').replace(/\s+/g, ' ').slice(0, 90) })
    await p.evaluate(d => window.openScheduler(d), DI); await p.waitForSelector(SEL); await wait(p, 800)
    return { b, wkRow }
  }
  const baseBadge = (await weekBadge()).b
  console.log('baseline week badge (standing by):', baseBadge)
  let n = 0
  for (const junk of ['abc', ' ', '7', '25:90', '0830']) {
    n++
    await scrollTo(p, p.locator(f('rl')).first(), 250)
    const z = await typeBox(p, p.locator(f('rl')), junk)
    const rl = await stored('rl')
    const boxVal = await p.evaluate(sel => document.querySelector(sel).value, f('rl'))
    const c = await chips(p, SEL)
    const litN = c.filter(x => /✓/.test(x.txt)).length
    await shot(p, `B-BT1-${n}-r-${junk.replace(/[^a-z0-9]/gi, '_') || 'space'}`)
    await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 200)
    const wl = await openWarn(p)
    await tapEl(p, p.locator('#schedBoard .wh[data-sbwtog]'), { label: 'fold' })
    const oil = await p.evaluate(() => { const b = document.querySelector('#schedBoard [data-oilmode]'); return b ? 'oil button present' : 'none' })
    const { b } = await weekBadge()
    const flies = litN > 0
    const longDay = /long work day|crew rest/i.test(wl)
    console.log(`BT1 junk=${JSON.stringify(junk)} -> stored R ${JSON.stringify(rl)}, box shows ${JSON.stringify(boxVal)}, lit chips ${litN}/${c.length}, zoom ${z.scale}, week badge "${b}" (standing-by baseline "${baseBadge}"), warnings: ${wl.slice(0, 220)}`)
    rec(`BT1-${n}`, junk === '0830' ? (flies && longDay) : (flies === (b !== baseBadge) ), `${JSON.stringify(junk)}: stored ${JSON.stringify(rl)}; chip lit ${flies}; badge changed ${b !== baseBadge}; warning list has a long-day/crew-rest line ${longDay}`)
  }
  // clear
  await scrollTo(p, p.locator(f('rl')).first(), 250); await typeBox(p, p.locator(f('rl')), '')
  console.log('after clearing R:', JSON.stringify(await stored('rl')), (await chips(p, SEL)).map(x => x.txt).join(','))
  // BT2: a literal dash typed in an empty standby R
  for (const dash of ['–', '—', '-']) {
    await scrollTo(p, p.locator(f('rl')).first(), 250)
    await typeBox(p, p.locator(f('rl')), dash)
    const rl = await stored('rl'), boxVal = await p.evaluate(sel => document.querySelector(sel).value, f('rl'))
    const c = await chips(p, SEL), lit = c.filter(x => /✓/.test(x.txt)).length
    await shot(p, `B-BT2-${dash.charCodeAt(0)}`)
    const { b } = await weekBadge()
    rec(`BT2-${dash.charCodeAt(0)}`, lit === 0 && b === baseBadge, `typed ${JSON.stringify(dash)} (U+${dash.charCodeAt(0).toString(16)}): stored ${JSON.stringify(rl)}, box shows ${JSON.stringify(boxVal)}, lit chips ${lit}, week badge "${b}" vs baseline "${baseBadge}"`)
    await scrollTo(p, p.locator(f('rl')).first(), 250); await typeBox(p, p.locator(f('rl')), '')
  }
  console.log('errors', JSON.stringify(errors))
} finally { await browser.close() }
