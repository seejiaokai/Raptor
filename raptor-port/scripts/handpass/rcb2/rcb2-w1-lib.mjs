/* rcb2-w1 helpers v1 (15 Nov 26) — walker W1 of the rules check's small batch. Built on rcb2-lib.mjs (frozen build,
   a NEW world per run). Fixtures are made through the app's own controls; reads come from the element that DRAWS the words.
   Copied (never imported) from the older recipes: rcf-w1-lib / rcf-rw-lib / am-lib / w4-lib. */
process.env.RCB2_WHO = 'w1'
export const W = await import('./rcb2-lib.mjs')
export const { L, say, check, nrm, SHOTS } = W
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const FRI = 4, SAT = 5
export const results = W.results

/** a world: { page, phone, browser, errors, who } */
export async function world(kind = 'desktop', who = 'a') {
  const phone = kind === 'phone'
  const o = await W.openWorld({ phone, who })
  o.phone = phone; o.who = who; o.page.__phone = phone
  await o.page.evaluate(() => {
    window.__toasts = []
    const mo = new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.textContent) { const l = window.__toasts; if (l[l.length - 1] !== t.textContent) l.push(t.textContent) } })
    mo.observe(document.body, { subtree: true, childList: true, characterData: true })
  })
  return o
}
export const takeToasts = async page => { await sleep(120); return page.evaluate(() => { const a = window.__toasts || []; window.__toasts = []; return a }) }
export const pid = async (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)

/** a picture (full viewport) */
export const pic = async (w, name) => { await w.page.screenshot({ path: `${SHOTS}/${name}.png` }); return name + '.png' }
export const crop = async (w, loc, name) => { const l = typeof loc === 'string' ? w.page.locator(loc).first() : loc; await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200); await l.screenshot({ path: `${SHOTS}/${name}.png` }); return name + '.png' }

