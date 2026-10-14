/* W1 shared fixtures and readers (walker's own helper) */
import * as L from '../../dl-lib.mjs'
export { L }
export const SAT = '2026-07-18'

/* file LL for plasma (Fable) on Sat 18 Jul 2026, all day, through the Inputs page's own "+ Input" form */
export async function fileLeaveFable(w) {
  const p = w.page
  await L.go(w, 'inputs')
  await w.press('#inListBtn'); await L.sleep(400)
  await w.press('#inNew')
  await p.waitForSelector('#inpEditPop #inpEditType')
  await p.selectOption('#inpEditPop #inpEditPerson', 'plasma')
  await p.selectOption('#inpEditPop #inpEditType', 'LL')
  await L.sleep(200)
  // the picker starts on the current month; page to July 2026 by reading its heading
  for (let i = 0; i < 24; i++) {
    const h = (await p.locator('#inpEditPop .rc-mon').innerText()).trim().toLowerCase()
    if (h.startsWith('jul') && h.endsWith('2026')) break
    const [m, y] = h.split(/\s+/)
    const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    const at = +y * 12 + MONTHS.indexOf(m.slice(0, 3)), want = 2026 * 12 + 6
    await w.press(at < want ? '#inpEditPop .rc-nav[aria-label="Next month"]' : '#inpEditPop .rc-nav[aria-label="Previous month"]')
  }
  await w.press(`#inpEditPop [data-cal="${SAT}"]`)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && !(await ad.isChecked())) await ad.click()
  const read = await p.locator('#inpEditPop .rc-read').innerText()
  await w.press('#inpEditSave'); await L.sleep(600)
  const still = await p.locator('#inpEditPop').count()
  return { read, formStillOpen: still }
}

/* publish Saturday through the bridge (fixture only); extra = also put a second man on a Saturday programme row */
export async function publishSat(w, { crew = false } = {}) {
  return await w.page.evaluate(({ crew }) => {
    const W = window, di = 5
    let ids = [], cs = {}
    if (crew) {
      const all = Object.keys(W.PEOPLE).filter(id => !['plasma', 'bane', 'nick', 'all', 'allavail'].includes(id) && W.PEOPLE[id] && W.PEOPLE[id].cs && !W.PEOPLE[id].pers && !W.PEOPLE[id].sans && !W.PEOPLE[id].ph)
        .sort((a, b) => String(W.PEOPLE[b].cs).length - String(W.PEOPLE[a].cs).length)
      ids = all.slice(0, 3)
      const rows = [['Hangar open day', ['nick', ids[0]], '13:00', '15:00'], ['Range brief', ['bane', ids[1], ids[2]], '09:00', '12:00']]
      for (const [prog, who, a, b] of rows) {
        W.DAYS[di].ground.push({ prog, str: a, end: b, who: '', rmks: '' }); W.afterSchedMutate()
        for (const id of who) { W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, id); W.afterSchedMutate() }
      }
    }
    const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    W.setDayApproved(di, true); W.afterSchedMutate()
    cs = Object.fromEntries(['plasma', 'bane', 'nick', ...ids].map(id => [id, W.PEOPLE[id].cs]))
    return { ids, cs }
  }, { crew })
}

export async function toWar(w) {
  const p = w.page
  await L.go(w, 'leavewar')
  await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(600)
  await p.evaluate(() => window.clearToast && window.clearToast())
}

