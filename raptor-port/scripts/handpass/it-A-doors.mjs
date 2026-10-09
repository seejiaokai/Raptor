// Doors that write an input's title, each driven only through its own controls, and the title cases T2 T3 T5 T6 T8
// (docs/superpowers/briefs/2026-10-09-reads/input-own-title-scenarios-astra.md, the head). Reading uses window.INPUTS only.
import { press, tapAt, win, DAYWIN, sleep, month, openNew as calOpenNew, openSaved as calOpenSaved, saveWin, gotoInputs, closeAnyWin, closeDayWin, csId, allRecs, norm, shot, elShot } from './it-A-lib.mjs'

export async function setSeveral(p, ids) {
  const sw = p.locator('[data-testid="pp-several"]'); await sw.waitFor()
  if ((await sw.getAttribute('aria-checked')) !== 'true') { await press(p, sw); await sleep(p, 250) }
  const want = new Set(ids)
  for (const b of await p.locator('button[data-pp]').all()) {
    const id = await b.getAttribute('data-pp'), on = (await b.getAttribute('aria-pressed')) === 'true'
    if (want.has(id) !== on) { await b.scrollIntoViewIfNeeded(); await press(p, b); await sleep(p, 80) }
  }
  const cnt = await p.locator('[data-testid="pp-count"]').innerText().catch(() => '?')
  return cnt
}
export const T40 = '1234567890123456789012345678901234567890'
export const LIT = '<b>Ops</b> "A&B"'
const newRecs = async (p, before) => { const a = await allRecs(p); return a.filter(r => !before.has(r.iid)) }
const idset = async p => new Set((await allRecs(p)).map(r => r.iid))
export const recOf = async (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, has: r.title != null && r.title !== '', remarks: r.remarks, date: r.date, grp: r.grp } : null }, iid)

/* ---------- geometry of a form: nothing overlaps the Title box, nothing leaves the form ---------- */
export async function geometry(p, containerSel) {
  return p.evaluate(sel => {
    const c = document.querySelector(sel); if (!c) return { err: 'no container ' + sel }
    const cr = c.getBoundingClientRect()
    const els = [...c.querySelectorAll('input:not([type=hidden]),select,button,textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden' })
    const box = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
    const overlaps = [], out = []
    for (let i = 0; i < els.length; i++) {
      const a = box(els[i])
      if (a.r > cr.right + 1 || a.l < cr.left - 1) out.push((els[i].id || els[i].getAttribute('aria-label') || els[i].className || els[i].tagName))
      for (let j = i + 1; j < els.length; j++) {
        if (els[i].contains(els[j]) || els[j].contains(els[i])) continue
        const b = box(els[j])
        const w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t)
        if (w > 2 && h > 2) overlaps.push((els[i].id || els[i].getAttribute('aria-label') || els[i].tagName) + ' x ' + (els[j].id || els[j].getAttribute('aria-label') || els[j].tagName))
      }
    }
    const t = els.find(e => e.id === 'inpEditTitle' && e.tagName === 'INPUT') || els.find(e => e.id === 'inTitle') || els.find(e => e.getAttribute('data-ed') === 'title')
    return { overlaps, out, n: els.length, title: t ? { w: Math.round(t.getBoundingClientRect().width), sw: t.scrollWidth, cw: t.clientWidth } : null }
  }, containerSel)
}

/* ---------- the doors ---------- */
const WINSEL = '[data-testid="win-inputedit"]'
const POPSEL = '#inpEditPop'

