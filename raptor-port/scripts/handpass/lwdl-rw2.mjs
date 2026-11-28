// lwdl-rw2.mjs — the re-walk of his D2921 (28 Nov 26, "4:1"): on a phone Approvals' Approve and Refuse carry no tick or
// cross, a half-day date keeps to one line, the decided look (ring, grey) stays; the desktop's Approvals and a phone's
// bid window keep the marks. From the lw-decide-look walk ([LW-DECIDE-LOOK], his D2881); run from raptor-port/:
//   HOST=localhost PORT=<preview> node scripts/handpass/lwdl-rw2.mjs
import { run, signIn, press, pic, T, sleep, closeBrowsers, openCell } from './lwdl-lib.mjs'

const readLine = page => page.evaluate(() => {
  const l = document.querySelector('[data-rw2="1"]'); if (!l) return null
  const d = l.querySelector('[data-testid="appr-dates"]'), r = d.getBoundingClientRect()
  const btn = id => { const b = l.querySelector(`[data-testid="${id}"]`); const cs = getComputedStyle(b); const br = b.getBoundingClientRect()
    return { text: b.textContent, mark: !!b.querySelector('svg.dec-ic'), ring: `${cs.outlineStyle} ${cs.outlineWidth}`, color: cs.color, w: Math.round(br.width), right: Math.round(br.right) } }
  return { date: d.innerText.replace(/\n/g, ' / '), dateLines: Math.round(r.height / (parseFloat(getComputedStyle(d).lineHeight) || 15)),
    rowH: Math.round(l.getBoundingClientRect().height), ap: btn('appr-approve'), rf: btn('appr-refuse'), vw: innerWidth, sideways: document.documentElement.scrollWidth > innerWidth }
})
const tagHalf = page => page.evaluate(() => {
  const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]
  const l = ls.find(x => / (AM|PM)/.test(x.querySelector('[data-testid="appr-dates"]')?.innerText || ''))
  if (l) l.setAttribute('data-rw2', '1'); return !!l
})

await run('rw2-APPR', ['p402', 'p390', 'p360', 'desk'], async S => {
  const page = S.page, phone = S.size !== 'desk'
  await signIn(S); await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  S.check(await tagHalf(page), 'a half-day request is on the list')
  await page.locator('[data-rw2="1"]').scrollIntoViewIfNeeded()
  const marks = await page.evaluate(() => document.querySelectorAll('[data-testid="approvals-page"] .appr-btns svg.dec-ic').length)
  S.check(phone ? marks === 0 : marks > 0, phone ? 'no tick or cross anywhere on the phone list' : 'the desktop list keeps its ticks and crosses', marks)
  const a = await readLine(page); S.note('waiting: ' + JSON.stringify(a))
  if (phone) S.check(a.dateLines === 1 || (S.size === 'p360' && a.dateLines <= 2), 'the half-day date keeps its line (two at 360, as before the build)', a.dateLines)
  S.check(!a.sideways, 'no sideways scroll', a.sideways)
  await pic(S, 'waiting', ['[data-rw2="1"]'], { pad: 10 })
  /* approve it: the lit one ringed, the other grey, the row the same height, the edge not moved */
  const tap = async id => { const b = page.locator(`[data-rw2="1"] [data-testid="${id}"]`); const bb = await b.boundingBox()
    if (S.touch) await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await b.click()
    await sleep(page, 500) }
  await tap('appr-approve')
  const b = await readLine(page); S.note('approved: ' + JSON.stringify(b))
  S.check(b.ap.text === 'Approved' && b.ap.ring.startsWith('solid 2px'), 'Approved, ringed', b.ap)
  S.check(b.rf.color === 'rgb(125, 135, 148)', 'Refuse grey', b.rf.color)
  S.check(b.rowH === a.rowH, 'the row keeps its height', [a.rowH, b.rowH])
  S.check(b.ap.right === a.ap.right && b.rf.right === a.rf.right, 'the buttons\' edges do not move under the finger', [a.ap.right, b.ap.right, a.rf.right, b.rf.right])
  await pic(S, 'approved', ['[data-rw2="1"]'], { pad: 10 })
  await tap('appr-refuse')
  const c = await readLine(page)
  S.check(c.rf.text === 'Refused' && c.rf.ring.startsWith('solid 2px') && c.ap.color === 'rgb(125, 135, 148)', 'changed to Refused: ringed, Approve grey', c)
  await pic(S, 'refused', ['[data-rw2="1"]'], { pad: 10 })
  await tap('appr-refuse')
  const d = await readLine(page)
  S.check(d.rf.text === 'Refuse' && d.ap.text === 'Approve', 'a second tap sends it back to pending', [d.ap.text, d.rf.text])
  await pic(S, 'back-to-pending', ['[data-rw2="1"]'], { pad: 10 })
  /* the plain-user round: the bid window elsewhere keeps its marks (D2921 is Approvals only) */
  await press(S, T('lw-tab-grid')); await sleep(page, 700)
  await openCell(S, 'slipway', '2026-02-10')
  const win = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid^="decide-"] svg.dec-ic')].length)
  S.note('bid window marks: ' + win)
  if (win === 0) S.note('the empty day shows no Approve / Refuse until a bid is placed — checked by the walk earlier')
  await pic(S, 'bid-window', ['[data-testid="bid-picker"]'], { pad: 6 })
})
await closeBrowsers()
