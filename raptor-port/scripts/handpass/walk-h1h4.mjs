/* H1 (Fable S41, Codex 21) — ordinary weekdays untouched, and the "Off day"
   tag.  H4 (Fable S44, Codex 16) — the "not published yet" reminder and when
   it must stay quiet. */
import { open, board, tap, type, put, shot, publish, go, warnings, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

const dayRead = async (di) => {
  await go(page, 'editsched'); await board(page, di)
  const w = await warnings(page)
  const s = await page.evaluate(() => {
    const root = document.querySelector('#schedBoard')
    const vis = e => !!(e && (e.offsetParent || e.getClientRects().length))
    return {
      title: ((root.querySelector('.sb-title') || {}).innerText || '').replace(/\n+/g, ' ').trim(),
      dayBar: ((root.querySelector('.daybar') || {}).innerText || '').replace(/\n+/g, ' | '),
      oilButtons: [...root.querySelectorAll('[data-oilmode], #sbOil')].filter(vis).map(e => e.innerText.replace(/\n/g, ' ').trim()),
      bars: [...root.querySelectorAll('.puck[data-person]')].filter(e => vis(e) && !e.closest('#sbRoster'))
        .filter(e => /oilbar-(fo|ho)/.test(e.className)).length,
      chips: [...root.querySelectorAll('.oilcount, [data-oilsent]')].filter(vis).length,
      weekChips: [...document.querySelectorAll('#eWeek .oilcount')].filter(vis).length,
    }
  })
  return { ...s, warnHead: w.head, oilWarnings: (w.lines || []).filter(l => /OIL/i.test(l)), allWarnings: w.lines }
}
const setEvent = async (date, text) => {
  await go(page, 'leavewar'); await page.waitForTimeout(1200)
  const c = page.locator(`[data-testid="event-0-${date}"]`)
  await c.scrollIntoViewIfNeeded().catch(() => {})
  await c.click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="event-text"]').fill(text)
  await page.locator('[data-testid="event-apply"]').click(); await page.waitForTimeout(700)
  return (await page.locator(`[data-testid="event-0-${date}"]`).innerText()).trim()
}

/* ---------- H1: an ordinary Tuesday ---------- */
R.tuePlain = await dayRead(1)
await shot(page, 'G-H1-01-tuesday-plain')

/* tag it "Off day" — the war's own second type */
R.offSet = await setEvent('2026-07-14', 'Off day')
R.tueOffDay = await dayRead(1)
await shot(page, 'G-H1-02-tuesday-off-day')

/* and PH, for the comparison */
R.phSet = await setEvent('2026-07-14', 'PH')
R.tuePH = await dayRead(1)
await shot(page, 'G-H1-03-tuesday-ph')
await setEvent('2026-07-14', '')
R.tueCleared = await dayRead(1)

/* ---------- H4: the "not published yet" reminder ---------- */
const reminder = (o) => (o.allWarnings || []).filter(l => /not published yet|publish it before/i.test(l))

R.satDraft = await dayRead(5)
R.satDraftReminder = reminder(R.satDraft)
await shot(page, 'G-H4-01-sat-draft-reminder')

/* the blanket on an unpublished day — the reminder must go quiet */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilblank]:visible').first().click()
await page.waitForTimeout(800)
await oilMode(page, false)
await page.waitForTimeout(600)
R.satBlanket = await dayRead(5)
R.satBlanketReminder = reminder(R.satBlanket)
await shot(page, 'G-H4-02-sat-blanket-reminder')
/* blanket off again */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilblank]:visible').first().click()
await page.waitForTimeout(700)
await oilMode(page, false)
await page.waitForTimeout(500)

/* publish it — the reminder must go */
R.satPub = await publish(page, 5)
await page.waitForTimeout(700)
R.satPublished = await dayRead(5)
R.satPublishedReminder = reminder(R.satPublished)
await shot(page, 'G-H4-03-sat-published-reminder-gone')

/* a weekday never shows it */
R.tueReminder = reminder(R.tuePlain)

