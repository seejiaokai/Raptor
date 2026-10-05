/* probe for P4c-11: what Escape and Enter do to a Board time box / Remarks box, with the caret and value at 0 / 300 / 1200 ms */
import * as R from './stk2-P-run.mjs'
const { newWorld, closeWorld, openBoard, nav, boxList, clickBox, caret, label, sleep, pic, scopeSel, valueOf, typeNow, seqN } = R
for (const surf of ['board', 'week']) {
  const page = await newWorld({})
  if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
  const scope = surf === 'week' ? scopeSel('week', 0) : scopeSel('board', 0)
  for (const key of ['ff:0.0.0.to', 'fr:0.0.0.0']) {
    const list = await boxList(page, scope); const ix = list.findIndex(b => b.key === key)
    const orig = (await valueOf(page, scope, key))
    await clickBox(page, scope, ix); await typeNow(page, 'ZZ9')
    const n0 = await seqN(page)
    await page.keyboard.press('Escape')
    const reads = []
    for (const t of [0, 300, 1200]) { if (t) await sleep(t === 300 ? 300 : 900); reads.push({ t, vals: await valueOf(page, scope, key), caret: label(await caret(page)), cmds: (await seqN(page)) - n0 }) }
    await pic(page, `probe11-${surf}-${key.replace(/[^a-z0-9]/gi, '_')}-after-escape`)
    console.log(surf, key, 'orig', JSON.stringify(orig), JSON.stringify(reads))
    // click elsewhere (a heading) and read again
    await page.mouse.click(5, 5); await sleep(400)
    console.log('   after clicking away:', JSON.stringify(await valueOf(page, scope, key)), 'cmds', (await seqN(page)) - n0)
  }
}
await closeWorld()
