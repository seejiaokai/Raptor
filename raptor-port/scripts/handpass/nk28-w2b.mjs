// W2 part B: scenarios 3 (board), 4 (OIL tracker), 5 (medical), 6 (windows), 7 (input window) on the phone.
console.log('nk28-w2b v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const bands = p => p.evaluate(() => [...document.querySelectorAll('.savestat.nokeep, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); return { cls: e.className, par: e.parentElement.className.toString().split(' ')[0] + (e.parentElement.id ? '#' + e.parentElement.id : ''), t: Math.round(r.top * 10) / 10, b: Math.round(r.bottom * 10) / 10, l: Math.round(r.left), r: Math.round(r.right), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70), btn: !!e.querySelector('button') } }))
const rectOf = (p, sel) => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility() }); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }, sel)
const w = await world(); const p = w.page
const only = (process.env.ONLYS || '').split(',').filter(Boolean); const want = s => !only.length || only.includes(s)
try {
  await L.login(p, 'a'); await sleep(400)
  await p.evaluate(() => window.go('editsched')); await sleep(1200)
  // ---- 3 board
  if (want('3')) {
    await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard', { state: 'visible' }); await sleep(900)
    const f = await pic(p, 'S3-board')
    const bs = await bands(p); const ft = await firstTop(p, '.topbar, .saveband, .savestat, #drawer, .sb-bar, #sbBar')
    const b = bs.find(x => /Not kept/.test(x.text) && /sb-top/.test(x.par))
    note('3', 'board bands visible', JSON.stringify(bs), f)
    const row = await rectOf(p, '#schedBoard .sb-line, #schedBoard .sb-sec, #schedBoard .sb-day')
    ok('3', 'board band', !!b && !b.btn && b.l === 0 && b.r === 402 && b.b - b.t <= 40, `band=${JSON.stringify(b)} firstRowish=${JSON.stringify(row)} firstTop=${JSON.stringify(ft)}`, f)
    if (b) { const covered = await p.evaluate(b => { const e = document.elementFromPoint(201, b.b + 3); return e ? e.tagName + '.' + String(e.className).split(' ')[0] : null }, b); note('3', 'what is just under the board band', covered, f) }
    // the board's first row: first content block below its bar
    const top = await p.evaluate(() => { const bd = document.getElementById('schedBoard'); const kids = [...bd.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 150 && r.height > 20 && r.top > 0 && cs.visibility !== 'hidden' && e.children.length === 0 || (r.width > 150 && r.height > 20 && /sb-(sec|line|arow|day)/.test(String(e.className))) }); return kids.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 3).map(e => String(e.className).split(' ')[0] + '@' + Math.round(e.getBoundingClientRect().top)) }); note('3', 'board topmost blocks', JSON.stringify(top), f)
    const done = p.locator('#schedBoard button:visible', { hasText: 'Done' }).first()
    const t = await tapShot(p, await done.boundingBox(), 'S3-done-tap')
    await sleep(900); const f2 = await pic(p, 'S3-after-done')
    const bs2 = await bands(p)
    const bb = bs2.find(x => /Not kept/.test(x.text) && /topbar/.test(x.par))
    const cur = await p.evaluate(() => ({ page: window.CURPAGE, board: !!document.querySelector('#schedBoard:not([hidden])') && !!document.getElementById('schedBoard').getBoundingClientRect().width }))
    ok('3', 'Done back to Edit Schedule, band in the top bar', !!bb && cur.page === 'editsched', `bands=${JSON.stringify(bs2)} cur=${JSON.stringify(cur)} tap ${t.ms}ms`, f2 + ' | ' + t.quick)
  }
  // ---- 6 windows
  if (want('6')) {
    await p.evaluate(() => window.go('editsched')); await sleep(800)
    await p.tap('#histBtn'); await sleep(900)
    const f = await pic(p, 'S6-changes-window')
    const bandR = (await bands(p)).find(x => /Not kept/.test(x.text))
    const win = await rectOf(p, '.chgwin:not([hidden]), .changeswin:not([hidden]), .win:not([hidden])')
    const head = await rectOf(p, '.win-hide')
    ok('6', 'changes window head below band', !!bandR && !!head && head.t >= bandR.b, `band bottom ${bandR && bandR.b}; window box ${JSON.stringify(win)}; Hide button top ${head && head.t}`, f)
    // move test with the mouse on the grip
    const grip = await rectOf(p, '.win-grip, .win-drag, .win-ttl')
    note('6', 'changes window grip found', JSON.stringify(grip), f)
    if (grip) {
      const x = (grip.l + grip.r) / 2, y = (grip.t + grip.b) / 2
      await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x, y - 120, { steps: 8 }); await p.mouse.up(); await sleep(500)
      const f3 = await pic(p, 'S6-changes-moved')
      const head2 = await rectOf(p, '.win-hide')
      note('6', 'changes window after a drag by its grip', `Hide button top ${head && head.t} -> ${head2 && head2.t}`, f3)
      await p.tap('.win-x >> visible=true'); await sleep(700)
      await p.tap('#histBtn'); await sleep(900)
      const head3 = await rectOf(p, '.win-hide'); const f4 = await pic(p, 'S6-changes-reopened')
      ok('6', 'moved window keeps its place on reopen', head2 && head3 ? Math.abs(head3.t - head2.t) <= 2 : null, `moved top ${head2 && head2.t}; reopened top ${head3 && head3.t}`, f4)
      await p.tap('.win-x >> visible=true'); await sleep(500)
    }
    // ALL AVAIL window from the board
    await p.evaluate(() => { const w = window; w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]; w.afterSchedMutate(); w.openScheduler(0) })
    await p.waitForSelector('#schedBoard [data-oilsent]', { state: 'visible', timeout: 15000 }).catch(() => {}); await sleep(600)
    const chip = await p.locator('#schedBoard [data-oilsent]').first().boundingBox().catch(() => null)
    if (!chip) ok('6', 'ALL AVAIL window', null, 'NOTRUN: the ALL AVAIL chip is not on the board', await pic(p, 'S6-noallavail'))
    else {
      await p.touchscreen.tap(chip.x + chip.width / 2, chip.y + chip.height / 2); await sleep(900)
      const f5 = await pic(p, 'S6-allavail-window')
      const bs = await bands(p); const bnd = bs.find(x => /Not kept/.test(x.text))
      const aw = await rectOf(p, '.availwin:not([hidden])'); const ttl = await rectOf(p, '.availwin .win-ttl')
      ok('6', 'ALL AVAIL window head below band', !!bnd && !!aw && ttl && ttl.t >= bnd.b, `bands=${JSON.stringify(bs.map(x => [x.par, x.t, x.b]))} window=${JSON.stringify(aw)} title=${JSON.stringify(ttl)}`, f5)
      await p.tap('.availwin .win-x'); await sleep(500)
    }
    await p.evaluate(() => { const d = [...document.querySelectorAll('#schedBoard button')].find(b => /Done/.test(b.innerText)); if (d) d.click() }); await sleep(800)
  }
  // ---- 4 OIL tracker (Leave War tab OIL)
  if (want('4')) {
    await p.evaluate(() => window.go('leavewar')); await sleep(1500)
    await p.tap('.intab >> text=OIL'); await sleep(1200)
    const f = await pic(p, 'S4-oil')
    const bs = await bands(p); note('4', 'bands visible on the OIL page', JSON.stringify(bs), f)
    const first = await rectOf(p, 'button:has(+ button), .oil-top ~ *')
    const showBtn = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => /From first entry/.test(b.innerText) && b.checkVisibility()); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top) } })
    const b = bs.find(x => /Not kept/.test(x.text) && /oil-top/.test(x.par))
    ok('4', 'OIL tracker band', !!b && !b.btn && !!showBtn && showBtn.t >= b.b, `band=${JSON.stringify(b)} first control row (From first entry) top=${JSON.stringify(showBtn)}`, f)
    await p.keyboard.press('Escape'); await sleep(700)
    await pic(p, 'S4-oil-closed'); note('4', 'after Escape', 'OIL sheet open? ' + (await p.evaluate(() => !!document.querySelector('.sheetscrim') && document.querySelector('.sheetscrim').checkVisibility())))
    note('4', 'OIL page controls', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.checkVisibility() && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 874).slice(0, 25).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + e.innerText.trim().slice(0, 14)))), f)
  }
  // ---- 5 medical
  if (want('5')) {
    await p.evaluate(() => window.go('inputs')); await sleep(1200)
    await p.tap('#inMedBtn'); await sleep(1200)
    const f = await pic(p, 'S5-medical')
    const bs = await bands(p); note('5', 'bands on the Medical tab', JSON.stringify(bs), f)
    note('5', 'Medical tab controls', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button]')].filter(e => e.checkVisibility() && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top > 80 && e.getBoundingClientRect().top < 874).slice(0, 30).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.title || '').trim().slice(0, 16) + '|' + Math.round(e.getBoundingClientRect().top)))), f)
  }
} catch (e) { ok('B', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('B', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
