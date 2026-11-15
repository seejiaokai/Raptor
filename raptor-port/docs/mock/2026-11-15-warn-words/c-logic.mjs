/* C — the Logic page's changed-settings strip. REAL today (two settings a check reads changed through the page: Default
   rally 3h -> 2h50, Debrief after landing -> 1h30), then DRAWN proposed: only the sentence after the bold count changed.
   usage: [PHONE=1] node c-logic.mjs */
import * as X from './ww-lib.mjs'
import { appendFileSync } from 'node:fs'
const w = await X.open({ phone: process.env.PHONE === '1' })
const { page, P } = w
const man = rec => appendFileSync(X.OUT + '/manifest.jsonl', JSON.stringify(rec) + '\n')
const size = w.phone ? '402x874 WebKit @3x' : '1536x864 Chromium @2x'
X.say(P, 'set', await X.setKey(w, 'reportLead', '2h50'))
X.say(P, 'set', await X.setKey(w, 'debrief', '1h30'))
if (w.phone) { await X.reload(w) }
await X.go(page, 'logic'); await X.sleep(500)
const TODAY = "2 settings changed from the squadron standard. The schedule is checked against them now. A published day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a change to Default rally, Debrief after landing or Full day of OIL would change that OIL, the day reads pending."
/* D2067 (15 Nov 26): "why are there so many text explaning" — cut to one sentence; the four-sentence version it replaced is in git */
const PROPOSED_TAIL = " Published days keep their old settings until published again."
const read = () => page.evaluate(() => (document.querySelector('#lgOff')?.innerText || '').replace(/\s+/g, ' ').trim())
async function shot(file) {
  await X.neutral(w)
  const c = await page.evaluate(() => {
    const e = document.querySelector('#lgOff'); e.scrollIntoView({ block: 'center' })
    const r = e.getBoundingClientRect()
    return { x: Math.max(0, r.left - 16), y: Math.max(0, r.top - 56), width: Math.min(innerWidth, r.right + 16) - Math.max(0, r.left - 16), height: r.bottom + 14 - Math.max(0, r.top - 56) }
  })
  await X.sleep(200)
  await page.screenshot({ path: `${X.OUT}/${file}`, clip: c })
}
const t = await read()
X.say(P, 'C TODAY', t)
if (t !== TODAY) throw new Error('strip not as the proposal quotes it: ' + t)
await shot(`c-logic-today-${P}.png`)
man({ file: `c-logic-today-${P}.png`, family: "The Logic page's note under the changed-settings strip", state: 'today', kind: 'real (Default rally 3h→2h50 and Debrief after landing changed on the Logic page)', size, rows: [t] })
await page.evaluate(tail => { const e = document.querySelector('#lgOff'), b = e.querySelector('b'); while (b.nextSibling) b.nextSibling.remove(); e.appendChild(document.createTextNode(tail)) }, PROPOSED_TAIL)
const p = await read()
const want = '2 settings changed from the squadron standard.' + PROPOSED_TAIL
if (p !== want) throw new Error('drawn strip differs: ' + p)
await shot(`c-logic-proposed-${P}.png`)
if ((await read()) !== want) throw new Error('strip redrawn by the app before the picture')
man({ file: `c-logic-proposed-${P}.png`, family: "The Logic page's note under the changed-settings strip", state: 'proposed', kind: 'drawn on the real strip (only the sentence after the bold count changed; cold-read correction "shows as pending" applied)', size, rows: [p] })
await w.browser.close()
