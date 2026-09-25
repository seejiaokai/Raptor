/* Walker B2, items 1 + 2 (close-ups, phone, member) and item 13 (the ORIG seal). 25 Sep 26.
   Starts from b2-01's saved world (Monday: AL2 out, AL3 waiting). Adds, through the app's own gestures:
     - a man whose ONLY problem is that his Monday night breaks his Tuesday rest (dragged onto the night VL line), so
       the dotted ring carries its own CR caption (D94);
     - "LATE SHOW" typed into his Tuesday line's remarks, so Tuesday's breach rings dashed (sanctioned) if he clears by
       step (D94, the dashed ring on the board as on the week).
   Then: DPR-3 close-ups (desktop), the phone (390, DPR 3), the member's View-only Sched, and the ORIG seal beside an
   AL3 day, an AL4 day and a DRAFT day on the edit week head, the board strip and View-only Sched, desktop and phone. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2'
const L = await import('./b2-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishAL, go, dragOnto, seatMarks, HEX, rgb, check, note, summary, screen,
  viewPick, head, editText, idOf } = L
const SHOTS = process.env.HP_SHOTS
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad'
const S1 = `${SCR}/b2-world-al3wait.json`, S2 = `${SCR}/b2-world-trace.json`
const allErrors = []

/* ---- A. the clean dotted ring and the dashed late show (desktop, DPR 1) ---------------------------------------- */
{
  const { browser, ctx, page, errors } = await openHi({ width: 1440, height: 900, state: S1, dpr: 1 })
  await editWeek(page)
  /* a WSO who is on nothing on Monday and flies Tuesday morning (read, to choose him — the move itself is a drag) */
  const cand = await page.evaluate(() => {
    const D = window.DAYS, P = window.PEOPLE
    const onMon = new Set(JSON.stringify(D[0]).match(/"[a-z0-9_]+"/g).map(s => s.slice(1, -1)).filter(x => P[x]))
    const out = []
    D[1].waves.forEach((w, gi) => w.formations.forEach((f, li) => f.aircraft.forEach((a, ai) => {
      if (a.w && P[a.w] && !onMon.has(a.w) && P[a.w].seat === 'RCP') out.push({ id: a.w, cs: P[a.w].cs, to: f.to, key: `fr:1.${gi}.${li}.${ai}`, seat: `1.${gi}.${li}.${ai}.w` })
    })))
    return out.sort((a, b) => String(a.to).localeCompare(String(b.to)))
  })
  console.log('candidates', JSON.stringify(cand.slice(0, 6)))
  const c = cand[0]
  await board(page, 0)
  console.log('drag', c && c.cs, '→ 0.1.0.1.w:', c ? await dragOnto(page, '0.1.0.1.w', c.cs) : 'NO CANDIDATE')
  const w0 = await page.evaluate(id => { const W = window.WARN; return { chip: (W.chip[0] || {})[id] || '', sev: (W.sev[0] || {})[id] || '', trace: (W.trace[0] || {})[id] || null, tueChip: (W.chip[1] || {})[id] || '', tueDash: !!((W.dash || [])[1] || {})[id] } }, c.id)
  console.log('WARN for', c.cs, JSON.stringify(w0))
  const pk = async (root, di) => page.evaluate(([root, id]) => [...document.querySelectorAll(`${root} .puck[data-person="${id}"]`)].filter(e => (e.offsetWidth || e.offsetHeight) && !e.closest('#sbRoster') && !e.closest('#eRoster'))
    .map(e => ({ cls: e.className, flag: (e.querySelector('.flag') || {}).innerText || '', outline: getComputedStyle(e).outlineStyle, title: (e.getAttribute('title') || '').slice(0, 120) })), [root, c.id])
  const bMon = await pk('#schedBoard')
  const sel = page.locator(`#schedBoard .seat[data-slot="0.1.0.1.w"]`).first()
  await sel.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  let b = await sel.boundingBox(); await page.screenshot({ path: `${SHOTS}/b2-02-board-trace-dpr1.png`, clip: { x: b.x - 260, y: b.y - 40, width: b.width + 420, height: b.height + 80 } })
  await closeBoard(page)
  const wMon = await pk('#eWeek .day[data-day="0"]')
  console.log('MON pucks board', JSON.stringify(bMon), 'week', JSON.stringify(wMon))
  check(`D94 | ${c.cs}'s Monday (breaks Tuesday rest): dotted ring on the board`, bMon.length && bMon.every(r => /boxdot/.test(r.cls) && r.outline === 'dotted' && !/boxred/.test(r.cls)), bMon.map(r => r.cls).join(' | '))
  /* on the cause day the trace's caption is the puck's title ("Crew rest — Tuesday is broken by this day: he had to leave by …"); no chip is printed on either surface */
  check(`D94 | ${c.cs}: the board carries the same crew-rest caption as the week`, bMon.length && /Crew rest — Tuesday is broken by this day/.test(bMon[0].title) && bMon.map(r => r.title + '|' + r.flag).join() === wMon.map(r => r.title + '|' + r.flag).join(), `board "${bMon.map(r => r.flag + '|' + r.title).join()}" · week "${wMon.map(r => r.flag + '|' + r.title).join()}"`)
  const ws = page.locator(`#eWeek .day[data-day="0"] .seat[data-slot="0.1.0.1.w"]`).first()
  await ws.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  b = await ws.boundingBox(); await page.screenshot({ path: `${SHOTS}/b2-02-week-trace-dpr1.png`, clip: { x: b.x - 200, y: b.y - 40, width: b.width + 360, height: b.height + 80 } })

  /* the sanctioned late show on Tuesday: "LATE SHOW" in his Tuesday line's remarks (typed on the week) */
  await editText(page, c.key, 'LATE SHOW')
  const w1 = await page.evaluate(id => { const W = window.WARN; return { chip: (W.chip[1] || {})[id] || '', dash: !!((W.dash || [])[1] || {})[id] } }, c.id)
  console.log('TUE after LATE SHOW', JSON.stringify(w1))
  const wTue = await pk('#eWeek .day[data-day="1"]')
  await board(page, 1)
  const bTue = await pk('#schedBoard')
  const bs = page.locator(`#schedBoard .seat[data-slot="${c.seat}"]`).first()
  if (await bs.count()) { await bs.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); b = await bs.boundingBox(); await page.screenshot({ path: `${SHOTS}/b2-02-board-dash-dpr1.png`, clip: { x: b.x - 260, y: b.y - 40, width: b.width + 420, height: b.height + 80 } }) }
  await closeBoard(page)
  console.log('TUE pucks week', JSON.stringify(wTue), 'board', JSON.stringify(bTue))
  if (w1.dash) {
    check(`D94 | ${c.cs}'s sanctioned late show: dashed on the week`, wTue.some(r => /boxdash/.test(r.cls) && r.outline === 'dashed'), wTue.map(r => r.cls).join(' | '))
    check(`D94 | ${c.cs}'s sanctioned late show: dashed on the board too`, bTue.some(r => /boxdash/.test(r.cls) && r.outline === 'dashed'), bTue.map(r => r.cls).join(' | '))
  } else note(`D94 dashed`, `"LATE SHOW" did not sanction ${c.cs}'s Tuesday (he does not clear rest by step, or the breach is bound elsewhere) — engine chip ${w1.chip}`)
  const ws2 = page.locator(`#eWeek .day[data-day="1"] .seat[data-slot="${c.seat}"]`).first()
  if (await ws2.count()) { await ws2.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); b = await ws2.boundingBox(); await page.screenshot({ path: `${SHOTS}/b2-02-week-dash-dpr1.png`, clip: { x: b.x - 200, y: b.y - 40, width: b.width + 360, height: b.height + 80 } }) }
  await ctx.storageState({ path: S2 })
  allErrors.push(...errors)
  await browser.close()
}

