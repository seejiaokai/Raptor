/* msq-j2-host-f v1 — job 2 (19 Nov 26): the host's re-run on the iPhone (402 x 874, WebKit, by touch) of W3-F's steps the
   walker could not close by script: Add a person's post-in calendar (open, a tap outside, reopen, pick), a name's window
   (open by his name, close by its ✕), a day cell's window and its ⋯ list (open, close), the bell (open, close by the bell,
   open, close by a tap outside). Each opened thing is proved on screen and inside 402 x 874 before anything in it is
   pressed. usage (from raptor-port): MSQ_DIST MSQ_BUNDLE MSQ_IMGDIR set; node scripts/handpass/msq/msq-j2-host-f.mjs */
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f-p'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-j2-host-f v3')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + label).catch(() => {}); return null } }
const shot2 = async name => { await sleep(100); await X.pic(w, name + '-tap'); await sleep(800); await X.pic(w, name) }
const box = async loc => { const b = await loc.boundingBox().catch(() => null); return b ? [Math.round(b.x), Math.round(b.y), Math.round(b.x + b.width), Math.round(b.y + b.height)] : null }
const inside = b => !!b && b[0] >= 0 && b[1] >= 0 && b[2] <= 402 && b[3] <= 874
const vis = loc => loc.first().isVisible().catch(() => false)
/* a point on the screen that is not inside `sel` and lands on nothing pressable */
const blankPoint = sel => page.evaluate(s => {
  const keep = document.querySelector(s)
  for (let y = 860; y > 60; y -= 20) for (let x = 20; x < 390; x += 30) {
    const e = document.elementFromPoint(x, y)
    if (!e || (keep && keep.contains(e))) continue
    if (e.closest('button,input,select,textarea,a,label,[role=button],[role=menuitem],td,[data-testid^="dcal"]')) continue
    return [x, y]
  }
  return null
}, sel)
const T1 = '2026-11-20'

/* 1 — Add a person's post-in calendar */
await safe('cal', async () => {
  await X.L.go(page, 'admin'); await sleep(1200)
  // on the phone Admin opens on another tab: its Users tab first (msq-w3-fixread's proven route)
  if (!(await vis(page.locator('input[aria-label="Find a callsign or sign-in"]')))) { await page.locator('button:visible', { hasText: /^Users/ }).first().tap(); await sleep(900) }
  const btn = page.locator('#accAddPostIn')
  await btn.scrollIntoViewIfNeeded(); await sleep(400)
  await btn.tap(); await shot2('f01-cal-open')
  const day = page.locator(`[data-testid="dcal-day-${T1}"]`)
  const calBox = await box(page.locator('[data-testid^="dcal-day-"]').first().locator('xpath=ancestor::*[contains(@class,"cal") or contains(@class,"dcal")][1]'))
  const open1 = await vis(day)
  row('W3-F host', 'iPhone', "ad9: Add a person -> tap the Post in date", 'the calendar opens, inside the screen', `day ${T1} shown: ${open1}; calendar box: ${JSON.stringify(calBox)} inside: ${inside(calBox)}`, open1 && inside(calBox) ? 'PASS' : 'FAIL', 'f01-cal-open.png')
  // the calendar is a centred window over a dimmed page (f01): a tap on the dim below it, clear of every control
  const pt = [200, Math.min(860, calBox[3] + 150)]
  say('outside point', JSON.stringify(pt), 'lands on', await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.getAttribute('data-testid') || '') : null }, pt))
  if (pt) await page.touchscreen.tap(pt[0], pt[1])
  await shot2('f02-cal-outside')
  const open2 = await vis(day)
  row('W3-F host', 'iPhone', `taps outside the calendar at ${JSON.stringify(pt)}`, 'the calendar closes, the form as it was', `day still shown: ${open2}`, pt && !open2 ? 'PASS' : 'FAIL', 'f02-cal-outside.png')
  await btn.tap(); await sleep(700)
  await day.tap(); await shot2('f03-cal-picked')
  const pi = (await btn.textContent()).trim()
  row('W3-F host', 'iPhone', 'reopens the calendar, taps Fri 20 Nov', 'the calendar closes, the date reads 20 Nov', `Post in reads "${pi}"; calendar still shown: ${await vis(day)}`, /20/.test(pi) && !(await vis(day)) ? 'PASS' : 'FAIL', 'f03-cal-picked.png')
})

