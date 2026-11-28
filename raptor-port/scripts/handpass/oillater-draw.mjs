// oillater-draw — chat 210's picture of his D2867 for the owner (D1625): the day's OIL list on the LAST of the four
// sign-off boxes, one of two questions answered, the foot reading "Save: the rest stays unanswered for now".
// The real app on this branch's build; the Saturday's two Training inputs left unanswered; CUR CK, SKED CK and PLANNED BY
// signed by Later; APPROVED BY pressed; one row's Yes. The foot line is ringed.
// Run from raptor-port/:  TS_URL=http://localhost:4321/ HP_SHOTS=<folder> node scripts/handpass/oillater-draw.mjs
import { SIZES, SAT_DI, open, login, openBoard, pickSign, log, errs, done } from './frf-w3-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const OUT = process.env.HP_SHOTS
mkdirSync(OUT, { recursive: true })
const RING = '.mk-ring { outline: 3px solid #ff2d95 !important; outline-offset: 3px !important; border-radius: 4px }'
for (const key of ['desktop', 'phone']) {
  const sz = { ...SIZES[key], opts: { ...SIZES[key].opts, deviceScaleFactor: key === 'desktop' ? 2 : 3 } }
  const { b, p } = await open(sz)
  await login(p)
  await p.addStyleTag({ content: RING })
  await p.evaluate(() => { const w = window
    w.INPUTS.unshift({ iid: 'mk-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now', acc: 'g' })
    w.INPUTS.unshift({ iid: 'mk-meet', person: 'stiff', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 540, e: 960, remarks: '', mod: 'now', acc: 'g' })
    w.afterSchedMutate() })
  await openBoard(p, SAT_DI)
  for (const [role, nth] of [['cur', 0], ['sked', 0], ['plan', 1]]) {
    await pickSign(p, 'board', role, nth)
    await p.locator('[data-testid="odl-later"]').waitFor({ timeout: 6000 }); await p.locator('[data-testid="odl-later"]').click(); await p.waitForTimeout(300)
  }
  await pickSign(p, 'board', 'appr', 2)
  await p.locator('[data-testid="win-oilday"]').waitFor({ timeout: 6000 }); await p.waitForTimeout(300)
  const yes = p.locator('[data-testid="win-oilday"] [data-testid^="odl-yes-"]').first()
  if (sz.tap) await yes.tap(); else await yes.click()
  await p.waitForTimeout(400)
  const foot = await p.evaluate(() => { const f = document.querySelector('[data-testid="odl-left"]'); f.classList.add('mk-ring'); return f.textContent })
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
  log(key, 'foot:', JSON.stringify(foot))
  const win = p.locator('[data-testid="win-oilday"]').first()
  await win.screenshot({ path: path.join(OUT, `last-box-some-picked-${key}.png`) })
  await p.screenshot({ path: path.join(OUT, `last-box-some-picked-${key}-whole.png`) })
  await done(b)
}
log('errors:', errs.length ? errs.join('\n') : 'none')