/* ---- B. close-ups at DPR 3 (desktop): the edit week, the board, View-only Sched (issued + peek) ----------------- */
async function seatShot(page, name, rootSel, key, { padX = 70, padY = 26 } = {}) {
  const s = page.locator(`${rootSel} .seat[data-slot="${key}"]`).first()
  if (!(await s.count())) { console.log('no seat', rootSel, key); return }
  await s.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  const b = await s.boundingBox(); if (!b) return
  await page.screenshot({ path: `${SHOTS}/${name}.png`, clip: { x: Math.max(0, b.x - padX), y: Math.max(0, b.y - padY), width: b.width + padX * 2, height: b.height + padY * 2 } })
}
const CLOSE = [['tally-al2-amber', '0.0.0.1.w'], ['saber-al2-red', '0.0.1.0.p'], ['warden-al3-red-dotted', '0.1.0.0.p'], ['trace-al3-dotted', '0.1.0.1.w'],
  ['desk-al2', 'd:0.1.0'], ['extra-al3', 'd:0.1.1.x0'], ['sim-al2', 's:0.oft.0.p'], ['pax-al3', 's:0.amt.1.pax.1'], ['ground-al3', 'g:0.1'], ['prog-al2', 'a:0.1.1']]
{
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: S2, dpr: 3 })
  await editWeek(page)
  for (const [n, k] of CLOSE) await seatShot(page, `b2-02-week-dpr3-${n}`, '#eWeek .day[data-day="0"]', k)
  await board(page, 0)
  for (const [n, k] of CLOSE.slice(0, 6)) await seatShot(page, `b2-02-board-dpr3-${n}`, '#schedBoard', k)
  await closeBoard(page)
  await go(page, 'viewsched'); await page.waitForTimeout(500)
  await viewPick(page, 0, 'working')
  for (const [n, k] of CLOSE.slice(0, 4)) await seatShot(page, `b2-02-viewpeek-dpr3-${n}`, '#vWeek .day[data-day="0"]', k)
  await viewPick(page, 0, 'issued')
  /* the issued face drops the seat keys: picture the first wave's first line whole */
  const f = page.locator('#vWeek .day[data-day="0"] .go').first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  await f.screenshot({ path: `${SHOTS}/b2-02-viewissued-dpr3-wave1.png` })
  allErrors.push(...errors)
  await browser.close()
}

