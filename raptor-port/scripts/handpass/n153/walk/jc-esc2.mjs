// jc-esc2 - S43 (a hidden row cannot take Escape), S44 (Squadrons' and places' rows cancel alike), S45 (the new-squadron and Add a person forms stay their own).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, admCat, go, shut, as, state, openRow } from './jlib.mjs'
import { toUsers, who, editRow, tips, bell } from './jc-lib.mjs'
import { openF, closeF, tap, tick, SEARCH } from './jc-flib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-esc2 v1', SZ)
picsFor('jc-esc2-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const esc = async s => { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(260) }
const edOpen = s => s.page.locator('#accEdCancel').count().then(n => n > 0)
const focusTag = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const r = a.closest && a.closest('[data-person]'); return `${a.tagName}${a.id ? '#' + a.id : ''}${r ? ' in row ' + r.dataset.person : ''}` })
const places = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin button.acc-main')].filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent.replace(/\s+/g, ' ').trim()).filter(t => /GMT|·/.test(t)))
const sqRow = (s, re) => s.page.locator('#page-admin button.acc-main', { hasText: re }).filter({ visible: true }).first()
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await toUsers(s)
  await step('S43 control: hidden by the search, no Escape', async () => {
    await editRow(s, 'prowler', [{ name: 'control1' }]); await page.fill(SEARCH, 'Forge'); await page.waitForTimeout(260)
    await page.fill(SEARCH, ''); await page.waitForTimeout(260)
    const op = await edOpen(s); rec('S43 control: his row open after the search is cleared', op)
    if (op) { rec('S43 control: the draft in the box, no Escape pressed', await page.inputValue('#accEdName')); await page.locator('#accEdCancel').click(); await page.waitForTimeout(200) }
    await editRow(s, 'prowler', [{ name: 'control2' }]); await tick(s, 'WSOs'); await page.waitForTimeout(200); await tick(s, 'WSOs'); await closeF(s); await page.waitForTimeout(220)
    const op2 = await edOpen(s); rec('S43 control: his row open after a filter hid and showed him', op2)
    if (op2) { rec('S43 control: the draft, filter case', await page.inputValue('#accEdName')); await page.locator('#accEdCancel').click(); await page.waitForTimeout(200) }
  })
  await step('S43 hidden by the search', async () => {
    await editRow(s, 'prowler', [{ name: 'hidden1' }]); await page.fill(SEARCH, 'Forge'); await page.waitForTimeout(260)
    const drawn = await page.evaluate(() => { const r = document.querySelector('#page-admin [data-person="prowler"]'); return !!r && r.getBoundingClientRect().height > 0 }); rec('S43 his row drawn while the search hides him', drawn)
    await page.focus(SEARCH); await esc(s); rec('S43 search after Escape', await page.inputValue(SEARCH)); rec('S43 focus', await focusTag(s)); await pic(s, 's43-1-search-hid')
    await page.fill(SEARCH, ''); await page.waitForTimeout(240)
    const op = await edOpen(s); rec('S43 his row open when the search is cleared', op)
    if (op) { rec('S43 draft', await page.inputValue('#accEdName')); await page.locator('#accEdCancel').click(); await page.waitForTimeout(200) }
    const a = await who(s, 'prowler'); check('S43 nothing saved from the hidden row', a.name === 'ad2', a.name)
  })
  await step('S43 hidden by a filter, then Escape on the Filter', async () => {
    await editRow(s, 'prowler', [{ name: 'hidden2' }]); await tick(s, 'WSOs'); await page.waitForTimeout(220)
    const drawn = await page.evaluate(() => { const r = document.querySelector('#page-admin [data-person="prowler"]'); return !!r && r.getBoundingClientRect().height > 0 }); rec('S43b his row drawn', drawn)
    await esc(s); check('S43b Escape closes the Filter', !(await page.locator('#accFilterPanel').count()), 'panel gone'); rec('S43b focus after', await focusTag(s))
    await page.evaluate(() => document.activeElement?.blur?.()); await esc(s); rec('S43b focus after a second Escape', await focusTag(s))
    await openF(s); await page.locator('#accFilterClear').click(); await page.waitForTimeout(150); await closeF(s); await page.waitForTimeout(200)
    const op = await edOpen(s); rec('S43b row open after the filter is cleared', op); if (op) { rec('S43b the draft after the two Escapes', await page.inputValue('#accEdName')); await page.locator('#accEdCancel').click(); await page.waitForTimeout(200) }
    const a = await who(s, 'prowler'); check('S43b nothing saved', a.name === 'ad2', a.name)
  })
  await step('S43 leave for Squadrons, another page and the phone list', async () => {
    await editRow(s, 'prowler', [{ name: 'hidden3' }])
    await admCat(s, 'Squadrons'); await page.waitForTimeout(250); await sqRow(s, /^142/).click(); await page.waitForTimeout(280)
    check('S43c a Squadrons row opened', await page.locator('#sqMoveCancel').count() > 0, 'open')
    await esc(s); check('S43c Escape closes the Squadrons row', !(await page.locator('#sqMoveCancel').count()), 'closed'); rec('S43c focus', await focusTag(s))
    await go(s, 'inputs'); await shut(s); await page.waitForTimeout(350); await bell.open(s); check('S43c bell open on Inputs', await bell.isOpen(s), 'open'); await esc(s)
    check('S43c Escape closed the bell', !(await bell.isOpen(s)), 'closed'); rec('S43c page after Escape', (await state(s)).page)
    await page.evaluate(() => document.activeElement?.blur?.()); await esc(s); rec('S43c a bare Escape on Inputs leaves page', (await state(s)).page)
    await toUsers(s); const op = await edOpen(s); rec('S43c his row after coming back', op); if (op) { rec('S43c draft', await page.inputValue('#accEdName')); await page.locator('#accEdCancel').click(); await page.waitForTimeout(200) }
    const a = await who(s, 'prowler'); check('S43c nothing saved', a.name === 'ad2', a.name)
    if (!s.desk) { const back = page.locator('.adm-back:visible'); rec('S43c phone back button', await back.count()); if (await back.count()) { await editRow(s, 'prowler', [{ name: 'hidden4' }]); await back.first().tap(); await page.waitForTimeout(300); await esc(s); rec('S43c on the phone category list, page', (await state(s)).page); await toUsers(s); const o = await edOpen(s); rec('S43c phone row after return', o); if (o) await page.locator('#accEdCancel').click(); const z = await who(s, 'prowler'); check('S43c phone nothing saved', z.name === 'ad2', z.name) } }
  })
  await step('S44 a squadron row with + New place…', async () => {
    await admCat(s, 'Squadrons'); const p0 = await places(s); rec('S44 before', p0)
    await sqRow(s, /^142/).click(); await page.waitForTimeout(260)
    const opts = await page.evaluate(() => [...document.querySelector('#sqPlace').options].map(o => `${o.value}|${o.textContent}`)); rec('S44 place options', opts)
    const nw = opts.find(o => /New place/.test(o)); if (nw) { await page.selectOption('#sqPlace', nw.split('|')[0]); await page.waitForTimeout(250) }
    const newBox = page.locator('#page-admin input').filter({ visible: true }); rec('S44 inputs in the open row', await newBox.evaluateAll(l => l.map(e => e.id)))
    const pn = page.locator('#sqPlaceName').filter({ visible: true }).first(); check('S44 the new place box is there', (await pn.count()) > 0, await pn.count()); if (await pn.count()) await pn.fill('Orphan Base'); await pic(s, 's44-1-new-place')
    await esc(s); check('S44 squadron row closed', !(await page.locator('#sqMoveCancel').count()), 'closed'); const p1 = await places(s); check('S44 no orphan place', JSON.stringify(p1) === JSON.stringify(p0), p1)
    await sqRow(s, /^142/).click(); await page.waitForTimeout(250); const v = await page.inputValue('#sqPlace'); rec('S44 reopened place', v); await page.locator('#sqMoveCancel').click(); await page.waitForTimeout(200)
  })
  await step('S44 a place row: Escape, Cancel, and after an error', async () => {
    const p0 = await places(s); const pr = sqRow(s, /^Home base/)
    await pr.click(); await page.waitForTimeout(240); const v0 = await page.inputValue('#plName'), tz0 = await page.inputValue('#plTz')
    await page.fill('#plName', 'Renamed X'); const tzOpts = await page.evaluate(() => [...document.querySelector('#plTz').options].map(o => o.value)); await page.selectOption('#plTz', tzOpts.find(z => z !== tz0)); await pic(s, 's44-2-place-edit')
    await esc(s); check('S44b place row closed', !(await page.locator('#plCancel').count()), 'closed'); check('S44b place unchanged', JSON.stringify(await places(s)) === JSON.stringify(p0), await places(s))
    await pr.click(); await page.waitForTimeout(240); check('S44b fields back', (await page.inputValue('#plName')) === v0 && (await page.inputValue('#plTz')) === tz0, await page.inputValue('#plName'))
    await page.fill('#plName', ''); await page.locator('#plSave').click(); await page.waitForTimeout(280); const err = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin .err, #page-admin [role=alert]')].find(x => x.textContent.trim() && x.getBoundingClientRect().width > 0); return e ? e.textContent.trim() : null }); rec('S44b the error on a blank name', err); await pic(s, 's44-3-error')
    const open = await page.locator('#plCancel').count(); check('S44b error keeps the row open', open > 0, open)
    await esc(s); check('S44b Escape closes it after an error', !(await page.locator('#plCancel').count()), 'closed'); check('S44b unchanged', JSON.stringify(await places(s)) === JSON.stringify(p0), await places(s))
    await pr.click(); await page.waitForTimeout(240); await page.fill('#plName', 'Cancel me'); await page.locator('#plCancel').click(); await page.waitForTimeout(220); check('S44b Cancel same as Escape', JSON.stringify(await places(s)) === JSON.stringify(p0), await places(s))
  })
  await step('S45 + New squadron form', async () => {
    await page.locator('#sqNew').filter({ visible: true }).first().click(); await page.waitForTimeout(250); await page.fill('#sqNewNum', '777'); await page.focus('#sqNewNum')
    await esc(s); const o = await page.locator('#sqNewNum').count(); rec('S45 new squadron form after Escape: open', o > 0); if (o) rec('S45 its number', await page.inputValue('#sqNewNum'))
    if (o) { await page.locator('#sqNewCancel').click(); await page.waitForTimeout(220) }
    const after = await places(s); check('S45 no squadron made', !after.some(t => /777/.test(t)), after)
    await sqRow(s, /^142/).click(); await page.waitForTimeout(220); await esc(s)
    await page.locator('#sqNew').filter({ visible: true }).first().click(); await page.waitForTimeout(220); await page.fill('#sqNewNum', '778')
    await esc(s); const o2 = await page.locator('#sqNewNum').count(); rec('S45 form after a row was closed by Escape, then Escape: open', o2 > 0); if (o2) { check('S45 the row closed earlier does not take its text', (await page.inputValue('#sqNewNum')) === '778', await page.inputValue('#sqNewNum')); await page.locator('#sqNewCancel').click(); await page.waitForTimeout(200) }
  })
  await step('S45 Add a person', async () => {
    await toUsers(s); await page.fill('#accAddCs', 'Zeta'); await page.focus('#accAddCs'); await page.waitForTimeout(100); await esc(s)
    rec('S45 Add a person after Escape', { name: await page.inputValue('#accAddCs'), focus: await focusTag(s) })
    await openRow(s, 'prowler'); await page.fill('#accEdName', 'draft45'); await esc(s)
    check('S45 closing a row by Escape leaves the Add form alone', (await page.inputValue('#accAddCs')) === 'Zeta', await page.inputValue('#accAddCs'))
    check('S45 row closed', !(await edOpen(s)), 'closed'); rec('S45 focus after', await focusTag(s))
    await page.fill('#accAddCs', ''); await page.waitForTimeout(100)
  })
  await step('S44 as own admin: what Hunter gets on Squadrons', async () => {
    await as(s, 'ad2', 'a2'); await admCat(s, 'Squadrons'); await page.waitForTimeout(250); await pic(s, 's44-4-hunter')
    const rows = await page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-main')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.tagName + ':' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30))); rec('S44c Hunter sees', rows); rec('S44c + New squadron offered', await page.locator('#sqNew').filter({ visible: true }).count())
    const b = page.locator('#page-admin button.acc-main', { hasText: /^142/ }).filter({ visible: true })
    if (await b.count()) { await b.first().click(); await page.waitForTimeout(250); rec('S44c can open 142', await page.locator('#sqMoveCancel').count()); if (await page.locator('#sqMoveCancel').count()) await esc(s); check('S44c closed after Escape', !(await page.locator('#sqMoveCancel').count()), 'closed') }
    const f = page.locator('#page-admin button.acc-main', { hasText: /^149/ }).filter({ visible: true })
    rec('S44c 149 row is a button for Hunter', await f.count())
    if (await f.count()) {
      const off = await f.first().isDisabled(); rec('S44c 149 row is greyed for Hunter', off)
      if (off) check('S44c no foreign editing of 149', true, 'its row cannot be pressed')
      else { await f.first().click(); await page.waitForTimeout(250); check('S44c no foreign editing of 149', !(await page.locator('#sqMoveSave').count()), await page.locator('#sqMoveSave').count()); if (await page.locator('#sqMoveCancel').count()) await page.locator('#sqMoveCancel').click() }
    }
    const pb = page.locator('#page-admin button.acc-main', { hasText: /^Home base/ }).filter({ visible: true })
    if (await pb.count()) { const dis = await pb.first().isDisabled(); rec('S44c place row greyed for Hunter', dis); if (!dis) { await pb.first().click(); await page.waitForTimeout(240); rec('S44c place row opened for Hunter', await page.locator('#plCancel').count()); if (await page.locator('#plCancel').count()) await esc(s); check('S44c place closed after Escape', !(await page.locator('#plCancel').count()), 'closed') } }
  })
  await s.ctx.close()
} finally { finish('jc-esc2-' + SZ); await closeAll() }