/* an EMPTY eligible day — next week's Saturday, nothing on it */
const wkBtns = page.locator('[data-sbweek]:visible')
if (await wkBtns.count()) { await wkBtns.last().click({ force: true }); await page.waitForTimeout(1500) }
R.emptySat = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const side = document.querySelector('#sbSide')
  const txt = (side && side.innerText) || ''
  const cut = txt.indexOf('PLACEHOLDERS')
  return {
    title: ((root.querySelector('.sb-title') || {}).innerText || '').replace(/\n+/g, ' ').trim(),
    warnings: (cut > 0 ? txt.slice(0, cut) : txt).split('\n').map(s => s.trim()).filter(Boolean).slice(0, 10),
    oilButtons: [...root.querySelectorAll('[data-oilmode], #sbOil')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\n/g, ' ').trim()),
  }
})
R.emptySatReminder = R.emptySat.warnings.filter(l => /not published yet|publish it before/i.test(l))
await shot(page, 'G-H4-04-empty-saturday-next-week')

/* ---------- C16: a desk with no times, and what publishing says ---------- */
R.sunday = await (async () => {
  if (await wkBtns.count()) { await page.locator('[data-sbweek]:visible').first().click({ force: true }); await page.waitForTimeout(1500) }
  await go(page, 'editsched'); await board(page, 6)
  /* blank the seed SDO desk's times */
  await type(page, `[data-bfld="dr:6.0.0.str"]`, '')
  await type(page, `[data-bfld="dr:6.0.0.end"]`, '')
  await page.waitForTimeout(500)
  const before = await warnings(page)
  const pub = await publish(page, 6)
  await page.waitForTimeout(900)
  const toasts = await page.evaluate(() => [...document.querySelectorAll('*')]
    .filter(e => e.offsetParent && !e.children.length && /earns? no|nobody|no start and end/i.test(e.innerText || ''))
    .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).slice(0, 5))
  await shot(page, 'G-H4-05-sunday-blind-desk-published')
  const after = await warnings(page)
  return { before: before.lines, pub, toasts, after: after.lines }
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-h1h4.json', JSON.stringify(R, null, 1))
const pr = (n, o) => { console.log(`--- ${n} ---`)
  console.log('  ' + o.title + '   dayBar: ' + o.dayBar)
  console.log('  OIL buttons=' + JSON.stringify(o.oilButtons) + '  bars on the board=' + o.bars + '  count chips board=' + o.chips + ' week=' + o.weekChips)
  console.log('  OIL warnings: ' + JSON.stringify(o.oilWarnings)) }
pr('Tuesday, ordinary', R.tuePlain)
console.log('tagged "' + R.offSet + '"'); pr('Tuesday, tagged Off day', R.tueOffDay)
console.log('tagged "' + R.phSet + '"'); pr('Tuesday, tagged PH', R.tuePH)
pr('Tuesday, tag cleared', R.tueCleared)
console.log('=== H4 ===')
console.log('Saturday DRAFT reminder:', JSON.stringify(R.satDraftReminder))
console.log('Saturday BLANKET reminder:', JSON.stringify(R.satBlanketReminder), ' (all warnings: ' + JSON.stringify((R.satBlanket.allWarnings || []).slice(0, 6)) + ')')
console.log('Saturday PUBLISHED reminder:', JSON.stringify(R.satPublishedReminder), ' publish:', JSON.stringify(R.satPub))
console.log('Tuesday reminder:', JSON.stringify(R.tueReminder))
console.log('EMPTY next-week Saturday:', JSON.stringify(R.emptySat))
console.log('  its reminder:', JSON.stringify(R.emptySatReminder))
console.log('=== C16 Sunday, blind desk ===')
console.log('  before: ' + JSON.stringify(R.sunday.before))
console.log('  publish: ' + JSON.stringify(R.sunday.pub))
console.log('  what the app said: ' + JSON.stringify(R.sunday.toasts))
console.log('  after: ' + JSON.stringify(R.sunday.after))
console.log('errors:', R.errors)
await browser.close()
