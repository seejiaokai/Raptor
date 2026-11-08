// W2 part N: scenario 14, the plain-user round (storage refused): time change + Undo/Redo, windows closed four ways, bell, + Input probe.
console.log('nk28-w2n v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea, a, label')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !e.closest('#drawer') }).slice(0, 45).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || e.placeholder || '').trim().slice(0, 26).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
const bandOk = async p => { const b = await vis(p, '.topbar > .savestat.nokeep'); return !!b && b.bold === 'Not kept' && b.rest === REST && b.h === 36 && !b.btn }
const w = await world(); const p = w.page
const times = () => p.evaluate(() => [...document.querySelectorAll('.t')].filter(e => e.checkVisibility()).slice(0, 2).map(e => e.innerText).join('/'))
try {
  await L.login(p, 'a'); await sleep(500)
  await nav(p, 'editsched'); await sleep(800)
  // change a time, undo, redo
  const t0 = await times()
  const tb = await p.locator('.t:visible', { hasText: '07:45' }).first().boundingBox()
  await p.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2); await sleep(600)
  await p.keyboard.press('Control+A'); await p.keyboard.type('0800'); await p.keyboard.press('Enter'); await sleep(900)
  const t1 = await times(); const f1 = await pic(p, 'S14-time-changed')
  await p.tap('#undoBtn'); await sleep(800); const t2 = await times(); const f2 = await pic(p, 'S14-undone')
  await p.tap('#redoBtn'); await sleep(800); const t3 = await times(); const f3 = await pic(p, 'S14-redone')
  ok('14', 'change a time, Undo, Redo', t0 !== t1 && t2 === t0 && t3 === t1 && await bandOk(p), `times ${t0} -> ${t1} -> undo ${t2} -> redo ${t3}; band whole: ${await bandOk(p)}`, f1 + ' | ' + f2 + ' | ' + f3)
  // windows: changes window, Jump to a date, bell; each closed by every way that applies
  const base = (await firstTop(p)).t
  const wins = [
    ['changes window', '#histBtn', { x: '.win-x >> visible=true', esc: true, outside: true }],
    ['Jump to a date', '.wknav-mbtn', { esc: true, outside: true }],
    ['bell', '#notifyBell', { esc: true, outside: true }],
  ]
  for (const [name, sel, hows] of wins) {
    for (const how of ['x', 'esc', 'outside']) {
      if (how === 'x' && !hows.x) continue
      try {
        await p.evaluate(() => window.go('editsched')); await sleep(500)
        await p.tap(sel); await sleep(800)
        const fo = await pic(p, `S14-${name.replace(/\W+/g, '_')}-open-${how}`)
        const ctl = await list(p)
        if (how === 'x') await p.tap(hows.x)
        else if (how === 'esc') await p.keyboard.press('Escape')
        else await p.touchscreen.tap(380, 840)
        await sleep(700)
        const fc = await pic(p, `S14-${name.replace(/\W+/g, '_')}-closed-${how}`)
        const open = await p.evaluate(() => { const e = [...document.querySelectorAll('.win-x, .availwin, .bellmenu, .bell-pop, #notifyMenu, .dpop, .jump-pop, .wk-cal')].filter(e => e.checkVisibility() && e.getBoundingClientRect().width > 0); return e.map(e => String(e.className).split(' ')[0]) })
        const ft = (await firstTop(p)).t
        ok('14', `${name} closed by ${how}`, open.length === 0 && ft === base && await bandOk(p), `still-open parts: ${JSON.stringify(open)}; first content ${ft} (before ${base}); band whole ${await bandOk(p)}`, fo + ' | ' + fc)
        if (how === 'x' && name === 'changes window') note('14', 'changes window controls', ctl, fo)
      } catch (e) { ok('14', `${name} closed by ${how}`, null, 'NOTRUN: ' + String(e.message).split('\n')[0]) }
    }
  }
  // the + Input probe
  await nav(p, 'inputs'); await sleep(600)
  await p.tap('#inListBtn'); await sleep(800)
  await p.tap('#inNew'); await sleep(1000)
  await pic(p, 'probe-new-input')
  console.log('new input controls', await list(p))
} catch (e) { ok('N', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('N', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
