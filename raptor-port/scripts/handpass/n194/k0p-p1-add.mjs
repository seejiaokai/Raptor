// k0p-p1-add - Part 1: "+ Add a person" on Admin → Users (K2a, built), beside its drawings, items 1-9, on the desktop
// and the phone. Hunter (142's admin, Plan of 149, View of 150) on 149, as the drawings s1-add2-a drew him.
//   node raptor-port/scripts/handpass/n194/k0p-p1-add.mjs     (ONLY=d or ONLY=p)
import { resolve } from 'node:path'
import { mk, signIn, go, pick, usersTab, FACT, closeAll, world, wait, ERRS, OUT, ring, unring, shot, boxOf, vis, look, sideBySide, toastNow, rowsOf, hit, ROOT } from './k0p-lib.mjs'
console.log('k0p-p1-add v1')
const DRAWN = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/drawn')
const R = (s, sel) => boxOf(s, sel)
const focusNow = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const c = getComputedStyle(a); return { id: a.id, tag: a.tagName, text: (a.textContent || '').trim().slice(0, 30), focusVisible: a.matches(':focus-visible'), outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor, boxShadow: c.boxShadow.slice(0, 80) } })
const formState = s => s.page.evaluate(() => { const b = document.querySelector('#accAddBlock'); return { open: !!b, opener: !!document.querySelector('#accAddOpen'), cs: document.querySelector('#accAddCs')?.value ?? null, ini: document.querySelector('#accAddIni')?.value ?? null, home: !!document.querySelector('#accAddHome') } })
const pad = (b, n = 0) => b && { x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n }
async function typeIn(s, sel, text) { const l = vis(s, sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) { await l.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(text) } else { await l.tap(); await wait(s, 300); await s.page.keyboard.type(text) } await wait(s, 250); return l.inputValue() }
async function topRow(s) {
  return { search: await R(s, '#accTop .od-find'), searchInput: await R(s, '#accFind'), filter: await R(s, '#accFilter'), opener: await R(s, '#accAddOpen'), top: await R(s, '#accTop'), panel: await R(s, '#page-admin .adm-panel, #page-admin .adm-pane') }
}
async function run(sz) {
  const s = await mk(sz, { storageState: await world() })
  const k = `p1.${sz}`
  try {
    await signIn(s, 'hunter'); FACT(`${k}.pick149`, await pick(s, 149)); await usersTab(s); await wait(s, 600)
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
    /* ---- 1. the top row, closed ---- */
    const t1 = await topRow(s); FACT(`${k}.1.topRow`, t1)
    const t = t1
    if (t.search && t.filter && t.opener) FACT(`${k}.1.oneLine`, { tops: [t.search.y, t.filter.y, t.opener.y], heights: [t.search.h, t.filter.h, t.opener.h], bottoms: [t.search.y + t.search.h, t.filter.y + t.filter.h, t.opener.y + t.opener.h], gapSearchFilter: Math.round((t.filter.x - t.search.x - t.search.w) * 10) / 10, gapFilterOpener: Math.round((t.opener.x - t.filter.x - t.filter.w) * 10) / 10, gapRowToOpener: Math.round((t.opener.y - t.search.y - t.search.h) * 10) / 10, openerVsRow: { left: t.opener.x, right: t.opener.x + t.opener.w, rowLeft: t.search.x, rowRight: t.filter.x + t.filter.w } })
    const wait1 = await R(s, '#page-admin h4.adm-sub')
    await shot(s, `p1-1-closed-${sz}`, [t.search, t.filter, t.opener, wait1], 12)
    /* ---- 8 (closed) + 2. open the form ---- */
    const searchBefore = t.search
    await hit(s, '#accAddOpen', 600)
    const st2 = await formState(s); FACT(`${k}.2.afterOpen`, st2)
    FACT(`${k}.2.focusAfterOpen`, await focusNow(s))
    const searchAfter = await R(s, '#accTop .od-find'); FACT(`${k}.2.searchWidth`, { before: searchBefore?.w, after: searchAfter?.w, filterAfter: await R(s, '#accFilter') })
    const hdAdd = await look(s, '#accAddBlock h4.adm-sub'), hdWait = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin h4.adm-sub')].find(x => /waiting/i.test(x.textContent) && x.getBoundingClientRect().width > 0); if (!e) return null; const c = getComputedStyle(e); return { text: e.textContent.trim(), fontSize: c.fontSize, fontWeight: c.fontWeight, color: c.color, letterSpacing: c.letterSpacing, textTransform: c.textTransform, fontFamily: c.fontFamily.slice(0, 40) } })
    FACT(`${k}.2.headings`, { addAPerson: hdAdd, waiting: hdWait })
    /* type Nova as the drawing did, blur, scroll top */
    FACT(`${k}.typedNova`, await typeIn(s, '#accAddCs', 'Nova'))
    await s.page.evaluate(() => document.activeElement?.blur?.()); await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    const form = await R(s, '#accAddBlock'), top2 = await R(s, '#accTop')
    FACT(`${k}.2.form`, { top: top2, form, heading: await R(s, '#accAddBlock h4.adm-sub'), cs: await R(s, '#accAddCs'), ini: await R(s, '#accAddIni'), seat: await R(s, '#accAddSeat'), cat: await R(s, '#accAddCat'), name: await R(s, '#accAddName'), postIn: await R(s, '#accAddPostIn'), note: await R(s, '#accAddNote'), add: await R(s, '#accAdd'), cancel: await R(s, '#accAddCancel') })
    /* the build cut to the drawing's part: the top row to the pair */
    const add = await R(s, '#accAdd'), cancel = await R(s, '#accAddCancel')
    const formFull = form && form.y + form.h <= s.H
    if (!formFull && !s.desk) FACT(`${k}.2.formRunsPastScreen`, { formBottom: form.y + form.h, H: s.H })
    await shot(s, `p1-2-open-${sz}`, [top2, form], 12)
    /* ---- 8. under the open form ---- */
    const sep = await s.page.evaluate(() => { const b = document.querySelector('#accAddBlock'); const n = b?.nextElementSibling; const n2 = n?.nextElementSibling; const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { tag: e.tagName, cls: e.className, text: (e.textContent || '').trim().slice(0, 30), y: Math.round(q.top), h: Math.round(q.height), w: Math.round(q.width), borderTop: getComputedStyle(e).borderTopColor + ' ' + getComputedStyle(e).borderTopWidth } }; return { after1: r(n), after2: r(n2), formBottom: Math.round(b.getBoundingClientRect().bottom) } })
    FACT(`${k}.8.underForm`, sep)
    await s.page.evaluate(() => document.querySelector('#accAddCancel').scrollIntoView({ block: 'center' })); await wait(s, 300)
    const pair = await R(s, '#accAddBlock .acc-acts'), w8 = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#page-admin h4.adm-sub')].find(x => /waiting/i.test(x.textContent) && x.getBoundingClientRect().width > 0); const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } })
    await shot(s, `p1-8-under-${sz}`, [pair, w8], 16)
    /* ---- 3. the pair, and an opened row's Save · Cancel on the same page ---- */
    const acts = await s.page.evaluate(() => { const p = document.querySelector('#accAddBlock .acc-acts'), c = getComputedStyle(p); const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left * 10) / 10, y: Math.round(q.top * 10) / 10, w: Math.round(q.width * 10) / 10, h: Math.round(q.height * 10) / 10, font: getComputedStyle(e).fontSize + ' ' + getComputedStyle(e).fontWeight, pad: getComputedStyle(e).padding, radius: getComputedStyle(e).borderRadius, bg: getComputedStyle(e).backgroundColor } }; const a = document.querySelector('#accAdd'), b = document.querySelector('#accAddCancel'); return { add: r(a), cancel: r(b), gap: Math.round((b.getBoundingClientRect().left - a.getBoundingClientRect().right) * 10) / 10, rowDisplay: c.display + ' ' + c.flexWrap + ' gap ' + c.gap } })
    FACT(`${k}.3.addPair`, acts)
    const pAdd = await R(s, '#accAddBlock .acc-acts')
    await s.page.locator('[data-person="osp9"] .acc-tap').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await wait(s, 200)
    await hit(s, s.page.locator('[data-person="osp9"] .acc-tap').first(), 700)
    const rowPair = await s.page.evaluate(() => { const sv = document.querySelector('#accEdSave'), cn = document.querySelector('#accEdCancel'); if (!sv) return null; const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left * 10) / 10, y: Math.round(q.top * 10) / 10, w: Math.round(q.width * 10) / 10, h: Math.round(q.height * 10) / 10, font: getComputedStyle(e).fontSize + ' ' + getComputedStyle(e).fontWeight, pad: getComputedStyle(e).padding, radius: getComputedStyle(e).borderRadius, bg: getComputedStyle(e).backgroundColor } }; const p = sv.parentElement, c = getComputedStyle(p); return { save: r(sv), cancel: r(cn), gap: Math.round((cn.getBoundingClientRect().left - sv.getBoundingClientRect().right) * 10) / 10, rowDisplay: c.display + ' ' + c.flexWrap + ' gap ' + c.gap, others: [...p.querySelectorAll('button')].map(b => b.textContent.trim()) } })
    FACT(`${k}.3.rowPair`, rowPair)
    if (rowPair) { await s.page.evaluate(() => document.querySelector('#accEdSave').scrollIntoView({ block: 'center' })); await wait(s, 200); await shot(s, `p1-3-rowpair-${sz}`, [await R(s, '#accEdSave'), await R(s, '#accEdCancel')], 14); await hit(s, '#accEdCancel', 400) }
    /* the add pair cut alone too */
    await s.page.evaluate(() => document.querySelector('#accAddCancel').scrollIntoView({ block: 'center' })); await wait(s, 200)
    await shot(s, `p1-3-addpair-${sz}`, [await R(s, '#accAdd'), await R(s, '#accAddCancel')], 14)
    /* ---- 5. Filter over the open form; the search with the form open ---- */
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
    await hit(s, '#accFilter', 500)
    const fpanel = await s.page.evaluate(() => { const p = document.querySelector('#accFilter')?.getAttribute('aria-controls'); const e = p ? document.getElementById(p) : document.querySelector('.od-fpanel, [data-testid="users-filter"]'); if (!e) return null; const q = e.getBoundingClientRect(); return { id: e.id, shown: q.width > 0, x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } })
    FACT(`${k}.5.filterOpen`, { panel: fpanel, form: await formState(s) })
    await shot(s, `p1-5-filter-open-${sz}`, [await R(s, '#accTop'), fpanel, await R(s, '#accAddBlock')].filter(Boolean), 12)
    await hit(s, '#accFilter', 500)
    FACT(`${k}.5.filterClosedByItsButton`, { panelStill: await s.page.evaluate(id => !!(id && document.getElementById(id)?.getBoundingClientRect().width), fpanel?.id), form: await formState(s) })
    FACT(`${k}.5.searchTyped`, await typeIn(s, '#accFind', 'osp'))
    FACT(`${k}.5.afterSearch`, { form: await formState(s), rows: (await rowsOf(s)).slice(0, 6) })
    await s.page.evaluate(() => document.activeElement?.blur?.()); await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
    await shot(s, `p1-5-search-${sz}`, [await R(s, '#accTop'), await R(s, '#accAddBlock')], 12)
    await typeIn(s, '#accFind', ''); if (s.desk) { await s.page.keyboard.press('Control+a'); await s.page.keyboard.press('Backspace') } else { await s.page.locator('#accFind').fill('') } await wait(s, 300)
    /* ---- 4. Cancel, reopen empty, focus ring on the opener; Escape the same; Escape with Post in's calendar ---- */
    await hit(s, '#accAddCancel', 600)
    FACT(`${k}.4.afterCancel`, { form: await formState(s), focus: await focusNow(s) })
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
    await shot(s, `p1-4-cancel-focus-${sz}`, [await R(s, '#accTop')], 14)
    await hit(s, '#accAddOpen', 500)
    FACT(`${k}.4.reopened`, await formState(s))
    await typeIn(s, '#accAddCs', 'Zulu')
    await s.page.keyboard.press('Escape'); await wait(s, 500)
    FACT(`${k}.4.afterEscape`, { form: await formState(s), focus: await focusNow(s) })
    if (s.desk) { await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200); await shot(s, `p1-4-escape-focus-${sz}`, [await R(s, '#accTop')], 14) }
    await hit(s, '#accAddOpen', 500); FACT(`${k}.4.reopened2`, await formState(s))
    await typeIn(s, '#accAddCs', 'Yank')
    await hit(s, '#accAddPostIn', 600)
    const cal1 = await s.page.evaluate(() => !!document.querySelector('[data-testid="dcal-card"]'))
    FACT(`${k}.4.calendarOpen`, cal1)
    if (cal1) await shot(s, `p1-4-postin-cal-${sz}`, [await R(s, '[data-testid="dcal-card"]'), await R(s, '#accAddPostIn')], 12)
    await s.page.keyboard.press('Escape'); await wait(s, 500)
    FACT(`${k}.4.firstEscape`, { calendar: await s.page.evaluate(() => !!document.querySelector('[data-testid="dcal-card"]')), form: await formState(s), focus: await focusNow(s) })
    await s.page.keyboard.press('Escape'); await wait(s, 500)
    FACT(`${k}.4.secondEscape`, { calendar: await s.page.evaluate(() => !!document.querySelector('[data-testid="dcal-card"]')), form: await formState(s), focus: await focusNow(s) })
    /* ---- 6. add a person on 149 (callsign, seat, CAT) ---- */
    await hit(s, '#accAddOpen', 500)
    const cs = sz === 'd' ? 'Nova' : 'Vega'
    await typeIn(s, '#accAddCs', cs)
    const seatV = await s.page.evaluate(() => [...document.querySelector('#accAddSeat').options].find(o => /pilot/i.test(o.textContent))?.value)
    await s.page.selectOption('#accAddSeat', seatV); await s.page.selectOption('#accAddCat', { index: 2 })
    FACT(`${k}.6.filled`, await s.page.evaluate(() => ({ cs: document.querySelector('#accAddCs').value, seat: document.querySelector('#accAddSeat').selectedOptions[0]?.textContent, cat: document.querySelector('#accAddCat').selectedOptions[0]?.textContent, homeBox: !!document.querySelector('#accAddHome'), addWords: document.querySelector('#accAdd').textContent })))
    await hit(s, '#accAdd', 300)
    const note6 = await toastNow(s)
    await wait(s, 500)
    FACT(`${k}.6.after`, { toast: note6, form: await formState(s), inList: (await rowsOf(s)).filter(r => r.endsWith(':' + cs)), squadron: await s.page.evaluate(() => document.querySelector('.od-head .adm-sub')?.textContent.trim()) })
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 100)
    await shot(s, `p1-6-added-${sz}`, [await R(s, '#accTop'), await R(s, '#accAddBlock'), await R(s, '#toastEl')].filter(Boolean), 12)
    const nr = s.page.locator('#page-admin .acc-row[data-person]').filter({ hasText: new RegExp('^' + cs) }).first()
    if (await nr.count()) { await nr.evaluate(e => e.scrollIntoView({ block: 'center' })); await wait(s, 300); await shot(s, `p1-6-in-list-${sz}`, [await nr.boundingBox().then(b => b && { x: b.x, y: b.y, w: b.width, h: b.height })], 30) }
    /* no Home squadron box: Hunter on 142 too */
    await hit(s, '#accAddCancel', 300).catch(() => {})
    FACT(`${k}.6.pick142`, await pick(s, 142)); await usersTab(s); await wait(s, 400)
    if (await s.page.locator('#accAddOpen').count()) await hit(s, '#accAddOpen', 500)
    FACT(`${k}.6.hunter142`, await formState(s))
    FACT(`${k}.errs`, s.errs)
  } catch (e) { FACT(`${k}.error`, String(e).slice(0, 400)); await s.page.screenshot({ path: `${OUT}/../../../../.tmp/n194-k0p/p1-${sz}-error.png` }).catch(() => {}) } finally { await s.ctx.close() }
}
/* Saber on all three: no Home squadron box; and item 7, Quals' "+ Add person" (desktop) */
async function saber() {
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'saber')
    for (const n of [142, 149, 150]) { FACT(`p1.6.saber.${n}.bar`, await pick(s, n)); await usersTab(s); await wait(s, 400); if (await s.page.locator('#accAddOpen').count()) await hit(s, '#accAddOpen', 400); FACT(`p1.6.saber.${n}`, await formState(s)); if (await s.page.locator('#accAddCancel').count()) await hit(s, '#accAddCancel', 300) }
    await pick(s, 142)
    await go(s, 'quals'); await wait(s, 700)
    await hit(s, '#qAddToggle', 900)
    FACT('p1.7.afterQualsAdd', { page: await s.page.evaluate(() => document.querySelector('.page.on')?.id), form: await formState(s), focus: await focusNow(s) })
    await shot(s, 'p1-7-from-quals-d', [await R(s, '#accTop'), await R(s, '#accAddBlock')].filter(Boolean), 12)
    FACT('p1.saber.errs', s.errs)
  } catch (e) { FACT('p1.saber.error', String(e).slice(0, 400)) } finally { await s.ctx.close() }
}
try {
  if (!process.env.ONLY || process.env.ONLY === 'd') await run('d')
  if (!process.env.ONLY || process.env.ONLY === 'p') await run('p')
  if (!process.env.ONLY || process.env.ONLY === 's') await saber()
} finally { FACT('errors', ERRS); await closeAll() }
