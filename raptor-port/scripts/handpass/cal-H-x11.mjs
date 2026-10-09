/* X-11 — grouping in Changes survives edits, deletion and amendment (D663). Wed 15 Jul 26, published clean first.
   order: filed (3 people) -> Ace takes himself out (one subject alone) -> AL1 -> the remaining group deleted -> AL2. */
import * as H from './cal-H-lib.mjs'
H.setTag('x11')
const { browser, page, errors } = await H.world({})
await H.toastSpy(page)
const DI = 2
const A = await H.pidOf(page, 'Saber'), ACE = await H.pidOf(page, 'Ace'), ANVIL = await H.pidOf(page, 'Anvil')
const swap = async (pid, role) => { await page.evaluate(([p, r]) => { window.raptorMe(p); window.raptorRole(r) }, [pid, role]); await H.sleep(500) }
const grpNow = async () => (await H.inputsNow(page)).filter(x => /X11/.test(x.remarks))
async function readGroupBy(g) {
  const b = page.locator('.chgwin:not([hidden]) button.cw-g-btn', { hasText: new RegExp('^' + g + '$') }).first()
  if (await b.count()) { await b.click(); await H.sleep(300) }
  return (await H.changesRead(page)).lines
}
async function readAll(tag) {
  await H.toEdit(page); await H.showDay(page, DI)
  await H.changesWin(page, DI)
  const out = { tag }
  out.tabs = (await H.changesRead(page)).tabs
  await H.changesTab(page, 'New to you'); out.new = (await H.changesRead(page)).lines; out.picNew = await H.pic(page, `${tag}-new`)
  await H.changesTab(page, 'All changes')
  out.allItem = await readGroupBy('Item'); out.picAllItem = await H.pic(page, `${tag}-all-item`)
  out.allWho = await readGroupBy('Who'); out.picAllWho = await H.pic(page, `${tag}-all-who`)
  await readGroupBy('Item')
  await H.changesTab(page, 'To go out'); out.togo = (await H.changesRead(page)).lines; out.picTogo = await H.pic(page, `${tag}-togo`)
  await H.changesClose(page)
  return out
}
const shared = lines => lines.filter(l => /^Input · Meeting · \d people/.test(l))
const sep = lines => lines.filter(l => /^(Ranger|Drifter|Ace) · Meeting$/.test(l))

// 0. a clean published day
await H.toEdit(page); await H.showDay(page, DI); await H.signDay(page, DI); await H.publishDay(page, DI)
// 1. the filing
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-15', type: 'Meeting', people: ['Ranger', 'Drifter', 'Ace'], exclude: ['Saber'], remarks: 'X11 group' })
const g1 = await grpNow()
const R1 = await readAll('1-filed')
await swap(ANVIL, 'admin')
const R1b = await readAll('1b-as-Anvil')
await swap(A, 'admin')
H.judge('X-11 (1) filed', 'published Wed 15 Jul clean, filed ONE Meeting for Ranger, Drifter and Ace; read New to you / All changes (by Item and by Who) / To go out, and New to you as a second admin (Anvil, swap)', [
  ['3 records, one group id', g1.length === 3 && new Set(g1.map(x => x.grp)).size === 1, g1.map(x => x.person)],
  ['All changes by Item: ONE item "Input · Meeting · 3 people" with the three names under it', shared(R1.allItem).length === 1 && ['Ranger', 'Drifter', 'Ace'].every(n => R1.allItem.some(l => l.startsWith(n + ' · Meeting added'))), R1.allItem.slice(0, 12)],
  ['All changes by Who: Saber\'s lines each carry the group\'s title', R1.allWho.filter(l => /^Input · Meeting · 3 people/.test(l)).length === 3, R1.allWho.slice(0, 14)],
  ['New to you (second admin): ONE shared item', shared(R1b.new).length === 1, R1b.new.slice(0, 10)],
  ['To go out: ONE shared item (not a line for each man)', shared(R1.togo).length === 1 && sep(R1.togo).length === 0, R1.togo],
], [R1.picAllItem, R1.picAllWho, R1.picTogo, R1b.picNew], { R1: { allItem: R1.allItem, allWho: R1.allWho, togo: R1.togo, tabs: R1.tabs }, R1b: { new: R1b.new, tabs: R1b.tabs, togo: R1b.togo } })

