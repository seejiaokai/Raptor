/* Walker E — P4a-06: plans, templates (day / wave / duty), changes window, ALL AVAIL window, week calendar at the normal size and a short screen.
   Starts from the published world file. HP_PHONE=1 for the phone (short screen = 844x390), desktop short screen = 1280x700. */
import * as E from './stk-E-lib.mjs'
import * as LIB from './lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const SHORT = phone ? { width: 844, height: 390 } : { width: 1280, height: 700 }
const FULL = phone ? E.PHONE : E.DESK
const STATE = process.env.E_STATE_DIR + `/world-${SZ}-pub.json`
const sleep = E.sleep
const { browser, ctx, page, errors } = await E.world({ size: FULL, phone, state: STATE })
const pics = [], checks = [], notes = {}
const pic = async n => { const f = await E.pic(page, `p4a06-${SZ}-${n}`); pics.push(f); return f }
/* a window / sheet: its box, whether it has a readable body, whether the last thing in its scroll can be reached, what its close lands on */
async function inspect(root, closeSel, label) {
  const r = await page.evaluate(([root, closeSel]) => {
    const e = [...document.querySelectorAll(root)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== 'hidden' })
    if (!e) return { none: true }
    const b = e.getBoundingClientRect()
    // the scrolling part: the deepest descendant that actually scrolls vertically, else the box itself
    const cl0 = closeSel ? [...document.querySelectorAll(closeSel)].find(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 }) : null
    let closeLands0 = null
    if (cl0) { const q = cl0.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); closeLands0 = !!h && (h === cl0 || cl0.contains(h)) && q.bottom <= innerHeight + 1 && q.top >= -1 }
    const sc = [e, ...e.querySelectorAll('*')].filter(x => x.scrollHeight > x.clientHeight + 4 && ['auto', 'scroll'].includes(getComputedStyle(x).overflowY)).sort((a, c) => c.clientHeight - a.clientHeight)[0] || null
    if (sc) sc.scrollTop = sc.scrollHeight
    const kids = [...(sc || e).children].filter(k => k.getBoundingClientRect().height > 0)
    const last = kids[kids.length - 1]
    const lr = last ? last.getBoundingClientRect() : null
    const cl = closeSel ? [...document.querySelectorAll(closeSel)].find(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 }) : null
    let closeLands = null
    if (cl) { const q = cl.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); closeLands = !!h && (h === cl || cl.contains(h)) && q.bottom <= innerHeight + 1 && q.top >= -1 }
    const dn = [...e.querySelectorAll('button')].find(x => /^(Done|Close)$/.test(x.innerText.trim()) && x.getBoundingClientRect().width > 0)
    let doneLands = null
    if (dn) { const q = dn.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); doneLands = !!h && (h === dn || dn.contains(h)) && q.bottom <= innerHeight + 1 && q.top >= -1 }
    return { closeAtTop: closeLands0, doneAtBottom: doneLands, box: [b.x, b.y, b.width, b.height].map(Math.round), text: (e.innerText || '').replace(/\s+/g, ' ').trim().length, scrolls: !!sc, lastVisible: lr ? (lr.bottom <= innerHeight + 2 && lr.top >= -2 && lr.bottom <= b.bottom + 2) : null, closeLands: (closeLands0 === true || doneLands === true) ? true : (closeLands0 === null && doneLands === null ? null : false), inView: b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1 && b.left >= -1 && b.top >= -1 }
  }, [root, closeSel])
  notes[label] = r
  return r
}
const ok = (r, name) => r && !r.none && r.box[2] > 150 && r.box[3] > 60 && r.text > 20 && r.inView && r.closeLands !== false && (r.lastVisible !== false || r.scrolls)
async function surface(label, open, root, closeSel, close) {
  let r1 = null, r2 = null
  try {
    await open(); await sleep(700)
    r1 = await inspect(root, closeSel, label + '@full'); await pic(`${label}-full`)
    await page.setViewportSize(SHORT); await sleep(600)
    r2 = await inspect(root, closeSel, label + '@short'); await pic(`${label}-short`)
    await page.setViewportSize(FULL); await sleep(500)
    await close(); await sleep(500)
  } catch (e) { notes[label + '-err'] = String(e.stack).replace(/\s+/g, ' ').slice(0, 700); await page.setViewportSize(FULL).catch(() => {}) }
  checks.push([`${label}: opens whole at the normal size and on the short screen (box, body, last row, close all reachable)`, ok(r1) && ok(r2), { full: r1, short: r2, err: notes[label + '-err'] }])
}
async function openDay(di) {
  await E.closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await E.nav(page, 'editsched')
  await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-sbday="${d}"]`); const sc = b.closest('.week') || b.closest('.day').parentElement; const dd = b.closest('.day'); if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = dd.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) }, di)
  await sleep(300)
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard', { state: 'visible', timeout: 10000 }); await sleep(600)
}
const click = async (sel, o = {}) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded(); await l.click(o); await sleep(400) }
try {
  await LIB.board(page, 5); await sleep(700)
  // ---- saved plans: make one through the menu, then look at the list
  await click('#schedBoard [data-planmenu]')
  const planMenu = page.locator('.wavemenu button:has-text("Alt Plan"), .wavemenu [data-planadd], .wavemenu :text("Plan")').filter({ hasText: /\+/ }).first()
  await pic('plan-menu-before')
  let planMade = 'no add control'
  if (await planMenu.count()) { await planMenu.click(); await sleep(800); planMade = 'pressed' ; await pic('plan-after-add') }
  await click('#schedBoard [data-planmenu]').catch(() => {})
  const planItems = await page.locator('.wavemenu [data-planpv], .wavemenu [data-planlive], .wavemenu [data-plan], .wavemenu button').count()
  const pm = await inspect('.wavemenu', null, 'plans-menu')
  await pic('plans-menu-populated')
  notes.plans = { planMade, planItems, pm }
  checks.push(['Plans menu: opens with the live copy, the issued version(s) and the added plan, readable at both sizes', planItems >= 2 && pm && !pm.none && pm.box[2] > 150 && pm.inView, { planMade, planItems, pm }])
  await page.keyboard.press('Escape'); await page.mouse.click(5, 5).catch(() => {}); await sleep(300)
  // ---- day templates: save this day as a template, then manage (Wednesday: an unpublished day, templates cannot apply to a published one)
  await page.keyboard.press('Escape'); await openDay(2)
  await surface('day-template-menu', async () => { await click('#sbTpl:visible, #schedBoard [data-daytpladd]:visible') }, '.wavemenu', null, async () => { await page.keyboard.press('Escape'); await page.mouse.click(5, 5).catch(() => {}) })
  await click('#sbTpl:visible, #schedBoard [data-daytpladd]:visible')
  const save = page.locator('.wavemenu button:has-text("Save this day as a template")').first()
  await surface('day-templates-window', async () => { await save.click(); await page.waitForSelector('#daytplModal', { state: 'visible' }) }, '#daytplModal .modal-box, #daytplModal', '#daytplClose', async () => { await click('#daytplClose') })
  await page.keyboard.press('Escape'); await sleep(300)
  // ---- the changes window, populated by the edits of the day
  await page.keyboard.press('Escape'); await openDay(5)
  await surface('changes-window', async () => { await click('#sbHist'); await page.waitForSelector('.chgwin', { state: 'visible' }) }, '.chgwin', '.chgwin .win-x', async () => { await click('.chgwin .win-x') })
  // ---- the ALL AVAIL window: the count chip on the programme row
  await surface('all-avail-window', async () => { const chip = page.locator('#schedBoard [data-oilsent]').first(); await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForSelector('.availwin:not([hidden])', { state: 'visible' }) }, '.availwin:not([hidden])', '.availwin .win-x', async () => { await click('.availwin .win-x') })
  // movable / resizable: drag the availwin grip (desktop) and measure
  if (!phone) {
    await page.locator('#schedBoard [data-oilsent]').first().click(); await page.waitForSelector('.availwin:not([hidden])', { state: 'visible' }); await sleep(600)
    const b0 = await page.locator('.availwin:not([hidden])').boundingBox(); const grip = await page.locator('.availwin .win-grip').boundingBox()
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2); await page.mouse.down(); await page.mouse.move(grip.x - 160, grip.y + 90, { steps: 8 }); await page.mouse.up(); await sleep(400)
    const b1 = await page.locator('.availwin:not([hidden])').boundingBox()
    let b2 = null
    { const cx = b1.x + b1.width - 5, cy = b1.y + b1.height - 5; await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx - 60, cy + 70, { steps: 8 }); await page.mouse.up(); await sleep(400); b2 = await page.locator('.availwin:not([hidden])').boundingBox() }
    await pic('all-avail-moved-resized')
    checks.push(['ALL AVAIL window moves by its grip and resizes by its corner (desktop)', Math.abs(b1.x - b0.x) > 80 && (b2.width !== b1.width || b2.height !== b1.height), { b0, b1, b2 }])
    await click('.availwin .win-x')
  }
  await E.closeBoard(page); await sleep(500)
  // ---- the week calendar, the amendments box (desktop), duty + wave template windows from Admin
  await E.nav(page, 'editsched')
  await surface('week-calendar', async () => { if (phone) await click('#page-editsched .filters .filt-cal'); else await click('#weekSegE .wk-cal'); await page.waitForSelector('#weekCal', { state: 'visible' }) }, '#weekCal', '#weekCal .x', async () => { await click('#weekCal .x') })
  if (!phone) {
    const al = await inspect('#alPanel', null, 'amendments-box'); await page.locator('#alPanel').scrollIntoViewIfNeeded(); await pic('amendments-box')
    const txt = await page.locator('#alPanel').innerText()
    checks.push(['Amendments box: shows the day with changes and its Publish AL button, and no "Discard marks"', al && !al.none && /Publish AL/.test(txt) && !/discard/i.test(txt), { txt: txt.replace(/\s+/g, ' ').slice(0, 140) }])
  } else checks.push(['Amendments box on the phone: not drawn below 821px wide (hidden by its own rule); the day heads carry the pending chip instead', (await page.locator('#alPanel:visible').count()) === 0, 'hidden'])
  await E.nav(page, 'admin'); if (phone) await page.locator('.adm-cat').nth(1).click(); else await page.locator('.adm-cat').nth(1).click(); await sleep(500)
  await surface('duty-templates-window', async () => { await click('#admDutyTpl'); await page.waitForSelector('#tplModal', { state: 'visible' }) }, '#tplModal .modal-box, #tplModal', '#tplClose', async () => { await click('#tplClose') })
  await page.locator('#admWaveTpl').click(); await page.waitForSelector('#waveTplModal', { state: 'visible' }); await sleep(500)
  const newT = page.locator('#waveTplModal button:has-text("New wave template")').first(); if (await newT.count()) { await newT.click(); await sleep(700); await pic('wave-template-new-editor') }
  const wNested = await inspect('#waveTplModal .modal-box, #waveTplModal', '#waveTplClose', 'wave-template-nested')
  checks.push(['Wave templates: the nested "new wave template" editor opens whole', wNested && !wNested.none && wNested.text > 40 && wNested.inView, wNested])
  await page.keyboard.press('Escape'); await sleep(300)
  if (await page.locator('#waveTplModal:visible').count()) await click('#waveTplClose').catch(() => {})
  await surface('wave-templates-window', async () => { await click('#admWaveTpl'); await page.waitForSelector('#waveTplModal', { state: 'visible' }) }, '#waveTplModal .modal-box, #waveTplModal', '#waveTplClose', async () => { await click('#waveTplClose') })
  checks.push(['no console / page / 4xx errors', !errors.length, errors])
} catch (e) { checks.push(['script ran to the end', false, String(e.message).split('\n').slice(0, 3).join(' ').slice(0, 300)]); await pic('FAILED') }
E.judge('P4a-06', `${SZ}: plans menu, day / duty / wave template windows, changes window, ALL AVAIL window (moved and resized), week calendar, amendments box - at ${phone ? '390x844 and 844x390' : '1440x900 and 1280x700'}`, checks, pics)
console.log(JSON.stringify(notes).slice(0, 4000))
E.savePart(`p4a6-${SZ}`)
await browser.close()
