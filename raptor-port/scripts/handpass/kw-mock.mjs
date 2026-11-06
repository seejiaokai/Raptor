// The keyboard and windows batch (5 Nov 26 — [BOARD-KEYS-LEFT], [VEILED-WINDOWS-BAR], [WINDOWS-KEEP-KEYS]): every part he
// will see, drawn on the real app (frozen build) before anything is built (D1625), at a desktop's and his iPhone's size.
//   WALK_DIR=<frozen dist> ISR_OUT=<pictures> LOOK_URL=http://localhost:4397/ node scripts/handpass/kw-mock.mjs
//   (the pictures it drew are kept beside the page put to him: docs/mock/2026-11-05-keys-windows/img/)
// 1 the top bar left free over three windows — Jump to a date and the day-details window: today the veil covers the
//   whole screen, Undo and Redo with it; drawn, the veil starts at the foot of the bar, as the Traffic window's has since
//   30 Oct 26 (the one transform: the window's own `top` set to the bar's foot, the class the Traffic window wears).
// 2 the keyboard's ring on the Scheduler Board — a menu opened by the keys on its first item, a day chip, the edit week's
//   day name: the app's own focus ring (2px cyan outline), drawn on the real element with an outline only.
// 3 the Traffic window on View-only Sched for an admin — today its typing boxes; drawn, the read list a member sees there.
// 4 an unreadable in-time clock on a wave of several unnamed lines — today said once per line under the box; drawn, once.
import * as L from './isr-A-lib.mjs'
const { tid, note, check } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const RING = 'kw-ring'
const CSS = `.${RING}{outline:2px solid var(--accent) !important;outline-offset:2px !important}
.${RING}.kw-in{outline-offset:-2px !important}`
const shot = (page, name, clip) => page.screenshot({ path: `${L.OUT}/${name}.png`, ...(clip ? { clip } : {}) })

async function editSched(page) { await L.go(page, 'editsched'); await sleep(300) }
async function openBoard(page, tap, di = 2) {
  await L.press(page, tap, page.locator(`[data-sbday="${di}"]:visible`))
  await page.waitForSelector('#schedBoard:not([hidden]) .sb-top'); await sleep(400)
}
async function closeBoard(page) {
  await page.evaluate(() => { const d = document.querySelector('#schedBoard:not([hidden]) #sbDone, #schedBoard:not([hidden]) [data-sbdone]'); if (d) d.click() }); await sleep(300)
}
/* the transform: the open window's veil from the bar's foot (the Traffic window's way, Modals.tsx AirPop) */
async function belowBar(page, id) {
  return page.evaluate(id => {
    const n = document.getElementById(id); if (!n || n.hidden) throw new Error('premise: ' + id + ' is not up')
    const bar = document.querySelector('#schedBoard:not([hidden]) .sb-top') || document.getElementById('burger')?.closest('.topbar')
    const b = Math.round(bar.getBoundingClientRect().bottom)
    n.style.top = b + 'px'; n.classList.add('air-below')
    return b
  }, id)
}
const neutral = async (page, tap) => { await page.evaluate(() => document.activeElement && document.activeElement.blur()); if (!tap) await page.mouse.move(2, 600) }

