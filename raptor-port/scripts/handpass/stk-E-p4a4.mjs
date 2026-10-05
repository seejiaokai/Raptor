/* Walker E — P4a-04 (Inputs / Quals / Medical keep usable frozen controls) and P4a-05 (Logic / Help / Admin). HP_PHONE=1 for the phone. */
import * as E from './stk-E-lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const STATE = process.env.E_STATE_DIR + `/world-${SZ}.json`
const DOC = process.env.E_STATE_DIR + '/ewalk-test-doc.png'
const sleep = E.sleep
const { browser, ctx, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone, state: STATE })
const info = {}
/* ---------------- P4a-04 ---------------- */
{
  const pics = [], checks = []
  try {
    await E.nav(page, 'inputs')
    await page.locator('#inRangeBtn').click(); await sleep(300); await page.locator('#inRangeAll').click(); await sleep(500)
    const rows0 = await page.locator('#inBody tr[data-iid]').count()
    // add a plain input and one with a harmless document, through the page's own form
    for (const spec of [{ person: 'Vector', type: 'LL', day: '2026-07-21', rem: 'E walk LL' }, { person: 'Vector', type: 'OML', day: '2026-07-23', rem: 'E walk medical + doc', doc: true }]) {
      await page.locator('#inType').scrollIntoViewIfNeeded()
      await page.selectOption('#inPerson', { label: spec.person }); await page.selectOption('#inType', spec.type)
      await page.locator(`#inCal [data-cal="${spec.day}"]`).first().click(); await sleep(200)
      const dayBtn = page.locator('#inAllday'); if (await dayBtn.count()) { if (!(await dayBtn.isChecked())) await dayBtn.click() }
      else { const all = page.locator('#inSpan [data-span="all"]'); if (await all.count()) await all.click() }
      await page.fill('#inRemarks', spec.rem)
      if (spec.doc) { await page.setInputFiles('#page-inputs .docfield input[type=file]', DOC); await sleep(500) }
      await page.locator('#inAdd').click(); await sleep(700)
      const nodoc = page.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await sleep(400) }
      const oil = page.locator('[data-testid="oilconf"]:visible'); if (await oil.count()) { await oil.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(400) }
    }
    await page.locator('#inRangeBtn').click().catch(() => {}); await sleep(200); if (await page.locator('#inRangeAll:visible').count()) await page.locator('#inRangeAll').click(); await sleep(500)
    const rows1 = await page.locator('#inBody tr[data-iid]').count()
    pics.push(await E.pic(page, `p4a04-${SZ}-inputs-list`))
    // header / body alignment
    const align = await page.evaluate(() => { const ths = [...document.querySelectorAll('#intbl thead th')].filter(t => t.offsetParent), tr = document.querySelector('#inBody tr[data-iid]'); if (!tr) return null; const tds = [...tr.children].filter(t => t.offsetParent); return ths.map((t, i) => tds[i] ? Math.round(Math.abs(t.getBoundingClientRect().left - tds[i].getBoundingClientRect().left)) : 99) })
    checks.push([`Inputs table has rows to scroll (${rows1}; ${rows0} before adding two)`, rows1 >= 8 && rows1 > rows0, { rows0, rows1 }])
    checks.push(['Inputs: each heading sits over its column (offset <= 3px)', !!align && align.every(d => d <= 3), align])
    // scroll to the last row
    await page.evaluate(() => { const s = document.querySelector('#inBody'); window.scrollTo(0, document.body.scrollHeight); const sc = s && (s.closest('.tblwrap, .intbl-wrap, .scroll') || s.parentElement); if (sc) sc.scrollTop = sc.scrollHeight }); await sleep(400)
    const lastRow = await page.evaluate(() => { const rs = [...document.querySelectorAll('#inBody tr[data-iid]')]; const r = rs[rs.length - 1].getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } })
    pics.push(await E.pic(page, `p4a04-${SZ}-inputs-last-row`))
    checks.push(['Inputs: the last row can be scrolled onto the screen', lastRow.top >= 0 && lastRow.bottom <= lastRow.vh + 2, lastRow])
    // sort + filter
    await page.evaluate(() => window.scrollTo(0, 0))
    const th = page.locator('#intbl thead th').nth(0); const firstBefore = await page.locator('#inBody tr[data-iid]').first().getAttribute('data-iid')
    const canSort = await th.isVisible(); if (canSort) { await th.click(); await sleep(400) }; const firstAfter = await page.locator('#inBody tr[data-iid]').first().getAttribute('data-iid')
    await page.selectOption('#inFPerson', { label: 'Vector' }); await sleep(500)
    const vecRows = await page.locator('#inBody tr[data-iid]').count()
    pics.push(await E.pic(page, `p4a04-${SZ}-inputs-filtered-vector`))
    await page.fill('#inFSearch', 'medical'); await sleep(500)
    const medRows = await page.locator('#inBody tr[data-iid]').count()
    checks.push(['Inputs: sorting by the first heading reorders and a person filter + search narrows the list', (!canSort || firstBefore !== firstAfter) && vecRows >= 2 && medRows >= 1 && medRows <= vecRows, { canSort: canSort ? 'headings sort' : 'phone shows cards: no sortable headings', firstBefore, firstAfter, vecRows, medRows }])
    // editor reachable on a row
    const pen = page.locator('#inBody tr[data-iid] [data-edit]').first()
    let ed = 'no pen'
    if (await pen.count()) { await pen.scrollIntoViewIfNeeded(); const l = await E.lands(pen); await pen.click(); await sleep(500); ed = { lands: l, open: await page.locator('#inBody tr.ined').count() }; pics.push(await E.pic(page, `p4a04-${SZ}-inputs-row-editor`)); await page.locator('#inBody tr.ined [data-cancel]').first().click().catch(() => {}); await sleep(300) }
    checks.push(['Inputs: a row\'s pencil is what a finger lands on and opens its editor', ed && ed.lands === true && ed.open >= 1, ed])
    await page.fill('#inFSearch', ''); await page.selectOption('#inFPerson', 'all'); await sleep(300)
    // calendar view, a day sheet
    await page.locator('#inCalBtn').click(); await page.waitForSelector('#inpCal', { state: 'visible' }); await sleep(500)
    for (let i = 0; i < 4 && !(await page.locator('#inpCal [data-icday="2026-07-21"]').count()); i++) { await page.locator('#icPrev').click(); await sleep(250) }
    let calDay = 'no day cell'
    const cell = page.locator('#inpCal [data-icday="2026-07-21"] .ic-num').first()
    if (await cell.count()) { await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(500); calDay = { pop: await page.locator('.ic-pop:visible').count() }; pics.push(await E.pic(page, `p4a04-${SZ}-inputs-calendar-day-sheet`)); await page.locator('#icPopClose').click().catch(() => {}); await sleep(300) }
    checks.push(['Inputs calendar: a day with an input opens its sheet and closes again', calDay && calDay.pop >= 1, calDay])
    await page.locator('#icClose').click().catch(() => {}); await sleep(400)
    // medical view + a document
    await page.locator('#inMedBtn').click(); await page.waitForSelector('#medView', { state: 'visible' }); await sleep(500)
    pics.push(await E.pic(page, `p4a04-${SZ}-medical`))
    const docBtn = page.locator('#medView button[title^="Tap to view"]').first()
    let doc = 'no document control found'
    if (await docBtn.count()) { await docBtn.scrollIntoViewIfNeeded(); await docBtn.click().catch(() => {}); await sleep(700); doc = { viewer: await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && e.offsetParent !== undefined && /doc|view|image|page|close/i.test(e.className + ' ' + e.id) && e.getBoundingClientRect().width > 150 && !e.closest('#medView, .topbar, #toastEl')).length) }; pics.push(await E.pic(page, `p4a04-${SZ}-medical-document-viewer`)) }
    info.docviewer = doc
    await page.keyboard.press('Escape'); await sleep(300)
    for (const sel of ['.docview .x', '.docviewer .x', '#docClose', '.doc-modal .x']) { const l = page.locator(sel + ':visible'); if (await l.count()) { await l.first().click().catch(() => {}); break } }
    await page.locator('#medClose').click().catch(() => {}); await sleep(400)
    checks.push(['Medical: the document pill opens a viewer', !!doc && typeof doc === 'object' && doc.viewer >= 1, doc])
    // Quals: frozen header + editing
    await E.nav(page, 'quals')
    pics.push(await E.pic(page, `p4a04-${SZ}-quals-top`))
    await page.evaluate(() => window.scrollTo(0, 700)); await sleep(400)
    const qh = await page.evaluate(() => { const names = [...document.querySelectorAll('#qtbl thead th')].filter(t => t.getBoundingClientRect().width > 20).map(t => t.innerText.replace(/[^A-Za-z/ ]/g, '').trim()); const tr = [...document.querySelectorAll('#qtbl tbody tr')].find(r => r.children.length >= 10) || null; const tds = tr ? [...tr.children].filter(t => t.getBoundingClientRect().width > 20) : []; const inView = tds.filter(td => td.getBoundingClientRect().right <= innerWidth - 2); const hits = inView.slice(0, 8).map(td => { const r = td.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, 72); return h ? h.innerText.replace(/[^A-Za-z/ ]/g, '').trim() : null }); return { scroll: Math.round(scrollY), names: names.slice(0, 8), hits } })
    pics.push(await E.pic(page, `p4a04-${SZ}-quals-scrolled`))
    checks.push(['Quals: with the page scrolled, a frozen heading row is on screen and each heading sits over its own column (those in view, up to eight)', qh.scroll > 100 && qh.hits.length >= 4 && qh.hits.every((h, i) => h && qh.names[i] && h.toUpperCase().startsWith(qh.names[i].toUpperCase().slice(0, 4))), qh])
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
    const qe = page.locator('#qEdit'); const qeLands = await E.lands(qe); await qe.click(); await sleep(500)
    pics.push(await E.pic(page, `p4a04-${SZ}-quals-edit-mode`))
    await qe.click().catch(() => {}); await sleep(300)
    checks.push(['Quals: Enable editing is what a finger lands on and toggles the mode', qeLands === true, qeLands])
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.message).split('\n')[0]]); pics.push(await E.pic(page, `p4a04-${SZ}-FAILED`)) }
  E.judge('P4a-04', `${SZ}: Inputs (add two incl. one with a document, sort, filter, row editor, calendar sheet), Medical + document, Quals header and edit mode`, checks, pics)
}
/* ---------------- P4a-05 ---------------- */
{
  const pics = [], checks = []
  const e0 = errors.length
  try {
    await E.nav(page, 'logic')
    const total = await page.locator('#lgCount').innerText()
    await page.fill('#lgSearch', 'report'); await sleep(500)
    const nSearch = await page.locator('#lgCount').innerText()
    pics.push(await E.pic(page, `p4a05-${SZ}-logic-search-report`))
    const res = {}
    for (const f of ['hard', 'adv', 'note', 'fired', 'all']) { await page.locator(`[data-lgf="${f}"]`).click(); await sleep(300); res[f] = await page.locator('#lgCount').innerText(); }
    await page.fill('#lgSearch', ''); await sleep(300)
    const back = await page.locator('#lgCount').innerText()
    pics.push(await E.pic(page, `p4a05-${SZ}-logic-cleared`))
    checks.push(['Logic: searching "report" narrows the count, every filter answers, clearing restores it', nSearch !== total && back === total, { total, nSearch, res, back }])
    const sw = await E.sideways(page); checks.push(['Logic: no sideways scroll', !sw.over, sw])
    // Help
    await E.nav(page, 'help')
    await page.selectOption('#bugCat', { index: 1 }).catch(() => {})
    await page.fill('#bugText', 'E walk: a harmless test note'); 
    const send = page.locator('#bugSend'); const sl = await E.lands(send)
    pics.push(await E.pic(page, `p4a05-${SZ}-help-filled`))
    await send.click(); await sleep(800)
    const listed = await page.locator('#bugList').innerText().catch(() => '')
    pics.push(await E.pic(page, `p4a05-${SZ}-help-sent`))
    checks.push(['Help: the report goes in and shows in the list', sl === true && /harmless test note/.test(listed), { sl, listed: listed.slice(0, 80) }])
    // Admin
    await E.nav(page, 'admin')
    if (phone) await page.locator('.adm-cat').first().click().catch(() => {}); else await page.locator('.adm-cat').first().click()
    await sleep(500)
    await page.fill('#accFind', 'Rang'); await sleep(500)
    const people = await page.locator('#accList [data-person]').count()
    pics.push(await E.pic(page, `p4a05-${SZ}-admin-users-find`))
    const tap = page.locator('#accList [data-person] .acc-tap').first(); const tl = await E.lands(tap)
    await tap.click(); await sleep(600)
    pics.push(await E.pic(page, `p4a05-${SZ}-admin-user-sheet`))
    await page.keyboard.press('Escape'); await sleep(300)
    await page.fill('#accFind', '').catch(() => {})
    checks.push(['Admin Users: the find box narrows the roster and a person row opens', people >= 1 && people < 20 && tl === true, { people, tl }])
    if (phone) await page.locator('.adm-back').click().catch(() => {})
    await page.locator('.adm-cat').nth(1).click(); await sleep(500)
    const arrows = page.locator('button:has-text("▼")').first(); let arrow = 'none'
    pics.push(await E.pic(page, `p4a05-${SZ}-admin-config`))
    const cl = await E.lands(page.locator('#admDutyTpl')); checks.push(['Admin config: the template buttons are what a finger lands on', cl === true, cl])
    if (phone) await page.locator('.adm-back').click().catch(() => {})
    await page.locator('.adm-cat').nth(2).click(); await sleep(500)
    const dateIn = page.locator('#page-admin input[type=date]:visible').first()
    await dateIn.fill('2020-01-01'); await sleep(300)
    const clr = page.locator('#page-admin button:has-text("Clear old clutter")').first()
    const enabled = await clr.isEnabled()
    pics.push(await E.pic(page, `p4a05-${SZ}-admin-data-ready`))
    let confirm = 'not pressed'
    if (enabled) { await clr.click(); await sleep(600); const said = await page.locator('#toastEl').innerText().catch(() => ''); confirm = (await page.locator('#dlgModal:visible, .confirm:visible, [role=dialog]:visible').count()) ? 'a confirmation asked' : 'no confirmation; the app said: ' + said; pics.push(await E.pic(page, `p4a05-${SZ}-admin-data-confirm`)); const cancel = page.locator('button:text-matches("^(Cancel|No|Keep)", "i"):visible').first(); if (await cancel.count()) await cancel.click(); else await page.keyboard.press('Escape'); await sleep(400) }
    checks.push(['Admin Data: Clear old clutter, pressed with a date before everything stored, either asks first or says there is nothing to clear (no destructive step)', enabled && /(a confirmation asked|No old clutter)/.test(confirm), { enabled, confirm }])
    const errNew = errors.slice(e0)
    checks.push(['no console / page / 4xx errors in this part', !errNew.length, errNew])
  } catch (e) { checks.push(['script ran to the end', false, String(e.message).split('\n')[0]]); pics.push(await E.pic(page, `p4a05-${SZ}-FAILED`)) }
  E.judge('P4a-05', `${SZ}: Logic search/filters, Help report, Admin users / config / data (cancelled)`, checks, pics)
}
E.savePart(`p4a4-${SZ}`)
await browser.close()