/** press: a real tap on the phone, a click on a desktop; the control brought to the middle first; `after` = a picture ~60ms after the lift */
export async function press(w, sel, { nth = 0, after = null, scope = 'auto' } = {}) {
  const page = w.page
  const inBoard = scope === 'board' || (scope === 'auto' && (await page.locator('#schedBoard:visible').count()))
  const q = sel.split(',').map(s => (inBoard ? '#schedBoard ' : '') + s.trim() + ':visible').join(', ')
  const el = page.locator(q).nth(nth)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(150)
  const go = async () => { if (w.phone) await el.tap({ timeout: 2500 }); else await el.click({ timeout: 2500 }) }
  try { await go() } catch {
    const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel)
    if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  if (after) { await sleep(60); await page.screenshot({ path: `${SHOTS}/${after}.png` }) }
  await sleep(300)
}
export async function typeIn(w, sel, value) {
  const page = w.page
  const inBoard = await page.locator('#schedBoard:visible').count()
  const el = page.locator((inBoard ? '#schedBoard ' : '') + sel + ':visible').first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
  if (w.phone) await el.tap(); else await el.click()
  await el.fill('')
  await el.type(String(value), { delay: 8 })
  await el.blur(); await sleep(300)
}
export async function board(w, di) {
  const page = w.page
  const open = await page.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if (open != null) await closeBoard(w)
  await L.go(page, 'editsched')
  await press(w, `#eWeek [data-sbday="${di}"]`, { scope: 'page' })
  await page.waitForSelector('#schedBoard'); await sleep(500)
}
export async function closeBoard(w) {
  const page = w.page
  if (!(await page.locator('#schedBoard:visible').count())) return false
  const x = page.locator('#sbDone:visible, #sbClose:visible').first()
  if (await x.count()) { if (w.phone) await x.tap(); else await x.click(); await sleep(600) } else { await page.keyboard.press('Escape'); await sleep(500) }
  return true
}
export async function addWave(w, di, kind = '') {
  const page = w.page
  const n0 = await page.evaluate(i => window.DAYS[i].waves.length, di)
  await press(w, `[data-wvadd="${di}"]`)
  await press(w, `.wavemenu [data-wmkind="${kind}"]`, { scope: 'page' })
  await page.waitForFunction(([i, n]) => window.DAYS[i].waves.length === n + 1, [di, n0], { timeout: 6000 })
  await sleep(300)
  return n0
}
export async function addGround(w, di) {
  const page = w.page
  const b = await page.evaluate(d => window.DAYS[d].ground.length, di)
  await press(w, `[data-gradd="${di}"]`); await sleep(400)
  const a = await page.evaluate(d => window.DAYS[d].ground.length, di)
  return a > b ? a - 1 : -1
}
export async function ensureRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.locator('#sbRoster:visible').count()) return
  const tab = page.locator('#schedBoard .ros-tab:visible').first()
  if (await tab.count()) { await tab.tap(); await sleep(400) }
}
export async function closeRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) { const tab = page.locator('#schedBoard .ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await sleep(400) } }
}
/** seat a man: arm the slot, tap him in the crew list. Returns 'ok' or 'FAILED …' */
export async function seat(w, slotSel, id) {
  const page = w.page
  await ensureRoster(w)
  let res = 'FAILED'
  for (let t = 0; t < 3; t++) {
    await press(w, slotSel); await sleep(200)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
    if (!(await p.count())) { await page.keyboard.press('Escape'); res = 'FAILED: ' + id + ' not offered'; break }
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
    try { if (w.phone) await p.tap({ timeout: 2500 }); else await p.click({ timeout: 2500 }) } catch { const b = await p.boundingBox(); if (b) { if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
    await sleep(400); res = 'ok'; break
  }
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await closeRoster(w)
  return res
}
/** a flying line on a new wave: times and a man */
export async function sortie(w, di, { to = '12:00', ld = '13:00', who = null, cs = null, msn = null } = {}) {
  const gi = await addWave(w, di, '')
  if (cs) await typeIn(w, `[data-bfld="ff:${di}.${gi}.0.cs"]`, cs)
  if (msn) await typeIn(w, `[data-bfld="ff:${di}.${gi}.0.msn"]`, msn)
  if (to) await typeIn(w, `[data-bfld="ff:${di}.${gi}.0.to"]`, to)
  if (ld) await typeIn(w, `[data-bfld="ff:${di}.${gi}.0.ld"]`, ld)
  let r = null
  if (who) r = await seat(w, `[data-slot="${di}.${gi}.0.0.p"]`, who)
  return { gi, put: r }
}
/** a ground row (BRIEFING by default) with a man */
export async function ground(w, di, { prog = 'BRIEFING', str = '09:00', end = '10:00', who = null } = {}) {
  const ri = await addGround(w, di)
  if (ri < 0) throw new Error('no ground row made')
  await typeIn(w, `[data-bfld="gr:${di}.${ri}.prog"]`, prog)
  if (str) await typeIn(w, `[data-bfld="gr:${di}.${ri}.str"]`, str)
  if (end) await typeIn(w, `[data-bfld="gr:${di}.${ri}.end"]`, end)
  let r = null
  if (who) { await ensureRoster(w); await press(w, `[data-fill="g:${di}.${ri}.+"]`); await sleep(200)
    const p = w.page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).first()
    if (await p.count()) { if (w.phone) await p.tap(); else await p.click(); await sleep(400); r = 'ok' } else r = 'FAILED not offered'
    await w.page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await closeRoster(w) }
  return { ri, put: r }
}
export async function openWarnFold(w) {
  if (!w.phone) return
  const open = await w.page.locator('#schedBoard .sbwrap').first().evaluate(e => e.classList.contains('open')).catch(() => true)
  if (!open) { await press(w, '[data-sbwtog]'); await sleep(300) }
}
/** the board's list: [{ix, hid, struck, gone, text, btn, cls}] — read from the drawn lines only */
export async function boardWarn(w) {
  await openWarnFold(w)
  return w.page.evaluate(() => {
    const box = document.querySelector('#schedBoard .sb-warn')
    if (!box) return { head: null, lines: [] }
    const vis = e => e.getBoundingClientRect().width > 0
    const head = (box.querySelector('.wh') || {}).innerText || ''
    const lines = [...box.querySelectorAll('.wln')].filter(vis).map(e => {
      const t = e.querySelector('.wln-t'), b = e.querySelector('button.wln-mute')
      return { cls: String(e.className).replace(/\s+/g, ' '), ix: e.dataset.wix == null ? null : +e.dataset.wix, hid: e.classList.contains('hid'), struck: t ? getComputedStyle(t).textDecorationLine.includes('line-through') : false,
        text: ((t || e).innerText || '').replace(/\s+/g, ' ').replace(/ /g, ' ').trim(), btn: b ? (b.querySelector('svg.wmuteico') ? 'reset' : b.innerText.trim()) : '' }
    })
    return { head: head.replace(/\s+/g, ' ').trim(), lines }
  })
}
/** a week's warning strip for day di on root '#eWeek' | '#vWeek': opens it, returns items (each .witem drawn) */
export async function weekWarn(w, root, di) {
  const page = w.page
  const s = page.locator(`${root} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return { head: 'NO STRIP', items: [] }
  const head = nrm(await s.innerText())
  const open = await page.locator(`${root} [data-dwbox="${di}"].open`).count()
  if (!open) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await s.tap(); else await s.click(); await sleep(400) }
  const items = await page.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: String(e.className), text: e.innerText.replace(/\s+/g, ' ').replace(/ /g, ' ').trim() })), [root, di])
  return { head, items, wasOpen: !!open }
}
export const hideIx = async (w, di, ix) => { await press(w, `[data-woff="${di}.${ix}"]`, { after: null }); await sleep(300) }
export async function undo(w) {
  const inBoard = await w.page.locator('#schedBoard:visible').count()
  const b = w.page.locator((inBoard ? '#schedBoard ' : '') + 'button[aria-label="Undo"]:visible').first()
  if (!(await b.count())) return { ok: false, why: 'no undo button visible' }
  if (await b.isDisabled()) return { ok: false, why: 'disabled ' + (await b.getAttribute('title')) }
  if (w.phone) await b.tap(); else await b.click(); await sleep(700); return { ok: true }
}
/** sign four, publish the day (first publication) or the amendment */
export async function signAndPublish(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r0} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) { out[role] = 'NO NAMES'; continue }
    await sel.selectOption(opts[0]); await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  let which = null
  for (const attr of ['data-beak', 'data-alpub']) {
    const b = page.locator(`${r0} [${attr}="${di}"]:visible`).first()
    if (await b.count()) { which = attr; if (await b.isDisabled()) return { pressed: false, why: 'disabled ' + (await b.getAttribute('title')), signs: out }
      await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await b.tap(); else await b.click(); await sleep(900); break }
  }
  if (!which) return { pressed: false, why: 'no publish button', signs: out }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(900) }
  return { pressed: true, which, signs: out }
}
/** the day's head (tag, pending, buttons) on the board or week */
export async function head(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  return page.evaluate(([r, i]) => {
    const scope = r === '#schedBoard' ? document.querySelector('#schedBoard') : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const q = s => scope.querySelector(s)
    const btn = s => { const b = q(s); return b ? { text: b.innerText.trim(), disabled: !!b.disabled } : null }
    return { tag: ((q('.verchip') || {}).innerText || '').replace(/\s+/g, ' ').trim(), pending: ((q('.dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim(),
      beak: btn(`[data-beak="${i}"]`), alpub: btn(`[data-alpub="${i}"]`), signState: ((q('.so-state') || {}).innerText || '').replace(/\s+/g, ' ').trim(),
      signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex]?.text || '') }
  }, [r0, di])
}
/** the day-details window (the day's name / date / ⓘ on any page): open it, read it. */
export async function dayDetails(w, di, { root = null, name = null } = {}) {
  const page = w.page
  const cands = root ? [`${root} .day[data-day="${di}"] [data-dayinfo="${di}"]`] : [`#schedBoard [data-dayinfo="${di}"]`, `#eWeek .day[data-day="${di}"] [data-dayinfo="${di}"]`, `#vWeek .day[data-day="${di}"] [data-dayinfo="${di}"]`]
  let b = null
  for (const c of cands) { const l = page.locator(c + ':visible').first(); if (await l.count()) { b = l; break } }
  if (!b) return { error: 'no door: ' + cands.join(' | ') }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  if (w.phone) await b.tap(); else await b.click()
  await sleep(500)
  if (name) await page.screenshot({ path: `${SHOTS}/${name}.png` })
  return page.evaluate(() => {
    const p = document.querySelector('#dayPop:not([hidden])')
    if (!p || !p.getBoundingClientRect().width) return { error: 'window did not open' }
    const body = p.querySelector('#dayPopBody')
    const items = [...p.querySelectorAll('.witem, .dip-warn, li')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').replace(/ /g, ' ').trim())
    return { title: (p.querySelector('#dayPopTitle') || {}).innerText || '', text: (body ? body.innerText : p.innerText).replace(/\s+/g, ' ').replace(/ /g, ' ').trim(), items, vis: p.getBoundingClientRect().width }
  })
}
export async function closeDayDetails(w, how = 'Close') {
  const page = w.page
  const vis = () => page.evaluate(() => { const p = document.querySelector('#dayPop:not([hidden])'); return !!(p && p.getBoundingClientRect().width) })
  if (!(await vis())) return 'was not open'
  if (how === 'Close') { const b = page.locator('#dayPopDone:visible').first(); if (w.phone) await b.tap(); else await b.click() }
  else if (how === 'x') { const b = page.locator('#dayPopClose:visible').first(); if (w.phone) await b.tap(); else await b.click() }
  else if (how === 'Escape') await page.keyboard.press('Escape')
  else if (how === 'outside') { const vp = page.viewportSize(); if (w.phone) await page.touchscreen.tap(6, vp.height - 6); else await page.mouse.click(6, vp.height - 6) }
  await sleep(500)
  return (await vis()) ? 'STILL OPEN' : 'closed'
}
/** File an input through the Inputs page (copy of w4-lib fileInput). */
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export async function fileInputOld(w, f) {
  const page = w.page
  await L.go(page, 'inputs')
  await page.waitForSelector('#inAdd')
  if (f.person && await page.locator('#inPerson').count()) await page.selectOption('#inPerson', f.person)
  await page.selectOption('#inType', f.type)
  const walkTo = async (iso) => {
    for (let i = 0; i < 36 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
      const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
      await page.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await page.waitForTimeout(80)
    }
    await page.locator(`#inCal [data-cal="${iso}"]`).first().click(); await page.waitForTimeout(120)
  }
  await walkTo(f.from)
  if ((await page.locator('#inDates').textContent()).includes('→')) await walkTo(f.from)
  if (f.to && f.to !== f.from) await walkTo(f.to)
  if (await page.locator('#inSpan').count()) {
    await page.locator(`#inSpan [data-span="${f.span || 'all'}"]`).click()
    if (f.span === 'custom') { await page.locator('#inStartT').fill(f.start); await page.locator('#inEndT').fill(f.end) }
  } else if (await page.locator('#inAllday').count()) {
    const want = !f.start
    if ((await page.locator('#inAllday').isChecked()) !== want) await page.locator('#inAllday').click()
    if (f.start) { await page.locator('#inStartT').fill(f.start); await page.locator('#inEndT').fill(f.end) }
  }
  if (f.remarks) await page.locator('#inRemarks').fill(f.remarks)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
  const before = await page.evaluate(() => window.INPUTS.length)
  await page.locator('#inAdd').scrollIntoViewIfNeeded()
  if (f.pic) await pic(w, f.pic)
  await page.locator('#inAdd').click(); await page.waitForTimeout(700)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = page.locator('[data-testid="docconf-nodoc"]')
    if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await page.waitForTimeout(500); continue }
    const conf = page.locator('[data-testid="oilconf"]')
    if (await conf.count() && await conf.isVisible()) { asked.push('oil'); await conf.locator('button').filter({ hasText: f.oil === 'no' ? /^No OIL/ : /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await page.waitForTimeout(600); continue }
    break
  }
  const after = await page.evaluate(() => window.INPUTS.length)
  const toast = await page.evaluate(() => { const el = document.getElementById('toastEl'); return el ? (el.textContent || '').trim() : '' })
  return { added: after - before, asked, toast }
}
/** File an input through the Inputs page's calendar (copy of rcf-w3-inp + s35): iso day, the day's "+ Add", the editor. */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function toMonth(page, year, mon0) {
  for (let i = 0; i < 60; i++) {
    const [name, y] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = year * 12 + mon0 - (+y * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click(); await page.waitForTimeout(250)
  }
}
export async function fileInput(w, f) {
  const page = w.page
  await L.go(page, 'inputs'); await sleep(500)
  const [y, m] = f.iso.split('-').map(Number)
  await toMonth(page, y, m - 1)
  await page.locator(`#inpCal [data-icday="${f.iso}"]`).click({ position: { x: 8, y: 8 } }); await sleep(400)
  if (f.picPop) await pic(w, f.picPop)
  await page.locator('#icPopAdd').click(); await page.waitForSelector('#inpEditType'); await sleep(300)
  const hasPerson = await page.locator('#inpEditPerson').count()
  if (f.person && hasPerson) await page.selectOption('#inpEditPerson', f.person)
  await page.selectOption('#inpEditType', f.type)
  if (f.remarks) await page.locator('#inpEditRmk').fill(f.remarks)
  const opts = await page.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value))
  if (f.pic) await pic(w, f.pic)
  const n0 = await page.evaluate(() => window.INPUTS.length)
  await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(800)
  const asked = []
  for (let k = 0; k < 3; k++) {
    const nd = page.locator('[data-testid="docconf-nodoc"]')
    if (await nd.count() && await nd.first().isVisible()) { asked.push('document'); await nd.first().click(); await sleep(600); continue }
    const conf = page.locator('[data-testid="oilconf"]')
    if (await conf.count() && await conf.isVisible()) { asked.push('oil'); await conf.locator('button').filter({ hasText: /^No/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
    break
  }
  const added = (await page.evaluate(() => window.INPUTS.length)) - n0
  if (f.picAfter) await pic(w, f.picAfter)
  const open = await page.locator('#inpEditPop:visible, .win-bar:visible').count()
  if (open) { await page.keyboard.press('Escape'); await sleep(500) }
  return { added, asked, hasPerson, opts, stillOpenAfterAdd: open, rec: await page.evaluate(([r]) => { const x = window.INPUTS.find(i => i.remarks === r); return x ? JSON.stringify(x).slice(0, 260) : null }, [f.remarks || '']) }
}
export async function relogin(w, who) {
  const page = w.page
  const lo = page.locator('#logout:visible').first()
  if (await lo.count()) await lo.click()
  else {
    const menu = page.locator('.hamb:visible, #hamb:visible, button[aria-label*="menu" i]:visible').first()
    if (await menu.count()) { if (w.phone) await menu.tap(); else await menu.click(); await sleep(400) }
    const lo2 = page.getByRole('button', { name: /Log ?out/i }).first(); if (w.phone) await lo2.tap(); else await lo2.click()
  }
  await sleep(700)
  await L.login(page, who); w.who = who
}
export async function finishWorld(w) { say('errors:', JSON.stringify(w.errors.slice(0, 8))); await W.closeAll(w.browser) }
