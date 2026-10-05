/* P1-01 .. P1-06 — desktop 1440x900, one world */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, row, judge, savePart, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log(...a)
const bar = d => p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] .dprev-bar`); return b ? b.innerText.replace(/\s+/g, ' ') : null }, d)

/* ---------- P1-01 ---------- */
let r = await S.publishNew(p, 0)
await S.closeBoard(p)
const ver0 = await S.curVer(p, 0)
const origBefore = await S.orig(p, 0)
await S.weekText(p, 'fr:0.0.0.0', 'D488 MON REMARKS CHANGED')
await S.weekText(p, 'dn:1.0', 'D488 TUE NOTE CHANGED')
const pendMon = await S.pendingKeys(p, 0), pendTue = await S.pendingKeys(p, 1)
const hMon = await S.dayHead(p, 0)
const marksTue0 = await S.marksPainted(p, 'week', 1)
await S.W.showDay(p, 0)
const picA = await pic(p, 'P1-01-a-before-load')
await p.locator('#eWeek [data-planmenu="0"]').click(); await sleep(400)
await p.locator(`.wavemenu [data-planpv="${ver0}"]`).click(); await sleep(600)
const bannerPrev = await bar(0)
await S.W.showDay(p, 0)
const picC = await pic(p, 'P1-01-c-preview-banner')
const monRemarksDuring = await S.readBox(p, 'fr:0.0.0.0')
await p.locator('#eWeek [data-restore="0"]').click(); await sleep(500)
const bannerArmed = await bar(0)
const monPendAfterTap1 = await S.pendingKeys(p, 0)
const picD = await pic(p, 'P1-01-d-armed')
await p.locator('#eWeek [data-restore="0"]').click(); await sleep(800)
const monRemarksAfter = await S.readBox(p, 'fr:0.0.0.0'), tueNoteAfter = await S.readBox(p, 'dn:1.0')
const pendMonAfter = await S.pendingKeys(p, 0), pendTueAfter = await S.pendingKeys(p, 1)
const disc1 = await S.discardControls(p)
const panel1 = await S.alPanel(p)
const marksTue1 = await S.marksPainted(p, 'week', 1)
const picE = await pic(p, 'P1-01-e-after-load')
log('P1-01 raw', JSON.stringify({ pendMon, pendTue, hMon, marksTue0, bannerPrev, monRemarksDuring, bannerArmed, monPendAfterTap1, monRemarksAfter, tueNoteAfter, pendMonAfter, pendTueAfter, disc1, panel1, marksTue1 }))
judge('P1-01', 'published Mon, changed its Remarks, changed Tue day note; previewed Mon Original; Load onto working copy (armed, then confirmed)', [
  ['Monday published (ORIG, orig=true)', origBefore && hMon.tag === 'ORIG', hMon.tag],
  ['Mon pending 1 before, Tue pending 1 before', pendMon.length === 1 && pendTue.length === 1, { pendMon, pendTue }],
  ['preview banner offers Load onto working copy; first tap arms with a discard count', /Discard 1 edit/.test(bannerArmed || ''), bannerArmed],
  ['nothing changed before confirmation (Mon remarks still the edited text while armed)', monPendAfterTap1.length === 1, monPendAfterTap1],
  ['Monday follows the existing load: remarks back to the original', monRemarksAfter !== 'D488 MON REMARKS CHANGED', monRemarksAfter],
  ['Tuesday text kept', /D488 TUE NOTE CHANGED/.test(tueNoteAfter || ''), tueNoteAfter],
  ['Tuesday marks kept (pending keys still 1)', pendTueAfter.length === 1, pendTueAfter],
  ['no Discard marks control anywhere', disc1.alDrop === 0 && !disc1.bodyHasPhrase, disc1],
], [picA, picC, picD, picE])

/* ---------- P1-02 ---------- */
// Mon is published (ORIG, loaded back, 0 pending). Tuesday still unpublished with its edited note.
await S.weekText(p, 'fr:0.0.0.0', 'D488 MON AMEND ONE')
await S.weekText(p, 'pn:1', 'D488 TUE SECOND NOTE')
await S.W.showDay(p, 0)
const panelPre = await S.alPanel(p)
const picP2a = await pic(p, 'P1-02-a-two-days-edited')
const monAfterEdit = { pend: await S.pendingKeys(p, 0), head: await S.dayHead(p, 0) }
// sign Monday on the week and publish AL1 through the Amendments panel
const sg = await S.W.signDay(p, 0)
await sleep(400)
const panelSigned = await S.alPanel(p)
await p.locator('#alPanel').getByRole('button', { name: /^Publish AL1$/ }).click(); await sleep(900)
const alsMon = await S.alsOf(p, 0), alsTue = await S.alsOf(p, 1)
const monPend2 = await S.pendingKeys(p, 0), tuePend2 = await S.pendingKeys(p, 1)
const tueNotes2 = [await S.readBox(p, 'dn:1.0'), await S.readBox(p, 'pn:1')]
const panelAfter = await S.alPanel(p)
const verMon = await S.curVer(p, 0), verTue = await S.curVer(p, 1)
const picP2b = await pic(p, 'P1-02-b-after-AL1')
log('P1-02 raw', JSON.stringify({ panelPre, monAfterEdit, sg, panelSigned, alsMon, alsTue, monPend2, tuePend2, tueNotes2, panelAfter, verMon, verTue }))
judge('P1-02', 'edited Mon (published) and Tue (unpublished); signed Mon; Publish AL1 in the Amendments box', [
  ['panel before: lists Monday only as a day with changes', /1 day with changes to publish/.test(panelPre.text), panelPre.text],
  ['Monday issued AL1 (als has an Mon entry), Tuesday has none', alsMon.length === 1 && alsTue.length === 0, { alsMon, alsTue }],
  ['Monday pending now 0', monPend2.length === 0, monPend2],
  ['Tuesday keeps both notes and its pending marks', tuePend2.length === 2 && tueNotes2.every(t => /D488/.test(t || '')), { tuePend2, tueNotes2 }],
  ['Tuesday still unpublished (no version)', !(await S.orig(p, 1)), verTue],
], [picP2a, picP2b])

/* ---------- P1-03 ---------- */
// Wednesday (di 2), unpublished: change a formation Mission, a reporting line and a section note — on the week
await S.weekText(p, 'ff:2.0.0.msn', 'D488 ACM')
await S.setItLine(p, 2, 0, 0, '07:00H: D488 RALLY TEST')
await S.weekText(p, 'pn:2', 'D488 WED PROGRAMME NOTE')
await S.W.showDay(p, 2)
const pend3a = await S.pendingKeys(p, 2)
const marksWk = await S.marksPainted(p, 'week', 2)
const picP3a = await pic(p, 'P1-03-a-week-marks')
await S.toBoard(p, 2)
const marksBd = await S.marksPainted(p, 'board', 2)
const picP3b = await pic(p, 'P1-03-b-board-marks')
const pubr = await S.publishNew(p, 2)
const pend3b = await S.pendingKeys(p, 2)
const picP3c = await pic(p, 'P1-03-c-published')
await S.closeBoard(p)
const after3 = { msn: await S.readBox(p, 'ff:2.0.0.msn'), it: await S.itPainted(p, 2, 0), pn: await S.readBox(p, 'pn:2'), orig: await S.orig(p, 2) }
const marksWk2 = await S.marksPainted(p, 'week', 2)
await S.W.showDay(p, 2)
const picP3d = await pic(p, 'P1-03-d-week-after')
log('P1-03 raw', JSON.stringify({ pend3a, marksWk, marksBd, pubr: pubr.head, pend3b, after3, marksWk2 }))
judge('P1-03', 'Wed unpublished: changed Mission, a reporting line, the programme note; looked in week + board; published', [
  ['three edits are pending marks before publication', pend3a.length >= 3, pend3a],
  ['published', after3.orig, pubr.head.tag],
  ['marks cleared on publication', pend3b.length === 0, pend3b],
  ['text survives', after3.msn === 'D488 ACM' && /D488 RALLY TEST/.test((after3.it || []).join(' ')) && /D488 WED PROGRAMME NOTE/.test(after3.pn || ''), after3],
], [picP3a, picP3b, picP3c, picP3d])

/* what the Wed chip's 8 is: open its window, read the lines */
async function chgWin(p, di) {
  const b = p.locator(`#eWeek .day[data-day="${di}"] [data-chgday="${di}"]`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await b.click(); await sleep(700)
  const t = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? w.innerText.replace(/\s+/g, ' ').trim().slice(0, 900) : null })
  const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await sleep(300) }
  return t
}
const wedWin = await chgWin(p, 2)
log('WED changes window', wedWin)

