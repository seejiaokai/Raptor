/* www w2 helpers v1 (16 Nov 26): shared reading helpers for W2's scripts. Sets WWW_WHO before the lib loads. */
process.env.WWW_WHO = 'w2'
export const X = await import('./www-lib.mjs')
export const { say, sleep, L, nrm, FRI, SAT, SUN, MON, TUE, WED, THU } = X

/** a Friday flight with a take-off typed, landing as given, man optional; returns wave index */
export async function frFlight(w, di, to, ld, man, msn = 'VL BFM') {
  const wi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld) await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.msn"]`, msn)
  if (man) { const s = await X.seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, man); if (s !== 'ok') say('SEAT PROBLEM', man, s) }
  return wi
}
/** a ground row: name, start, end; person seated if given; returns the row index */
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
/** retype a box (field key as in data-bfld) */
export const setF = (w, key, v) => X.typeIn(w, `[data-bfld="${key}"]`, v)
/** the roster's group counts and one man's row classes, with the seat armed or not */
export async function rosterRead(w, person = 'bane') {
  await X.ensureRoster(w)
  return w.page.evaluate(p => {
    const r = document.querySelector('#sbRoster'); if (!r) return { none: true }
    const heads = [...r.querySelectorAll('*')].filter(e => e.children.length === 0 && /FREE|FLY/.test(e.textContent) && e.getBoundingClientRect().width).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 8)
    const e = r.querySelector(`.rpuck[data-person="${p}"]`)
    const pk = e && e.querySelector('.puck')
    const note = e && e.nextElementSibling && !e.nextElementSibling.classList.contains('rpuck') ? e.nextElementSibling.innerText.replace(/\s+/g, ' ') : ''
    return { heads, rpuck: e ? e.className : 'NONE', puck: pk ? pk.className : '', cs: pk ? pk.title : '', note, struck: e ? getComputedStyle(e).textDecorationLine + '/' + getComputedStyle(e).opacity : '' }
  }, person)
}
export async function arm(w, sel) { await X.press(w, sel, { scope: 'board' }); await X.sleep(350); return w.page.evaluate(() => window.ARM && window.ARM.key) }
export async function disarm(w) { await w.page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await X.sleep(250); await X.closeRoster(w) }
/** the count chip beside a placeholder on a ground row */
export async function chipText(w, slotKey) {
  return w.page.evaluate(k => { const s = document.querySelector(`#schedBoard [data-slot="${k}"] .oilcount, #schedBoard .seat[data-slot="${k}"] .oilcount`); return s ? s.innerText.trim() : null }, slotKey)
}
/** open the avail window from a chip; read its drawn fixed surface */
export async function openAvail(w, slotKey) {
  const page = w.page
  const chip = page.locator(`#schedBoard [data-slot="${slotKey}"] .oilcount:visible`).first()
  if (!(await chip.count())) return { ok: false, why: 'no chip ' + slotKey }
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await X.sleep(150)
  if (w.phone) await chip.tap(); else await chip.click()
  await X.sleep(700)
  return readFixed(w)
}
export async function readFixed(w) {
  return w.page.evaluate(() => {
    const vis = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 180 && r.height > 120 && (cs.position === 'fixed') && cs.display !== 'none' && cs.visibility !== 'hidden' })
    const aw = vis.filter(e => e.classList.contains('availwin'))
    const top = aw.length ? aw : vis.filter(e => !vis.some(o => o !== e && o.contains(e)))
    return { ok: top.length > 0, wins: top.map(e => ({ id: e.id, cls: String(e.className).slice(0, 50), text: e.innerText.replace(/[\s ]+/g, ' ').trim().slice(0, 1800) })) }
  })
}
