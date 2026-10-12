// E6 + E5: the E1/E3 world (Range brief, Solo drill, a bare Training all cancelled by Saber); sign in as Ranger on the phone.
import { browser, PARTS, URL, sleep, mk, summarise, DI } from './or-E-lib.mjs'
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, storageState: `${PARTS}/or-E-state2.json` })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) }); page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
await page.clock.install({ time: new Date('2026-06-22T14:00:00') })
await page.goto(URL)
const w = mk(page, ctx, true, errors, 'E3'); const { press } = w
await w.signIn('us', 'us')
const winControls = () => page.evaluate(() => [...document.querySelectorAll('#inpEditPop button, #inpEditPop input, #inpEditPop select, #inpEditPop textarea')].filter(e => e.offsetParent && !/pp-puck|rc-d|rc-nav|rc-today/.test(e.id + e.className + (e.getAttribute('data-testid') || ''))).map(e => ({ id: e.id || e.getAttribute('data-testid') || e.className.slice(0, 30), tag: e.tagName.toLowerCase(), text: (e.innerText || e.value || '').replace(/\s+/g, ' ').slice(0, 40), dis: !!e.disabled, ro: !!e.readOnly })))
const closeWin = async () => { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(300) } }
try {
  // ---- E6: the bell, lit
  await page.evaluate(() => window.go('inputs')); await sleep(600); await w.quiet()
  const bs = await w.bellState(); w.say('E6 Ranger bell at start', JSON.stringify(bs)); w.res('e6_bell_start', bs)
  const bb = await (await w.bell()).boundingBox()
  await w.clip('e6-01-bell-lit', bb, [14, 160, 14, 260]); await w.loud()
  await press(await w.bell()); await sleep(450)
  w.say('E6 tap', JSON.stringify(await w.bellState()), await w.note())
  const f1 = await w.shotList('e6-02-list'); w.say('E6 list', JSON.stringify(summarise(f1))); w.res('e6_list', summarise(f1))
  w.say('E6 raw list facts', JSON.stringify(f1 && { vw: f1.vw, box: f1.box, bell: f1.bellRect, hit: f1.hitIsList }))
  // tap the first line
  const first = await page.locator('.bell-list .bl-line').first().innerText()
  await press(page.locator('.bell-list .bl-line').first()); await sleep(700)
  const wopen = await page.locator('#inpEditPop:visible').count()
  w.say('E6 tap on first line', JSON.stringify({ line: first.replace(/\s+/g, ' '), window: wopen, title: await page.locator('#inpEditPop #inpEditOwnTitle').first().inputValue().catch(() => null), page: await page.evaluate(() => document.querySelector('.page.on')?.id), listOpen: await page.locator('.bell-list').count() }))
  await w.quiet(); await w.shot('e6-03-line-opens-input'); await w.loud()
  await closeWin()
  await press(await w.bell()); await sleep(450)
  const f2 = await w.shotList('e6-04-one-read'); w.say('E6 list after one read', JSON.stringify(summarise(f2))); w.res('e6_list_after_one', summarise(f2))
  w.say('E6 bell state while list open', JSON.stringify(await w.bellState()))
  await press(await w.bell()); await sleep(300)   // close list
  // ---- E5: his own face
  const rb = (await w.rec('Range brief')), sd = (await w.rec('Solo drill'))
  w.say('E5 ids', JSON.stringify([rb && rb.iid, sd && sd.iid]))
  await w.toMonth(); await sleep(300); await w.quiet()
  const bars = await page.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(e => /Ran|Solo|Training|Hex/i.test(e.textContent + e.title)).map(e => ({ iid: e.getAttribute('data-iid'), t: e.textContent, strike: getComputedStyle(e).textDecorationLine, op: getComputedStyle(e).opacity, tip: (e.getAttribute('title') || '').split('\n').slice(0, 2).join(' / ') })))
  w.say('E5 bars', JSON.stringify(bars)); w.res('e5_bars', bars)
  await w.shot('e5-01-month-full')
  await w.openDay('2026-07-15'); await w.quiet()
  const cs = `[data-testid="win-inputsday"] .icard[data-popiid="${rb.iid}"]`
  await page.locator(cs).first().scrollIntoViewIfNeeded()
  const cf = await w.facts(cs); w.say('E5 card (Range brief, as Ranger)', JSON.stringify(cf)); w.res('e5_card', cf)
  await w.clip('e5-02-card', await page.locator(cs).first().boundingBox(), [66, 12, 14, 12])
  await press(page.locator(cs).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(500); await w.quiet()
  const ctl = await winControls(); w.say('E5 Range brief window controls (pickers/calendar days left out)', JSON.stringify(ctl))
  { const tid = await w.csId('Tally')
    const before = await page.evaluate(id => { const b = document.querySelector(`#inpEditPop [data-pp="${id}"]`); return b ? { pressed: b.getAttribute('aria-pressed'), cls: b.className, aria: b.getAttribute('aria-disabled'), pe: getComputedStyle(b).pointerEvents } : null }, tid)
    const tb = page.locator(`#inpEditPop [data-pp="${tid}"]`).first()
    if (await tb.count()) { await tb.scrollIntoViewIfNeeded(); await press(tb).catch(e => w.say('tap on Tally refused by the page: ' + String(e).slice(0, 100))); await sleep(400) }
    const after = await page.evaluate(id => { const b = document.querySelector(`#inpEditPop [data-pp="${id}"]`); return b ? { pressed: b.getAttribute('aria-pressed'), cls: b.className } : null }, tid)
    w.say('E5 Ranger taps Tally in the window: before', JSON.stringify(before), 'after', JSON.stringify(after), 'Save visible:', await page.locator('#inpEditSave:visible').count(), 'INPUTS', JSON.stringify((await w.rec('Range brief')).people), await w.note())
    w.res('e5_tally_tap', { before, after, saveVisible: await page.locator('#inpEditSave:visible').count() }) }
  const wt = await page.evaluate(() => { const m = document.querySelector('[data-testid="inped-cx"]'); return m ? { text: m.textContent.trim(), controls: m.querySelectorAll('button,input').length } : null })
  const wbody = await page.evaluate(() => document.querySelector('#inpEditPop').innerText.replace(/\s+/g, ' ').slice(0, 900))
  w.say('E5 window title bar', JSON.stringify(wt)); w.say('E5 window text', wbody); w.res('e5_window', { wt, ctl, wbody })
  await w.shot('e5-03-window-full')
  // does the window offer to un-cancel anywhere?
  w.say('E5 any un-cancel control', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop *')].filter(e => /un-?cancel|restore|reinstate|cx/i.test((e.id || '') + ' ' + (e.getAttribute('data-testid') || '') + ' ' + (e.tagName === 'BUTTON' ? e.innerText : ''))).map(e => (e.id || e.getAttribute('data-testid') || e.tagName) + ':' + e.innerText.slice(0, 20)))))
  // scroll window to see Take me out
  await page.evaluate(() => { const b = [...document.querySelectorAll('#inpEditPop button')].find(b => /take me out/i.test(b.innerText)); if (b) b.scrollIntoView({ block: 'center' }) }); await sleep(300)
  await w.shot('e5-04-window-takemeout')
  await closeWin(); await w.closeDay()
  await page.evaluate(() => window.go('inputs'))
  // list card
  await press(page.locator('#inListBtn')); await sleep(400)
  if (!(await page.locator('#inRangeAll').count())) await press(page.locator('#inRangeBtn'))
  await press(page.locator('#inRangeAll')); await sleep(400)
  for (const [lab, rec] of [['Range brief', rb], ['Solo drill', sd]]) {
    const lc = page.locator(`.icard[data-iid="${rec.iid}"]`).first()
    await lc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await w.quiet()
    const lf = await w.facts(`.icard[data-iid="${rec.iid}"]`); w.say('E5 list card ' + lab, JSON.stringify(lf)); w.res('e5_list_' + lab, lf)
    await w.clip('e5-05-list-' + lab.replace(' ', '-'), await lc.boundingBox(), [70, 12, 70, 12])
  }
  await press(page.locator('#inCalBtn')); await sleep(200)
  // ---- E5 part 2: Ranger's ALONE cancelled input: re-word it
  await w.toMonth(); await w.openDay('2026-07-16'); await w.quiet()
  const sc = `[data-testid="win-inputsday"] .icard[data-popiid="${sd.iid}"]`
  await page.locator(sc).first().scrollIntoViewIfNeeded()
  w.say('E5 solo card before', JSON.stringify(await w.facts(sc)))
  await press(page.locator(sc).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(500); await w.quiet()
  const sctl = await winControls(); w.say('E5 solo window controls', JSON.stringify(sctl))
  w.say('E5 solo window title bar', JSON.stringify(await page.evaluate(() => { const m = document.querySelector('[data-testid="inped-cx"]'); return m ? m.textContent.trim() : null })))
  await w.shot('e5-06-solo-window-full')
  await page.locator('#inpEditPop #inpEditOwnTitle').first().fill('Solo drill reworded')
  await page.locator('#inpEditPop #inpEditRmk').fill('Bring water').catch(() => {})
  await press(page.locator('#inpEditSave')); await sleep(700)
  w.say('E5 after Ranger saves', JSON.stringify(await w.rec('Solo drill reworded')), await w.note())
  w.say('E5 oil sheet?', await page.locator('[data-testid="oilconf"]').count())
  await w.closeDay().catch(() => {})
  await w.toMonth(); await w.openDay('2026-07-16'); await w.quiet()
  const sf = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].find(x => /reworded/i.test(x.innerText)); if (!e) return null; const g = e.querySelector('.icx'), t = e.querySelector('.icard-title'); return { text: e.innerText.replace(/\s+/g, ' '), tag: g ? g.textContent : null, strike: t ? getComputedStyle(t).textDecorationLine : null, why: e.querySelector('.icx-why') ? e.querySelector('.icx-why').textContent : null } })
  w.say('E5 solo card after', JSON.stringify(sf)); w.res('e5_solo_after', sf)
  await w.shot('e5-07-solo-after-full')
  const sc2 = page.locator('[data-testid="win-inputsday"] .icard', { hasText: 'reworded' }).first()
  if (await sc2.count()) await w.clip('e5-07-solo-after', await sc2.boundingBox(), [66, 12, 14, 12])
  await w.closeDay()
  // ---- E6 end: Mark all read, then reload
  await press(await w.bell()); await sleep(450)
  const all = page.locator('[data-testid="bell-markall"]')
  w.say('E6 mark-all control', await all.count(), JSON.stringify(summarise(await w.listFacts())?.n))
  if (await all.count()) { await press(all); await sleep(500) }
  w.say('E6 bell after Mark all read', JSON.stringify(await w.bellState()), 'list open:', await page.locator('.bell-list').count())
  const f3 = await w.shotList('e6-05-all-read'); w.say('E6 list after all read', JSON.stringify(summarise(f3)))
  await page.mouse.click(195, 700).catch(() => {}); await sleep(200)
  await ctx.storageState({ path: `${PARTS}/or-E-state3.json` })
  await page.reload(); await sleep(600)
  await w.signIn('us', 'us')
  const rs = await w.bellState(); w.say('E6 bell after reload + sign-in', JSON.stringify(rs)); w.res('e6_bell_after_reload', rs)
  await w.shot('e6-06-after-reload')
  await press(await w.bell()); await sleep(450)
  const f4 = await w.shotList('e6-07-list-after-reload'); w.say('E6 list after reload', JSON.stringify(summarise(f4)))
  w.say('errors', JSON.stringify(errors)); w.res('e56_errors', errors)
  await ctx.storageState({ path: `${PARTS}/or-E-state3.json` })
} catch (e) { w.say('E3 SCRIPT FAILED', String(e).slice(0, 700)); await w.shot('e3-zz-fail').catch(() => {}) }
await browser.close()