// 2. one subject alone: Ace takes himself out (swap to Ace as a member)
await swap(ACE, 'member')
await H.inputsMonth(page, 2026, 7)
const t2 = await H.openBar(page, /\+2/)
await H.pic(page, '2-ace-editor')
const takeBtn = page.locator('[data-testid="inped-takeout"]')
const hasTake = await takeBtn.count()
if (hasTake) { await takeBtn.click(); await H.sleep(300); await H.pic(page, '2b-ace-takeout-ask'); await page.locator('[data-testid="inped-takeout-yes"]').click(); await H.sleep(800) }
const g2 = await grpNow()
await swap(A, 'admin')
const R2 = await readAll('2-ace-out')
H.judge('X-11 (2) one subject alone', 'Ace (swap to member) opened the shared Meeting, pressed "Take me out" and confirmed; back to Saber; read the tabs', [
  ['the editor opened on the entry (title names "+2")', /\+2/.test(t2 || ''), t2],
  ['Take me out was there', !!hasTake, hasTake],
  ['the shared input kept Ranger and Drifter only', g2.length === 2 && !g2.some(x => x.person === ACE), g2.map(x => x.person)],
  ['All changes by Item: Ace\'s own removal line is attributed to Ace, the filing still names him', R2.allItem.some(l => /^Ace · Meeting deleted/.test(l)) && R2.allItem.some(l => /^Ace · Meeting added/.test(l)) && R2.allItem.some(l => l === 'Ace · 8/10 ' + l.slice(-5)) , R2.allItem.slice(0, 14)],
  ['All changes by Who: Ace has a heading of his own with 1 change', R2.allWho.some(l => /^Ace · 1 change/.test(l)), R2.allWho.filter(l => /Ace|Saber ·/.test(l)).slice(0, 8)],
  ['To go out: the pair still waiting is ONE item (2 people)', shared(R2.togo).length === 1 && sep(R2.togo).length === 0, R2.togo],
], [R2.picAllItem, R2.picAllWho, R2.picTogo], { R2: { allItem: R2.allItem, allWho: R2.allWho, togo: R2.togo, tabs: R2.tabs, new: R2.new } })

// 3. AL1
await H.toEdit(page); await H.showDay(page, DI)
await H.signDay(page, DI); const pu1 = await H.publishAL(page, DI)
const h3 = await H.head(page, DI)
const R3 = await readAll('3-after-AL1')
H.judge('X-11 (3) amendment AL1', 'signed and published AL1 (carrying Ranger and Drifter; Ace already out); read the tabs', [
  ['AL1 was published', pu1.pressed === true && /AL1/.test(h3.tag), { pu1, tag: h3.tag }],
  ['All changes by Item: still ONE shared item with its names', shared(R3.allItem).length >= 1 && ['Ranger', 'Drifter'].every(n => R3.allItem.some(l => l.startsWith(n + ' · Meeting added'))), R3.allItem.slice(0, 16)],
  ['All changes by Who: Ace still has his own line', R3.allWho.some(l => /^Ace · 1 change/.test(l)), R3.allWho.filter(l => /Ace/.test(l))],
  ['To go out is empty', /Nothing is waiting/.test(R3.togo.join(' ')), R3.togo],
], [R3.picAllItem, R3.picAllWho, R3.picTogo], { R3: { allItem: R3.allItem, allWho: R3.allWho, togo: R3.togo, tabs: R3.tabs } })

// 4. delete the remaining group (Saber, admin)
await H.inputsMonth(page, 2026, 7)
const t4 = await H.openBar(page, /\+1/)
await page.click('#inpEditDel'); await H.sleep(400)
const ask = await page.locator('[data-testid="inped-delall"]').innerText().catch(() => '')
await H.pic(page, '4b-delall-ask')
await page.locator('[data-testid="inped-delall-yes"]').click(); await H.sleep(800)
const g4 = await grpNow()
const R4 = await readAll('4-deleted')
H.judge('X-11 (4) deletion', 'Saber deleted the remaining shared input ("Delete this input for all 2 people?") on the amended day; read the tabs', [
  ['the question named both people', /all 2 people/.test(ask), ask],
  ['no X11 input is left', g4.length === 0, g4.length],
  ['All changes by Item: the deleted group keeps its title and the names, each "deleted" line', shared(R4.allItem).length >= 1 && ['Ranger', 'Drifter'].every(n => R4.allItem.some(l => l.startsWith(n + ' · Meeting deleted'))), R4.allItem.slice(0, 20)],
  ['To go out: the deletion is ONE shared item', shared(R4.togo).length === 1 && sep(R4.togo).length === 0, R4.togo],
  ['All changes by Who: Saber\'s deletion lines carry the group title', R4.allWho.filter(l => /^Input · Meeting · \d people/.test(l)).length >= 2, R4.allWho.slice(0, 20)],
], [R4.picAllItem, R4.picAllWho, R4.picTogo], { R4: { allItem: R4.allItem, allWho: R4.allWho, togo: R4.togo, tabs: R4.tabs, t4 } })

