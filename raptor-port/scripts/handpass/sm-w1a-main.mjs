// W1a main: S17, S25, S6, S7, S8, S9 (one fresh published world each), PC or phone.
// Run: node scripts/handpass/sm-w1a-main.mjs <pc|phone> <s17|s25|s6|s7|s8|s9>
import * as L from './sm-lib.mjs'
const SIZE = process.argv[2] || 'pc', SCN = process.argv[3] || 's17'
console.log('sm-w1a-main v1', SIZE, SCN)
const OUT = L.outDir('w1a')
const DI = SCN === 's9' ? 5 : 2, ISO = SCN === 's9' ? '2026-07-18' : '2026-07-15'
const W = await L.launch(SIZE, { origin: 'http://localhost:4391' })
const { page } = W
page.setDefaultTimeout(8000)
const res = {}
const log = (k, v) => { res[k] = v; console.log(k, JSON.stringify(v)) }
const step = async (k, fn) => { try { log(k, await fn()) } catch (e) { log(k, { err: e.message.split('\n')[0] }) } }
const p = n => `${SCN}-${SIZE}-${n}`
const tap = async sel => { const l = (typeof sel === 'string' ? page.locator(sel) : sel).filter({ visible: true }).first(); if (W.phone) await l.tap(); else await l.click() }

