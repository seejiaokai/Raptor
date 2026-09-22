/* [OIL-SEATS-CAN-EARN] walk — SURFACES, three loose ends:
   A. the same phone chip on a WEEKDAY — D27 put the count on every day, so the
      unreachable chip now appears five days a week as well as at the weekend;
   B. can a placeholder reach a COCKPIT by DRAG (the tap is refused)? That is
      the only way one could ever appear in the exported file;
   C. the ISSUED page on the week — the version preview, the only place
      "as issued" is visible. */
import { open, go, board, tap, type, shot, publish, STATE } from './lib.mjs'

/* ---------------- A. a weekday, phone, edit week ------------------------- */
{
  const di = 1                                            // Tuesday 14 Jul — earns nobody anything
  const { browser, page, errors } = await open({ state: STATE, width: 390, height: 844 })
  await board(page, di)
  const ri = await page.evaluate(d => (window.DAYS[d].ground || []).length, di)
  await tap(page, `[data-gradd="${di}"]`)
  await type(page, `[data-bfld="gr:${di}.${ri}.prog"]`, 'WEEKDAY PROBE')
  await type(page, `[data-bfld="gr:${di}.${ri}.str"]`, '08:00')
  await type(page, `[data-bfld="gr:${di}.${ri}.end"]`, '10:00')
  await tap(page, `[data-fill="g:${di}.${ri}.+"]`)
  await page.waitForTimeout(200)
  const p = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  await page.locator('#sbClose:visible').first().click().catch(() => {}); await page.waitForTimeout(900)
  await go(page, 'editsched'); await page.waitForTimeout(900)
  const r = await page.evaluate(d => {
    const day = document.querySelector(`#eWeek .day[data-day="${d}"]`)
    const c = day && [...day.querySelectorAll('.oilcount')].find(e => (e.closest('.pl-row') || {}).innerText?.includes('WEEKDAY PROBE'))
    if (!c) return { chip: 'NO CHIP DRAWN ON THE WEEKDAY' }
    c.scrollIntoView({ block: 'center', inline: 'center' })
    const b = c.getBoundingClientRect(), cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const top = document.elementFromPoint(cx, cy)
    return { chip: (c.innerText || '').trim(), title: (c.getAttribute('title') || '').slice(0, 110),
      onTop: !!(top && (top === c || c.contains(top))),
      front: top ? (top.tagName + '.' + String(top.className).trim().replace(/\s+/g, '.')).slice(0, 34) : 'none', cx, cy }
  }, di)
  console.log('===== A. A WEEKDAY (Tuesday), phone, edit week =====')
  console.log(' ', JSON.stringify(r))
  if (r.cx) {
    await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
    await page.mouse.click(r.cx, r.cy); await page.waitForTimeout(650)
    const said = await page.evaluate(() => { const t = document.getElementById('toastEl')
      return t && t.style.opacity === '1' ? (t.textContent || '').trim().slice(0, 120) : null })
    console.log('  a finger on it ->', said ? '"' + said + '…"' : 'NOTHING HAPPENED')
  }
  await shot(page, 'SURF-27-weekday-phone-chip')
  console.log('  errors:', errors.slice(0, 4))
  await browser.close()
}