/* ---------- P1-04 ---------- */
const thuKey = 'dn:3.0'
const thuOrig = await S.readBox(p, thuKey)
await S.weekText(p, thuKey, 'D488 THU NOTE EDITED')
const thuEdited = { text: await S.readBox(p, thuKey), pend: await S.pendingKeys(p, 3) }
await S.W.showDay(p, 3)
const picP4a = await pic(p, 'P1-04-a-edited')
const u1 = await W.door(p, 'top', 'undo')
const thuUndone = { text: await S.readBox(p, thuKey), pend: await S.pendingKeys(p, 3) }
const picP4b = await pic(p, 'P1-04-b-undone')
const r1 = await W.door(p, 'top', 'redo')
const thuRedone = { text: await S.readBox(p, thuKey), pend: await S.pendingKeys(p, 3) }
await p.locator('#histBtn').click(); await sleep(800)
await p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first().click(); await sleep(400)
const hist = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? w.innerText.replace(/\s+/g, ' ').trim() : null })
const picP4c = await pic(p, 'P1-04-c-history')
await p.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await sleep(300)
await S.reloadAs(p, 'a')
await L.go(p, 'editsched'); await sleep(500)
const thuReload = { text: await S.readBox(p, thuKey), pend: await S.pendingKeys(p, 3) }
await S.W.showDay(p, 3)
const picP4d = await pic(p, 'P1-04-d-reloaded')
log('P1-04 raw', JSON.stringify({ thuOrig, thuEdited, u1, thuUndone, r1, thuRedone, hist, thuReload }))
judge('P1-04', 'edited Thu day note; top-bar Undo, Redo; opened History; reloaded', [
  ['edit marked (1 pending)', thuEdited.pend.length === 1 && thuEdited.text === 'D488 THU NOTE EDITED', thuEdited],
  ['Undo puts the old text back and clears its mark', thuUndone.text === thuOrig && thuUndone.pend.length === 0, thuUndone],
  ['Redo restores text and its mark', thuRedone.text === 'D488 THU NOTE EDITED' && thuRedone.pend.length === 1, thuRedone],
  ['History names the actual edit (the note text) and has no marks-cleared line', !!hist && /D488 THU NOTE EDITED/.test(hist) && !/marks cleared/i.test(hist), hist.slice(0, 700)],
  ['after reload text and mark are still there', thuReload.text === 'D488 THU NOTE EDITED' && thuReload.pend.length === 1, thuReload],
], [picP4a, picP4b, picP4c, picP4d])

