/* rcf-w3 S38 v1 — the Logic page's changed lines (F5-F11 and the other Logic sentences), desktop then phone.
   usage: RCF_RUN=s38-r1 node scripts/handpass/rcf/rcf-w3-s38.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s38 v1', W.SHOTS)

// [id, ruling, NEW fragments (each must be on the page), OLD fragments (none may be)]
const LINES = [
  ['F5', ['his in-time or rally, his B where neither is typed, or anything earlier, such as a meeting.'], ['his in-time, his B where no in-time is typed']],
  ['F6', ['An SC SPARE standing by carries no crew rest either way, but one that flies carries it as any flyer does. A shift reports at its start, or at its B or R where one is earlier than the start.'], ['and a shift\'s start is its report']],
  ['F7', ['but his in-time or rally, or his B where neither is typed, is later, so it clears.'], ['but his typed in-time is later']],
  ['F8', ['from its B or R if earlier than its START, otherwise from its START, to its END.'], ['from its B or R (the earlier) to its END']],
  ['F9', ['A row the scheduler adds with no times, or no end time, earns nothing, but a request answered yes earns over its own times.'], ['A row with no times, or no end time, earns nothing.']],
  ['F10', ['checked for clashes, the long day, days in a row and their own absences, and a front seat is always a warning. None of the flying rules apply to them: crew rest, turns, pairing, AAR, SC currency or briefs.'], ['checked only for clashes, the long day and days in a row']],
  ['F11', ['an instructor pilot (IP, IR or FI) in the back seat', 'That clears the front seat\'s currency warning, but an instructor pilot without the mark is flagged instead.'], ['an instructor in the back seat', 'an instructor without the mark is flagged instead']],
  ['O1 In-time lines', ['A formation\'s rally is its R box alone. An In-time line is an in-time whatever its words, even one that says RALLY, and its first clock is used (09:00H or 0900).'], ['a line that says RALLY still counts as a rally']],
  ['O2 no clock', ['A line with no clock, RALLY AFTER IN TIME included, sets no time.'], ['means rally at that formation\'s in-time']],
  ['O3 unreadable', ['The app cannot read the clock on an In-time line.'], ['or RALLY AFTER IN TIME has no in-time']],
  ['O4 SC MAIN advisory', ['Once the shift flies, every clash with it is red.'], []],
  ['O5 SC MAIN setting', ['Once his shift flies, every clash is red.'], []],
  ['O6 standby row flies', ['checked as a sortie is'], ['checked as an SC MAIN is']],
  ['O7 take-off = landing', ['none if it has neither. A standby shift with no length earns none. One that flies with its R or B before its START earns from that time.'], ['a standby shift with no length earns none, flying or not']],
  ['O9 flight ends', ['A flight ends at landing plus the debrief', 'or at take-off plus the debrief where the landing is not a time. Anything else ends at its written end.'], ['anything else at its written end.']],
  ['O10 OIL flight runs', ['A flight runs from its in-time or rally, whichever is earlier', 'where neither is entered), to landing plus the debrief.'], ['where neither an in-time nor a rally is entered']],
  ['O11 desk line', ['Until its wave flies, a desk made from an AVALON or BB template earns only if switched on in OIL Earn. Once the wave flies, the desk earns by default.'], []],
]

async function run(phone) {
  const tag = phone ? 'p' : 'd'
  const { browser, page, errors } = await W.openWorld({ phone })
  const open = async () => {
    if (phone) {
      // phone: the side menu holds the page names
      const link = page.locator('a[data-page="logic"]:visible').first()
      if (!(await link.count())) { await page.locator('#burger').click(); await page.waitForTimeout(500) }
      await page.locator('a[data-page="logic"]:visible').first().click()
    } else await page.locator('a[data-page="logic"]:visible').first().click()
    await page.waitForSelector('#page-logic.on'); await page.waitForTimeout(500)
  }
  await open()
  const nFolds = await page.locator('#page-logic details').count()
  say(`[${tag}] folds on the Logic page:`, nFolds)
  // open every "How it works" fold by pressing its summary
  const sums = page.locator('#page-logic details > summary')
  const ns = await sums.count()
  for (let i = 0; i < ns; i++) {
    const open = await page.evaluate(i => document.querySelectorAll('#page-logic details')[i].open, i)
    if (!open) { await sums.nth(i).scrollIntoViewIfNeeded(); await sums.nth(i).click(); await page.waitForTimeout(150) }
  }
  const openCount = await page.evaluate(() => [...document.querySelectorAll('#page-logic details')].filter(d => d.open).length)
  check(`S38${tag} all folds open`, openCount === nFolds && nFolds > 0, `${openCount}/${nFolds} open`)
  const txt = nrm(await page.evaluate(() => document.querySelector('#page-logic').innerText))
  for (const [id, news, olds] of LINES) {
    const nm = news.map(f => ({ f, ok: txt.includes(nrm(f)) }))
    check(`S38${tag} ${id} new words present`, nm.every(x => x.ok), nm.map(x => (x.ok ? 'yes' : 'NO: ' + x.f.slice(0, 70))).join(' | '))
    const om = olds.map(f => ({ f, found: txt.includes(nrm(f)) }))
    if (olds.length) check(`S38${tag} ${id} old words gone`, om.every(x => !x.found), om.map(x => (x.found ? 'STILL: ' + x.f.slice(0, 60) : 'gone')).join(' | '))
    // picture, cropped to the smallest element holding the new words
    const key = nrm(news[0]).slice(0, 48)
    const ok = await page.evaluate(([k, idx]) => {
      document.querySelectorAll('[data-rcfpic]').forEach(e => e.removeAttribute('data-rcfpic'))
      let best = null
      for (const e of document.querySelectorAll('#page-logic *')) {
        const t = (e.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ')
        if (t.includes(k) && e.offsetWidth > 0 && (!best || t.length < best.t)) best = { e, t: t.length }
      }
      if (!best) return false
      best.e.setAttribute('data-rcfpic', idx); best.e.scrollIntoView({ block: 'center' }); return true
    }, [key, id])
    if (ok) { await page.waitForTimeout(150); await L.shot(page, `${tag}-${id.replace(/[^A-Za-z0-9]+/g, '-')}`, page.locator('[data-rcfpic]').first()) }
    else say(`[${tag}] ${id}: no element to crop`)
  }
  // the full folds-open page
  await page.evaluate(() => window.scrollTo(0, 0))
  await L.shot(page, `${tag}-logic-top`)
  // Debrief 2h -> 1h30 -> 2h: does the fold's "(2h)" follow?
  const readFold = () => page.evaluate(() => { const t = document.querySelector('#page-logic').innerText.replace(/ /g, ' ').replace(/\s+/g, ' '); const m = t.match(/A flight ends at landing plus the debrief \(([^)]*)\)/); return m ? m[1] : null })
  const before = await readFold()
  const editBtn = page.getByRole('button', { name: /^Edit$/ }).first()
  if (await editBtn.count()) {
    await editBtn.scrollIntoViewIfNeeded(); await editBtn.click(); await page.waitForTimeout(400)
    const box = page.locator('#lgBody input[data-lgset="debrief"]').first()
    if (await box.count()) {
      await box.scrollIntoViewIfNeeded()
      await box.click({ clickCount: 3 }); await page.keyboard.type('1h30'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
      const val1 = await box.inputValue().catch(() => '?')
      const mid = await readFold()
      await L.shot(page, `${tag}-debrief-1h30`)
      say(`[${tag}] RECORD debrief box shows "${val1}"; fold reads "(${mid})" (before: "(${before})")`)
      check(`S38${tag} fold follows 90 min`, mid === '1h30' ? true : 'RECORD', `fold "(${mid})" after the box read "${val1}"`)
      await box.click({ clickCount: 3 }); await page.keyboard.type('2h'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
      const back = await readFold()
      check(`S38${tag} fold back at 2h`, back === '2h', `fold "(${back})", box "${await box.inputValue().catch(() => '?')}"`)
      await L.shot(page, `${tag}-debrief-back`)
    } else say(`[${tag}] NOT WALKED debrief box: no input[data-lgset=debrief] after Edit`)
    const fin = page.getByRole('button', { name: /^(Done|Finish)/ }).first()
    if (await fin.count()) { await fin.click(); await page.waitForTimeout(300) }
  } else say(`[${tag}] NOT WALKED debrief change: no Edit button`)
  check(`S38${tag} no console/page errors`, errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
}
await run(false)
await run(true)
W.summary()
