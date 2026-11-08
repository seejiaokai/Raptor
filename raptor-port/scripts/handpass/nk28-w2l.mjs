// W2 part L: scenario 13 (?nostore&savefail, change on Edit Schedule).
console.log('nk28-w2l v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const bandsAll = p => p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); const b = e.querySelector('b'), rest = e.querySelector('.sv-rest'); return { cls: e.className, t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height), bold: b && b.innerText, rest: rest && rest.innerText, btn: [...e.querySelectorAll('button')].map(x => x.innerText.trim()), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) } }))
const w = await world({ locked: false, url: '/?nostore&savefail' }); const p = w.page
try {
  await p.waitForSelector('#luser'); await sleep(900)
  const fs = await pic(p, 'S13-signin'); note('13', 'sign-in screen with ?nostore&savefail', JSON.stringify(await bandsAll(p)), fs)
  await L.login(p, 'a'); await sleep(1200)
  note('13', 'just after sign-in (page ' + await p.evaluate(() => window.CURPAGE) + ')', JSON.stringify(await bandsAll(p)), await pic(p, 'S13-after-signin'))
  await nav(p, 'editsched'); await sleep(900)
  const f0 = await pic(p, 'S13-before')
  const b0 = await bandsAll(p)
  note('13', 'before any change', JSON.stringify(b0), f0)
  const t0 = p.locator('.t:visible', { hasText: '07:45' }).first()
  const tb = await t0.boundingBox()
  await p.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2); await sleep(700)
  const f1 = await pic(p, 'S13-time-open')
  console.log('active', await p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '#' + a.id + '.' + String(a.className).split(' ')[0] + '|' + (a.value || a.innerText || '').slice(0, 20) : null }))
  await p.keyboard.press('Control+A'); await p.keyboard.type('0800'); await p.keyboard.press('Enter'); await sleep(1200)
  const f2 = await pic(p, 'S13-after')
  const b2 = await bandsAll(p)
  const timeNow = await p.evaluate(() => [...document.querySelectorAll('.t')].filter(e => e.checkVisibility()).slice(0, 2).map(e => e.innerText))
  const failed = b2.some(x => /failed/.test(x.cls) || /Not saved/.test(x.text))
  const nokeep = b2.some(x => x.bold === 'Not kept')
  note('13', 'after a change with ?nostore&savefail', `times now ${JSON.stringify(timeNow)}; bands=${JSON.stringify(b2)}; "Not saved" shows=${failed}; "Not kept" shows=${nokeep}`, f0 + ' | ' + f2)
  ok('13', 'a failed save wins over Not kept (Not saved + Retry, one band)', failed && !nokeep && b2.length === 1 && b2[0].btn.some(x => /Retry/i.test(x)), JSON.stringify(b2), f2)
} catch (e) { ok('L', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('L', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
