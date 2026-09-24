/* w3-06 — S23 (Fable) at desktop AND phone: withdraw a signer's SCHEDULER appointment on the Quals page AFTER
   he has signed SKED CK, through the Quals page's own "Enable editing" → tap his SCHEDULER tick → "Save
   changes". Expected (AM16): his name stays shown on the sign-off (a signature never blanks itself on an
   appointment change), but it no longer COUNTS — the line reads "1 to sign · SKED CK" and "Publish day" is
   locked; give the tick back and the day is signed again. Then the same on a PUBLISHED day's amendment
   (Monday: AL1 + a pending change → "Publish AL2").
   Usage: node w3-06-quals.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, shot, navTo } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const brief = h => `${h.tag} | ${h.signState} | ${JSON.stringify(h.signs)} | pub=${h.beak ? h.beak.text + (h.beak.disabled ? ' (locked: ' + h.beak.title + ')' : ' (enabled)') : h.alpub ? h.alpub.text + (h.alpub.disabled ? ' (locked: ' + h.alpub.title + ')' : ' (enabled)') : '-'}`

/* sign one role with the n-th offered name; returns {id, name} */
async function sign(page, di, role, n) {
  const sel = page.locator(`#eWeek select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })).filter(o => o.v))
  const o = opts[Math.min(n, opts.length - 1)]
  await sel.selectOption(o.v); await page.waitForTimeout(300)
  return { id: o.v, name: o.t, offered: opts.map(x => x.t) }
}
/* the Quals page: Enable editing → tap one person's SCHEDULER cell → Save changes */
async function flipScheduler(page, id, name) {
  await navTo(page, 'quals')
  await page.locator('#qEdit:visible').click(); await page.waitForTimeout(400)
  const cell = page.locator(`#qtbl [data-q="${id}|sched"]`).first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
  const before = (await cell.innerText()).trim()
  await cell.click(); await page.waitForTimeout(400)
  const after = (await cell.innerText()).trim()
  await shot(page, name)
  await page.locator('#qSave:visible').click(); await page.waitForTimeout(500)
  return { before, after }
}

for (const w of which) {
  const { check, note, summary } = checker('w3-06 ' + w)
  const P = s => `w3-06-${w}-${s}`
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  await watchToasts(page)
  const dayShot = async (s, di) => {
    const d = page.locator(`#eWeek .day[data-day="${di}"]`).first()
    await d.evaluate(e => { e.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollBy(0, -(window.innerWidth < 820 ? 64 : 150)) }); await page.waitForTimeout(350)
    await shot(page, P(s))
  }
  try {
    /* ---- a draft day: Friday ---- */
    await editWeek(page)
    const cur = await sign(page, 4, 'cur', 0), sk = await sign(page, 4, 'sked', 0), pl = await sign(page, 4, 'plan', 1), ap = await sign(page, 4, 'appr', 2)
    const h0 = await head(page, 4)
    note('Friday signed', { cur: cur.name, sked: sk.name, plan: pl.name, appr: ap.name, skedOffered: sk.offered, head: brief(h0) })
    check('setup: Friday fully signed ("Signed — this day can be published")', /Signed — this day can be published/.test(h0.signState), h0.signState)
    const f1 = await flipScheduler(page, sk.id, P('a-quals-sked-signer-untick'))
    note('Quals: SKED CK signer\'s SCHEDULER tick', f1)
    await navTo(page, 'editsched')
    const h1 = await head(page, 4)
    note('Friday after the appointment was withdrawn', brief(h1))
    check('S23/AM16: the withdrawn signer\'s name stays shown on SKED CK (the signature never blanks itself)', h1.signs[1] === sk.name, JSON.stringify(h1.signs))
    check('S23/AM16: but it no longer counts — the line says SKED CK is to sign', /1 to sign/.test(h1.signState) && /SKED CK/.test(h1.signState + (h1.beak && h1.beak.title || '')), h1.signState)
    check('S23/AM16: and "Publish day" is locked', h1.beak && h1.beak.disabled, JSON.stringify(h1.beak))
    await dayShot('b-fri-after-withdrawal', 4)
    /* which of the four is short? the week's pills and line vs the board's strip */
    const weekPills = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="4"] select[data-sign]')].filter(s => s.offsetWidth)
      .map(s => `${s.dataset.sign}=${s.options[s.selectedIndex]?.text}${(s.closest('.sgn') && s.closest('.sgn').classList.contains('on')) ? ' (green)' : ''}`))
    check('S23/AM15b: the week says WHICH role no longer counts (not just "1 to sign" beside four green names)',
      /SKED CK/.test(h1.signState) || !weekPills.some(p => /^sked=.*\(green\)/.test(p)), `line "${h1.signState}" · pills ${JSON.stringify(weekPills)}`)
    await L.board(page, 4)
    const bs = await page.evaluate(() => ({ line: (document.querySelector('#schedBoard .so-state') || {}).innerText || '',
      pills: [...document.querySelectorAll('#schedBoard select[data-sign]')].filter(s => s.offsetWidth).map(s => `${s.dataset.sign}=${s.options[s.selectedIndex]?.text}${(s.closest('.sgn') && s.closest('.sgn').classList.contains('on')) ? ' (green)' : ''}`) }))
    note('S23 the board\'s strip after the withdrawal', bs)
    await shot(page, P('g-board-fri-after-withdrawal'))
    await L.closeBoard(page)
    const offered = await page.locator('#eWeek select[data-sign="sked"][data-signday="4"]:visible option').evaluateAll(os => os.map(o => o.text).filter(t => !/name/.test(t)))
    note('S23: who SKED CK now offers', offered)
    check('AM16: SKED CK still offers the signed (now unappointed) name, so the existing signature is not dropped', offered.includes(sk.name), JSON.stringify(offered))
    const f2 = await flipScheduler(page, sk.id, P('c-quals-sked-signer-retick'))
    await navTo(page, 'editsched')
    const h2 = await head(page, 4)
    note('Friday after the tick came back', { f2, head: brief(h2) })
    check('S23: giving the appointment back makes the signature count again (signed)', /Signed — this day can be published/.test(h2.signState), h2.signState)

    /* ---- a published day's amendment: Monday (AL1 + a pending change) ---- */
    const m1 = await sign(page, 0, 'cur', 0), m2 = await sign(page, 0, 'sked', 0), m3 = await sign(page, 0, 'plan', 1), m4 = await sign(page, 0, 'appr', 2)
    const hm0 = await head(page, 0)
    note('Monday signed', brief(hm0))
    check('setup: Monday signed for AL2 ("Publish AL2" enabled)', hm0.alpub && !hm0.alpub.disabled, brief(hm0))
    await flipScheduler(page, m2.id, P('d-quals-untick-again'))
    await navTo(page, 'editsched')
    const hm1 = await head(page, 0)
    note('Monday after the withdrawal', brief(hm1))
    check('S23/AM16 on an amendment: "Publish AL2" locks, the name stays shown', hm1.alpub && hm1.alpub.disabled && hm1.signs[1] === m2.name, brief(hm1))
    await dayShot('e-mon-after-withdrawal', 0)
    await flipScheduler(page, m2.id, P('f-quals-retick'))
    await navTo(page, 'editsched')
    const hm2 = await head(page, 0)
    check('S23: re-appointed, "Publish AL2" unlocks again', hm2.alpub && !hm2.alpub.disabled, brief(hm2))
    note('toasts', await toasts(page))
  } catch (e) { check('script ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash')).catch(() => {}) }
  check('no console errors during the walk', errors.length === 0, JSON.stringify(errors).slice(0, 400))
  summary()
  await browser.close()
}
