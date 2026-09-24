/* w2-08 — THE ALL AVAIL WINDOW OPENED FROM A VERSION, THEN THE VERSION GOES (S38).
   The window "lives and dies with its version" (view.ts prunePreviews): opened from an issued or a plan
   chip, it lists that version's men; unpublish the day or bring the plan out and it must close rather than
   go on labelling a list it can no longer read. It also closes on a page change (D66).
   Surfaces: the edit week's preview of the Original, the board's preview, the view page's issued face, the
   view page's plan preview. Usage: node w2-08-availwin.mjs [week|board|view|plan|all] [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, board, closeBoard, check, note, summary, installToasts, takeToasts, h, lookAt, switchTo, pvTap, pvBar, unpublish,
  viewDay, viewPick, screen, put, planMenuItems, menuLook, STATE, DESK, PHONE } = L
const part = process.argv[2] || 'all'
const widths = process.argv[3] ? [process.argv[3]] : ['desktop', 'phone']
const win = page => page.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); return w ? { open: true, title: (w.querySelector('.win-ttl') || {}).innerText?.replace(/\s+/g, ' ') || '', text: w.innerText.replace(/\s+/g, ' ').slice(0, 160) } : { open: false } })
async function tapChip(page, scopeSel) {
  const c = page.locator(`${scopeSel} .oilcount[data-oilsent]:visible`).first()
  if (!(await c.count())) return 'NO CHIP'
  const ver = await c.getAttribute('data-oilver')
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await c.click(); await page.waitForTimeout(700)
  return ver || '(live)'
}

for (const w of widths) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  /* ---- A: the edit week's preview of Saturday's Original ---- */
  if (part === 'all' || part === 'week') {
    console.log(`\n##### S38-A edit week preview — ${w} #####`)
    const { browser, page, errors } = await open({ ...W, state: STATE })
    await installToasts(page); await editWeek(page)
    await lookAt(page, 5, /^Original/)
    const ver = await tapChip(page, '#eWeek .day[data-day="5"]')
    let ws = await win(page)
    check(`${P}.S38-A the ALL AVAIL chip in the Original's preview opens the window, on that version (${ver})`, ws.open && ver !== 'NO CHIP' && ver !== '(live)', JSON.stringify({ ver, ws }))
    await screen(page, `${P}-90-S38-week-preview-window-open`)
    await pvTap(page, 5, 'data-golive')
    ws = await win(page)
    note(`${P}.S38-A after "← Back to live copy" (the version still exists)`, JSON.stringify(ws))
    const un = await unpublish(page, 5)
    const t = await takeToasts(page); ws = await win(page); const hd = await h(page, 5)
    check(`${P}.S38-A Unpublish Saturday (${un.armedFirst ? 'two taps — OIL bid against' : 'one tap'}) → DRAFT, and the window opened on the Original CLOSES`, un.pressed && hd.tag === 'DRAFT' && !ws.open, JSON.stringify({ un, tag: hd.tag, ws, t }))
    await screen(page, `${P}-91-S38-week-after-unpublish`)
    check(`${P}.S38-A: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
  /* ---- B: the board's preview ---- */
  if (part === 'all' || part === 'board') {
    console.log(`\n##### S38-B board preview — ${w} #####`)
    const { browser, page, errors } = await open({ ...W, state: STATE })
    await installToasts(page); await editWeek(page)
    await board(page, 5)
    await planMenuItems(page, 5); await menuLook(page, /^Original/)
    const ver = await tapChip(page, '#schedBoard .pv-frozen')
    let ws = await win(page)
    check(`${P}.S38-B the chip in the board's preview of the Original opens the window on that version (${ver})`, ws.open && ver !== 'NO CHIP' && ver !== '(live)', JSON.stringify({ ver, ws }))
    await screen(page, `${P}-92-S38-board-preview-window-open`)
    /* does the window, where it opens, cover the preview bar's buttons? */
    const cover = await page.evaluate(() => {
      const bar = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(x => x.offsetWidth); if (!bar) return 'no bar'
      return [...bar.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return `${b.innerText.trim()}: ${at && (at === b || b.contains(at)) ? 'reachable' : 'COVERED by ' + ((at && at.closest('.availwin')) ? 'the window' : (at ? at.className : 'nothing'))}` }).join(' · ')
    })
    note(`${P}.S38-B where the window opens, the board's preview-bar buttons are`, cover)
    check(`${P}.S38-B the window opened from the board's preview does not cover the preview bar's buttons`, !/COVERED by the window/.test(cover), cover)
    if (w === 'desktop') {
      /* a person drags the window aside by its grip bar, then goes back to live */
      const wb = page.locator('.availwin:not([hidden]) .win-bar').first()
      const bb = await wb.boundingBox()
      if (bb) { await page.mouse.move(bb.x + 40, bb.y + bb.height / 2); await page.mouse.down(); await page.mouse.move(bb.x - 700, bb.y + 350, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(400) }
      await pvTap(page, 5, 'data-golive')
    } else {
      /* on a phone the window is a bottom panel; the bar sits at the top of the board's scroller. Scroll it
         back to the top (the chip tap had scrolled it under the board's own top strip) and press it there */
      await page.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(x => x.offsetWidth); if (b) { b.scrollIntoView({ block: 'start' }); const sc = b.closest('.sb-scroll, .sb-main, #sbMain') || document.scrollingElement; if (sc && sc.scrollBy) sc.scrollBy(0, -90) } })
      await page.waitForTimeout(300)
      const cover2 = await page.evaluate(() => { const bar = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(x => x.offsetWidth); const b = bar && bar.querySelector('[data-golive]'); if (!b) return 'no button'
        const r = b.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return at && (at === b || b.contains(at)) ? 'reachable' : 'COVERED by ' + (at && at.closest('.availwin') ? 'the window' : (at ? at.className : 'nothing')) })
      check(`${P}.S38-B with the bar scrolled back to the top, "← Back to live copy" is reachable beside the open window`, cover2 === 'reachable', cover2)
      const b = page.locator('#schedBoard .dprev-bar [data-golive]:visible').first(); const bx = await b.boundingBox()
      if (bx) { await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await page.waitForTimeout(600) }
    }
    ws = await win(page)
    note(`${P}.S38-B after the board's "← Back to live copy"`, JSON.stringify(ws))
    const un = await unpublish(page, 5)
    ws = await win(page); const hd = await h(page, 5)
    check(`${P}.S38-B Unpublish from the board → DRAFT, and the window CLOSES`, un.pressed && hd.tag === 'DRAFT' && !ws.open, JSON.stringify({ un, tag: hd.tag, ws }))
    await screen(page, `${P}-93-S38-board-after-unpublish`)
    check(`${P}.S38-B: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
  /* ---- C: the view page's issued face ---- */
  if (part === 'all' || part === 'view') {
    console.log(`\n##### S38-C view page issued face — ${w} #####`)
    const { browser, page, errors } = await open({ ...W, state: STATE })
    await installToasts(page); await go(page, 'viewsched')
    const ver = await tapChip(page, '#vWeek .day[data-day="5"]')
    let ws = await win(page)
    check(`${P}.S38-C the chip on Saturday's ISSUED face opens the window on the issued version (${ver})`, ws.open && ver !== 'NO CHIP' && ver !== '(live)', JSON.stringify({ ver, ws }))
    await screen(page, `${P}-94-S38-view-issued-window-open`)
    /* Unpublish lives on the edit page: going there is a page change, which closes the window first (D66) */
    await go(page, 'editsched')
    ws = await win(page)
    check(`${P}.S38-C going to Edit Schedule (where Unpublish is) closes the window — D66`, !ws.open, JSON.stringify(ws))
    const un = await unpublish(page, 5)
    await go(page, 'viewsched')
    ws = await win(page); const v = await viewDay(page, 5)
    check(`${P}.S38-C after the unpublish the view page shows Saturday as a draft, no window left over`, un.pressed && v.tag === 'DRAFT' && !ws.open, JSON.stringify({ un, tag: v.tag, ws }))
    check(`${P}.S38-C: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
  /* ---- D: the view page's PLAN preview (Wednesday Plan A with an ALL AVAIL on it) ---- */
  if ((part === 'all' || part === 'plan') && w === 'desktop') {
    console.log(`\n##### S38-D view page plan preview — ${w} #####`)
    const { browser, page, errors } = await open({ ...W, state: STATE })
    await installToasts(page); await editWeek(page)
    await switchTo(page, 2, /Plan A/); await takeToasts(page)
    await board(page, 2)
    const got = await put(page, '[data-fill="a:2.0.+"]', ['allavail'])
    note('d.S38-D ALL AVAIL placed on Wed Plan A (Common Programme row 1)', got)
    await closeBoard(page); await editWeek(page)
    await switchTo(page, 2, /Plan B/); await takeToasts(page)
    await go(page, 'viewsched')
    const optA = await page.evaluate(() => [...document.querySelector('#vWeek select[data-dver="2"]').options].find(o => o.value.startsWith('d:'))?.value)
    await viewPick(page, 2, optA)
    const ver = await tapChip(page, '#vWeek .day[data-day="2"]')
    let ws = await win(page)
    check('d.S38-D the chip in the view page\'s Plan A preview opens the window on that plan (' + ver + ')', ws.open && /^d:/.test(ver), JSON.stringify({ ver, ws }))
    await screen(page, 'd-95-S38-view-plan-preview-window-open')
    /* picking the live plan back on the view page: the plan still exists → the window may stay */
    await viewPick(page, 2, 'live')
    ws = await win(page)
    note('d.S38-D after picking "Plan B ●" (live) on the view page — Plan A still exists', JSON.stringify(ws))
    /* bringing Plan A out happens on the edit page: the page change closes the window first (D66) */
    await go(page, 'editsched')
    ws = await win(page)
    check('d.S38-D going to Edit Schedule to switch plans closes the window (D66) — the switch itself cannot be reached with it open', !ws.open, JSON.stringify(ws))
    await switchTo(page, 2, /Plan A/); await takeToasts(page)
    ws = await win(page)
    check('d.S38-D after the switch no window is left open', !ws.open, JSON.stringify(ws))
    check('d.S38-D: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
}
process.exitCode = summary('w2-08-availwin') ? 1 : 0