/* open the window for a new input; options: who (string|[strings]), type, goes 'u'|'g', remarks */
async function fillWin({ who, type, iso = ISO, goes = null, remarks = null }) {
  await L.openInputsList(W)
  await page.locator(L.T('in-new')).first().click(); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(500)
  const names = Array.isArray(who) ? who : [who]
  await page.locator('#inpEditType').selectOption(type); await L.sleep(300)
  if (names.length > 1) {
    await page.locator(L.T('pp-several')).click(); await L.sleep(400)
    for (const n of names) await page.locator('.pp-puck').filter({ hasText: new RegExp('^' + n + '') }).first().click()
    if (!names.includes('Saber')) await page.locator('.pp-puck.on').filter({ hasText: /^Saber/ }).first().click()
    await L.sleep(200)
  } else await page.locator('#inpEditPerson').selectOption({ label: names[0] })
  if (goes) { const g = page.locator(L.T('inpEdit-goes-' + goes)); if (await g.count()) await g.click(); else console.log('NO goes toggle for', type) }
  if (remarks != null) await page.locator('#inpEditRmk').fill(remarks)
  await page.locator(`[data-testid="inpEdCal-day-${iso}"]`).first().click(); await L.sleep(200)
  await page.locator(`[data-testid="inpEdCal-day-${iso}"]`).first().click(); await L.sleep(200)
}
async function answerQs(o = {}) {
  await L.sleep(900)
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click()
    else { await page.locator(L.T(o.oil === 'yes' ? 'oil-yes' : 'oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
    await L.sleep(700)
  }
}
const iids = () => page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
async function file(o) {
  const before = await iids()
  try { await fillWin(o); await page.locator('#inpEditSave').click(); await answerQs(o) } catch (e) { await L.pic(W, OUT, p('err-' + (Array.isArray(o.who) ? o.who.join('') : o.who)) ).catch(() => {}); console.log('ERR detail', e.message.slice(0, 400)); await page.locator('#inpEditCancel').click({ timeout: 2000 }).catch(() => {}); await page.keyboard.press('Escape'); await L.sleep(400); throw e }
  const after = await iids(); const fresh = after.filter(i => !before.includes(i))
  return fresh.length ? await page.evaluate(id => { const r = (window.INPUTS || []).find(x => x.iid === id); return { iid: r.iid, type: r.type, who: r.people } }, fresh[0]) : null
}
/* open the window of an existing input from the Edit Schedule week by the row's name button */
async function openFromWeek(di, whoText) {
  await L.goEdit(W)
  const row = page.locator(`#eWeek section.day[data-day="${di}"] .sec-unav .pl-row`).filter({ hasText: whoText }).first()
  await row.scrollIntoViewIfNeeded(); await L.sleep(300)
  await tap(row.locator('.nm .ntx').first()); await L.sleep(1200)
  if (!await page.locator('#inpEditSave').count()) { await L.pic(W, OUT, p('err-open')); console.log('OPEN FAIL, windows:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].map(e => e.dataset.testid + ':' + e.getBoundingClientRect().width)))) }
  await page.waitForSelector('#inpEditSave'); await L.sleep(500)
}
async function saveEdit(o) { await page.locator('#inpEditSave').click(); await answerQs(o) }

/* readings — AS PAINTED */
const weekRows = di => page.evaluate(di => {
  const day = document.querySelector(`#eWeek section.day[data-day="${di}"]`)
  return [...day.querySelectorAll('.sec-unav .pl-row')].filter(r => r.getBoundingClientRect().height > 0).map(r => {
    const b = r.querySelector('.nm .ntx'); const cs = b && getComputedStyle(b)
    const who = [...r.querySelectorAll('.puck, .pk, [data-who]')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.textContent.replace(/\s+/g, ' ').trim()).join('|')
    return { name: b && b.textContent.trim(), who: who || r.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), aln: b && (b.dataset.aln || null), deco: cs && `${cs.textDecorationLine} ${cs.textDecorationStyle}`, marked: !!cs && /dotted/.test(cs.textDecorationStyle) && cs.textDecorationLine.includes('underline') }
  })
}, di)
const boardRows = () => page.evaluate(() => {
  return [...document.querySelectorAll('#schedBoard .sb-panel.unav .sb-arow')].filter(r => r.getBoundingClientRect().height > 0).map(r => {
    const b = r.querySelector('.sbi-ty, .ain, [data-aln]') ; const cs = b && getComputedStyle(b)
    const who = [...r.querySelectorAll('.puck, .pk')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.textContent.replace(/\s+/g, ' ').trim()).join('|')
    return { name: b && b.textContent.trim().slice(0, 20), cls: b && (b.className + '').slice(0, 30), who: who || r.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), aln: b && (b.dataset.aln || null), outline: cs && `${cs.outlineStyle} ${cs.outlineWidth}`, marked: !!cs && cs.outlineStyle === 'dotted' }
  })
})
const groundRows = di => page.evaluate(di => [...document.querySelectorAll(`#eWeek section.day[data-day="${di}"] .pl-row.gr-frominput`)].filter(r => r.getBoundingClientRect().height > 0).map(r => { const b = r.querySelector('.ntx'); const cs = getComputedStyle(b); return { text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), marked: /dotted/.test(cs.textDecorationStyle) } }), di)
const pending = di => page.evaluate(di => { const d = document.querySelector(`#eWeek section.day[data-day="${di}"] .dpend`); return d ? d.textContent.trim() : null }, di)
const sbPending = () => page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard *')].find(x => x.children.length === 0 && /\d+ pending/.test(x.textContent) && x.getBoundingClientRect().width > 0); return e ? e.textContent.trim() : null })
/* the changes window: open it from the pending chip on the week, read its "To go out" list, close it by its ✕ */
async function changesList(di, shot) {
  await L.goEdit(W)
  const chip = page.locator(`#eWeek section.day[data-day="${di}"] .dpend:visible`).first()
  if (!await chip.count()) return { err: 'no chip' }
  await chip.scrollIntoViewIfNeeded(); await tap(chip); await L.sleep(800)
  const out = await page.evaluate(() => {
    const e = [...document.querySelectorAll('*')].filter(x => x.getBoundingClientRect().width > 0 && /Waiting to go out/.test(x.innerText || '') && x.children.length < 30)
    const win = e.length ? e[e.length - 1] : null
    let root = win; while (root && root.parentElement && !/fixed|absolute/.test(getComputedStyle(root).position)) root = root.parentElement
    return root ? root.innerText.replace(/\s+/g, ' ').trim().slice(0, 700) : null
  })
  if (shot) await L.pic(W, OUT, p(shot))
  const x = await page.evaluate(() => { const r = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && b.textContent.trim() === '✕' && /Changes/.test((b.closest('[class*=win], [role=dialog], div') || {}).innerText || '')); return r.length })
  const cx = page.locator('button').filter({ hasText: /^✕$/ }).filter({ visible: true }).last()
  if (await cx.count()) { await tap(cx); await L.sleep(400) }
  return out
}
async function snap(tag, di = DI, shotSel = true) {
  await L.goEdit(W)
  const o = { pending: await pending(di), week: await weekRows(di), ground: await groundRows(di) }
  const sel = `#eWeek section.day[data-day="${di}"] .sec-unav`
  await L.center(page, sel); await L.sleep(400); await L.pic(W, OUT, p(tag + '-week'), { sel })
  o.changes = await changesList(di, tag + '-changes')
  return o
}
async function boardSnap(tag, di = DI) {
  await L.openBoard(W, di)
  const o = { sbPending: await sbPending(), rows: await boardRows() }
  await L.center(page, '#schedBoard .sb-panel.unav'); await L.sleep(500)
  await L.pic(W, OUT, p(tag + '-board'), { sel: '#schedBoard .sb-panel.unav' })
  return o
}
const agree = (o, who) => `${who}: week=${o.week.filter(r => r.who.includes(who) || r.name.includes(who)).map(r => r.marked).join(',')} list=${(o.changes || '').includes(who)}`

