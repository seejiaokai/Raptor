/* S10 — Import into an empty Tracker (D admin).  The empty screen ("Import a file…") cannot be reached by any control of a
   personal Tracker (deleting the last course answers "Keep at least one course."), so that part is NOT WALKED; the substitute
   is File ⇪ Import as the FIRST act of a brand-new profile, on the real backend (and on ?fresh=1), then a reload.
     node scripts/handpass/trk1105-walk-s10.mjs */
import { open, back, keys, diffKeys, classify, ocuAny, pair, click, shot, importFile, answerDialogs, mk, sleep, SCRATCH } from './trk1105-walk-lib.mjs'
import { resolve } from 'node:path'
console.log('trk1105-walk-s10 v1')
const L = mk('S10')
const file = resolve(SCRATCH, 'S9-1-before.json')
{
  const { browser, page } = await open({ url: '/?fresh=1' })
  await click(page, '#courseMenuBtn'); await click(page, '#delCourse'); await sleep(600)
  const t = await page.locator('#dlgModal:visible').innerText().catch(() => '')
  L.ok('empty "Import a file…" screen: reach it by deleting courses', 'D', 'admin', null, `NOT WALKED: deleting the only course answers "${t.replace(/\n+/g, ' / ')}" — no control reaches the empty screen`, await shot(page, 'S10-0-keep-one-course'))
  await browser.close()
}
for (const [tag, url] of [['fresh', '/?fresh=1'], ['real', '/']]) {
  const { browser, page, errors } = await open({ url })
  const k0 = await keys(page)
  await importFile(page, file)
  const dl = await answerDialogs(page, [/^Replace/i, /^Yes/i, /^Import/i, /^OK/i], 9000)
  L.note(`${tag}: import dialogs`, JSON.stringify(dl).slice(0, 600))
  await sleep(1500)
  const balls = await page.locator('#flowSvg .ball').count()
  const stu = await page.locator('#activeSel option').allInnerTexts().catch(() => [])
  const pr = await pair(page)
  L.ok(`${tag}: charts and students are there after the import`, 'D', 'admin', balls > 20 && stu.length >= 2, `balls ${balls}; students ${stu.join('/')}`, await shot(page, `S10-${tag}-2-imported`))
  L.note(`${tag}: top bar ↶ after the import`, `${pr.undoOff ? 'greyed' : 'lit'}; title "${pr.title}"; one pair in the top bar: ${pr.undo === 1 && pr.redo === 1 && pr.inTop && !pr.inTracker}`)
  const k1 = await keys(page), cl = classify(diffKeys(k0, k1))
  if (tag === 'real') {
    L.ok('real backend: changed keys under raptor:tracker/, none ocu:', 'D', 'admin', cl.tracker.length > 0 && cl.ocu.length === 0 && ocuAny(k1).length === 0 && cl.other.length === 0, `tracker ${cl.tracker.length} ocuLocal ${cl.ocuLocal.length} other ${cl.other.length}`)
    await page.reload(); await back(page, 'a', false)
    const b2 = await page.locator('#flowSvg .ball').count(), s2 = await page.locator('#activeSel option').allInnerTexts()
    L.ok('real backend: reload — the imported charts and students survive', 'D', 'admin', b2 > 20 && s2.length >= 2, `balls ${b2}; students ${s2.join('/')}`, await shot(page, 'S10-real-3-reloaded'))
  } else {
    L.ok('fresh: nothing written under raptor:tracker/, no ocu: key (memory session)', 'D', 'admin', cl.tracker.length === 0 && cl.ocu.length === 0 && ocuAny(k1).length === 0, `tracker ${cl.tracker.length} ocuLocal ${cl.ocuLocal.length}`)
  }
  L.note(`${tag} errors`, errors.join(' | ').slice(0, 500) || 'none')
  await browser.close()
}
L.save('S10')
