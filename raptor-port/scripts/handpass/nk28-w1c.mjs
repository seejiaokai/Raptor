// W1 control: the changes window moved and reopened in a PLAIN world; the ALL AVAIL count chip. Version: nk28-w1c v1
console.log('nk28-w1c v1')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
for (const locked of [false, true]) {
  const w = await world({ locked }); const p = w.page
  await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'editsched')
  const tag = locked ? 'locked' : 'plain'
  await p.click('#histBtn'); await sleep(900)
  const a = await vis(p, '.chgwin')
  const hb = await p.locator('.chgwin').first().boundingBox()
  await p.mouse.move(hb.x + 14, hb.y + 20); await p.mouse.down(); await p.mouse.move(hb.x - 300, hb.y + 140, { steps: 12 }); await p.mouse.up(); await sleep(500)
  const m = await vis(p, '.chgwin')
  await p.click('#histBtn'); await sleep(600); const c = await vis(p, '.chgwin')
  await p.click('#histBtn'); await sleep(800); const r = await vis(p, '.chgwin')
  note(`ctl ${tag}: changes window first/moved/closed/reopened`, JSON.stringify({ first: a && [a.l, a.t], moved: m && [m.l, m.t], closed: !c, reopened: r && [r.l, r.t] }))
  if (locked) {
    await p.evaluate(() => { const e = [...document.querySelectorAll('.puck.allavail')].filter(x => !x.closest('.rpuck'))[3]; e.scrollIntoView({ block: 'center', inline: 'center' }) }); await sleep(900)
    console.log(await p.evaluate(() => { const e = [...document.querySelectorAll('.puck.allavail')].filter(x => { const r = x.getBoundingClientRect(); return r.left > 0 && r.left < 1100 && r.top > 150 && !x.closest('.rpuck') })[0]; return e ? e.parentElement.outerHTML.slice(0, 900) : 'none' }))
  }
  await w.ctx.close()
}
await L.closeAll()