/* ---- C. the phone (390 × 844, DPR 3): tags on the week, the board, the view peek -------------------------------- */
{
  const { browser, page, errors } = await openHi({ width: 390, height: 844, state: S2, dpr: 3 })
  await editWeek(page)
  const wk = await seatMarks(page, '#eWeek .day[data-day="0"]')
  const bad = r => { const al = rgb(HEX[r.alc || r.aln]); return (r.edge && (r.edge.shadow.includes(al) || r.edge.outline.includes(al))) || (r.alc ? r.tag.bg !== al : !r.tag.border.startsWith('dotted')) }
  check('phone week | every changed puck: its tag, no AL ring', wk.length >= 14 && !wk.some(bad), `${wk.length} seats · bad: ${wk.filter(bad).map(r => r.who).join(',')}`)
  for (const [n, k] of CLOSE.slice(0, 4)) await seatShot(page, `b2-02-phone-week-${n}`, '#eWeek .day[data-day="0"]', k, { padX: 40 })
  await board(page, 0)
  const bd = await seatMarks(page, '#schedBoard')
  check('phone board | every changed puck: its tag, no AL ring', bd.length >= 14 && !bd.some(bad), `${bd.length} seats · bad: ${bd.filter(bad).map(r => r.who).join(',')}`)
  for (const [n, k] of CLOSE.slice(0, 4)) await seatShot(page, `b2-02-phone-board-${n}`, '#schedBoard', k, { padX: 40 })
  await closeBoard(page)
  await go(page, 'viewsched'); await page.waitForTimeout(500)
  await viewPick(page, 0, 'working')
  const vp = await seatMarks(page, '#vWeek .day[data-day="0"]')
  check('phone view peek | every changed puck: its tag, no AL ring', vp.length >= 14 && !vp.some(bad), `${vp.length} seats`)
  await seatShot(page, 'b2-02-phone-viewpeek-warden', '#vWeek .day[data-day="0"]', '0.1.0.0.p', { padX: 40 })
  allErrors.push(...errors)
  await browser.close()
}