/* 2 — the Leave War: a name's window */
await X.L.go(page, 'leavewar'); await sleep(2600)
await X.pic(w, 'f10-war')
await safe('name', async () => {
  const pt = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-leavewar .nm')].find(e => e.textContent.trim() === 'Merlin' && e.getBoundingClientRect().top > 100 && e.getBoundingClientRect().left >= 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
  say('Merlin point', JSON.stringify(pt))
  await page.touchscreen.tap(pt[0], pt[1]); await shot2('f11-name-window')
  const nm = page.locator('[data-testid="pw-name"]')
  const open = await vis(nm)
  const wb = await box(nm.locator('xpath=ancestor::*[contains(@class,"bidsheet")][1]'))
  row('W3-F host', 'iPhone', "ad9 taps Merlin's name on the war grid", 'his window opens, inside the screen, named Merlin', `open: ${open}; name: "${open ? (await nm.textContent()).trim() : ''}"; window box: ${JSON.stringify(wb)} inside: ${inside(wb)}`, open && inside(wb) ? 'PASS' : 'FAIL', 'f11-name-window.png')
  await page.locator('[data-testid="pw-close"]').tap(); await shot2('f12-name-closed')
  row('W3-F host', 'iPhone', "presses the window's ✕", 'the window goes, the grid as it was', `window still shown: ${await vis(nm)}`, !(await vis(nm)) ? 'PASS' : 'FAIL', 'f12-name-closed.png')
})

/* 3 — a day cell, its window, its ⋯ list */
await safe('cell', async () => {
  const cell = page.locator('td[data-testid="cell-mer9-2026-11-23"]')
  const cb = await box(cell)
  say('cell box', JSON.stringify(cb))
  await cell.tap(); await shot2('f13-day-window')
  const x = page.locator('[data-testid="bid-cancel"]')
  const open = await vis(x)
  const wb = await box(x.locator('xpath=ancestor::*[contains(@class,"bidsheet")][1]'))
  row('W3-F host', 'iPhone', "ad9 taps Merlin's Mon 23 Nov", 'the day window opens, inside the screen', `open: ${open}; cell box ${JSON.stringify(cb)}; window box ${JSON.stringify(wb)} inside: ${inside(wb)}`, open && inside(wb) ? 'PASS' : 'FAIL', 'f13-day-window.png')
  const more = page.locator('[data-testid="bid-more"]')
  await more.tap(); await shot2('f14-dots-open')
  const items = await page.locator('[role=menuitem]:visible').allTextContents()
  const mb = await box(page.locator('[role=menuitem]:visible').last())
  row('W3-F host', 'iPhone', 'presses the window\'s ⋯', 'its list opens, inside the screen', `items: ${JSON.stringify(items.map(s => s.trim()))}; last item box ${JSON.stringify(mb)} inside: ${inside(mb)}`, items.length > 0 && inside(mb) ? 'PASS' : 'FAIL', 'f14-dots-open.png')
  await more.tap(); await shot2('f15-dots-closed')
  const items2 = await page.locator('[role=menuitem]:visible').count()
  row('W3-F host', 'iPhone', 'presses ⋯ again', 'the list closes, the window stays', `menu items still shown: ${items2}; window still open: ${await vis(x)}`, items2 === 0 && (await vis(x)) ? 'PASS' : 'FAIL', 'f15-dots-closed.png')
  await x.tap(); await shot2('f16-day-closed')
  row('W3-F host', 'iPhone', "presses the window's ✕", 'the window goes, the grid as it was', `window still shown: ${await vis(x)}`, !(await vis(x)) ? 'PASS' : 'FAIL', 'f16-day-closed.png')
})

/* 4 — the page's height: is there a foot to flick to */
await safe('foot', async () => {
  const h = await page.evaluate(() => ({ doc: document.scrollingElement.scrollHeight, view: innerHeight }))
  row('W3-F host', 'iPhone', 'reads how tall the Leave War page is against the screen', 'RECORD', JSON.stringify(h), 'RECORD', 'f10-war.png')
})

/* 5 — the bell */
await safe('bell', async () => {
  const bell = page.locator('#notifyBell:visible').first()
  const list = page.locator('[data-testid="bell-list"]')
  await bell.tap(); await shot2('f20-bell-open')
  const lb = await box(list)
  row('W3-F host', 'iPhone', 'taps the bell', 'its list opens, inside the screen', `open: ${await vis(list)}; box ${JSON.stringify(lb)} inside: ${inside(lb)}; words: ${(await list.innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 120)}`, (await vis(list)) && inside(lb) ? 'PASS' : 'FAIL', 'f20-bell-open.png')
  await bell.tap(); await shot2('f21-bell-bell')
  const s1 = await vis(list)
  row('W3-F host', 'iPhone', 'taps the bell again', 'the list closes', `list still shown: ${s1}`, !s1 ? 'PASS' : 'FAIL', 'f21-bell-bell.png')
  if (s1) { await page.keyboard.press('Escape'); await sleep(500) }
  await bell.tap(); await sleep(800)
  const pt = await blankPoint('[data-testid="bell-list"]')
  say('bell outside point', JSON.stringify(pt))
  if (pt) await page.touchscreen.tap(pt[0], pt[1])
  await shot2('f22-bell-outside')
  const s2 = await vis(list)
  row('W3-F host', 'iPhone', `opens the bell, taps outside it at ${JSON.stringify(pt)}`, 'the list closes', `list still shown: ${s2}`, !s2 ? 'PASS' : 'FAIL', 'f22-bell-outside.png')
})
await X.fin(w)
