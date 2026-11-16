/* www W2 scenario 7: a new hide and Undo, reload, the same two items re-timed, one item replaced.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s7.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's7-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('7 hides, undo, identity', size, did, exp, saw, v, pic)
say('www-w2-s7 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI
await X.board(w, FRI)
const wi = await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
const g0 = await H.gRow(w, FRI, 'BRIEFING', '13:10', '13:20', 'bane')
// a second warning to count independently: Ace long day isn't needed; use a second conflict for Ace
const ace = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ace'))
const wi2 = await H.frFlight(w, FRI, '09:00', '10:00', ace, 'ACE FLT')
const gA = await H.gRow(w, FRI, 'ACE ITEM', '09:30', '09:40', ace)
// the warning lines with their state, read from the elements drawn
async function lines() {
  await X.boardWarn(w)
  return page.evaluate(() => {
    const side = document.querySelector('#schedBoard #sbWarn') || document.querySelector('#schedBoard #sbSide')
    if (!side) return []
    return [...side.querySelectorAll('.witem, .wln')].filter(e => e.offsetWidth).map(e => ({ t: e.innerText.replace(/[\s ]+/g, ' ').trim(), cls: String(e.className), struck: getComputedStyle(e).textDecorationLine + '|' + [...e.querySelectorAll('*')].some(c => getComputedStyle(c).textDecorationLine.includes('line-through')) }))
  })
}
const head = () => page.evaluate(() => { const e = document.querySelector('#schedBoard #sbWarn, #schedBoard #sbSide'); return e ? e.innerText.replace(/[\s ]+/g, ' ').slice(0, 160) : '' })
const puckMarks = (cs) => page.evaluate(c => [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.getBoundingClientRect().width && (e.innerText || '').includes(c)).map(e => String(e.className) + '|' + [...e.querySelectorAll('[class*=flag], [class*=warn], .wk')].length).slice(0, 4), cs)
const isHid = l => !!l && /\bhid\b/.test(l.cls)
async function hideLine(re) {
  const el = page.locator('#schedBoard .witem:visible, #schedBoard .wln:visible').filter({ hasText: re }).first()
  const x = el.locator('text=✕').first()
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (PHONE) await x.tap(); else await x.click()
  await sleep(500)
}
let L0 = await lines()
say('LINES0', JSON.stringify(L0.map(l => l.t)))
say('HTML', await page.evaluate(() => { const e = document.querySelector('#schedBoard .witem'); return e ? e.outerHTML.slice(0, 700) : 'none' }))
await X.pic(w, `7-1-before-${P}`)
R('two conflicts (Ranger flight+briefing; Ace flight+item)', 'both Conflict lines shown; puck marks', JSON.stringify(L0.map(l => l.t)) + ' head: ' + await head(), L0.filter(l => /Conflict:/.test(l.t)).length >= 2 ? 'PASS' : 'FAIL', `7-1-before-${P}.png`)
const rangerMarks0 = await puckMarks('Ranger')
await hideLine(/Ranger — Conflict:/)
let L1 = await lines()
await X.pic(w, `7-2-hidden-${P}`)
const rl = L1.find(l => /Ranger — Conflict:/.test(l.t))
R('✕ pressed on Ranger\'s Conflict line', 'line stays, struck/dimmed; count and marks drop it; Ace line unchanged', JSON.stringify(L1.map(l => l.t + ' [' + l.cls + ' ' + l.struck + ']')) + ' head: ' + await head() + ' marks ' + JSON.stringify(rangerMarks0) + ' -> ' + JSON.stringify(await puckMarks('Ranger')), isHid(rl) ? 'PASS' : 'FAIL', `7-2-hidden-${P}.png`)
// Undo from the board bar
say('BAR BTNS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-top button, #schedBoard .sb-top [role=button]')].filter(e => e.getBoundingClientRect().width).map(e => e.id + '|' + (e.title || '') + '|' + (e.getAttribute('aria-label') || '') + '|' + (e.innerText || '').trim().slice(0, 12)))))
const und = page.locator('#schedBoard .sb-top [title="Undo"]:visible, #schedBoard .sb-top [aria-label="Undo"]:visible, #schedBoard .sb-top #sbUndo:visible, #schedBoard .sb-top [id*="ndo"]:visible').first()
say('undo button', await und.count())
if (await und.count()) { if (PHONE) await und.tap(); else await und.click(); await sleep(600) }
let L2 = await lines()
await X.pic(w, `7-3-undone-${P}`)
const rl2 = L2.find(l => /Ranger — Conflict:/.test(l.t))
R('the top-bar Undo pressed after the hide', 'RECORD (a hide may or may not be on the Undo list)', JSON.stringify(L2.map(l => l.t + ' [' + l.cls + ' ' + l.struck + ']')), 'RECORDED', `7-3-undone-${P}.png`)
// the line's own Reset arrow
if (isHid(rl2)) {
  const hl = page.locator('#schedBoard .wln.hid:visible, #schedBoard .witem.hid:visible').filter({ hasText: /Ranger — Conflict:/ }).first()
  say('HIDDEN HTML', (await hl.evaluate(e => e.outerHTML)).slice(0, 500))
  const rb = hl.locator('.wln-mute').first()
  await rb.evaluate(e => e.scrollIntoView({ block: 'center' })); if (PHONE) await rb.tap(); else await rb.click(); await sleep(500)
  const L2b = await lines(); await X.pic(w, `7-3b-reset-arrow-${P}`)
  const q = L2b.find(l => /Ranger — Conflict:/.test(l.t))
  R('the hidden line\'s own arrow pressed', 'the hide is taken back: line plain again, count back', JSON.stringify(L2b.map(l => l.t + ' [' + l.cls + ']')) + ' head: ' + await head(), q && !isHid(q) ? 'PASS' : 'FAIL', `7-3b-reset-arrow-${P}.png`)
}
// hide again, reload, sign in
await hideLine(/Ranger — Conflict:/)
const L3 = await lines()
const stateBefore = JSON.stringify(L3.find(l => /Ranger — Conflict:/.test(l.t)))
await X.closeBoard(w)
await sleep(500)
await page.reload(); await page.waitForTimeout(1500)
const needLogin = await page.locator('#luser:visible').count()
if (needLogin) await L.login(page, 'a')
await sleep(1000)
await X.board(w, FRI)
const L4 = await lines()
await X.pic(w, `7-4-reload-${P}`)
R('hide made, closed the board, reloaded the page' + (needLogin ? ' and signed in again' : ''), 'still hidden after the reload', JSON.stringify(L4.map(l => l.t + ' [' + l.cls + ' ' + l.struck + ']')), isHid(L4.find(l => /Ranger — Conflict:/.test(l.t))) ? 'PASS' : 'FAIL', `7-4-reload-${P}.png`)
// re-time the same two items, conflict kept
await H.setF(w, `gr:${FRI}.${g0}.str`, '13:15'); await H.setF(w, `gr:${FRI}.${g0}.end`, '13:25')
const L5 = await lines()
await X.pic(w, `7-5-retimed-${P}`)
const r5 = L5.find(l => /Ranger — Conflict:/.test(l.t))
R('same two items re-timed (BRIEFING 13:15-13:25), conflict kept', 'stays hidden', JSON.stringify(L5.map(l => l.t + ' [' + l.cls + ' ' + l.struck + ']')), isHid(r5) ? 'PASS' : 'FAIL', `7-5-retimed-${P}.png`)
// replace the item: a different row, the first one removed
const g1 = await H.gRow(w, FRI, 'BRIEFING TWO', '13:15', '13:25', 'bane')
// take Ranger off the first row's seat by changing its name, then check
await page.evaluate(([d, i]) => { const b = document.querySelector(`#schedBoard [data-bfld="gr:${d}.${i}.prog"]`); return b ? b.value : null }, [FRI, g0])
// delete the first row (the row's ✕ button)
const delBtns = await page.evaluate(([d]) => [...document.querySelectorAll('#schedBoard [data-grdel], #schedBoard [data-del]')].map(e => Object.keys(e.dataset).join(',') + '=' + Object.values(e.dataset).join(',')).slice(0, 8), [FRI])
say('DEL candidates', JSON.stringify(delBtns))
const row0 = page.locator(`#schedBoard [data-bfld="gr:${FRI}.${g0}.prog"]`).first()
const rowBtn = row0.locator('xpath=ancestor::*[self::div or self::tr][1]').locator('button:text-is("✕"), button:text-is("×"), button[title*="elete" i]').last()
say('row del btn', await rowBtn.count())
if (await rowBtn.count()) { await rowBtn.evaluate(e => e.scrollIntoView({ block: 'center' })); if (PHONE) await rowBtn.tap(); else await rowBtn.click(); await sleep(600) }
const yes = page.getByRole('button', { name: /^(Delete|Yes|Remove|OK)/ }).first()
if (await yes.count() && await yes.isVisible().catch(() => false)) { await yes.click(); await sleep(500) }
const L6 = await lines()
await X.pic(w, `7-6-replaced-${P}`)
const r6 = L6.find(l => /Ranger — Conflict:/.test(l.t))
R('first BRIEFING row deleted, a different row (BRIEFING TWO, same times) holds the conflict', 'the new conflict is NOT hidden (a different item)', JSON.stringify(L6.map(l => l.t + ' [' + l.cls + ' ' + l.struck + ']')), r6 ? (!isHid(r6) ? 'PASS' : 'FAIL') : 'NOT WALKED', `7-6-replaced-${P}.png`)
await X.fin(w)
