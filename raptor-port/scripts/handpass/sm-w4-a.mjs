// W4 re-walk, scenarios 1-4 (chat 13, 8 Nov 26). Env: SIZE=pc|phone SC=1|2|3|4 SURF=week|board  SM_DIST=<dist>
import * as L from './sm-lib.mjs'
const SIZE = process.env.SIZE || 'pc', SC = process.env.SC || '1', SURF = process.env.SURF || 'week'
const ORIGIN = process.env.ORIGIN || 'http://localhost:4398'
const tag = `s${SC}-${SIZE}-${SURF}`
console.log('sm-w4-a v1', tag, L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch(SIZE, { origin: ORIGIN })
const { page } = W
const res = { tag }
try {
  await L.signIn(W)
  if (SC === '3') await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief' })
  await L.publishDay(W, 2); await L.closeBoard(W)
  if (SC === '1') res.filed = (await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }))?.type
  if (SC === '2') res.filed = (await L.fileInput(W, { who: 'Bolt', type: 'CSE', iso: '2026-07-15' }))?.type
  if (SC === '4') {
    const sans = await page.evaluate(() => (window.PEOPLE || []).filter(p => /sans/i.test(JSON.stringify(p))).slice(0, 5).map(p => p.cs || p.callsign || p.name))
    res.sansCandidates = sans
    res.filed = (await L.fileInput(W, { who: process.env.SANS || sans[0], type: 'SANS Availability', iso: '2026-07-15' }))?.type
  }
  if (SC === '3') {
    await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500)
    // press Reject on Saint's card then → Unavail
    const card = page.locator('#eWeek section.day[data-day="2"]').locator('text=Safety brief').first()
    await card.scrollIntoViewIfNeeded().catch(() => {})
    res.cardButtons = await page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] button')].filter(b => b.getBoundingClientRect().height > 0 && /Reject|Accept|Unavail/.test(b.textContent)).map(b => b.textContent.trim() + '|' + (b.dataset.testid || b.className)))
    console.log('cardButtons', JSON.stringify(res.cardButtons))
    await L.pic(W, OUT, `${tag}-0-card`, { sel: '#eWeek section.day[data-day="2"]' })
    const sRow = () => page.locator("#eWeek section.day[data-day=\"2\"] .sec-inp"); const rej = sRow().locator("button").filter({ hasText: /Reject/ }).first()
    if (!(await rej.filter({ visible: true }).count())) { await L.press(W, page.locator('#eWeek section.day[data-day="2"] [data-pitog="2"]')); await L.sleep(600) }
    await rej.scrollIntoViewIfNeeded(); await L.pic(W, OUT, tag + "-0a-reject", { sel: '#eWeek section.day[data-day="2"] .sec-inp' })
    await L.press(W, rej); await L.sleep(900)
    res.afterReject = await page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] button')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent.trim()).filter(t => /Unavail|Accept|Reject/.test(t)))
    { const t0 = page.locator('#eWeek section.day[data-day="2"] button').filter({ hasText: /Unavail/ }).filter({ visible: true }); if (!(await t0.count())) { await L.press(W, page.locator('#eWeek section.day[data-day="2"] [data-pitog="2"]')); await L.sleep(600) } }
    const un = sRow().locator("button").filter({ hasText: /Unavail/ }).first(); res.unRowText = await un.evaluate(b => (b.closest(".pl-row") || b.parentElement).textContent.replace(/s+/g, " ").trim().slice(0, 60)); await un.scrollIntoViewIfNeeded(); await L.pic(W, OUT, tag + '-0b-unavbtn', { sel: '#eWeek section.day[data-day="2"]' })
    await L.press(W, un); await L.sleep(1000)
    for (let i = 0; i < 3; i++) {
      const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).length)
      if (!open) break
      await page.locator(L.T('oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click(); await L.sleep(800)
    }
    res.unavRows = await page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] .sec-unav .pl-row')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 50)))
    console.log('afterReject', JSON.stringify(res.afterReject), 'unavRows', JSON.stringify(res.unavRows))
  }
  let opener
  if (SURF === 'board') { await L.openBoard(W, 2); opener = page.locator('#schedBoard [data-pendlist]').filter({ visible: true }).first() }
  else { await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500); opener = page.locator('#eWeek section.day[data-day="2"] [data-pendlist="2"]') }
  res.openerCount = await opener.count()
  res.dayPend = SURF === 'week' ? await L.dayPending(page, 2) : await page.evaluate(() => (document.querySelector('#schedBoard .dpend') || {}).textContent)
  await L.press(W, opener); await L.sleep(1000)
  const readLines = () => page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ tag: e.tagName, plix: e.getAttribute('data-plix'), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) })))
  res.lines = await readLines()
  res.foot = await page.evaluate(() => (document.querySelector('.chgwin .pl-foot') || {}).textContent)
  console.log('lines', JSON.stringify(res.lines), 'foot', JSON.stringify(res.foot))
  await L.pic(W, OUT, `${tag}-1-list`, { sel: '.chgwin' })
  const pick = { 1: /LL/, 2: /CSE/, 3: /Meeting/, 4: /SANS|Avail/ }[SC]
  const line = page.locator('.chgwin .pl-item').filter({ hasText: pick }).first()
  res.lineFound = await line.count()
  if (res.lineFound) {
    res.lineTag = await line.evaluate(e => e.tagName)
    await L.press(W, line)
    if (W.phone) await page.screenshot({ path: OUT + `/${tag}-2-tap100.png` })
    await L.sleep(300)
    await L.pic(W, OUT, `${tag}-2-land-early`, {})
    await L.sleep(900)
    res.after = await page.evaluate(() => ({ y: Math.round(scrollY), toast: (document.querySelector('#toastEl') || {}).textContent, chgwinOpen: !![...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().height > 0),
      flash: [...document.querySelectorAll('.chgflash')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ cls: e.className.slice(0, 50), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), inUnav: !!e.closest('.sec-unav, .sb-panel.unav'), top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height) })) }))
    console.log('after', JSON.stringify(res.after))
    await L.pic(W, OUT, `${tag}-3-land`, { sel: '.chgflash', pad: 40 })
    await L.pic(W, OUT, `${tag}-3-landfull`, {})
  } else console.log('no line matching', String(pick))
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR', res.err); try { await L.pic(W, OUT, `${tag}-err`, {}) } catch {} }
res.errs = W.errs
console.log('RESULT', JSON.stringify(res))
await L.closeAll(W)