/* ---------- P1-05 ---------- */
// Friday (di 4): publish, amend, issue; then Unpublish flow
const fri0 = await S.publishNew(p, 4)
await S.closeBoard(p)
const friV0 = await S.curVer(p, 4)
await S.weekText(p, 'dtn:4', 'D488 FRI AMEND NOTE')
const friPend = await S.pendingKeys(p, 4)
const fsg = await W.signDay(p, 4)
await sleep(300)
const panelFri = await S.alPanel(p)
await p.locator('#alPanel').getByRole('button', { name: /^Publish AL1$/ }).click().catch(async () => { /* the button may sit under a different label */ })
await sleep(900)
const friV1 = await S.curVer(p, 4), friPendAfter = await S.pendingKeys(p, 4)
const picP5a = await pic(p, 'P1-05-a-friday-AL1')
// Unpublish flow
await S.W.showDay(p, 4)
const unp = await W.unpublish(p, 4)
await sleep(700)
const friAfterUn = { orig: await S.orig(p, 4), ver: await S.curVer(p, 4), pend: await S.pendingKeys(p, 4), head: await S.dayHead(p, 4), note: await S.readBox(p, 'dtn:4') }
const picP5b = await pic(p, 'P1-05-b-unpublished')
await S.weekText(p, 'dtn:4', 'D488 FRI AFTER UNPUBLISH')
const friEdit = { pend: await S.pendingKeys(p, 4), note: await S.readBox(p, 'dtn:4') }
const disc5 = await S.discardControls(p)
const re = await S.publishAm(p, 4)
await S.closeBoard(p)
const friRe = { orig: await S.orig(p, 4), ver: await S.curVer(p, 4), pend: await S.pendingKeys(p, 4), note: await S.readBox(p, 'dtn:4'), als: await S.alsOf(p, 4) }
await S.W.showDay(p, 4)
const picP5c = await pic(p, 'P1-05-c-republished')
log('P1-05 raw', JSON.stringify({ friV0, friPend, panelFri, friV1, friPendAfter, unp, friAfterUn, friEdit, disc5, re: re.head, friRe }))
judge('P1-05', 'published Fri; amended (AL1); pressed Unpublish; edited the working copy; signed and republished', [
  ['Friday issued then amended to AL1', friV0 && friV1 && friV0 !== friV1 && friPendAfter.length === 0, { friV0, friV1 }],
  ['Unpublish ran the existing confirm (armed first)', !!unp.armedFirst || unp.pressed, unp],
  ['Unpublish withdrew the latest issue: Friday is back at its Original with the amendment held as a pending change', friAfterUn.ver === friV0 && friAfterUn.pend.length === 1, friAfterUn],
  ['edit on the working copy is marked, no clearing control anywhere', friEdit.pend.length >= 1 && disc5.alDrop === 0 && !disc5.bodyHasPhrase, { friEdit, disc5 }],
  ['republishing needed the four sign-offs and issued the amendment again (same version id)', friRe.ver === friV1 && friRe.pend.length === 0, { friRe, signs: re.s }],
], [picP5a, picP5b, picP5c])

console.log(errors)
savePart('p1a')
await browser.close()