export function calDoor() {
  const d = {
    key: 'cal', label: 'the Calendar window',
    isNewDoor: true,
    form: WINSEL,
    title: p => win(p).locator('input#inpEditTitle'),
    type: p => win(p).locator('#inpEditType'),
    async openNew(p, s) {
      await calOpenNew(p, s.iso)
      if (s.person) await win(p).locator('#inpEditPerson').selectOption(s.person)
      if (s.type) await p.selectOption('#inpEditType', s.type)
      if (s.several) await setSeveral(p, s.several)
      if (s.st && await p.locator('#inpEditStart').count()) { await p.fill('#inpEditStart', s.st); await p.fill('#inpEditEnd', s.en) }
      if (s.rmk != null) await p.fill('#inpEditRmk', s.rmk)
    },
    async openSaved(p, rec) { await calOpenSaved(p, rec.iid, isoOf(rec)) },
    async submit(p, oil = 'no') { const head = await saveWin(p, oil); return { head, open: (await win(p).count()) > 0 } },
    async saveSaved(p, oil = 'no') { return d.submit(p, oil) },
    async cancel(p) { if (await win(p).count()) { await press(p, p.locator('#inpEditCancel')); await sleep(p, 250) } },
    async shown(p, rec) {
      const iso = isoOf(rec)
      if (!(await p.locator(`[data-testid="idy-row-${rec.iid}"]`).count())) {
        await gotoInputs(p); await closeAnyWin(p)
        const [y, m] = iso.split('-').map(Number); await month(p, y, m)
        await tapAt(p, p.locator(`#inpCal [data-icday="${iso}"]`), { x: 8, y: 8 })
      }
      const c = p.locator(`[data-testid="idy-row-${rec.iid}"]`); await c.waitFor()
      return c.evaluate(c => ({ name: (c.querySelector('.idy-kind') || {}).textContent, kind: (c.querySelector('[data-testid="idy-kindtag"]') || {}).textContent || null, rmk: (c.querySelector('.sd-rmk') || {}).textContent || null, html: c.innerHTML.includes('<b>Ops') }))
    },
  }
  return d
}
export function listDoor() {
  const d = {
    key: 'list', label: 'the List’s Add form',
    isNewDoor: true,
    form: '.inbar',
    title: p => p.locator('#inTitle'),
    type: p => p.locator('#inType'),
    async openNew(p, s) {
      await gotoInputs(p); await closeAnyWin(p)
      await press(p, p.locator('#inListBtn')); await p.waitForSelector('#inAdd', { state: 'visible' })
      if (s.person) await p.selectOption('#inPerson', s.person)
      await pickDate(p, s.iso)
      if (s.type) await p.selectOption('#inType', s.type)
      if (s.several) await setSeveral(p, s.several)
      if (s.st && await p.locator('#inStartT').count()) { await p.fill('#inStartT', s.st); await p.fill('#inEndT', s.en) }
      if (s.rmk != null) await p.fill('#inRemarks', s.rmk)
    },
    async openSaved(p, rec) { return penDoor.openSaved(p, rec) },
    async submit(p, oil = 'no') {
      await press(p, p.locator('#inAdd'))
      const sheet = p.locator('[data-testid="oilconf"]'); let head = ''
      if (await sheet.waitFor({ timeout: 1100 }).then(() => true, () => false)) {
        head = norm(await sheet.locator('.airpop-head').innerText())
        await press(p, sheet.locator(`[data-testid="oil-${oil}"]`)); await press(p, sheet.locator('[data-testid="oilconf-save"]'))
      }
      await p.waitForTimeout(400)
      return { head, open: false }
    },
    async cancel() {},
    async shown(p, rec) {
      await showAll(p)
      const tr = p.locator(`#inBody tr[data-iid="${rec.iid}"]`); await tr.first().waitFor()
      return tr.first().evaluate(t => { const c = t.querySelector('[data-label="Type"]'); return { name: (c.querySelector('[data-testid="in-title"]') || {}).textContent || null, kind: (c.querySelector('.intag') || {}).textContent || null, html: t.innerHTML.includes('<b>Ops'), titleLine: !!c.querySelector('[data-testid="in-title"]'), rmk: (t.querySelector('[data-label="Remarks"]') || {}).textContent || '' } })
    },
  }
  return d
}
export const penDoor = {
  key: 'pencil', label: 'the List’s pencil editor', isNewDoor: false,
  form: '#inBody tr.ined',
  title: p => p.locator('#inBody tr.ined input[data-ed="title"]'),
  type: p => p.locator('#inBody tr.ined select[data-ed="type"]'),
  async openSaved(p, rec) {
    await gotoInputs(p); await closeAnyWin(p)
    await press(p, p.locator('#inListBtn')); await showAll(p)
    const tr = p.locator(`#inBody tr[data-iid="${rec.iid}"]`); await tr.first().waitFor()
    await tr.first().scrollIntoViewIfNeeded()
    await press(p, tr.first().locator('[data-edit]'))
    await p.locator('#inBody tr.ined').waitFor(); await sleep(p, 150)
  },
  async saveSaved(p, oil = 'no') {
    await press(p, p.locator('#inBody tr.ined [data-save]'))
    const sheet = p.locator('[data-testid="oilconf"]'); let head = ''
    if (await sheet.waitFor({ timeout: 1100 }).then(() => true, () => false)) {
      head = norm(await sheet.locator('.airpop-head').innerText())
      await press(p, sheet.locator(`[data-testid="oil-${oil}"]`)); await press(p, sheet.locator('[data-testid="oilconf-save"]'))
    }
    await p.waitForTimeout(400)
    return { head, open: (await p.locator('#inBody tr.ined').count()) > 0 }
  },
  async cancel(p) {
    const c = p.locator('#inBody tr.ined [data-cancel], #inBody tr.ined button:has-text("Cancel")')
    if (await c.count()) { await press(p, c.first()); await sleep(p, 250) }
  },
  async shown(p, rec) { return listDoor().shown(p, rec) },
}
export const listD = () => Object.assign(listDoor(), { saveSaved: penDoor.saveSaved, openSaved: penDoor.openSaved })

