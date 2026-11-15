/* www w3 helpers (16 Nov 26): the re-walk's shared reading helpers; sets the frozen build and WWW_WHO before the lib loads. */
process.env.WWW_WHO = 'w3'
process.env.WWW_DIST = 'C:/Users/User/AppData/Local/Temp/claude/42b9573624e95a02/4c1797bb-9f38-4e6f-b517-4ac8dd7d50b9/scratchpad/frozen-47715d5'
process.env.WWW_BUNDLE = 'index-Dk1Ve6Qu.js'
export const X = await import('./www-lib.mjs')
export const { say, sleep, L, nrm, FRI, SAT, SUN, MON, TUE, WED, THU } = X

export async function frFlight(w, di, to, ld, man, msn = 'VL BFM') {
  const wi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld) await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.msn"]`, msn)
  if (man) { const s = await X.seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, man); if (s !== 'ok') say('SEAT PROBLEM', man, s) }
  return wi
}
export async function gRow(w, di, name, str, end, man) {
  const page = w.page
  const g0 = await page.evaluate(d => window.DAYS[d].ground.length, di)
  await X.press(w, `[data-gradd="${di}"]`, { scope: 'board' }); await X.sleep(400)
  await X.typeIn(w, `[data-bfld="gr:${di}.${g0}.prog"]`, name)
  if (str) await X.typeIn(w, `[data-bfld="gr:${di}.${g0}.str"]`, str)
  if (end) await X.typeIn(w, `[data-bfld="gr:${di}.${g0}.end"]`, end)
  if (man) { const s = await X.seat(w, `[data-fill="g:${di}.${g0}.+"]`, man); if (s !== 'ok') say('SEAT PROBLEM', man, s) }
  return g0
}
export const setF = (w, key, v) => X.typeIn(w, `[data-bfld="${key}"]`, v)

/** the board's lines that mention a pattern */
export async function bwf(w, re) { return (await X.boardWarn(w)).filter(l => re.test(l)) }

export async function logicOpen(w, edit = true) {
  const page = w.page
  await L.go(page, 'logic'); await X.sleep(500)
  if (edit && await page.locator('#lgEdit:visible').count()) { await X.press(w, '#lgEdit'); await X.sleep(300) }
}
export async function logicDone(w) {
  if (await w.page.locator('#lgDone:visible').count()) { await X.press(w, '#lgDone'); await X.sleep(300) }
}
export async function setSetting(w, key, value) {
  const page = w.page
  const inp = page.locator(`[data-lgset="${key}"]:visible`).first()
  await inp.waitFor({ state: 'visible', timeout: 6000 })
  await inp.evaluate(e => e.scrollIntoView({ block: 'center' })); await X.sleep(150)
  if (w.phone) await inp.tap(); else await inp.click()
  await inp.fill(String(value))
  await page.keyboard.press('Tab')
  await X.sleep(500)
  return inp.inputValue()
}
export async function signAndPublish(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r0} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) { out[role] = 'NO NAMES'; continue }
    await sel.selectOption(opts[0]); await X.sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  let which = null
  for (const attr of ['data-beak', 'data-alpub']) {
    const b = page.locator(`${r0} [${attr}="${di}"]:visible`).first()
    if (await b.count()) { which = attr; if (await b.isDisabled()) return { pressed: false, why: 'disabled ' + (await b.getAttribute('title')), signs: out }
      await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await b.tap(); else await b.click(); await X.sleep(900); break }
  }
  if (!which) return { pressed: false, why: 'no publish button', signs: out }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await X.sleep(900) }
  return { pressed: true, which, signs: out }
}
export async function head(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  return page.evaluate(([r, i]) => {
    const scope = r === '#schedBoard' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const q = s => scope.querySelector(s)
    return { tag: ((q('.verchip') || {}).innerText || '').replace(/\s+/g, ' ').trim(), pending: ((q('.dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() }
  }, [r0, di])
}
/** the crew-rest lines for a man in all three readings of a day (week strip, day details, board) */
export async function crLines(w, di, re, tag) {
  const P = w.P
  await L.go(w.page, 'editsched'); await sleep(400)
  const ww = await X.weekWarn(w, '#eWeek', di)
  await X.pic(w, `${tag}-week-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', di)
  await X.pic(w, `${tag}-details-${P}`)
  await X.closeDayPop(w, 'done')
  await X.board(w, di)
  const bw = await X.boardWarn(w)
  await X.pic(w, `${tag}-board-${P}`)
  await X.closeBoard(w)
  const f = a => (a || []).filter(l => re.test(l))
  return { week: f(ww.items), details: f(dd.items), board: f(bw) }
}
/** a free man (nothing on the given days of this week): returns [cs, key] */
export async function freeMan(w, days, names = ['Ace', 'Anvil', 'Blade', 'Cinch', 'Cobra', 'Comet', 'Forge', 'Gambit', 'Havoc', 'Hunter']) {
  const page = w.page
  const busy = await page.evaluate(ds => ds.map(d => JSON.stringify(window.DAYS[d])).join('|'), days)
  for (const c of names) {
    const k = await page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), c)
    if (k && !busy.includes(`"${k}"`)) return [c, k]
  }
  return [null, null]
}