for (const size of ['desktop', 'phone']) {
  const { page, tap } = await L.session(size, 'ad')
  await page.addStyleTag({ content: CSS })
  const vp = page.viewportSize()
  const top = { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, size === 'phone' ? 560 : 520) }

  /* 1a/1b — Jump to a date, on Edit Schedule's week */
  await editSched(page)
  await L.press(page, tap, page.locator('button[aria-label="Jump to a date"]').filter({ visible: true }))
  await page.waitForSelector('#weekCal:not([hidden]) .weekcal-box'); await neutral(page, tap); await sleep(200)
  await shot(page, `1a-${size}-jump-today`, top)
  const b1 = await belowBar(page, 'weekCal'); await sleep(150)
  await shot(page, `1b-${size}-jump-drawn`, top)
  const undoFree = await page.evaluate(() => { const u = document.getElementById('undoBtn'); if (!u) return null; const r = u.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!at && (at === u || u.contains(at)) })
  check('1b', `${size}: with the veil from the bar's foot (${b1}px) Undo is the element under its own centre`, undoFree === true, undoFree)
  /* its own ✕ (the picture blurred the keys out of it, and its Escape is heard only inside it — the build's to settle) */
  await page.evaluate(() => { const n = document.getElementById('weekCal'); n.style.removeProperty('top'); n.classList.remove('air-below'); n.querySelector('.airpop-head .x').click() }); await sleep(250)

  /* 1c/1d — the day-details window, from the Scheduler Board's ⓘ (Undo and Redo on the board's own bar) */
  await openBoard(page, tap)
  const info = await page.locator('#schedBoard:not([hidden]) [data-dayinfo]').count()
  if (info) {
    await L.press(page, tap, page.locator('#schedBoard:not([hidden]) [data-dayinfo]').filter({ visible: true }).first())
    await page.waitForSelector('#dayPop:not([hidden]) .airpop-box'); await neutral(page, tap); await sleep(200)
    await shot(page, `1c-${size}-daydetails-today`, top)
    await belowBar(page, 'dayPop'); await sleep(150)
    await shot(page, `1d-${size}-daydetails-drawn`, top)
    await page.keyboard.press('Escape'); await sleep(250)
  } else L.notWalked('1c', `${size}: no ⓘ on the board`)

  /* 2 — the keyboard's ring on the board (desktop: the menus, the chips; the phone has no day chips) */
  if (size === 'desktop') {
    /* 2a today: + Block's menu opened by Enter — the keys stay on the button */
    const blk = page.locator('#schedBoard:not([hidden]) [data-dwadd]').filter({ visible: true }).first()
    await blk.scrollIntoViewIfNeeded(); await blk.focus(); await page.keyboard.press('Enter'); await sleep(300)
    const at = await page.evaluate(() => { const a = document.activeElement; return a ? (a.className || a.tagName) + ' ' + (a.textContent || '').trim().slice(0, 20) : null })
    note('2a', `desktop: after Enter on + Block the keys are on ${JSON.stringify(at)}`)
    const box = await page.evaluate(() => { const m = document.querySelector('.wavemenu'); const r = m.getBoundingClientRect(); const a = document.querySelector('#schedBoard:not([hidden]) [data-dwadd]:focus') || document.activeElement; const s = a.getBoundingClientRect(); const x = Math.min(r.left, s.left) - 16, y = Math.min(r.top, s.top) - 16; return { x: Math.max(0, x), y: Math.max(0, y), width: Math.max(r.right, s.right) - x + 16, height: Math.max(r.bottom, s.bottom) - y + 16 } })
    await page.evaluate(c => { const a = document.activeElement; if (a && a !== document.body) a.classList.add(c) }, RING)
    await shot(page, '2a-desktop-blockmenu-today', box)
    await page.evaluate(c => { document.querySelectorAll('.' + c).forEach(e => e.classList.remove(c)); document.activeElement && document.activeElement.blur(); const i = document.querySelector('.wavemenu button.wm'); i.classList.add(c, 'kw-in') }, RING)
    await shot(page, '2b-desktop-blockmenu-drawn', box)
    await page.evaluate(c => document.querySelectorAll('.' + c).forEach(e => e.classList.remove(c, 'kw-in')), RING)
    await page.keyboard.press('Escape'); await sleep(200)
    /* 2c — a day chip on the board's bar: today the Tab passes it by; drawn, it takes the ring */
    const chip = await page.evaluate(c => { const ch = [...document.querySelectorAll('#schedBoard:not([hidden]) .sbday[data-sbtab]')].find(x => !x.classList.contains('on') && x.getBoundingClientRect().width > 0); ch.classList.add(c); const r = ch.closest('.sb-top').getBoundingClientRect(); return { x: 0, y: r.top, width: innerWidth, height: r.height + 4, tab: ch.tabIndex } }, RING)
    note('2c', `desktop: a board day chip's tabIndex today ${chip.tab} (−1 = Tab never reaches it)`)
    await shot(page, '2c-desktop-daychip-drawn', { x: chip.x, y: chip.y, width: chip.width, height: chip.height })
    await page.evaluate(c => document.querySelectorAll('.' + c).forEach(e => e.classList.remove(c)), RING)
    await closeBoard(page)
    /* 2d — the edit week's day name, which shows that day's crew in the aircrew panel */
    await editSched(page); await neutral(page, tap); await sleep(600)
    const dn = await page.evaluate(c => { const d = [...document.querySelectorAll('#eWeek [data-crewday]')].find(x => x.getBoundingClientRect().width > 0); d.classList.add(c); const r = d.closest('.day-head').getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), width: Math.min(innerWidth, r.width + 16), height: r.height + 16, tab: d.tabIndex } }, RING)
    note('2d', `desktop: the edit week's day name's tabIndex today ${dn.tab}`)
    /* the week redraws its days from strings, which drops a class set by hand: the ring is drawn by a rule, which stays */
    await page.addStyleTag({ content: `#eWeek .day-head [data-crewday]{outline:2px solid var(--accent) !important;outline-offset:2px !important;border-radius:4px}` }); await sleep(150)
    await shot(page, '2d-desktop-dayname-drawn', dn)
    await page.evaluate(c => document.querySelectorAll('.' + c).forEach(e => e.classList.remove(c)), RING)
  }

  /* 3 — the Traffic window on View-only Sched, as an admin */
  await L.go(page, 'viewsched'); await sleep(300)
  const tb = page.locator('#vWeek [data-air]').filter({ visible: true }).first()
  if (await tb.count()) {
    await tb.scrollIntoViewIfNeeded(); await L.press(page, tap, tb)
    await page.waitForSelector('#airpop:not([hidden]) .airpop-box'); await neutral(page, tap); await sleep(200)
    const bx = async () => page.evaluate(() => { const r = document.querySelector('#airpop .airpop-box').getBoundingClientRect(); return { x: Math.max(0, r.left - 12), y: Math.max(0, r.top - 12), width: Math.min(innerWidth, r.width + 24), height: r.height + 24 } })
    await shot(page, `3a-${size}-traffic-view-today`, await bx())
    const lines = await page.evaluate(() => {
      const box = document.querySelector('#airpop .airpop-box'), body = box.querySelector('#airBody')
      const ls = [...body.querySelectorAll('input[data-airi]')].map(i => i.value)
      const mk = t => { const d = document.createElement('div'); const s = document.createElement('span'); s.className = 'adot'; d.append(s, document.createTextNode(t)); return d }
      const v = document.createElement('div'); v.className = 'airview'
      if (ls.length) ls.forEach(t => v.append(mk(t))); else { const s = document.createElement('span'); s.style.color = 'var(--ink-3)'; s.textContent = 'No traffic booked.'; v.append(s) }
      body.replaceChildren(v); box.querySelector('.airpop-foot[data-admin]')?.remove()
      return ls.length
    })
    note('3', `${size}: the window's lines ${lines}`)
    await sleep(150)
    await shot(page, `3b-${size}-traffic-view-drawn`, await bx())
    await page.keyboard.press('Escape'); await sleep(250)
  } else L.notWalked('3', `${size}: no Traffic button on View-only Sched`)

  /* 4 — an unreadable clock on a wave of three unnamed lines (desktop board only: the same note is drawn on the phone) */
  if (size === 'desktop') {
    await editSched(page); await openBoard(page, tap)
    await L.press(page, tap, page.locator('#schedBoard:not([hidden]) [data-wvadd]').filter({ visible: true }).first())
    const fly = page.locator('.wavemenu button').filter({ hasText: /^Flying/ }).first()
    if (await fly.count()) await fly.click(); else await page.locator('.wavemenu button').first().click()
    await sleep(400)
    const gi = await page.evaluate(() => { const ws = [...document.querySelectorAll('#schedBoard:not([hidden]) [data-gline]')]; return ws.length ? ws[ws.length - 1].dataset.gline : null })
    note('4', `the new wave's address ${gi}`)
    for (let k = 0; k < 2; k++) { await page.locator(`#schedBoard:not([hidden]) [data-gline="${gi}"]`).first().click(); await sleep(250) }
    await page.locator(`#schedBoard:not([hidden]) [data-itadd="${gi.replace('.', '|')}"]`).first().click(); await sleep(300)
    const line = page.locator(`#schedBoard:not([hidden]) [data-itline^="${gi.replace('.', '|')}|"]`).first()
    await line.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('25:90 in time'); await page.keyboard.press('Tab'); await sleep(400)
    const fb = `#schedBoard:not([hidden]) .intimes[data-intimes="${gi.replace('.', '|')}"]`
    const today = await L.text(page, `${fb} [data-reporting-feedback]`)
    note('4a', `today's words under the box: ${JSON.stringify(today)}`)
    const clip = async () => page.evaluate(sel => { const b = document.querySelector(sel).closest('.sb-go') || document.querySelector(sel); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), width: Math.min(innerWidth - Math.max(0, r.left - 8), r.width + 16), height: Math.min(r.height + 16, 420) } }, fb)
    await neutral(page, tap); await sleep(150)
    await shot(page, '4a-desktop-unreadable-today', await clip())
    await page.evaluate(sel => { const n = document.querySelector(`${sel} [data-reporting-feedback]`); const parts = (n.textContent || '').match(/[^.]+\.[^.]+\./g) || []; n.textContent = [...new Set(parts.map(s => s.trim()))].join(' ') }, fb)
    note('4b', `drawn: ${JSON.stringify(await L.text(page, `${fb} [data-reporting-feedback]`))}`)
    await shot(page, '4b-desktop-unreadable-drawn', await clip())
  }
  await page.context().close()
}
await L.finish('kw-mock')