/* ---- D. the member on View-only Sched ------------------------------------------------------------------------------ */
{
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: S2, dpr: 1, who: 'm' })
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  const iss = await seatMarks(page, '#vWeek .day[data-day="0"]')
  check('member view issued face | AL2 tags on the 8 published changes, no waiting tag', iss.filter(r => r.alc === '2').length >= 8 && !iss.some(r => r.aln), `${iss.length} tagged: ${iss.map(r => r.who + (r.alc ? '/AL' + r.alc : '/aln' + r.aln)).join(',')}`)
  const hasPeek = await page.locator('#vWeek select[data-vwork="0"]').count()
  if (hasPeek) {
    await viewPick(page, 0, 'working')
    const pk = await seatMarks(page, '#vWeek .day[data-day="0"]')
    check('member view peek | hollow tags on the waiting changes', pk.filter(r => r.aln === '3').length >= 7, `${pk.filter(r => r.aln).length} waiting tags`)
    const f = page.locator('#vWeek .day[data-day="0"] .go').nth(1)
    await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); await f.screenshot({ path: `${SHOTS}/b2-02-member-viewpeek-wave2.png` })
    await viewPick(page, 0, 'issued')
  } else note('member view peek', 'no working-draft selector for the member on Monday')
  const f = page.locator('#vWeek .day[data-day="0"] .go').first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); await f.screenshot({ path: `${SHOTS}/b2-02-member-viewissued-wave1.png` })
  allErrors.push(...errors)
  await browser.close()
}