export function boardDoor(di = 2) {
  const d = {
    key: 'board', label: 'the Board’s Ground Programme + Inputs', isNewDoor: true,
    form: POPSEL + ' .inpedbox',
    title: p => p.locator('#inpEditPop input#inpEditTitle'),
    type: p => p.locator('#inpEditPop #inpEditType'),
    di,
    async openBoard(p) {
      await closeBoardAny(p)
      await p.evaluate(() => window.go('editsched')); await sleep(p, 500)
      await press(p, p.locator(`#eWeek [data-sbday="${di}"]:visible`).first())
      await p.waitForSelector('#schedBoard'); await sleep(p, 500)
    },
    async openNew(p, s) {
      await d.openBoard(p)
      await press(p, p.locator('.sb-addinp').first()); await p.locator('#inpEditPop').waitFor({ state: 'visible' }); await sleep(p, 250)
      if (s.person) await p.selectOption('#inpEditPop #inpEditPerson', s.person)
      if (s.type) await p.selectOption('#inpEditPop #inpEditType', s.type)
      if (s.st && await p.locator('#inpEditStart').count()) { await p.fill('#inpEditPop #inpEditStart', s.st); await p.fill('#inpEditPop #inpEditEnd', s.en) }
      if (s.rmk != null) await p.fill('#inpEditPop #inpEditRmk', s.rmk)
    },
    async openSaved(p, rec) {
      if (!(await p.locator('#schedBoard').count())) await d.openBoard(p)
      const btn = p.locator(`#schedBoard [data-inpedit="${rec.iid}"]`)
      if (!(await btn.count())) { const t = p.locator('#schedBoard [data-pitog]'); if (await t.count()) { await press(p, t.first()); await sleep(p, 350) } }
      await btn.first().scrollIntoViewIfNeeded()
      await press(p, btn.first()); await p.locator('#inpEditPop').waitFor({ state: 'visible' }); await sleep(p, 250)
    },
    async submit(p, oil = 'no') {
      await press(p, p.locator('#inpEditPop #inpEditSave'))
      const sheet = p.locator('[data-testid="oilconf"]'); let head = ''
      if (await sheet.waitFor({ timeout: 1100 }).then(() => true, () => false)) {
        head = norm(await sheet.locator('.airpop-head').innerText())
        await press(p, sheet.locator(`[data-testid="oil-${oil}"]`)); await press(p, sheet.locator('[data-testid="oilconf-save"]'))
      }
      await p.waitForTimeout(450)
      return { head, open: (await p.locator('#inpEditPop').isVisible().catch(() => false)) }
    },
    async saveSaved(p, oil = 'no') { return d.submit(p, oil) },
    async cancel(p) { if (await p.locator('#inpEditPop').isVisible().catch(() => false)) { await press(p, p.locator('#inpEditPop #inpEditCancel')); await sleep(p, 250) } },
    async shown(p, rec) {
      if (!(await p.locator('#schedBoard').count())) await d.openBoard(p)
      let row = p.locator(`#schedBoard [data-inprow="${rec.iid}"]`)
      if (!(await row.count()) || !(await row.first().isVisible().catch(() => false))) { const t = p.locator('#schedBoard [data-pitog]'); if (await t.count()) { await press(p, t.first()); await sleep(p, 350) } }
      row = p.locator(`#schedBoard [data-inprow="${rec.iid}"]`)
      await row.first().scrollIntoViewIfNeeded()
      return row.first().evaluate(r => ({ name: (r.querySelector('.sbi-ty') || {}).textContent, kind: (r.querySelector('.nm-kind') || {}).textContent || null, html: r.innerHTML.includes('<b>Ops') }))
    },
  }
  return d
}
export async function closeBoardAny(p) {
  if (await p.locator('#inpEditPop').isVisible().catch(() => false)) { await press(p, p.locator('#inpEditPop #inpEditCancel')); await sleep(p, 250) }
  if (!(await p.locator('#schedBoard').count())) return
  const x = p.locator('#sbDone')
  if (await x.count()) { await press(p, x); await sleep(p, 500) } else { await p.keyboard.press('Escape'); await sleep(p, 400) }
}
export async function showAll(p) {
  if (!(await p.locator('#inAdd').isVisible().catch(() => false)) && !(await p.locator('#inBody').isVisible().catch(() => false))) await press(p, p.locator('#inListBtn'))
  if (!(await p.locator('#inRangePop').count())) await press(p, p.locator('#inRangeBtn'))
  await press(p, p.locator('#inRangeAll')); await sleep(p, 300)
}
export async function pickDate(p, iso) {
  const [y, m] = iso.split('-').map(Number)
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 0; i < 40 && !(await p.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
    const [mm, yy] = (await p.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
    const at = `${yy}-${String(MON.indexOf(mm.slice(0, 3)) + 1).padStart(2, '0')}`
    await press(p, p.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first()); await sleep(p, 80)
  }
  await press(p, p.locator(`#inCal [data-cal="${iso}"]`).first()); await sleep(p, 120)
}
const MONNUM = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
export const isoOf = rec => { const [m, d] = rec.date.split(' '); return `2026-${String(MONNUM[m]).padStart(2, '0')}-${String(+d).padStart(2, '0')}` }

/* ---------- the cases ---------- */
const typeInto = async (p, loc, text) => { await loc.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete'); await p.keyboard.type(text) }
const paste = async (p, loc, text) => {
  await p.evaluate(t => navigator.clipboard.writeText(t), text)
  await loc.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete'); await p.keyboard.press('Control+V')
}
const has = (a, b) => (a || '').includes(b)

/** run ONE title case at a door. `base` is {iso, person, st, en} for a new input, or {rec} for an editing door. Returns {ok, say, pics} */
export async function runCase(p, door, c, base, tag, opts = {}) {
  const say = [], pics = []
  let ok = true
  const need = (cond, msg) => { if (!cond) { ok = false; say.push('MISSED: ' + msg) } else say.push(msg) }
  const before = await idset(p)
  let rec = base.rec || null
  /* the form up */
  if (door.isNewDoor) await door.openNew(p, { iso: base.iso, person: base.person, type: base.type || 'Event', st: base.st, en: base.en, rmk: base.rmk, several: base.several })
  else {
    if (!rec) throw new Error('an editing door needs rec')
    await door.openSaved(p, rec)
    await door.type(p).selectOption(base.type || 'Event')
  }
  const T = door.title(p)
  await T.waitFor({ state: 'visible' })
  const startVal = await T.inputValue()
  let want = null            // the title that must be saved (null = none)
  let finalType = base.type || 'Event'
  let wantName = null
  const apply = async () => {
    if (c === 'T2') { await typeInto(p, T, 'Sports day'); want = 'Sports day' }
    else if (c === 'T3') {
      await typeInto(p, T, 'Sports day'); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete')
      await sleep(p, 700)
      await p.keyboard.press('Tab'); await sleep(p, 300)
      const v = await T.inputValue(), ph = await T.getAttribute('placeholder')
      need(v === '' && ph === 'Event', `emptied box stays empty after a pause and leaving it ("${v}"), hint "${ph}"`)
      want = null; wantName = 'Event'
    }
    else if (c === 'T5a') { await typeInto(p, T, T40); const v = await T.inputValue(); need(v === T40, `typed 40 characters, box holds ${v.length}`); want = T40 }
    else if (c === 'T5b') { await paste(p, T, T40 + 'EXTRA'); const v = await T.inputValue(); need(v === T40, `pasted 45 characters, box holds ${v.length}`); want = T40 }
    else if (c === 'T6') { await typeInto(p, T, LIT); const v = await T.inputValue(); need(v === LIT, `literal text typed in the box "${v}"`); want = LIT }
    else if (c === 'T8') {
      await typeInto(p, T, 'Sports day')
      await door.type(p).selectOption('Training'); await sleep(p, 250)
      need((await T.inputValue()) === 'Sports day', `Event to Training keeps "Sports day" (box "${await T.inputValue()}")`)
      const opts2 = await door.type(p).locator('option').allInnerTexts()
      if (opts2.includes('LL')) {
        await door.type(p).selectOption('LL'); await sleep(p, 300)
        const n = await door.title(p).count()
        need(n === 0, `LL: no Title control (${n} found)`)
        await door.type(p).selectOption('Event'); await sleep(p, 300)
        const v = await door.title(p).inputValue()
        need(v === 'Event', `back to Event: box shows "${v}", the discarded "Sports day" has not returned`)
        opts.leaveOffered = true
      } else { opts.leaveOffered = false; say.push('LL is not offered in this picker (kinds: ' + opts2.join(', ') + ') - so the leave round trip cannot be walked here; the save is kept as a Training titled "Sports day"'); want = 'Sports day'; finalType = 'Training' }
      if (opts.leaveOffered) { want = null; wantName = 'Event' }
    }
    if (c !== 'T8') pics.push(null)
  }
  await apply()
  const form = door.form
  const g = await geometry(p, form)
  if (c === 'T5a' || c === 'T5b' || c === 'T6') need(!g.err && g.overlaps.length === 0 && g.out.length === 0, `nothing overlaps or leaves the form (overlaps ${JSON.stringify(g.overlaps)}, out ${JSON.stringify(g.out)}; title box ${JSON.stringify(g.title)})`)
  const pic = `${tag}-${c}`
  await shot(p, pic); pics[0] = pic + '.png'
  const r = await door.submit(p, opts.oil || 'no')
  if (r.head) say.push(`OIL question "${r.head}"`)
  need(!r.open, 'the form closed on save')
  /* what was stored */
  let recs
  if (door.isNewDoor) recs = (await allRecs(p)).filter(x => !before.has(x.iid))
  else recs = [await recOf(p, rec.iid)]
  need(recs.length === (base.expectCount || 1), `${recs.length} input(s) stored`)
  const stored = recs[0]
  if (base.several && recs.length > 1) need(recs.every(x => x.grp && x.grp === recs[0].grp && x.title === recs[0].title), `the ${recs.length} rows are one shared entry with one title (grp ${recs[0].grp}, titles ${JSON.stringify(recs.map(x => x.title))})`)
  if (stored) {
    const t = stored.title
    if (want) need(t === want, `stored title "${t}"`)
    else need(t == null || t === '', `nothing stored as a title (title ${JSON.stringify(t)})`)
    need(stored.type === finalType, `kind ${stored.type}`)
    need(!(stored.remarks || '').includes(want || '\u0000'), `remarks "${stored.remarks}" gained no title`)
    rec = stored
    /* what the door's own screen prints */
    try {
      const sh = await door.shown(p, stored)
      if (want) { need(sh.name === want, `screen name "${sh.name}"`); need(sh.kind === finalType, `kind kept in sight "${sh.kind}"`) }
      else { need(sh.name === 'Event' || (door.key === 'list' && (sh.kind === 'Event')), `screen name "${sh.name}" / kind "${sh.kind}"`); if (door.key !== 'list') need(!sh.kind, `no repeated kind label ("${sh.kind}")`); else need(!sh.titleLine, 'an untitled row has no title line') }
      if (c === 'T6') need(!sh.html, 'the literal text made no markup')
      if (c === 'T6') { pics.push(null) }
    } catch (e) { ok = false; say.push('MISSED: could not read the screen: ' + String(e.message).split('\n')[0]) }
    /* reopen */
    if (door.key !== 'board' || true) {
      try {
        await door.cancel(p)
        await door.openSaved(p, stored)
        const t2 = door.title(p); await t2.waitFor({ state: 'visible' })
        const v = await t2.inputValue(), ty = await door.type(p).inputValue()
        need(v === (want ?? 'Event') && ty === finalType, `reopened: Title "${v}", Type "${ty}"`)
        const pic2 = `${tag}-${c}-reopen`; await shot(p, pic2); pics.push(pic2 + '.png')
        await door.cancel(p)
      } catch (e) { ok = false; say.push('MISSED: could not reopen: ' + String(e.message).split('\n')[0]) }
    }
  }
  return { ok, say: say.join(' · '), pics: pics.filter(Boolean), rec }
}
