/* Walker B2's helpers (25 Sep 26, the amendment batch walk). Built on w2-lib.mjs. Every fixture is made through the
   app's own gestures: a roster puck DRAGGED onto a seat (replace), a tap on an empty seat / a row's people cell then a
   tap on a roster puck (arm-then-pick), the sign-off selects, Publish AL. window.* is READ for the evidence only. */
export * from './w2-lib.mjs'

/** A person's id from their callsign (read). */
export const idOf = (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === c), cs)
/** The callsign in a slot (read). */
export const who = (page, key) => page.evaluate(k => { const v = window.slotVal(k); return v ? ((window.PEOPLE[v] || {}).cs || v) : '' }, key)

const scope = async (page) => (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
const roster = async (page) => (await page.locator('#schedBoard:visible').count()) ? '#sbRoster' : '#eRoster'

/** Drag a roster puck onto a seat (the app's drop replaces whoever sits there). Returns the callsign now in it. */
export async function dragOnto(page, key, cs) {
  const sc = await scope(page), rs = await roster(page)
  const id = await idOf(page, cs)
  const seat = page.locator(`${sc} .seat[data-slot="${key}"]:visible, ${sc} .sb-slot[data-slot="${key}"]:visible`).first()
  if (!(await seat.count())) return 'NO SEAT ' + key
  const src = page.locator(`${rs} .rpuck[data-person="${id}"]:visible`).first()
  if (!(await src.count())) return 'NOT IN ROSTER ' + cs
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(200)
  const a = await src.boundingBox(), b = await seat.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 6, { steps: 4 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 16 })
  await page.waitForTimeout(150)
  await page.mouse.up()
  await page.waitForTimeout(700)
  return who(page, key)
}

/** Arm a row's people cell (its empty part) and pick a roster puck: appends the man to the row's extras. */
export async function appendTo(page, fillKey, cs) {
  const sc = await scope(page), rs = await roster(page)
  const id = await idOf(page, cs)
  const cell = page.locator(`${sc} [data-fill="${fillKey}"]:visible`).first()
  if (!(await cell.count())) return 'NO CELL ' + fillKey
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(150)
  const b = await cell.boundingBox()
  /* press the cell's own empty right end, not a puck inside it */
  await page.mouse.click(b.x + b.width - 5, b.y + b.height / 2)
  await page.waitForTimeout(250)
  const armed = await page.evaluate(() => window.ARM && window.ARM.key)
  if (!armed) return 'DID NOT ARM ' + fillKey
  const p = page.locator(`${rs} .rpuck[data-person="${id}"]:visible`).first()
  if (!(await p.count())) { await page.keyboard.press('Escape'); return 'NOT OFFERED ' + cs + ' (armed ' + armed + ')' }
  await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await p.click()
  await page.waitForTimeout(600)
  return 'armed ' + armed
}

/** Every puck-bearing seat of a day on the visible surface, with what its tag and its puck's edge compute to. */
export async function seatMarks(page, rootSel) {
  return page.evaluate(sel => {
    const root = document.querySelector(sel); if (!root) return []
    return [...root.querySelectorAll('.seat')].filter(s => (s.offsetWidth || s.offsetHeight) && (s.dataset.alc || s.dataset.aln)).map(s => {
      const pk = s.querySelector('.puck'); const a = getComputedStyle(s, '::after'); const pc = pk ? getComputedStyle(pk) : null
      const alc = getComputedStyle(s).getPropertyValue('--alc').trim()
      return {
        key: s.dataset.slot || s.dataset.inpseat || '', alc: s.dataset.alc || '', aln: s.dataset.aln || '', alcColour: alc,
        who: pk ? ((window.PEOPLE[pk.dataset.person] || {}).cs || pk.dataset.person) : '', pcls: pk ? pk.className : '',
        tag: { content: a.content, bg: a.backgroundColor, border: a.borderTopStyle + ' ' + a.borderTopWidth + ' ' + a.borderTopColor, color: a.color, display: a.display },
        edge: pc ? { shadow: pc.boxShadow, outline: pc.outlineStyle + ' ' + pc.outlineWidth + ' ' + pc.outlineColor, border: pc.borderTopColor } : null,
        seatEdge: { shadow: getComputedStyle(s).boxShadow, outline: getComputedStyle(s).outlineStyle + ' ' + getComputedStyle(s).outlineWidth },
      }
    })
  }, rootSel)
}
/** "rgb(r, g, b)" for a hex (the AL palette). */
export const HEX = { 1: '#3BC6E8', 2: '#E5C24A', 3: '#3DE86B', 4: '#FFFFFF' }
export function rgb(hex) { const n = parseInt(hex.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})` }
