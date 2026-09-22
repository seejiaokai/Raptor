/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 17: naming the phantom.
   Publishing the everything-Saturday and reopening the saved world leaves the
   day reading "1 pending · Publish AL1" with nobody having touched it — but
   the near-empty Sunday reloads clean, and it happens with or without a
   placeholder. So it is something ON that Saturday that does not survive the
   round trip through storage. This asks the app WHICH cell it thinks moved. */
import { open, board, publish, shot, closeBoard, tap, STATE } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const TMP = OUT + '/state-lw-tmp3.json'
const DI = 5

const a = await open({ state: STATE })
await board(a.page, DI)
await publish(a.page, DI)
const beforeKeys = await a.page.evaluate(i => {
  const S = window.SCHED || {}
  return { pending: (S.pending || {})[i] || null, changes: (S.changes || {})[i] || null, added: (S.added || {})[i] || null }
}, DI)
console.log('straight after publishing, the day is holding:', JSON.stringify(beforeKeys))
await closeBoard(a.page); await a.page.waitForTimeout(600)
await a.page.context().storageState({ path: TMP })
await a.browser.close()

const b = await open({ state: TMP })
await board(b.page, DI)
const afterKeys = await b.page.evaluate(i => {
  const S = window.SCHED || {}
  const j = v => { try { return JSON.parse(JSON.stringify(v)) } catch { return String(v) } }
  return { pending: j((S.pending || {})[i] ?? null), changes: j((S.changes || {})[i] ?? null), added: j((S.added || {})[i] ?? null) }
}, DI)
console.log('after the reload, the day is holding:', JSON.stringify(afterKeys, null, 1).slice(0, 1200))

/* the History door names the cell in the squadron's own words */
const hist = b.page.locator('#schedBoard button:has-text("History")').first()
if (await hist.count()) {
  await hist.click(); await b.page.waitForTimeout(1200)
  const txt = await b.page.evaluate(() => [...document.querySelectorAll('.bidsheet, [role=dialog], .airpop, #histPop')]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
    .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700)))
  console.log('\nHISTORY says:', JSON.stringify(txt, null, 1).slice(0, 1400))
  await shot(b.page, 'LW-41-history-after-reload')
  await b.page.keyboard.press('Escape'); await b.page.waitForTimeout(400)
}
/* and the amendment marks painted on the day name the cell on screen */
const marked = await b.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-alp], #schedBoard [data-aln]')]
  .map(e => ({ tag: e.tagName, alp: e.getAttribute('data-alp'), aln: e.getAttribute('data-aln'),
    where: (e.closest('.sb-arow, .sb-line, .sb-panel') || {}).className || '',
    txt: (e.innerText || e.value || '').replace(/\s+/g, ' ').slice(0, 40) })).slice(0, 12))
console.log('\ncells wearing an amendment mark:', JSON.stringify(marked, null, 1).slice(0, 1200))
await shot(b.page, 'LW-42-marks-after-reload')
await b.browser.close()