/* read the clash note, phone line and strip alike */
export const readNote = p => p.evaluate(() => {
  const pg = document.querySelector('#page-leavewar'), n = pg.querySelector('[data-testid="sync-clashes"]')
  if (!n) return { present: false }
  const r = n.getBoundingClientRect(), filters = pg.querySelector('.filters')
  const line = n.querySelector('[data-testid="clash-line"]'), list = n.querySelector('[data-testid="clash-list"]')
  const rows = [...n.querySelectorAll('.clashrow')].map(row => {
    const q = c => row.querySelector(c).getBoundingClientRect(), lh = parseFloat(getComputedStyle(row).lineHeight)
    const rr = row.getBoundingClientRect(), hit = document.elementFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2)
    return { who: row.querySelector('.clash-who').textContent, day: row.querySelector('.clash-day').textContent, go: row.querySelector('.clash-do').textContent.replace(/ /g, ' '), what: row.querySelector('.clash-what').textContent,
      whoL: Math.round(q('.clash-who').left), dayL: Math.round(q('.clash-day').left), doR: Math.round(q('.clash-do').right), dayLines: Math.round(q('.clash-day').height / lh), nameCut: row.querySelector('.clash-who').scrollWidth > row.querySelector('.clash-who').clientWidth + 0.5, h: Math.round(rr.height),
      onTop: !!hit && (hit === row || row.contains(hit)), hitTag: hit ? hit.tagName + '.' + String(hit.className).slice(0, 30) : null, tag: row.tagName }
  })
  const strip = [...n.querySelectorAll('.row')].map(x => x.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim())
  return { present: true, cls: n.className, inFilters: filters.contains(n), box: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`, w: Math.round(r.width), vw: innerWidth,
    line: line ? line.textContent.replace(/\s+/g, ' ').trim() : null, expanded: line ? line.getAttribute('aria-expanded') : null,
    lineBox: line ? (() => { const b = line.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } })() : null,
    rows, strip, overflowX: document.documentElement.scrollWidth > innerWidth, filtersH: Math.round(filters.getBoundingClientRect().height),
    gridTop: Math.round(pg.querySelector('.stage').getBoundingClientRect().top) }
})

/* what dialog is open on whatever page */
export const dialogNow = p => p.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0)
  return { page: window.CURPAGE, dialogs: d.map(s => ({ tid: s.getAttribute('data-testid'), parent: (s.closest('[id^="page-"]') || {}).id || null, head: (s.textContent || '').replace(/\s+/g, ' ').slice(0, 90), buttons: [...s.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 14) })) }
})

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export async function openMonth(w, iso = SAT) {
  const p = w.page
  const bar = p.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && await bar.isVisible() && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await L.sleep(300) }
  const m = p.locator(`[data-testid="month-strip"] button`).filter({ hasText: new RegExp("^" + MON[+iso.slice(5, 7) - 1], "i") }).first()
  if (await m.count()) { await m.click(); await L.sleep(900) }
  await p.locator(`[data-testid="head-${iso}"]`).waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await L.sleep(400)
}
export const sheetNow = p => p.evaluate(() => {
  const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth || e.offsetHeight)
  if (!d.length) return { open: 'nothing' }
  const s = d[d.length - 1]
  return { open: s.getAttribute('data-testid'), label: s.getAttribute('aria-label'), text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400),
    buttons: [...s.querySelectorAll('button')].filter(b => b.offsetWidth || b.offsetHeight).map(b => `${b.getAttribute('data-testid') || '?'}:${(b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40)}${b.disabled ? '(off)' : ''}`) }
})
export async function tapCell(w, id, iso = SAT) {
  const p = w.page
  if (!(await p.locator(`[data-testid="cell-${id}-${iso}"]`).count())) await openMonth(w, iso)
  const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return { open: 'NO CELL DRAWN' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await L.sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)), over: h ? `${h.tagName}.${String(h.className).slice(0, 30)}[${h.getAttribute('data-testid') || ''}]` : 'nothing' } })
  if (!at.ok) return { open: 'COVERED', over: at.over }
  if (w.phone) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y)
  await L.sleep(700)
  return sheetNow(p)
}
export async function sheetPress(w, which) {
  const p = w.page
  const s = p.locator('.bidsheet[role="dialog"]:visible').last()
  const b = which instanceof RegExp ? s.locator('button').filter({ hasText: which }).first() : s.locator(`[data-testid="${which}"]`).first()
  if (!(await b.count())) return { pressed: false, why: 'no ' + which, sheet: await sheetNow(p) }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled', sheet: await sheetNow(p) }
  if (w.phone) await b.tap(); else await b.click()
  await L.sleep(700)
  return { pressed: true, sheet: await sheetNow(p) }
}
export async function closeSheets(w) {
  const p = w.page
  for (let i = 0; i < 4; i++) {
    const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last()
    if (await x.count()) { await x.evaluate(e => e.click()).catch(() => {}); await L.sleep(350); continue }
    if (await p.locator('[data-testid="sheet-scrim"]').count()) { await p.keyboard.press('Escape'); await L.sleep(300); continue }
    break
  }
}
export async function stageTo(w, label) {
  const p = w.page
  await w.press('[data-testid="stage-now"]'); await L.sleep(400)
  const menu = await p.evaluate(() => { const m = document.querySelector('[data-testid="stage-menu"]'); return m ? [...m.querySelectorAll('button')].map(b => `${b.getAttribute('data-testid')}:${b.textContent.trim()}`) : null })
  return menu
}

/* the C6 fixture: Saturday published with crew on two programme rows; Fable bids, then bane (the second man) */
export async function c6Fixture(w, { pics = null } = {}) {
  const p = w.page
  const crew = await publishSat(w, { crew: true })
  await toWar(w)
  const SATD = SAT
  const baseline = await p.evaluate(() => { const pg = document.querySelector('#page-leavewar'); const st = pg.querySelector('.stagetxt'); return { filtersH: Math.round(pg.querySelector('.filters').getBoundingClientRect().height), gridTop: Math.round(pg.querySelector('.stage').getBoundingClientRect().top), stageCut: st ? st.scrollWidth > st.clientWidth : null, overflowX: document.documentElement.scrollWidth > innerWidth } })
  const set1 = await p.evaluate(d => window.lwSetCell('plasma', d, 'LL'), SATD)
  await p.waitForSelector('[data-testid="sync-clashes"]', { timeout: 15000 }); await L.sleep(500)
  const n1 = await readNote(p)
  if (pics) await L.pic(w, pics + '-one')
  const set2 = await p.evaluate(d => window.lwSetCell('bane', d, 'OL'), SATD)
  await L.sleep(800)
  const n2 = await readNote(p)
  return { crew, set1, set2, n1, n2, baseline }
}
