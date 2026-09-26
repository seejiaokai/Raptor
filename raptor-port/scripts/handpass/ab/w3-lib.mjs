/* Walker W3 — the Leave War's own gestures (absence-record re-test, 26 Sep 26). Helpers on top of ab-lib.mjs.
   Everything here drives the app's OWN controls (a real mouse drag over the grid, the selection sheet, the top bar's
   Undo / Redo, the stage control, the war picker). Reads of window.* / localStorage are for the evidence table only —
   nothing here writes through them. */
process.env.AB_WHO ||= 'w3'
export * from './ab-lib.mjs'
import { lwOpen, sheetNow, shot, closeSheets, login } from './ab-lib.mjs'

/** The war's own records for one man on some days, read from the saved world (the table only). */
export async function recsOf(page, pid, isos) {
  return page.evaluate(([p, ds]) => {
    let wars = []
    try { wars = JSON.parse(localStorage.getItem('raptor:leavewar/wars') || '[]') } catch { }
    const out = {}
    for (const d of ds) {
      const all = []
      for (const w of (Array.isArray(wars) ? wars : Object.values(wars))) {
        const recs = (w && (w.recs || w.records)) || {}
        const l = (recs[p] || {})[d]
        if (Array.isArray(l)) for (const r of l) all.push(`${r.kind}:${r.code}${r.state ? '/' + r.state : ''}${r.oil ? '/' + r.oil : ''}${r.days != null ? '/d' + r.days : ''}`)
      }
      out[d] = all.join(',') || '-'
    }
    return out
  }, [pid, isos])
}

/** Each man's box on each day: code, corner mark, landing paint. */
export async function grid(page, ids, isos) {
  return page.evaluate(([ps, ds]) => {
    const o = {}
    for (const p of ps) o[p] = ds.map(d => {
      const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
      const m = document.querySelector(`[data-testid="mark-${p}-${d}"]`)
      if (!c) return 'NOCELL'
      const t = (c.innerText || '').replace(/\s+/g, ' ').trim()
      return (t || '·') + (m ? `[${(m.innerText || '').trim()}]` : '')
    }).join(' | ')
    return o
  }, [ids, isos])
}

/** A real mouse drag from one man's day to another's (the owner's "left click, drag to select"). Both corner boxes
    are measured AFTER the rectangle's middle is scrolled into view, so the numbers are the ones on screen. */
export async function dragRect(page, a, isoA, b, isoB, { steps = 14 } = {}) {
  const mid = page.locator(`[data-testid="cell-${a}-${isoA}"]`).first()
  if (!(await mid.count())) await lwOpen(page, isoA)
  await page.locator(`[data-testid="cell-${a}-${isoA}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(350)
  const bx = async (id, iso) => page.locator(`[data-testid="cell-${id}-${iso}"]`).first().boundingBox()
  const b1 = await bx(a, isoA), b2 = await bx(b, isoB)
  if (!b1 || !b2) return { open: 'NO BOX', b1, b2 }
  const x1 = b1.x + b1.width / 2, y1 = b1.y + b1.height / 2, x2 = b2.x + b2.width / 2, y2 = b2.y + b2.height / 2
  /* is the start box what sits under the pointer? (a sticky head or a sheet can cover it) */
  const hit = await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); const c = h && h.closest('[data-testid^="cell-"]'); return c ? c.getAttribute('data-testid') : (h ? h.tagName + '.' + h.className : 'nothing') }, [x1, y1])
  await page.mouse.move(x1, y1)
  await page.mouse.down()
  await page.mouse.move(x1 + 6, y1 + 1, { steps: 3 })
  await page.mouse.move(x2, y2, { steps })
  await page.mouse.up()
  await page.waitForTimeout(700)
  return { ...(await sheetNow(page)), startHit: hit }
}

/** Press a button in the selection sheet (and read the sheet after, with its note). */
export async function selPress(page, testid) {
  const b = page.locator(`[data-testid="select-sheet"] [data-testid="${testid}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'no ' + testid, sheet: await sheetNow(page) }
  await b.click(); await page.waitForTimeout(700)
  const note = await page.locator('[data-testid="sel-note"]').allInnerTexts()
  return { pressed: true, note: note.join(' ').trim(), sheet: await sheetNow(page) }
}

/** The top bar's Undo / Redo (the one timeline): what its hover names first, whether it was on, what toast it raised. */
export async function lwHist(page, which = 'undo') {
  const b = page.locator(`[data-testid="lw-${which}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'no button' }
  const title = await b.getAttribute('title'), disabled = await b.isDisabled()
  if (disabled) return { pressed: false, title, disabled }
  await b.click(); await page.waitForTimeout(800)
  return { pressed: true, title }
}

/** Reload the page (a person's refresh) and, if the sign-in card comes back, sign in again as the same person. */
export async function reload(page, who = 'a') {
  await page.reload()
  await page.waitForTimeout(1200)
  if (await page.locator('#luser:visible').count()) await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }).catch(() => {})
  await page.waitForTimeout(400)
}

/** The stage the war shows, and press the stage control forward (→) or back (←). */
export async function stageNow(page) { return (await page.locator('[data-testid="stage-now"]:visible').first().innerText()).trim() }
export async function stageGo(page, dir = 'advance') {
  const b = page.locator(`[data-testid="stage-${dir}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  const label = (await b.innerText()).trim()
  if (await b.isDisabled()) return { pressed: false, why: 'disabled', label }
  await b.click(); await page.waitForTimeout(900)
  return { pressed: true, label, now: await stageNow(page) }
}

/** The war picker: its options, and pick one by name. */
export async function warPick(page, name) {
  const sel = page.locator('[data-testid="war-picker"]:visible').first()
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })))
  if (!name) return opts
  const o = opts.find(x => x.t === name || new RegExp(name).test(x.t))
  if (!o) return { picked: false, opts }
  await sel.selectOption(o.v); await page.waitForTimeout(1200)
  return { picked: true, to: o.t }
}

/** Every "M written / decided" figure the sheet claims, as numbers. */
export function claimed(note) {
  const n = (re) => { const m = re.exec(note || ''); return m ? +m[1] : null }
  return { written: n(/(\d+) (?:written|cleared|deleted|decided)/), skipped: n(/(\d+) skipped/) }
}
export { shot, closeSheets, sheetNow }
