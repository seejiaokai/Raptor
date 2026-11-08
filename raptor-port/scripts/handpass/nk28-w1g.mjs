// W1 part G: scenario 15 (magnifier at 4x), 10 (Tracker corner), 14 (plain-user round, abridged). Version: nk28-w1g v1
console.log('nk28-w1g v2')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
// 15
{
  const w = await world({ dpr: 4 }); const p = w.page
  await p.waitForSelector('#luser'); await L.login(p, 'a')
  await tab(p, 'editsched'); await sleep(700)
  const e = p.locator('input[placeholder*="callsign" i]:visible').first()
  const eb = await e.boundingBox()
  const pe = await shot(p, '15-editsched-search', { clip: { x: eb.x - 44, y: eb.y - 6, width: 190, height: eb.height + 12 } })
  await tab(p, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await sleep(900)
  const f = p.locator('input[placeholder*="find" i]:visible, input[type=search]:visible, input[placeholder*="search" i]:visible').first()
  let pt = null, fb = null
  if (await f.count()) { fb = await f.boundingBox(); pt = await shot(p, '15-tracker-find', { clip: { x: fb.x - 44, y: fb.y - 6, width: 190, height: fb.height + 12 } }) }
  const info = await p.evaluate(() => [...document.querySelectorAll('svg.srchglyph, .srchglyph')].filter(s => s.getBoundingClientRect().width > 0).map(s => { const r = s.getBoundingClientRect(); return [String(s.className.baseVal || s.className).slice(0, 25), Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10, s.innerHTML.length].join(' ') }))
  note('15 magnifier close-ups (4x pictures to be read side by side)', JSON.stringify({ editSchedBox: eb, trackerBox: fb, glyphsOnTrackerPage: info }), pe + ' ; ' + pt)
  await w.ctx.close()
}
// 10 and 14
{
  const w = await world({}); const p = w.page
  await p.waitForSelector('#luser'); await L.login(p, 'a')
  await tab(p, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await sleep(900)
  const before = await p.evaluate(() => (document.querySelector('#saveStat') || {}).textContent)
  const bandB = await vis(p, '.topbar > .savestat.nokeep')
  let how = 'clicked first ball'
  try { await p.locator('#flowSvg .ball').first().click({ timeout: 5000 }); await sleep(700); await p.keyboard.press('Escape'); await sleep(900) } catch (e) { how = 'ball click failed' }
  const after = await p.evaluate(() => (document.querySelector('#saveStat') || {}).textContent)
  const bandA = await vis(p, '.topbar > .savestat.nokeep')
  const pic = await shot(p, '10-tracker-corner', { clip: { x: 0, y: 0, width: 1536, height: 260 } })
  ok('10 Tracker: corner empty, band up, before and after a mark', !!bandB && !!bandA && !(before || '').trim() && !(after || '').trim(), JSON.stringify({ cornerBefore: before, cornerAfter: after, how, bandUpBefore: !!bandB, bandUpAfter: !!bandA }), pic)
  // 14 abridged: windows opened and closed three ways, band must stay
  const checks = []
  const bandUp = async () => !!(await vis(p, '.topbar > .savestat.nokeep'))
  await tab(p, 'editsched'); await sleep(600)
  await p.click('#histBtn'); await sleep(700); checks.push(['changes open', await bandUp()])
  await p.keyboard.press('Escape'); await sleep(500); checks.push(['changes Escape', await bandUp(), await p.locator('.chgwin:visible').count()])
  await p.click('#histBtn'); await sleep(700); await p.click('#histBtn'); await sleep(500); checks.push(['changes toggled shut', await bandUp(), await p.locator('.chgwin:visible').count()])
  await p.locator('button[aria-label*="Notif" i], #bellBtn, .bell').first().click({ timeout: 4000 }).then(async () => { await sleep(700); checks.push(['bell open', await bandUp()]); await p.mouse.click(700, 500); await sleep(500); checks.push(['bell shut by outside tap', await bandUp()]) }).catch(() => checks.push(['bell', 'could not press']))
  await p.locator('button[title*="Undo" i], #undoBtn').first().click({ timeout: 3000 }).then(() => checks.push(['undo pressed', 'ok'])).catch(() => checks.push(['undo', 'not pressable (nothing to undo)']))
  await tab(p, 'inputs'); await sleep(600); await p.click('#inMedBtn'); await sleep(700)
  await p.locator('.medcard', { hasText: 'Zenith' }).first().click(); await sleep(800); checks.push(['viewer open', await bandUp()])
  await p.locator('#docViewPop button', { hasText: 'Close' }).first().click(); await sleep(600); checks.push(['viewer Close', await bandUp(), await p.locator('#docViewPop:visible').count()])
  await p.locator('.medcard', { hasText: 'Zenith' }).first().click(); await sleep(800); await p.keyboard.press('Escape'); await sleep(600); checks.push(['viewer Escape', await bandUp(), await p.locator('#docViewPop:visible').count()])
  const pic14 = await shot(p, '14-after-round', { clip: { x: 0, y: 0, width: 1536, height: 260 } })
  const bad = checks.filter(c => c[1] === false)
  ok('14 plain-user round (abridged): band stays through windows', bad.length === 0, JSON.stringify(checks), pic14)
  if (w.errors.length) note('10/14 page errors', w.errors.join(' | '))
  await w.ctx.close()
}
finish('results-g.json')
await L.closeAll()
