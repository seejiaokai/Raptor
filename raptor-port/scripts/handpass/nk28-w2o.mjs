// W2 part O: scenario 14 rest: file an input and find it on the schedule; input window closed four ways; Jump to a date; changes window Escape again.
console.log('nk28-w2o v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const bandOk = async p => { const b = await vis(p, '.topbar > .savestat.nokeep'); return !!b && b.bold === 'Not kept' && b.rest === REST && b.h === 36 && !b.btn }
const openParts = p => p.evaluate(() => [...document.querySelectorAll('.win-x, .availwin, .dpop, .datecal, .caldrop, [class*=jump]')].filter(e => e.checkVisibility() && e.getBoundingClientRect().width > 0).map(e => String(e.className).split(' ')[0]))
const w = await world(); const p = w.page
const tapAt = async (sel) => { const b = await p.locator(sel).locator('visible=true').first().boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
try {
  await L.login(p, 'a'); await sleep(500)
  await nav(p, 'inputs'); await sleep(600)
  await p.tap('#inListBtn'); await sleep(800)
  // the input window closed four ways
  for (const how of ['x', 'cancel', 'esc', 'outside']) {
    await p.tap('#inNew'); await sleep(900)
    const fo = await pic(p, `S14-newinput-open-${how}`)
    if (how === 'x') await tapAt('.win-x >> visible=true')
    else if (how === 'cancel') await p.locator('button:visible', { hasText: /^Cancel$/ }).first().tap()
    else if (how === 'esc') await p.keyboard.press('Escape')
    else await p.touchscreen.tap(380, 860)
    await sleep(800)
    const fc = await pic(p, `S14-newinput-closed-${how}`)
    const op = await openParts(p)
    const still = await p.evaluate(() => /New input/.test(document.body.innerText) && !![...document.querySelectorAll('.win-x')].find(e => e.checkVisibility()))
    note('14', `+ Input window closed by ${how}`, `window still on screen: ${still}; band whole ${await bandOk(p)}`, fo + ' | ' + fc)
    if (still) { await p.tap('.win-x >> visible=true').catch(() => {}); await sleep(600) }
  }
  // file an OL for Saber on 14 Jul
  await p.tap('#inNew'); await sleep(900)
  await p.locator('button:visible', { hasText: /^14$/ }).first().tap(); await sleep(500)
  const ff = await pic(p, 'S14-newinput-filled')
  await p.locator('button:visible', { hasText: /^Add$/ }).first().tap(); await sleep(1200)
  const fa = await pic(p, 'S14-newinput-added')
  await p.locator('button:visible', { hasText: /^No document$/ }).first().tap(); await sleep(1200)
  await pic(p, 'S14-newinput-nodoc')
  const q = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300))
  if (await p.evaluate(() => /New input/.test(document.body.innerText))) { note('14', 'window still open after No document', q, fa); await p.keyboard.press('Escape'); await sleep(500) }
  note('14', 'after Add', q, ff + ' | ' + fa)
  // find it on the schedule
  await nav(p, 'editsched'); await sleep(900)
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /Next|›/.test(b.innerText) && b.checkVisibility()); })
  const found = await p.evaluate(() => { const t = document.body.innerText.replace(/\s+/g, ' '); const i = t.search(/UNAVAILABLE/i); return { unavail: i, snippet: i >= 0 ? t.slice(i, i + 160) : null, olAt: t.search(/\bOL\b/), olSnippet: t.slice(Math.max(0, t.search(/\bOL\b/) - 80), t.search(/\bOL\b/) + 80) } })
  const fs = await pic(p, 'S14-schedule-after-input')
  note('14', 'schedule after the input (Mon 13 Jul is the open day; the input is 14 Jul)', JSON.stringify(found), fs)
  // jump to a date
  await tapAt('.wknav-mbtn'); await sleep(900)
  const fj = await pic(p, 'S14-jump-open')
  const opJ = await openParts(p)
  note('14', 'Jump to a date opened', `parts ${JSON.stringify(opJ)}; text ${await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(120, 380))}`, fj)
  await p.keyboard.press('Escape'); await sleep(600)
  const fj2 = await pic(p, 'S14-jump-after-esc')
  ok('14', 'Jump to a date closed by Escape', (await openParts(p)).length === 0 && await bandOk(p), `parts left ${JSON.stringify(await openParts(p))}`, fj + ' | ' + fj2)
  await tapAt('.wknav-mbtn'); await sleep(800); await p.touchscreen.tap(380, 860); await sleep(600)
  const fj3 = await pic(p, 'S14-jump-after-outside')
  ok('14', 'Jump to a date closed by an outside tap', (await openParts(p)).length === 0 && await bandOk(p), `parts left ${JSON.stringify(await openParts(p))}`, fj3)
  // changes window, Escape, with a tap on its title first (focus inside)
  await tapAt('#histBtn'); await sleep(800)
  await p.keyboard.press('Escape'); await sleep(600)
  const e1 = (await openParts(p)).length
  const fe = await pic(p, 'S14-changes-esc-nofocus')
  await p.locator('.win-ttl >> visible=true').first().tap().catch(() => {}); await sleep(300)
  await p.keyboard.press('Escape'); await sleep(600)
  const e2 = (await openParts(p)).length
  note('14', 'changes window Escape again', `parts still open after Escape (no tap inside): ${e1}; after a tap on its title then Escape: ${e2}`, fe)
} catch (e) { ok('O', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('O', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