await L.signIn(W)
const preFile = []   // inputs filed before the day is published
if (SCN === 's7') {
  await step('fileA', () => file({ who: ['Bolt', 'Saint'], type: 'Other', goes: 'u', remarks: 'Range A' }))
  await step('fileB', () => file({ who: ['Hunter', 'Piston'], type: 'Other', goes: 'u', remarks: 'Range B' }))
}
if (SCN === 's8' || SCN === 's8b') await step('fileLL', () => file({ who: 'Bolt', type: 'LL' }))
if (SCN === 's6' || SCN === 's6b') await step('fileShared', () => file({ who: ['Bolt', 'Saint'], type: 'Other', goes: 'u', remarks: 'Range party' }))
await step('publish', () => L.publishDay(W, DI)); await L.closeBoard(W)
await step('clean', () => snap('0clean'))

if (SCN === 's17') {
  const kinds = [
    ['LL', { who: 'Bolt', type: 'LL' }], ['ATT C', { who: 'Saint', type: 'ATT C' }], ['HL', { who: 'Ranger', type: 'HL' }],
    ['OD', { who: 'Warden', type: 'OD' }], ['Training-U', { who: 'Hunter', type: 'Training', goes: 'u' }],
    ['Other-U', { who: 'Piston', type: 'Other', goes: 'u' }], ['Shared-U', { who: ['Comet', 'Forge'], type: 'Other', goes: 'u', remarks: 'Shared range' }],
    ['Personal', { who: 'Vandal', type: 'Personal' }], ['Meeting-G', { who: 'Sidewinder', type: 'Meeting', goes: 'g' }],
  ]
  for (const [k, o] of kinds) await step('file.' + k, () => file(o))
  await step('week', () => snap('1pend'))
  await step('personal.where', () => page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] [data-aln]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: (e.className + '').slice(0, 24), text: e.textContent.trim().slice(0, 24), sec: ((e.closest('[class*="sec-"]') || {}).className || '').slice(0, 30), deco: getComputedStyle(e).textDecorationStyle }))))
  await step('personalSection', async () => {
    await L.goEdit(W)
    return page.evaluate(() => {
      const day = document.querySelector('#eWeek section.day[data-day="2"]')
      const heads = [...day.querySelectorAll('*')].filter(e => e.children.length === 0 && /personal inputs/i.test(e.textContent) && e.getBoundingClientRect().height > 0).map(e => e.textContent.trim().slice(0, 40) + '|' + (e.className + ''))
      const secs = [...day.querySelectorAll('[class*="sec-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.className + '').slice(0, 40) + ' :: ' + e.textContent.replace(/s+/g, ' ').trim().slice(0, 60))
      const reject = [...day.querySelectorAll('button')].filter(b => /reject/i.test(b.textContent) && b.getBoundingClientRect().height > 0).length
      return { heads, secs, reject }
    })
  })
  await step('board', () => boardSnap('1pend'))
}
if (SCN === 's25') {
  await step('fileShared', () => file({ who: ['Bolt', 'Saint'], type: 'Other', goes: 'u', remarks: 'Range party' }))
  await step('filed', () => snap('1filed'))
  await step('filed.board', () => boardSnap('1filed'))
  await step('editRemarks', async () => { await openFromWeek(2, 'Bolt'); await page.locator('#inpEditRmk').fill('Range party moved'); await saveEdit(); return await snap('2edited') })
  await step('addPerson', async () => { await openFromWeek(2, 'Bolt'); await page.locator('.pp-puck').filter({ hasText: /^Hunter/ }).first().click(); await saveEdit(); return await snap('3added') })
  await step('removePerson', async () => { await openFromWeek(2, 'Bolt'); await page.locator('.pp-puck').filter({ hasText: /^Saint/ }).first().click(); await saveEdit(); return await snap('4removed') })
  await step('board.end', () => boardSnap('4removed'))
}
if (SCN === 's6') {
  await step('shared.rows', async () => ({ week: await weekRows(2) }))
  await step('board.clean', () => boardSnap('0clean'))
  // the individual row: what does the board's row offer for one man of the shared input?
  await step('board.inline', () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.unav .sb-arow')].filter(r => r.getBoundingClientRect().height > 0).map(r => ({ text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), inputs: [...r.querySelectorAll('input,textarea')].filter(i => i.getBoundingClientRect().width > 0).map(i => i.className + ':' + i.value) }))))
  await L.closeBoard(W)
  await step('editRemarksFromBolt', async () => { await openFromWeek(2, 'Bolt'); await page.locator('#inpEditRmk').fill('Range party — Bolt only?'); await saveEdit(); return await snap('1edited') })
  await step('board.edited', () => boardSnap('1edited'))
}
if (SCN === 's7') {
  await step('A.removeBolt', async () => { await openFromWeek(2, 'Saint'); await page.locator('.pp-puck').filter({ hasText: /^Bolt/ }).first().click(); await saveEdit(); return await snap('1removeBolt') })
  await step('B.addBolt', async () => { await openFromWeek(2, 'Hunter'); await page.locator('.pp-puck').filter({ hasText: /^Bolt/ }).first().click(); await saveEdit(); return await snap('2addBolt') })
  await step('board', () => boardSnap('2addBolt'))
}
if (SCN === 's8') {
  await step('delete', async () => { await openFromWeek(2, 'Bolt'); const d = page.locator('button').filter({ hasText: /^Delete/ }).filter({ visible: true }).first(); const n = await d.count(); if (!n) return { err: 'no delete button' }; await d.click(); await L.sleep(600); const y = page.locator('button').filter({ hasText: /^(Delete|Yes)/ }).filter({ visible: true }); return { n, confirm: await y.count() } })
  await step('replaceChanged', async () => { const r = await file({ who: 'Bolt', type: 'LL', remarks: 'changed remarks' }); return { r, snap: await snap('1replaced') } })
  await step('board.replaced', () => boardSnap('1replaced'))
}
if (SCN === 's9') {
  await step('files', async () => [await file({ who: 'Bolt', type: 'LL' }), await file({ who: 'Saint', type: 'Meeting', remarks: 'Safety brief' }), await file({ who: 'Warden', type: 'OD' }), await file({ who: 'Piston', type: 'Other', goes: 'u' })])
  await step('board.normal', () => boardSnap('1normal'))
  await step('board.groundnormal', () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-aln]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: (e.className + '').slice(0, 24), text: e.textContent.trim().slice(0, 20), outline: getComputedStyle(e).outlineStyle }))))
  const { oilOn } = await import('./oeb-w1-lib.mjs')
  await step('oil.on', async () => { await oilOn(W); await L.sleep(500); return true })
  await step('oil.unav', () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.unav .sb-arow')].filter(r => r.getBoundingClientRect().height > 0).map(r => ({ text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), boxes: [...r.querySelectorAll('[data-aln], .sbi-ty, .ain, button, span')].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).outlineStyle === 'dotted').map(e => (e.className + '').slice(0, 20)), alnAttr: [...r.querySelectorAll('[data-aln]')].length }))))
  await step('oil.ground', () => page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).outlineStyle === 'dotted').map(e => ({ cls: (e.className + '').slice(0, 24), text: e.textContent.trim().slice(0, 20) })).slice(0, 12)))
  await L.center(page, '#schedBoard .sb-panel.unav'); await L.sleep(400); await L.pic(W, OUT, p('2oil-unav'), { sel: '#schedBoard .sb-panel.unav' })
  await step('oil.pending', () => sbPending())
  await step('oil.off', async () => { await oilOn(W).catch(() => {}); await L.sleep(500); return await page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon')) })
  await step('back.unav', () => boardRows())
  await L.center(page, '#schedBoard .sb-panel.unav'); await L.sleep(400); await L.pic(W, OUT, p('3back-unav'), { sel: '#schedBoard .sb-panel.unav' })
}

if (SCN === 's6b') {
  // one man of a shared input, edited on the BOARD's own row (remarks box of Saint's row)
  await L.openBoard(W, 2)
  await step('board.saintRemark', async () => {
    const row = page.locator('#schedBoard .sb-panel.unav .sb-arow').filter({ hasText: 'Saint' }).first()
    const box = row.locator('.rmkin').first(); await box.scrollIntoViewIfNeeded(); await box.click(); await box.fill('Saint only — on the range'); await page.keyboard.press('Tab'); await L.sleep(900)
    return { rows: await boardRows(), pend: await sbPending() }
  })
  await L.center(page, '#schedBoard .sb-panel.unav'); await L.sleep(500); await L.pic(W, OUT, p('1board-split'), { sel: '#schedBoard .sb-panel.unav' })
  await step('board.sameSession.later', async () => { await L.sleep(2500); return await boardRows() })
  await L.closeBoard(W)
  await step('board.reopened', () => boardSnap('1reopened'))
  await L.closeBoard(W)
  await step('week.afterSplit', () => snap('1split'))
  await step('undo', async () => { const b = page.locator('button[title^="Undo"], button[aria-label^="Undo"]').filter({ visible: true }).first(); const n = await b.count(); if (n) { await tap(b); await L.sleep(900) } return { n, snap: await snap('2undo') } })
  await step('redo', async () => { const b = page.locator('button[title^="Redo"], button[aria-label^="Redo"]').filter({ visible: true }).first(); const n = await b.count(); if (n) { await tap(b); await L.sleep(900) } return { n, snap: await snap('3redo') } })
  await step('reload', async () => { await page.reload(); await L.sleep(1500); const login = await page.locator('#luser').count(); if (login) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') } await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 }); await L.sleep(800); return { login, snap: await snap('4reload') } })
  await step('publishAL', async () => { const r = await L.publishDay(W, 2); await L.sleep(500); const rows = await boardRows(); await L.closeBoard(W); return { r, rows, snap: await snap('5after') } })
}
if (SCN === 's8b') {
  await step('delete', async () => { await openFromWeek(2, 'Bolt'); const d = page.locator('button').filter({ hasText: /^Delete/ }).filter({ visible: true }).first(); await d.click(); await L.sleep(800); return { snap: await snap('1deleted') } })
  await step('refileIdentical', async () => { const r = await file({ who: 'Bolt', type: 'LL' }); return { r, snap: await snap('2identical') } })
  await step('board', () => boardSnap('2identical'))
}
if (SCN === 's17c') {
  await step('files', async () => [await file({ who: 'Vandal', type: 'Personal' }), await file({ who: 'Hunter', type: 'Training' })])
  await L.goEdit(W)
  await step('unfold', async () => {
    const head = page.locator('#eWeek section.day[data-day="2"] .sec-inp').locator('xpath=.').first()
    await head.scrollIntoViewIfNeeded(); await L.sleep(300)
    const h = page.locator('#eWeek section.day[data-day="2"] .sec-inp').locator('text=Personal Inputs').first()
    await tap(h); await L.sleep(700)
    return page.evaluate(() => {
      const sec = document.querySelector('#eWeek section.day[data-day="2"] .sec-inp')
      const rows = [...sec.querySelectorAll('*')].filter(e => e.getBoundingClientRect().height > 0 && (e.dataset.aln || /dotted/.test(getComputedStyle(e).textDecorationStyle) || getComputedStyle(e).outlineStyle === 'dotted'))
      return { open: sec.getBoundingClientRect().height, text: sec.innerText.replace(/s+/g, ' ').slice(0, 300), marked: rows.map(e => (e.className + '').slice(0, 20) + ':' + e.textContent.trim().slice(0, 20)) }
    })
  })
  await L.center(page, '#eWeek section.day[data-day="2"] .sec-inp'); await L.sleep(400); await L.pic(W, OUT, p('1personal-open'), { sel: '#eWeek section.day[data-day="2"] .sec-inp' })
  await step('sans', () => page.evaluate(() => { const sec = document.querySelector('#eWeek section.day[data-day="2"] .sec-sans'); const bad = [...sec.querySelectorAll('*')].filter(e => e.dataset.aln || getComputedStyle(e).textDecorationStyle === 'dotted' || getComputedStyle(e).outlineStyle === 'dotted').length; return { cards: sec.querySelectorAll('.puck, .pk').length, text: sec.innerText.replace(/s+/g, ' ').slice(0, 120), dottedOrAln: bad } }))
  await L.center(page, '#eWeek section.day[data-day="2"] .sec-sans'); await L.sleep(400); await L.pic(W, OUT, p('2sans'), { sel: '#eWeek section.day[data-day="2"] .sec-sans' })
}
log('errs', W.errs)
L.saveJson(OUT, p('results'), res)
await L.closeAll(W)
console.log('DONE')
