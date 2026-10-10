// Walker C, script 6 — 49 (Saber, phone 390 + desktop opened day) and 51 (Ranger on a phone)
import * as L from './ivet-C-lib.mjs'
import { stored, norm } from './ivet-C-4lib.mjs'
import { writeFileSync } from 'node:fs'
const PNG = L.SCR + '/c51-doc.png'
writeFileSync(PNG, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'))

/* a measuring function: the boxes of a card's parts and any overlap between them */
const parts = (scope) => `(() => {
  const root = ${scope}; if (!root) return null
  const rr = root.getBoundingClientRect()
  const els = [...root.querySelectorAll('[data-testid], .latetag, .intag, .innew')].filter(e => e.textContent.trim() && !e.querySelector('[data-testid]'))
  const items = els.map(e => { const rg = document.createRange(); rg.selectNodeContents(e); const rects = [...rg.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5); return { k: e.getAttribute('data-testid') || e.className, text: e.textContent.slice(0, 50), rects, lines: new Set(rects.map(r => Math.round(r.top))).size } })
  const hit = (a, b) => a.rects.some(x => b.rects.some(y => x.right > y.left + 1.5 && x.left < y.right - 1.5 && x.bottom > y.top + 1.5 && x.top < y.bottom - 1.5))
  const overlaps = []
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (hit(items[i], items[j])) overlaps.push(items[i].k + ' x ' + items[j].k)
  const outside = items.filter(it => it.rects.some(r => r.left < rr.left - 1 || r.right > rr.right + 1)).map(i => i.k)
  return { w: Math.round(rr.width), h: Math.round(rr.height), parts: items.map(i => ({ k: i.k, text: i.text, lines: i.lines })), overlaps, outside, scrollOK: root.scrollWidth <= root.clientWidth + 1, pageOK: document.documentElement.scrollWidth <= innerWidth }
})()`

if (!process.env.ONLY51) {
{
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', true, { fresh: false })
  const PPL = ['Widget', 'Otter', 'Marlin', 'Nomad', 'Torch', 'Piston', 'Reaper', 'Ridge', 'Trident', 'Vandal', 'Comet', 'Cobra', 'Bolt', 'Forge']
  await L.step('49', 'phone 390 (list card + opened day) and desktop opened day', 'Saber', async () => {
    await L.toList(page, true)
    const TITLE = 'C49 Squadron photograph and full dress briefing for the whole detachment before the annual inspection'
    const RMK = 'Bring dress uniform, hats, ID cards and the signed forms; meet outside the main hangar and wait for the photographer to call each flight in turn'
    const made = await L.fileInput(page, { type: 'Event', people: PPL, from: '2026-07-30', timed: ['09:15', '11:45'], title: TITLE, rmk: RMK }, true)
    if (made.length !== 14) throw new Error(`the 14-person input saved as ${made.length}: ${await L.toast(page)}`)
    const iid = made[0].iid
    const sv = await stored(page, iid)
    // the phone list card
    await L.toList(page, true); await page.evaluate(() => window.scrollTo(0, 0))
    const cardLoc = page.locator(`[data-testid^="inl-row-"]`).filter({ hasText: 'C49' }).first()
    await cardLoc.scrollIntoViewIfNeeded()
    const cardInfo = await page.evaluate(`(() => { const want = window.INPUTS.find(r => r.iid === ${JSON.stringify(iid)}); const c = [...document.querySelectorAll('[data-testid^="inl-row-"]')].find(t => { const r = window.INPUTS.find(x => 'inl-row-' + x.iid === t.getAttribute('data-testid')); return r && r.grp === want.grp }); window.__c49 = c; return c ? 1 : 0 })()`)
    const m = await page.evaluate(parts('window.__c49'))
    const kind = await page.evaluate(() => { const k = window.__c49.querySelector('[data-testid="inl-kind"]'); const cs = getComputedStyle(k); return { text: k.textContent, tt: cs.textTransform, color: cs.color, bg: cs.backgroundColor, radius: cs.borderTopLeftRadius, fs: cs.fontSize, pill: !!window.__c49.querySelector('.intag') } })
    const who = await page.evaluate(() => window.__c49.querySelector('[data-testid="inl-who"]').textContent)
    const pic1 = await L.shot(page, '49-phone-list-card')
    await cardLoc.screenshot({ path: `${L.OUT}/49-phone-list-card-crop.png` })
    // the opened day on the phone
    await L.openDay(page, '2026-07-30', true)
    const dayPhone = await page.evaluate(`(() => { const want = window.INPUTS.find(r => r.iid === ${JSON.stringify(iid)}); const c = [...document.querySelectorAll('[data-testid^="idy-row-"]')].find(t => { const r = window.INPUTS.find(x => 'idy-row-' + x.iid === t.getAttribute('data-testid')); return r && r.grp === want.grp }); window.__d49 = c; return c ? c.innerText.replace(/\\s+/g, ' ') : null })()`)
    const md = await page.evaluate(parts('window.__d49'))
    const kindD = await page.evaluate(() => { const k = window.__d49.querySelector('[data-testid="idy-kind"], .idy-kind, .icard-kind'); return k ? { cls: k.className, tt: getComputedStyle(k).textTransform, bg: getComputedStyle(k).backgroundColor } : null })
    const pic2 = await L.shot(page, '49-phone-day')
    await page.keyboard.press('Escape')
    // desktop opened day
    const dtw = await L.twin(ctx, L.DESK, 'ad', 'a', false)
    await L.openDay(dtw.page, '2026-07-30', false)
    const dayDesk = await dtw.page.evaluate(`(() => { const want = window.INPUTS.find(r => r.iid === ${JSON.stringify(iid)}); const c = [...document.querySelectorAll('[data-testid^="idy-row-"]')].find(t => { const r = window.INPUTS.find(x => 'idy-row-' + x.iid === t.getAttribute('data-testid')); return r && r.grp === want.grp }); window.__d49 = c; return c ? c.innerText.replace(/\\s+/g, ' ') : null })()`)
    const mk = await dtw.page.evaluate(parts('window.__d49'))
    const pic3 = await L.shot(dtw.page, '49-desk-day')
    await dtw.ctx.close()
    console.log('49', JSON.stringify({ sv, who, m, kind, dayPhone, md, dayDesk, mk, kindD }))
    const problems = []
    const want = [...PPL].sort((a, b) => a.localeCompare(b)).join(', ')
    if (who !== want) problems.push(`list card names "${who}"`)
    if (m.overlaps.length) problems.push('list card parts overlap: ' + m.overlaps.join(', '))
    if (m.outside.length) problems.push('list card parts outside the card: ' + m.outside.join(', '))
    if (!m.pageOK) problems.push('phone page wider than the screen')
    if (kind.pill || kind.bg !== 'rgba(0, 0, 0, 0)' || kind.tt !== 'uppercase') problems.push('the list card kind is not small grey capitals without a pill: ' + JSON.stringify(kind))
    for (const [lbl, mm] of [['phone opened day', md], ['desktop opened day', mk]]) { if (!mm) problems.push(lbl + ': card not found'); else { if (mm.overlaps.length) problems.push(lbl + ' overlaps: ' + mm.overlaps.join(', ')); if (mm.outside.length) problems.push(lbl + ' outside: ' + mm.outside.join(', ')) } }
    for (const [lbl, t] of [['phone day', dayPhone], ['desktop day', dayDesk]]) if (!t || !want.split(', ').every(n => t.includes(n))) problems.push(`${lbl} card does not name all 14`)
    L.rec('49', 'phone 390 (list + opened day) and desktop opened day', 'Saber', problems.length ? 'FAIL' : 'PROVISIONAL', problems.length ? problems.join('; ') : `14-person timed Event (09:15–11:45) with a ${TITLE.length}-char title and ${RMK.length}-char remark: list card ${m.w}×${m.h}px, names wrap on ${m.parts.find(p => p.k === 'inl-who')?.lines} lines, title ${m.parts.find(p => p.k === 'inl-title')?.lines} lines, remark ${m.parts.find(p => p.k === 'inl-rmk')?.lines} lines; no part overlaps another or leaves the card; kind "${kind.text}" is ${kind.tt} grey text, no pill (look at the pictures)`, [pic1, '49-phone-list-card-crop.png', pic2, pic3])
  })
  L.savePartial('6a')
  await ctx.close()
}

}
/* 51 */
{
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', true, { fresh: false })
  await L.step('51', 'phone', 'Ranger (member)', async () => {
    await L.toList(page, true)
    const ord = await L.fileInput(page, { type: 'Appointment', person: 'Saber', from: '2026-08-03', title: 'C51 ordinary', rmk: 'C51 Saber own appointment' }, true)
    // a medical input with a document, attached through the window's own Document control, by Saber for himself
    const had = await L.ids(page)
    await L.plus(page, true)
    await page.selectOption('#inpEditType', 'OML'); await page.selectOption('#inpEditPerson', await L.csId(page, 'Saber'))
    await L.pick(page, '2026-08-10', true)
    await page.locator(`${L.WIN} input[type=file]`).setInputFiles(PNG)
    await page.waitForTimeout(400)
    const chip = await page.locator(`${L.WIN} .docchip`).count()
    await page.locator('#inpEditSave').tap(); await page.waitForTimeout(500)
    if (await page.locator('[data-testid="docconf"]').count()) await page.locator('[data-testid="docconf-nodoc"]').tap()
    await page.locator(L.WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    const med = await L.newest(page, had)
    if (!ord[0] || !med[0] || !med[0].docs) throw new Error(`setup: ordinary ${ord.length}, medical ${med.length} docs ${med[0]?.docs} chips ${chip} toast ${await L.toast(page)}`)
    // now Ranger, same world
    await L.reSignIn(page, 'us', 'us')
    await L.toList(page, true)
    await page.locator('#inFiltersBtn').tap(); await page.selectOption('#inFPerson', 'all'); await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(300)
    const snap0 = await page.evaluate(() => JSON.stringify(window.INPUTS.map(r => [r.iid, r.remarks, r.title, r.date, r.endDate, r.type])))
    const open = async iid => { const c = page.locator(`[data-testid="inl-row-${iid}"]`); await c.scrollIntoViewIfNeeded(); await c.tap(); await page.locator(L.WIN).waitFor() }
    const state = () => page.evaluate(() => {
      const w = document.querySelector('[data-testid="win-inputedit"]'); const q = s => w.querySelector(s)
      const body = q('.inped-body')
      const foot = [...w.querySelectorAll('.airpop-foot button, .airpop-foot a')].map(b => b.textContent.trim() + (b.id ? '#' + b.id : ''))
      return { title: q('.win-ttl')?.textContent, ro: q('[data-testid="inped-ro"]')?.textContent || '', inert: !!body?.hasAttribute('inert'), save: !!q('#inpEditSave'), del: !!q('#inpEditDel'), foot, placed: q('[data-testid="inped-placed"]')?.textContent || '', help: !!q('#inTypeHelp'), docview: !!q('[data-testid="inped-docview"]'), rmk: q('#inpEditRmk')?.value, ttl: q('#inpEditOwnTitle')?.value, type: q('#inpEditType')?.value ?? q('#inpEditTypeFixed')?.textContent, hint: q('.inped-hint')?.textContent || '' }
    })
    // 1 the ordinary input
    await open(ord[0].iid)
    const s1 = await state()
    const pic1 = await L.shot(page, '51-phone-ordinary')
    // try to type into its fields (must not change)
    await page.locator('#inpEditRmk').fill('EDITED BY RANGER', { force: true, timeout: 1500 }).catch(() => {})
    const rmkAfter = await page.inputValue('#inpEditRmk').catch(() => null)
    let helpTry = null
    if (s1.help) {
      await page.locator('#inTypeHelp').tap({ timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(300)
      helpTry = { pop: await page.locator('#inTypePop').count(), winStill: await page.locator(L.WIN).count() }
      var pic1b = await L.shot(page, '51-phone-ordinary-help')
      await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    }
    if (await page.locator(L.WIN).count()) { const close = page.locator('#inpEditCancel, [data-testid="win-inputedit"] button[aria-label="Close"]').first(); await close.tap().catch(() => {}) }
    await page.waitForTimeout(250)
    // 2 the medical input with a document
    await open(med[0].iid)
    const s2 = await state()
    const pic2 = await L.shot(page, '51-phone-medical')
    const before = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')))
    let docOpen = null, pic3 = null
    if (s2.docview) {
      await page.locator('[data-testid="inped-docview"]').tap(); await page.waitForTimeout(600)
      const after = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')))
      const added = after.filter(x => !before.includes(x))
      const imgs = await page.evaluate(() => [...document.querySelectorAll('img, iframe, embed, object')].filter(e => e.getClientRects().length).map(e => ({ tag: e.tagName, w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height), src: (e.currentSrc || e.src || '').slice(0, 30) })))
      pic3 = await L.shot(page, '51-phone-document')
      docOpen = { added, imgs }
      await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    }
    if (await page.locator(L.WIN).count()) { await page.locator('#inpEditCancel').tap().catch(() => {}); await page.waitForTimeout(200) }
    // 3 the help through a fresh + Input
    await L.plus(page, true)
    const h = await page.locator('#inTypeHelp').count()
    let fresh = null
    if (h) { await page.locator('#inTypeHelp').tap(); await page.locator('#inTypePop').waitFor({ timeout: 2000 }).catch(() => {}); fresh = { pop: await page.locator('#inTypePop').count(), text: ((await page.locator('#inTypePop').textContent().catch(() => '')) || '').slice(0, 60) } }
    const pic4 = await L.shot(page, '51-phone-fresh-help')
    await page.keyboard.press('Escape'); await page.waitForTimeout(150)
    await page.locator('#inpEditCancel').tap().catch(() => {}); await page.waitForTimeout(200)
    const snap1 = await page.evaluate(() => JSON.stringify(window.INPUTS.map(r => [r.iid, r.remarks, r.title, r.date, r.endDate, r.type])))
    console.log('51', JSON.stringify({ s1, rmkAfter, helpTry, s2, docOpen, fresh, unchanged: snap0 === snap1 }))
    const problems = []
    for (const [lbl, s] of [['ordinary', s1], ['medical', s2]]) {
      if (s.save) problems.push(`${lbl}: a Save button is offered`)
      if (s.del) problems.push(`${lbl}: a Delete button is offered`)
      if (!/can change this/.test(s.ro)) problems.push(`${lbl}: no read-only line (reads "${s.ro}")`)
      if (!/Placed by Saber/.test(s.placed)) problems.push(`${lbl}: the placed-by stamp reads "${s.placed}"`)
    }
    if (rmkAfter !== s1.rmk) problems.push(`the Remarks box changed to "${rmkAfter}" after typing`)
    if (!s2.docview) problems.push('medical: no way to open the document is offered')
    else if (!docOpen || !docOpen.imgs.length) problems.push('medical: pressing the paperclip showed no document: ' + JSON.stringify(docOpen))
    if (snap0 !== snap1) problems.push('the saved inputs changed while Ranger looked')
    if (!s1.help && !(fresh && fresh.pop)) problems.push('the "?" help cannot be read anywhere')
    L.rec('51', 'phone', 'Ranger (member)', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `Saber-owned ordinary input opens read-only: "${s1.ro}", no Save, no Delete, stamp "${s1.placed}", typing into Remarks changed nothing; "?" help in the read-only window: ${s1.help ? 'drawn, pressing it ' + JSON.stringify(helpTry) : 'NOT drawn'}; fresh + Input "?" ${fresh ? 'opens the card' : 'absent'}. Medical input with a document: read-only "${s2.ro}", paperclip ${s2.docview ? 'present and opens the viewer (' + JSON.stringify(docOpen?.imgs) + ')' : 'absent'}; nothing saved changed.`, [pic1, pic1b, pic2, pic3, pic4].filter(Boolean))
  })
  L.savePartial('6b')
  await ctx.close()
}
console.log('errors:', L.errs)
await L.browser.close()
