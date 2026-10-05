/* Walker E — P4e-04 (Logic search stays visible), P4e-05 (compact Logic keeps permissions and values), P4e-06 (Insights closes from every door),
   P4e-07 (tall and short windows by height). HP_PHONE=1 for the phone. */
import * as E from './stk-E-lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const STATE = process.env.E_STATE_DIR + `/world-${SZ}.json`
const sleep = E.sleep
const FULL = phone ? E.PHONE : E.DESK
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)
const click = async (page, sel, o = {}) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded(); await l.click(o); await sleep(450) }
async function openDay(page, di) {
  await E.closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await E.nav(page, 'editsched')
  await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-sbday="${d}"]`); const dd = b.closest('.day'); const sc = dd.parentElement; if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = dd.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) }, di)
  await sleep(300)
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard', { state: 'visible', timeout: 10000 }); await sleep(600)
}
const hit = loc => loc.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { own: !!h && (h === e || e.contains(h)), x: Math.round(r.x), y: Math.round(r.y), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } })
async function wheel(page, sel, dy) { const b = await page.locator(sel).first().boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height - 40, Math.max(40, b.height / 2))); await page.mouse.wheel(0, dy); await sleep(250) }

/* ================= P4e-04 ================= */
async function p04() {
  const w = await E.world({ size: FULL, phone, state: STATE }); const { page, errors } = w; const pics = [], checks = []
  try {
    await E.nav(page, 'logic')
    await wheel(page, '#lgBody', 1400)
    const bar = async () => page.locator('.lgbar').evaluate(e => { const r = e.getBoundingClientRect(), top = document.querySelector('.topbar').getBoundingClientRect(); return { top: Math.round(top.bottom), y: Math.round(r.y), h: Math.round(r.height), windowY: Math.round(scrollY), overflow: document.documentElement.scrollWidth > innerWidth + 1 } })
    const b1 = await bar(); pics.push(await E.pic(page, `p4e04-${SZ}-logic-scrolled`))
    const ctl = await page.locator('.lgbar button:visible, .lgbar input:visible').all(); const hits = []
    for (const el of ctl) hits.push((await hit(el)).own)
    checks.push(['after scrolling down, the whole search / filter bar is still on screen, below the top bar', b1.windowY > 100 && b1.y >= b1.top - 1 && b1.y < b1.top + 12, b1])
    checks.push([`every control on the bar (${ctl.length}) is what a finger lands on while scrolled`, hits.length >= 6 && hits.every(Boolean), hits.filter(x => !x).length + ' covered'])
    checks.push([phone ? 'on a phone the bar takes at most 115px (two rows)' : 'on a desktop the bar is a single compact band', phone ? b1.h <= 115 : b1.h <= 70, { h: b1.h }])
    const count0 = await page.locator('#lgCount').innerText()
    await page.locator('#lgSearch').fill('report'); await sleep(500)
    const cSearch = await page.locator('#lgCount').innerText()
    const per = {}
    for (const f of ['all', 'hard', 'adv', 'note', 'fired']) { await page.locator(`[data-lgf="${f}"]`).click(); await sleep(250); per[f] = (await page.locator('#lgCount').innerText()).split(' rules')[0]; if (!(await hit(page.locator('#lgSearch'))).own) per[f] += ' (search covered!)' }
    await page.locator('[data-lgf="all"]').click(); await sleep(200)
    await page.locator('#lgSearch').fill('zzno-rule-match'); await sleep(400)
    const none = /Nothing matches/.test(await page.locator('#lgBody').innerText())
    pics.push(await E.pic(page, `p4e04-${SZ}-logic-no-match`))
    await page.locator('#lgSearch').fill(''); await sleep(300)
    const count1 = await page.locator('#lgCount').innerText()
    checks.push(['searching "report", each filter, an empty result and clearing all answer and restore the count', cSearch !== count0 && none && count1 === count0 && !Object.values(per).some(v => /covered/.test(v)), { count0, cSearch, per, none, count1 }])
    // resize ladder
    const lad = []
    for (const wd of [320, 390, 820, 821, 1440]) { await page.setViewportSize({ width: wd, height: 568 }); await sleep(300); await wheel(page, '#lgBody', 600); const r = await bar(); lad.push(`${wd}:y${r.y}/top${r.top}${r.overflow ? ' SIDEWAYS' : ''}`); if (!(r.y >= r.top - 1) || r.overflow) lad.push('BAD') }
    await page.setViewportSize(FULL)
    pics.push(await E.pic(page, `p4e04-${SZ}-logic-after-resizes`))
    checks.push(['across 320 / 390 / 820 / 821 / 1440 px the bar stays under the top bar and the page does not scroll sideways', !lad.includes('BAD'), lad.join(' ')])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 500)]); pics.push(await E.pic(page, 'p4e04-FAILED')) }
  E.judge('P4e-04', `${SZ}: Logic scrolled, searched, filtered, cleared and resized`, checks, pics)
  await w.browser.close()
}
/* ================= P4e-05 ================= */
async function p05() {
  const w = await E.world({ size: FULL, phone, state: STATE }); const { page, errors } = w; const pics = [], checks = []
  try {
    await E.nav(page, 'logic')
    await click(page, '#lgEdit')
    const setBox = page.locator('[data-lgset="step"]').first()
    const before = await setBox.inputValue().catch(() => null)
    await setBox.fill('1h10'); await setBox.press('Tab'); await sleep(400)
    const afterAdmin = await setBox.inputValue()
    pics.push(await E.pic(page, `p4e05-${SZ}-logic-admin-edit`))
    await click(page, '#lgDone'); await sleep(400)
    const shown = await page.locator('text=/step before take-off/i').first().innerText().catch(() => '')
    // member view of the same admin (the app's own control)
    if (phone) { await page.locator('#burger').click(); await sleep(300); await page.locator('#drawerRole').click() } else await page.locator('#roleBadge').click()
    await sleep(900)
    if ((await page.evaluate(() => window.CURPAGE)) !== 'logic') await E.nav(page, 'logic')
    await page.locator('#lgSearch').fill('sortie occupies'); await sleep(500)
    const mv = await page.evaluate(() => ({ edit: !!document.querySelector('#lgEdit') && document.querySelector('#lgEdit').offsetParent !== null, sets: document.querySelectorAll('[data-lgset]').length, value: (document.querySelector('#lgBody') || { innerText: '' }).innerText.replace(/\s+/g, ' ').slice(0, 600) }))
    pics.push(await E.pic(page, `p4e05-${SZ}-logic-member-view`))
    // tab through: nothing editable
    for (let i = 0; i < 20; i++) await page.keyboard.press('Tab')
    const editableFocus = await page.evaluate(() => { const a = document.activeElement; return a && a.matches && a.matches('[data-lgset]') })
    // back to admin
    if (phone) { await page.locator('#burger').click(); await sleep(300); await page.locator('#drawerRole').click() } else await page.locator('#roleBadge').click()
    await sleep(900)
    if ((await page.evaluate(() => window.CURPAGE)) !== 'logic') await E.nav(page, 'logic')
    await page.locator('#lgSearch').fill('').catch(() => {})
    const backEdit = await page.locator('#lgEdit:visible').count()
    // a real member in the same browser (same storage): sign out through the app's own control and sign in as the member
    const logout = async () => { if (phone) { await page.locator('#burger').click(); await sleep(300); await page.click('#drawerLogout') } else await page.click('#logout'); await page.waitForSelector('#luser', { timeout: 15000 }) }
    await logout(); await E.signIn(page, 'm'); await E.nav(page, 'logic'); await page.locator('#lgSearch').fill('sortie occupies'); await sleep(500)
    const real = await page.evaluate(() => ({ edit: !!document.querySelector('#lgEdit') && document.querySelector('#lgEdit').offsetParent !== null, sets: document.querySelectorAll('[data-lgset]').length, text: (document.querySelector('#lgBody') || { innerText: '' }).innerText.replace(/\s+/g, ' ').slice(0, 240) }))
    pics.push(await E.pic(page, `p4e05-${SZ}-logic-real-member`))
    await logout(); await E.signIn(page, 'a'); await E.nav(page, 'logic')
    const final = await page.locator('text=/step before take-off/i').first().innerText().catch(() => '')
    await click(page, '#lgEdit'); const finalVal = await page.locator('[data-lgset="step"]').first().inputValue(); 
    pics.push(await E.pic(page, `p4e05-${SZ}-logic-admin-again`))
    // restore the rule so nothing is left changed: Reset through its own control, Done
    await click(page, '#lgReset').catch(() => {}); await sleep(300); await click(page, '#lgDone').catch(() => {})
    checks.push(['the admin edit took (field shows 1h10 after Tab)', afterAdmin === '1h10', { before, afterAdmin }])
    checks.push(['the admin member view shows Logic read only (no Edit rules button, no fields), still searchable, with the saved 1h10 in the sentence', !mv.edit && mv.sets === 0 && /sortie occupies/i.test(mv.value) && /1h10/.test(mv.value), mv])
    checks.push(['Tab x20 in the member view never reaches an editable rule field', !editableFocus, editableFocus])
    checks.push(['switching the admin back from the member view brings the Edit rules button back', backEdit > 0, { backEdit }])
    checks.push(['a real member (signed in through the card) sees Logic read only, no edit controls, with the saved 1h10 shown', !real.edit && real.sets === 0 && /1h10/.test(real.text), real])
    checks.push(['signed back in as admin the saved value is still 1h10', finalVal === '1h10', { finalVal }])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 500)]); pics.push(await E.pic(page, 'p4e05-FAILED').catch(() => '')) }
  E.judge('P4e-05', `${SZ}: admin edits a rule, member view, real member, back as admin`, checks, pics)
  await w.browser.close().catch(() => {})
}
/* ================= P4e-06 ================= */
async function p06() {
  const w = await E.world({ size: FULL, phone, state: STATE }); const { page, errors } = w; const pics = [], checks = []
  const doors = phone
    ? [['View-only Sched ⋯', async () => { await E.nav(page, 'viewsched'); await click(page, '#viewSchedMore'); await click(page, '#viewSchedMoreInsights') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'viewsched'],
       ['Edit Schedule ⋯', async () => { await E.nav(page, 'editsched'); await click(page, '#editSchedMore'); await click(page, '#editSchedMoreInsights') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'editsched'],
       ['Board ⋯', async () => { await openDay(page, 5); await click(page, '#sbMore'); await click(page, '#sbMoreInsights') }, async () => (await page.evaluate(() => window.SBDAY)) === 5 && (await page.locator('#schedBoard:visible').count()) > 0]]
    : [['View-only Sched (direct)', async () => { await E.nav(page, 'viewsched'); await click(page, '#insightBtn') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'viewsched'],
       ['Edit Schedule (direct)', async () => { await E.nav(page, 'editsched'); await click(page, '#insightBtn') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'editsched'],
       ['Board (direct)', async () => { await openDay(page, 5); await click(page, '#sbInsights') }, async () => (await page.evaluate(() => window.SBDAY)) === 5 && (await page.locator('#schedBoard:visible').count()) > 0]]
  try {
    for (const [name, open, restored] of doors) {
      await open(); await page.waitForSelector('#insightClose', { state: 'visible', timeout: 8000 }); await sleep(400)
      const rowsBefore = await page.locator('#insightBody .irow').count()
      const all = page.locator('[data-insights-all]'); let shown = rowsBefore
      if (await all.count()) { await all.first().click(); await sleep(500); shown = await page.locator('#insightBody .irow').count() }
      await wheel(page, '#insightModal .modal-box', 4000)
      const r = await hit(page.locator('#insightClose'))
      const sc = await page.locator('#insightModal .modal-box').evaluate(e => ({ scroll: Math.round(e.scrollTop), max: Math.round(e.scrollHeight - e.clientHeight) }))
      pics.push(await E.pic(page, `p4e06-${SZ}-insights-bottom-${name.replace(/[^A-Za-z]+/g, '-')}`))
      await page.locator('#insightClose').click(); await sleep(500)
      const closed = (await page.locator('#insightModal:visible').count()) === 0
      const back = await restored()
      checks.push([`${name}: after Show all (${rowsBefore} -> ${shown} rows) and scrolling to the bottom (${sc.scroll}/${sc.max}) the cross is on screen and what a finger lands on; it closes and the starting surface is back`, r.own && r.y >= 0 && r.bottom <= (phone ? E.PHONE.height : E.DESK.height) && closed && back && sc.scroll > 20, { cross: r, closed, back, sc }])
    }
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 500)]); pics.push(await E.pic(page, 'p4e06-FAILED')) }
  E.judge('P4e-06', `${SZ}: Insights opened from each door, Show all, scrolled to the bottom, the cross pressed`, checks, pics)
  await w.browser.close()
}
/* ================= P4e-07 ================= */
async function p07() {
  const w = await E.world({ size: FULL, phone, state: STATE }); const { page, errors } = w; const pics = [], checks = []
  const sizes = phone ? [['390x844', E.PHONE], ['390x568', { width: 390, height: 568 }], ['844x390', { width: 844, height: 390 }]] : [['1440x900', E.DESK], ['1280x700', { width: 1280, height: 700 }]]
  const meas = async sel => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight, gapBelow: Math.round(innerHeight - r.bottom), x: Math.round(r.left), w: Math.round(r.width) } }, sel)
  const results = []
  try {
    // tall: Insights; Duty templates (Admin); short: the Day templates window with nothing saved yet (Admin), and Sort all
    for (const [label, sz] of sizes) {
      await page.setViewportSize(sz); await sleep(500)
      await E.nav(page, 'viewsched')
      if (phone && sz.width < 700) { await click(page, '#viewSchedMore'); await click(page, '#viewSchedMoreInsights') } else { if (await page.locator('#insightBtn:visible').count()) await click(page, '#insightBtn'); else { await click(page, '#viewSchedMore'); await click(page, '#viewSchedMoreInsights') } }
      await page.waitForSelector('#insightClose', { state: 'visible' }); await sleep(500)
      const ins = await meas('#insightModal .modal-box'); pics.push(await E.pic(page, `p4e07-${SZ}-${label}-insights`))
      const cross = await hit(page.locator('#insightClose')); await page.locator('#insightClose').click(); await sleep(400)
      await E.nav(page, 'admin'); await page.locator('.adm-cat').nth(1).click(); await sleep(400)
      await click(page, '#admDutyTpl'); await page.waitForSelector('#tplModal', { state: 'visible' }); await sleep(500)
      const duty = await meas('#tplModal .modal-box'); pics.push(await E.pic(page, `p4e07-${SZ}-${label}-duty-templates`))
      const dclose = await hit(page.locator('#tplClose')); await page.locator('#tplClose').click(); await sleep(400)
      await click(page, '#admDayTpl'); await page.waitForSelector('#daytplModal', { state: 'visible' }); await sleep(500)
      const dayt = await meas('#daytplModal .modal-box'); pics.push(await E.pic(page, `p4e07-${SZ}-${label}-day-templates-short`))
      await page.locator('#daytplClose').click(); await sleep(400)
      results.push({ label, wide: sz.width > 820, ins, cross: cross.own, duty, dclose: dclose.own, dayt })
    }
    await page.setViewportSize(FULL)
    const tallOk = r => r.ins && r.duty && r.cross && r.dclose
    if (phone) {
      for (const r of results) {
        if (r.wide) { checks.push([`${r.label}: the phone rules apply to widths up to 820px; at this width (a phone on its side) the windows are centred inside the screen with their close reachable`, r.ins.top >= 0 && r.ins.bottom <= r.ins.vh + 1 && r.cross && r.dclose, { ins: r.ins, duty: r.duty, short: r.dayt }]); continue }
        const tallLeavesStrip = r.ins.top <= 40 && r.ins.bottom >= r.ins.vh - 2
        checks.push([`${r.label}: the tall Insights window runs up to a thin strip at the top (top ${r.ins.top}px of ${r.ins.vh}px, bottom edge ${r.ins.bottom}) and its cross is reachable`, tallLeavesStrip && r.cross, r.ins])
        checks.push([`${r.label}: the Duty templates window stays within the screen and its close is reachable (top ${r.duty.top}, bottom ${r.duty.bottom} of ${r.duty.vh})`, r.duty.top >= 0 && r.duty.bottom <= r.duty.vh + 1 && r.dclose, r.duty])
        checks.push([`${r.label}: the short Day templates window is only as tall as its content (${r.dayt.h}px) and sits at the bottom (gap below ${r.dayt.gapBelow}px)`, r.dayt.h < r.dayt.vh * 0.6 && r.dayt.gapBelow <= 6, r.dayt])
      }
    } else {
      for (const r of results) checks.push([`${r.label}: windows sit inside the screen with their close reachable (the phone-height rules apply to a phone only)`, r.ins.top >= 0 && r.ins.bottom <= r.ins.vh + 1 && r.cross && r.dclose, { ins: r.ins, duty: r.duty }])
    }
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 500)]); pics.push(await E.pic(page, 'p4e07-FAILED')) }
  console.log(JSON.stringify(results))
  E.judge('P4e-07', `${SZ}: tall (Insights, Duty templates) and short (Day templates) windows at ${sizes.map(s => s[0]).join(', ')}`, checks, pics)
  await w.browser.close()
}
if (want('P4e-04')) await p04()
if (want('P4e-05')) await p05()
if (want('P4e-06')) await p06()
if (want('P4e-07')) await p07()
E.savePart('p4e47-' + SZ + (ONLY ? '-' + ONLY.join('+') : ''))