/* ---- E. THE ORIG SEAL (D111) beside an AL3 day, an AL4 day and a DRAFT day ---------------------------------------- */
async function tags(page) {
  return page.evaluate(() => [...document.querySelectorAll('.verchip')].filter(e => e.offsetWidth || e.offsetHeight).map(e => {
    const s = getComputedStyle(e), where = e.closest('#schedBoard') ? 'board' : e.closest('#vWeek') ? 'view' : e.closest('#eWeek') ? 'week' : e.closest('.signedln') ? 'signed' : 'other'
    return { where, text: e.innerText.trim(), cls: e.className, bg: s.backgroundColor, color: s.color, shadow: s.boxShadow, border: s.borderTopStyle, tick: !!e.querySelector('.vtick'), signed: !!e.closest('.signedln') }
  }))
}
function sealChecks(tag, list, expectOrig = true) {
  const orig = list.filter(t => /orig/.test(t.cls) && !t.signed)
  const grey = list.filter(t => /ORIG/.test(t.text) && (!/orig/.test(t.cls) || !t.tick))
  check(`${tag} | every ORIG tag is the seal (tick disc, faint white wash, thin light outline)`, (expectOrig ? orig.length > 0 : !orig.length) && orig.every(t => t.tick && t.bg === 'rgba(241, 244, 247, 0.1)' && /inset/.test(t.shadow) && t.color === 'rgb(241, 244, 247)'), `${orig.length} ORIG tags · ${orig.map(t => t.where + ':' + t.bg + ' ' + t.shadow).slice(0, 2).join(' | ')}`)
  check(`${tag} | no grey ORIG anywhere`, !grey.length, grey.map(t => t.where + ' ' + t.cls + ' ' + t.bg).join(' | '))
  const al4 = list.filter(t => t.text === 'AL4'), al3 = list.filter(t => t.text === 'AL3')
  if (al4.length) check(`${tag} | ORIG does not read as AL4 (AL4 solid white with dark ink; ORIG a faint wash with light ink)`, al4.every(t => t.bg === 'rgb(255, 255, 255)') && orig.every(t => t.bg !== 'rgb(255, 255, 255)' && t.color !== al4[0].color), `AL4 bg ${al4[0].bg} ink ${al4[0].color}`)
  if (al3.length) check(`${tag} | ORIG does not read as AL3 green`, al3.every(t => t.bg === 'rgb(61, 232, 107)') && orig.every(t => !/61, 232, 107/.test(t.bg + t.color + t.shadow)), `AL3 bg ${al3[0].bg}`)
  const draft = list.filter(t => /DRAFT/.test(t.text))
  if (draft.length) check(`${tag} | DRAFT stays dashed and apart from the seal`, draft.every(t => t.border === 'dashed' && !t.tick), draft.map(t => t.border).join(','))
}
async function headShots(page, prefix, phone) {
  /* the edit week's heads: Monday + Tuesday together, then Tuesday + Wednesday (desktop shows two and a half days) */
  await editWeek(page)
  if (!phone) {
    for (const [di, n] of [[0, 'mon-tue'], [1, 'tue-wed']]) {
      const hd = page.locator(`#eWeek .day[data-day="${di}"] .day-head`).first()
      await hd.evaluate(e => { e.closest('.day').scrollIntoView({ block: 'start', inline: 'start' }) }); await page.evaluate(() => window.scrollTo(window.scrollX, 0))
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${SHOTS}/${prefix}-week-${n}.png`, clip: { x: 0, y: 100, width: 1440, height: 190 } })
    }
  } else {
    for (const di of [0, 1, 2]) {
      const hd = page.locator(`#eWeek .day[data-day="${di}"] .day-head`).first()
      await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(400)
      const bb = await hd.boundingBox(); if (bb) await page.screenshot({ path: `${SHOTS}/${prefix}-week-d${di}.png`, clip: { x: 0, y: Math.max(0, bb.y - 10), width: 390, height: Math.min(200, bb.height + 60) } })
    }
  }
  sealChecks(`${prefix} week`, await tags(page))
  for (const di of [0, 1, 2]) {
    await board(page, di)
    const strip = page.locator('#schedBoard .verchip').first()
    await strip.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
    await page.screenshot({ path: `${SHOTS}/${prefix}-board-d${di}.png`, clip: { x: 0, y: 0, width: phone ? 390 : 1440, height: phone ? 300 : 240 } })
    const tb = await tags(page); sealChecks(`${prefix} board d${di}`, tb.filter(t => t.where === 'board'), di === 1)
    const sb = page.locator('#schedBoard .board-sign, #schedBoard .signedln').first()
    if (await sb.count()) { await sb.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); await sb.screenshot({ path: `${SHOTS}/${prefix}-board-signstrip-d${di}.png` }) }
  }
  await closeBoard(page)
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  for (const di of [0, 1, 2]) {
    const hd = page.locator(`#vWeek .day[data-day="${di}"] .day-head`).first()
    await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(350)
    const bb = await hd.boundingBox(); if (bb) await page.screenshot({ path: `${SHOTS}/${prefix}-view-d${di}.png`, clip: { x: Math.max(0, bb.x - 6), y: Math.max(0, bb.y - 6), width: Math.min(phone ? 390 : 1440, bb.width + 12), height: bb.height + 60 } })
  }
  sealChecks(`${prefix} view`, await tags(page))
}
{
  const { browser, ctx, page, errors } = await openHi({ width: 1440, height: 900, state: S2, dpr: 1 })
  await editWeek(page)
  /* Monday → AL3 (green): four OTHER signers, Publish AL3 */
  console.log('sign AL3', JSON.stringify(await signDay(page, 0, 1)), JSON.stringify(await publishAL(page, 0)))
  console.log('Mon head', JSON.stringify(await head(page, 0)))
  await headShots(page, 'b2-02-seal-al3', false)
  /* Monday → AL4 (white): one more change (a drag on the board), sign, Publish AL4 */
  await board(page, 0)
  console.log('AL4 change', await dragOnto(page, 'g:0.2', 'Vandal'))
  await closeBoard(page); await editWeek(page)
  console.log('sign AL4', JSON.stringify(await signDay(page, 0, 2)), JSON.stringify(await publishAL(page, 0)))
  console.log('Mon head', JSON.stringify(await head(page, 0)))
  await headShots(page, 'b2-02-seal-al4', false)
  await ctx.storageState({ path: `${SCR}/b2-world-al4.json` })
  allErrors.push(...errors)
  await browser.close()
}
{
  const { browser, page, errors } = await openHi({ width: 390, height: 844, state: `${SCR}/b2-world-al4.json`, dpr: 3 })
  await headShots(page, 'b2-02-seal-phone', true)
  allErrors.push(...errors)
  await browser.close()
}
check('no browser errors (every context)', allErrors.length === 0, allErrors.join(' | '))
summary('b2-02')
