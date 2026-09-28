/* G — the Leave War leftovers of the absence-record re-test.
   G1 [ABSENCE-SMALL-SEEN] 1 — a clash strip line names where it can be undone. The walk makes the clash the way it
      happens: leave filed on the Inputs page for the man on the published Saturday's duty desk. The line must end
      "— change the leave on the Inputs page" (the day's sheet has no control for Inputs-filed leave), never "resolve on
      the sheet".
   G2 [LW-ISO-DATES] — no Leave War sheet prints the stored 2026-07-18: the sheet opened on that man's Saturday, and a
      bid sheet on an empty day, read for a machine date; the header reads "Sat 18 Jul".
   G3 [ABSENCE-SMALL-SEEN] 5 (watch only) — a member at 390px: at three sideways scroll positions, every row's frozen
      name column is what a finger at its centre lands on — no leave drawn over it.
   Usage: node sf-g-leavewar.mjs [outdir-suffix] */
const OUT = 'g-leavewar' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const W4 = await import('../am/w4-lib.mjs')
const { open, go, screen, check, note, summary, SF_STATE, DESK, PHONE } = L
const ISO = /\d{4}-\d{2}-\d{2}/
const SAT = '2026-07-18'

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
/* the man on the published Saturday's first duty desk */
const who = await page.evaluate(() => {
  for (const dw of (window.DAYS[5].dutywaves || [])) for (const r of (dw.rows || [])) {
    const id = r && r.id; if (id && window.PEOPLE[id] && r.str && r.end && !window.PEOPLE[id].sp) return { id, cs: window.PEOPLE[id].cs, role: r.role }
  }
  return null
})
note('the man on Saturday\'s duty', JSON.stringify(who))
check('setup: the published Saturday has a man on a timed duty desk', !!who, '')
const filed = await W4.fileInput(page, { person: who.id, type: 'LL', from: SAT, to: SAT, span: 'all', remarks: 'SF-G LEAVE' })
note('LL filed', JSON.stringify(filed && filed.said))

/* G1 — the clash strip */
await go(page, 'leavewar'); await page.waitForTimeout(1500)
const strip = await page.evaluate(() => [...document.querySelectorAll('[data-testid="sync-clashes"] .row')].map(r => r.textContent.trim()))
const mine = strip.filter(t => t.includes(who.cs))
await page.locator('[data-testid="sync-clashes"]').first().screenshot({ path: `${process.env.HP_SHOTS}/g1-clash-strip.png` }).catch(() => {})
note('G1 the strip', JSON.stringify(strip))
check('G1a the leave over his worked Saturday is on the strip', mine.length > 0, JSON.stringify(strip))
check('G1b its line names where to undo it: the Inputs page', mine.some(t => /— change the leave on the Inputs page$/.test(t)), JSON.stringify(mine))
check('G1c no line sends him to a sheet with no control on it', !strip.some(t => /resolve on the sheet/.test(t)), JSON.stringify(strip))

/* G2 — his Saturday's sheet, and a bid sheet on an empty day */
const cell = page.locator(`[data-testid="cell-${who.id}-${SAT}"]`).first()
let opened = false
if (await cell.count()) { await cell.scrollIntoViewIfNeeded(); await cell.click(); await page.waitForTimeout(700); opened = true }
const sheet = await page.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth).pop()
  return s ? { name: s.getAttribute('data-testid'), text: s.innerText.replace(/\s+/g, ' ').slice(0, 400), titles: [...s.querySelectorAll('[title]')].map(e => e.getAttribute('title')).join(' | ') } : null })
await screen(page, 'g2-saturday-sheet')
note('G2 his Saturday\'s sheet', JSON.stringify({ opened, sheet }))
check('G2a his Saturday opens a sheet', !!sheet, '')
check('G2b it prints no stored machine date', !!sheet && !ISO.test(sheet.text) && !ISO.test(sheet.titles), JSON.stringify(sheet))
check('G2c a one-day header reads like the day\'s list ("Sat 18 Jul")', !!sheet && /Sat 18 Jul/.test(sheet.text), JSON.stringify(sheet && sheet.text))
await page.keyboard.press('Escape'); await page.waitForTimeout(400)

/* G3 — watch: a member at 390, the frozen column never under a leave chip */
await browser.close()
{
  const { browser: b2, page: p2, errors: e2 } = await open({ ...PHONE, who: 'm', state: SF_STATE })
  await go(p2, 'leavewar'); await p2.waitForTimeout(1500)
  const probe = async () => p2.evaluate(() => {
    const whos = [...document.querySelectorAll('.mxband .who, .mx tbody .who')].filter(e => e.offsetWidth && e.getBoundingClientRect().top > 0 && e.getBoundingClientRect().bottom < innerHeight)
    let bad = []
    for (const w of whos.slice(0, 40)) {
      const r = w.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      if (at && !at.closest('.who') && at.closest('td')) bad.push(((at.closest('td') || {}).getAttribute?.('data-testid')) || at.className)
    }
    return { rows: whos.length, bad }
  })
  const wrap = '.mx-wrap, .mx-outer'
  const res = []
  for (const x of [0, 900, 2400]) {
    await p2.evaluate(({ x, wrap }) => { const w = document.querySelector(wrap); if (w) w.scrollLeft = x }, { x, wrap }); await p2.waitForTimeout(500)
    res.push({ x, ...(await probe()) })
  }
  await p2.screenshot({ path: `${process.env.HP_SHOTS}/g3-member-phone.png` })
  note('G3 the member at 390, three scroll positions', JSON.stringify(res))
  check('G3 (watch) the frozen name column is never under a leave chip', res.every(r => r.rows > 0 && r.bad.length === 0), JSON.stringify(res))
  check('G3 no console errors', e2.length === 0, e2.join(' | ').slice(0, 300))
  await b2.close()
}
check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
process.exitCode = summary('sf-g-leavewar') ? 1 : 0