// 5. jumps: from the deleted group's lines and from an unrelated surviving input
async function lineKinds() {
  return page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return [...w.querySelectorAll('button[title="Go to this change"], .still[title]')].map(e => ({ tag: e.tagName, still: e.classList.contains('still'), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) })) })
}
async function snapState() { return page.evaluate(() => ({ cp: window.CURPAGE, sb: !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0, sbday: window.SBDAY, ed: (() => { const e = document.querySelector('[data-testid="win-inputedit"]'); return e ? e.querySelector('.win-ttl').innerText : null })(), flash: document.querySelectorAll('.flash, .jumpflash, .chg-flash, .hlflash').length })) }
await H.toEdit(page); await H.showDay(page, DI)
await H.changesWin(page, DI); await H.changesTab(page, 'To go out')
const kindsTogo = await lineKinds()
const s0 = await snapState()
const tg = page.locator('.chgwin:not([hidden]) button[title="Go to this change"], .chgwin:not([hidden]) .still[title]').first()
let afterTogo = 'no line'
if (await tg.count()) { await tg.click(); await H.sleep(900); afterTogo = await snapState() }
await H.pic(page, '5-jump-togo')
await H.changesWin(page, DI); await H.changesTab(page, 'All changes')
const kindsAll = await lineKinds()
const delLine = page.locator('.chgwin:not([hidden]) button[title="Go to this change"], .chgwin:not([hidden]) .still[title]', { hasText: /Ranger · Meeting deleted/ }).first()
let afterDel = 'no line'; let delKind = null
if (await delLine.count()) { delKind = await delLine.evaluate(e => ({ tag: e.tagName, still: e.classList.contains('still') })); await delLine.click(); await H.sleep(900); afterDel = await snapState() }
await H.pic(page, '5b-jump-deleted')
const jumpOK = typeof afterDel === 'string' || !afterDel.ed || !/Appointment|OD|OL|OIL|ATT|OML|LL/.test(afterDel.ed)
H.judge('X-11 (5) jumps', 'in the changes window pressed the first To go out item, then the "Ranger · Meeting deleted" line of the deleted group; read where the view went', [
  ['the lines exist (To go out / All changes)', kindsTogo.length > 0 && kindsAll.length > 0, { togo: kindsTogo.slice(0, 5), all: kindsAll.length }],
  ['the deleted group\'s line did not open an unrelated surviving input\'s editor', jumpOK, { delKind, afterDel }],
  ['the To go out jump went to the day / row (a place on the schedule)', typeof afterTogo === 'object' && (afterTogo.sb || afterTogo.cp === 'editsched'), { s0, afterTogo }],
], [], { kindsTogo: kindsTogo.slice(0, 8), kindsAll: kindsAll.slice(0, 10), s0, afterTogo, delKind, afterDel })

// 6. AL2
await H.toEdit(page); await H.showDay(page, DI)
const h6a = await H.head(page, DI)
await H.signDay(page, DI); const pu2 = await H.publishAL(page, DI)
const h6 = await H.head(page, DI)
const R6 = await readAll('6-after-AL2')
H.judge('X-11 (6) amendment AL2', 'published AL2 (the deletion) and read the tabs', [
  ['AL2 was published', pu2.pressed === true && /AL2/.test(h6.tag), { pu2, tag: h6.tag, before: h6a.pending }],
  ['All changes by Item still holds the group\'s item with all its lines', shared(R6.allItem).length >= 1 && ['Ranger', 'Drifter'].every(n => R6.allItem.some(l => l.startsWith(n + ' · Meeting deleted')) && R6.allItem.some(l => l.startsWith(n + ' · Meeting added'))), R6.allItem.slice(0, 20)],
  ['Ace\'s own line is still his', R6.allWho.some(l => /^Ace · 1 change/.test(l)), R6.allWho.filter(l => /Ace/.test(l))],
  ['To go out is empty', /Nothing is waiting/.test(R6.togo.join(' ')), R6.togo],
], [R6.picAllItem, R6.picAllWho, R6.picTogo], { R6: { allItem: R6.allItem, allWho: R6.allWho, togo: R6.togo, tabs: R6.tabs } })
console.log('ERRORS', errors)
H.save('x11', { errors })
await browser.close()