/* ---------------- B. the cockpit, by DRAG -------------------------------- */
{
  const di = 5
  const { browser, page, errors } = await open({ state: STATE })
  await board(page, di)
  console.log('\n===== B. CAN A PLACEHOLDER REACH A COCKPIT SEAT? =====')
  /* an EMPTY cockpit seat, made by adding a line through the wave's own + Line */
  await tap(page, `[data-gline="${di}.0"]`)
  await page.waitForTimeout(400)
  const seatKey = await page.evaluate(d => {
    const w = window.DAYS[d].waves[0]
    const li = w.formations.length - 1
    return `${d}.0.${li}.0.p`
  }, di)
  console.log(' the new, empty cockpit seat:', seatKey)
  const before = await page.evaluate(k => {
    const a = k.split('.'); const w = window.DAYS[+a[0]].waves[+a[1]]
    const f = w.formations[+a[2]]; const ac = f.aircraft[+a[3]]
    return ac ? { p: ac.p, w: ac.w } : 'no aircraft'
  }, seatKey)
  console.log(' before:', JSON.stringify(before))

  /* first the TAP, to record the refusal in this run too */
  await tap(page, `[data-slot="${seatKey}"]`)
  await page.waitForTimeout(250)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  let msg = null
  if (armed) {
    const p = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
    if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
    msg = await page.evaluate(() => { const t = document.getElementById('toastEl')
      return t && t.style.opacity === '1' ? (t.textContent || '').trim().slice(0, 180) : null })
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  const afterTap = await page.evaluate(k => {
    const a = k.split('.'); const ac = window.DAYS[+a[0]].waves[+a[1]].formations[+a[2]].aircraft[+a[3]]
    return ac ? { p: ac.p, w: ac.w } : 'gone'
  }, seatKey)
  console.log(' TAP + palette:  armed=' + armed + '  seat after=' + JSON.stringify(afterTap))
  console.log('   the app said:', msg || '(nothing)')

  /* now the DRAG — the second order */
  const src = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  const dst = page.locator(`#schedBoard [data-slot="${seatKey}"]:visible`).first()
  if (await src.count() && await dst.count()) {
    await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
    const a = await src.boundingBox(), b = await dst.boundingBox()
    if (a && b) {
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 18 })
      await page.waitForTimeout(220)
      await page.mouse.up()
      await page.waitForTimeout(700)
    }
  }
  const afterDrag = await page.evaluate(k => {
    const a = k.split('.'); const ac = window.DAYS[+a[0]].waves[+a[1]].formations[+a[2]].aircraft[+a[3]]
    return ac ? { p: ac.p, w: ac.w } : 'gone'
  }, seatKey)
  const dmsg = await page.evaluate(() => { const t = document.getElementById('toastEl')
    return t && t.style.opacity === '1' ? (t.textContent || '').trim().slice(0, 200) : null })
  console.log(' DRAG from the palette: seat after=' + JSON.stringify(afterDrag))
  console.log('   the app said:', dmsg || '(nothing)')
  await shot(page, 'SURF-28-cockpit-refusal')
  console.log('  errors:', errors.slice(0, 4))
  await browser.close()
}

/* ---------------- C. the ISSUED page, on the week ------------------------ */
{
  const di = 5
  const { browser, page, errors } = await open({ state: STATE })
  await board(page, di)
  const pub = await publish(page, di)
  console.log('\n===== C. THE ISSUED PAGE =====')
  console.log(' publishing Saturday:', JSON.stringify(pub))
  const menu = await page.locator(`#schedBoard [data-planmenu="${di}"]:visible`).count()
  console.log(' the day’s one white selector in the top bar:', menu ? 'present' : 'absent')
  if (menu) {
    await page.locator(`#schedBoard [data-planmenu="${di}"]:visible`).first().click(); await page.waitForTimeout(700)
    const rows = await page.evaluate(() => [...document.querySelectorAll('[data-planpv]')]
      .map(e => ({ pv: e.dataset.planpv, txt: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50) })))
    console.log(' the issued pages it lists:', JSON.stringify(rows))
    await shot(page, 'SURF-29-plan-selector')
    if (rows.length) {
      await page.locator(`[data-planpv="${rows[rows.length - 1].pv}"]`).first().click(); await page.waitForTimeout(1200)
      const seen = await page.evaluate(() => ({
        preview: !!document.querySelector('.pvbar, [class*=pvbar], .previewbar'),
        chips: [...document.querySelectorAll('.oilcount')].filter(e => e.getBoundingClientRect().width > 0)
          .map(e => ({ txt: (e.innerText || '').trim(), ver: e.dataset.oilver, title: (e.getAttribute('title') || '').slice(0, 120) })),
      }))
      console.log(' inside the issued page:', JSON.stringify(seen, null, 1))
      await shot(page, 'SURF-30-issued-page-board')
      /* the same issued page, seen from the WEEK */
      await go(page, 'viewsched'); await page.waitForTimeout(1000)
      const wk = await page.evaluate(d => {
        const day = document.querySelector(`#vWeek .day[data-day="${d}"]`)
        return day ? { chips: [...day.querySelectorAll('.oilcount')].map(e => ({ txt: (e.innerText || '').trim(), ver: e.dataset.oilver,
          title: (e.getAttribute('title') || '').slice(0, 120) })) } : 'no day'
      }, di)
      console.log(' the same day on the VIEW WEEK while the issued page is up:', JSON.stringify(wk, null, 1))
      await shot(page, 'SURF-31-issued-page-viewweek')
    }
  }
  console.log('  errors:', errors.slice(0, 6))
  await browser.close()
}
