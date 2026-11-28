// Walker b — B9 (Astra S20, F-S14): after Ranger's three changes on the week (start 0900, end 1100, remark "own hours"),
// the changes window ("All changes"), each line tapped and where it lands; each man's bell (Ranger, then Hex, signed in
// on the same world one after the other); the view-only week. EXPECTED: Hex is told nothing of Ranger's later changes.
// RECORD every line's words and where each tap lands.
console.log('shr-b-b9 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b9-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, state, weekCell, typeIn, pic, J, judge, showDay, handOver, openBell, bellClip, shot } = B
const c = 'B9', P = `b9-${SZ}-${ENG}`
let w
const out = {}
try {
  w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15')); await showDay(w.page, di)
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own hours']]) { await typeIn(w, await weekCell(w.page, di, 'bane', f), v); await w.page.keyboard.press('Tab'); await sleep(600) }
  await w.page.mouse.click(3, 120); await sleep(700)
  out.after = await state(w, c, 'after the three changes', di)
  const pics = []
  /* the changes window from the day's count */
  const cnt = w.page.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  out.count = (await cnt.innerText()).trim()
  await cnt.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await cnt.click(); await sleep(700)
  const tab = w.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first()
  if (await tab.count()) { await tab.click(); await sleep(400) }
  const readAll = () => w.page.evaluate(() => { const wn = document.querySelector('.chgwin:not([hidden])'); if (!wn) return null; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    return { title: t(wn.querySelector('.win-ttl')), tabs: [...wn.querySelectorAll('.win-tab')].map(x => t(x) + (x.classList.contains('on') ? ' [on]' : '')), groups: [...wn.querySelectorAll('.cw-g')].map((g, gi) => ({ head: t(g.querySelector('.cw-gh, .cw-ghname, summary, button')).slice(0, 120), lines: [...g.querySelectorAll('.cw-l')].map((l, li) => { l.setAttribute('data-shrb9', gi + '.' + li); return t(l) }) })), foot: t(wn.querySelector('.win-foot')) } })
  out.win = await readAll()
  log(c, 'changes window: ' + J(out.win))
  pics.push(await pic(w, c, `${P}-1-allchanges`, ['.chgwin:not([hidden])'], out.win, { noScroll: true }))
  /* tap each line in turn (the window stays open, its foot says) */
  out.taps = []
  const keys = await w.page.evaluate(() => [...document.querySelectorAll('[data-shrb9]')].map(e => e.getAttribute('data-shrb9')))
  for (const k of keys) {
    const l = w.page.locator(`[data-shrb9="${k}"]`).first()
    if (!(await l.count())) { out.taps.push({ k, none: 'gone' }); continue }
    const text = (await l.innerText()).replace(/\s+/g, ' ').trim()
    await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click({ timeout: 2500 }).catch(e => out.taps.push({ k, clickErr: String(e).slice(0, 80) })); await sleep(600)
    const landed = await w.page.evaluate(() => { const e = document.querySelector('.chgflash'); const t = x => x ? (x.innerText || x.value || '').replace(/\s+/g, ' ').trim().slice(0, 120) : ''; const note = document.getElementById('toastEl'); const ns = note && +getComputedStyle(note).opacity > 0.05 ? (note.textContent || '').trim() : ''
      return e ? { lit: t(e), cls: String(e.className).slice(0, 60), row: e.closest('.pl-row')?.getAttribute('data-inprow') || e.getAttribute('data-inprow') || null, puck: e.closest('.pl-row')?.querySelector('.puck')?.getAttribute('data-person') || null, day: e.closest('.day[data-day]')?.getAttribute('data-day') || null, note: ns, winOpen: !!document.querySelector('.chgwin:not([hidden])') } : { lit: null, note: ns, winOpen: !!document.querySelector('.chgwin:not([hidden])') } })
    out.taps.push({ k, text, landed })
    pics.push(await pic(w, c, `${P}-2-tap-${k.replace('.', '-')}`, landed.day ? [`#eWeek .day[data-day="${landed.day}"] .chgflash`] : ['.chgwin:not([hidden])'], { text, landed }, { noScroll: true }))
    if (!(await w.page.locator('.chgwin:not([hidden])').count())) { await cnt.click().catch(() => {}); await sleep(600); const t2 = w.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first(); if (await t2.count()) { await t2.click(); await sleep(300) } await readAll() }
  }
  log(c, 'taps: ' + J(out.taps))
  await w.page.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await sleep(300)
  /* each man's bell, and Ranger's view-only week */
  out.bells = {}
  for (const who of ['us', 'hex']) {
    w = await handOver(w, SZ, who)
    const lines = await openBell(w)
    out.bells[who] = lines.map(l => `${l.name} ${l.day} / ${l.what}`)
    await shot(w.page, c, `${P}-3-bell-${who}`, await bellClip(w.page), out.bells[who], w.size)
    pics.push(`${P}-3-bell-${who}.png`)
    log(c, `${who}'s bell: ${J(out.bells[who])}`)
    await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
    if (who === 'us') {
      await go(w.page, 'viewsched'); await sleep(400)
      await w.page.evaluate(i => document.querySelector(`#vWeek .day[data-day="${i}"]`)?.scrollIntoView({ block: 'start', inline: 'start' }), di)
      out.view = await w.page.evaluate(di => [...document.querySelectorAll(`#vWeek .day[data-day="${di}"] .sec-unav .pl-row`)].filter(r => r.getBoundingClientRect().width > 1 && r.querySelector('.puck[data-person="bane"], .puck[data-person="rocky"]')).map(r => `${r.querySelector('.puck[data-person="bane"]') ? 'Ranger' : 'Hex'} ${[...r.querySelectorAll('.t')].map(e => (e.textContent || '').trim()).join('-')} "${(r.querySelector('.rmk')?.textContent || '').trim()}"`), di)
      pics.push(await pic(w, c, `${P}-4-viewonly-ranger`, [`#vWeek .day[data-day="${di}"] .sec-unav`], out.view))
      log(c, 'view-only week (Ranger): ' + J(out.view))
    }
  }
  const hexToldOfRanger = (out.bells.hex || []).filter(l => /15 Jul/.test(l) && !/You were added|added you/i.test(l))
  judge(c, cfg, hexToldOfRanger.length === 0 ? 'PASS' : 'FAIL', { hexBell: out.bells.hex, hexLinesAboutTheDay: hexToldOfRanger }, pics.filter(p => /bell/.test(p)).join(', '))
  judge(c + ' lines and taps', cfg, 'RECORD', { count: out.count, window: out.win, taps: out.taps, bells: out.bells, viewOnly: out.view, store: out.after.store }, pics.join(', '))
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400) + ' :: ' + J(out).slice(0, 800)) }
try { await w?.ctx.close() } catch {}
await B.done()
