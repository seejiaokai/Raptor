// W2 part K: scenario 10 with a real mark (tap DCO), and a probe of Edit Schedule for a change to make (scenario 13/14).
console.log('nk28-w2k v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const corner = p => p.evaluate(() => { const s = document.getElementById('saveStat'); return s ? { vis: s.checkVisibility(), text: s.textContent.trim(), cls: s.className } : null })
const w = await world(); const p = w.page
try {
  await L.login(p, 'a'); await sleep(500)
  await nav(p, 'tracker'); await sleep(600)
  const ball = await p.locator('#flowSvg .ball').first().boundingBox()
  await p.touchscreen.tap(ball.x + ball.width / 2, ball.y + ball.height / 2); await sleep(700)
  const c0 = await corner(p)
  const dco = p.locator('button:visible', { hasText: /^DCO$/ }).first()
  const tt = await tapShot(p, await dco.boundingBox(), 'S10-mark-tap', 700)
  await sleep(800)
  const f1 = await pic(p, 'S10-marked')
  const c1 = await corner(p)
  const undoState = await p.evaluate(() => { const u = document.getElementById('trUndoBtn'); return u ? { disabled: u.disabled, cls: u.className, title: u.title } : null })
  ok('10', 'Tracker corner stays empty after a ball is marked (DCO)', (!c0 || !c0.vis || c0.text === '') && (!c1 || !c1.vis || c1.text === ''), `popover open: ${JSON.stringify(c0)}; after the mark ${JSON.stringify(c1)}; Undo button ${JSON.stringify(undoState)}; tap picture ${tt.ms}ms after the tap start`, f1 + ' | ' + tt.quick)
  await p.tap('#trUndoBtn'); await sleep(700)
  const f2 = await pic(p, 'S10-undone'); const c2 = await corner(p)
  ok('10', 'Tracker Undo of the mark; corner still empty', !c2 || !c2.vis || c2.text === '', JSON.stringify(c2), f2)
  // probe Edit Schedule
  await nav(p, 'editsched'); await sleep(900)
  console.log('editsched inputs', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('input, textarea, [contenteditable=true], .tm, [data-k]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top > 80 && r.top < 874 && r.left < 402 && e.checkVisibility() }).slice(0, 30).map(e => e.tagName + '#' + e.id + '.' + String(e.className).split(' ')[0] + '|' + (e.value || e.innerText || '').slice(0, 14) + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top) + '|' + (e.getAttribute('data-k') || e.getAttribute('data-key') || '')))))
  await pic(p, 'probe-editsched')
} catch (e) { ok('K', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('K', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
