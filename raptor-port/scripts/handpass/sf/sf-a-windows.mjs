/* A — [AVAILWIN-PREVIEW-BAR]: a floating window (ALL AVAIL, changes) never opens over the board's preview bar, whose
   buttons are the way home from a preview. Usage: node sf-a-windows.mjs [desktop|short|phone|all] [outdir-suffix] */
const OUT = 'a-windows' + (process.argv[3] ? '-' + process.argv[3] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, editWeek, board, planMenuItems, menuLook, pvTap, screen, check, note, summary, barButtons, winRect, SF_STATE, DESK, PHONE, SHORT } = L
const which = process.argv[2] || 'all'
const sizes = { desktop: DESK, short: SHORT, phone: PHONE }
async function tapChip(page) {
  const c = page.locator('#schedBoard .oilcount[data-oilsent]:visible').first()
  if (!(await c.count())) return false
  await c.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const b = await c.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(700)
  return true
}
const clearOf = (w, bb) => !!w && !!bb && (w.top >= bb[3] || w.bottom <= bb[1] || w.left >= bb[2] || w.right <= bb[0])
const allOk = bb => bb.buttons.length > 0 && bb.buttons.every(b => b.ok)
const closeAvail = page => page.locator('.availwin:not([hidden]) .win-x').first().click({ timeout: 1500 }).catch(() => {})

for (const k of (which === 'all' ? ['desktop', 'short', 'phone'] : [which])) {
  const P = k
  const { browser, page, errors } = await open({ ...sizes[k], state: SF_STATE })
  await editWeek(page); await board(page, 5)
  /* A1 — the window opened FROM the preview's own chip */
  await planMenuItems(page, 5); await menuLook(page, /^Original/)
  check(`${P}.A1 setup: the board shows the Original's preview bar`, !!(await barButtons(page)).bar, '')
  await tapChip(page)
  let bb = await barButtons(page), w = await winRect(page, '.availwin')
  await screen(page, `${P}-A1-availwin-from-preview`)
  if (k === 'phone') {
    check(`${P}.A1 phone: the window is the bottom panel (12px margins)`, !!w && w.left === 12 && w.vw - w.right === 12 && w.vh - w.bottom === 12, JSON.stringify(w))
  } else {
    check(`${P}.A1 the bar's buttons are reachable with the ALL AVAIL window open`, allOk(bb), JSON.stringify(bb))
    check(`${P}.A1 the window sits clear of the bar and inside the screen`, clearOf(w, bb.bar) && w.bottom <= w.vh, JSON.stringify({ w, bar: bb.bar }))
  }
  /* A2 — back to live: the bar goes, so the window goes back to its corner. On a build where the window covers the
     button (the defect) a person has to close the window first — so does the walk, and A2 then has no window to read. */
  if (!allOk(await barButtons(page))) { note(`${P}.A2`, 'Back is covered — the window is closed first, as a person would'); await closeAvail(page) }
  await pvTap(page, 5, 'data-golive')
  w = await winRect(page, '.availwin')
  note(`${P}.A2 after "← Back to live copy", the window opened on the Original is`, JSON.stringify(w))
  if (w && k !== 'phone') check(`${P}.A2 with no bar the window is back in its corner (top 96)`, w.top === 96, JSON.stringify(w))
  await closeAvail(page)
  /* A3 — the window opened on the LIVE board first, THEN the preview starts under it */
  await tapChip(page)
  await planMenuItems(page, 5); await menuLook(page, /^Original/)
  await page.waitForTimeout(400)
  bb = await barButtons(page); w = await winRect(page, '.availwin')
  await screen(page, `${P}-A3-preview-started-under-open-window`)
  if (k !== 'phone') check(`${P}.A3 a preview started with the window already open: the bar stays reachable`, allOk(bb) && clearOf(w, bb.bar), JSON.stringify({ bb, w }))
  /* A4 — press Load: the armed "Discard N edits & load — confirm" bar is TALLER (when the day has edits to discard) */
  const load = page.locator('#schedBoard .dprev-bar [data-restore]:visible').first()
  if ((await load.count()) && allOk(await barButtons(page))) {
    await load.click(); await page.waitForTimeout(500)
    bb = await barButtons(page); w = await winRect(page, '.availwin')
    note(`${P}.A4 after pressing Load the bar reads`, bb.bar ? bb.buttons.map(b => b.text).join(' | ') : '(the preview ended — loaded)')
    await screen(page, `${P}-A4-after-load-press`)
    if (k !== 'phone' && bb.bar) check(`${P}.A4 the armed bar is still clear of the window`, allOk(bb) && clearOf(w, bb.bar), JSON.stringify({ bb, w }))
    const keep = page.locator('#schedBoard [data-restcancel]:visible').first(); if (await keep.count()) { await keep.click(); await page.waitForTimeout(400) }
  } else note(`${P}.A4`, 'Load not pressable here (covered or absent) — see A3')
  /* A5 — the changes window, from the board's History, over a preview */
  await closeAvail(page)
  if ((await barButtons(page)).bar && !allOk(await barButtons(page))) await closeAvail(page)
  if (!(await barButtons(page)).bar) { await planMenuItems(page, 5); await menuLook(page, /^Original/) }
  const hist = page.locator('#schedBoard button:has-text("History"):visible, #schedBoard [aria-label*="History"]:visible').first()
  if (await hist.count()) {
    await hist.click(); await page.waitForTimeout(700)
    bb = await barButtons(page); w = await winRect(page, '.chgwin')
    await screen(page, `${P}-A5-changes-window-on-preview`)
    if (k !== 'phone') {
      check(`${P}.A5 the changes window leaves the bar reachable`, allOk(bb), JSON.stringify(bb))
      check(`${P}.A5 the changes window sits clear of the bar and inside the screen`, clearOf(w, bb.bar) && w.bottom <= w.vh, JSON.stringify({ w, bar: bb.bar }))
    } else note(`${P}.A5 phone: the changes window`, JSON.stringify(w))
  } else note(`${P}.A5`, 'no History button on the board at this width')
  check(`${P}: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('sf-a-windows') ? 1 : 0
