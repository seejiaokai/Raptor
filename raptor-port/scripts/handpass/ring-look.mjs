/* THE LOOK OF THE ONE MARK (owner D860, D861 — 15 Oct 26): pictures for him of the just-added ring as built — the opened
   day's card (no glow), the month's bar, the desktop List's one box round the row, and a note added on the Scheduler
   Board ringed on its own box. Each picture is taken inside the ring's six seconds.
   usage: DL_BASE=http://localhost:4174 DL_SHOTS=<folder> node scripts/handpass/ring-look.mjs */
import { L, inputsCal, openAdd } from './tb/w3/lib.mjs'

{ /* a phone: the opened day's card, then the month's bar */
  const w = await L.world('phone'), p = w.page
  try {
    await inputsCal(w, '2026-07-13'); await openAdd(w, '2026-07-15')
    await p.fill('#inpEditPop #inpEditRmk', 'ring look').catch(() => {})
    await w.press('#inpEditSave'); await L.sleep(900)
    await L.pic(w, 'ring-card-phone')
    const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click())
    /* changed again from its window would be another road; the month's bar after a save with no day open: the List's
       pencil is not there on a phone, so the bar is pictured by saving from the month's own "+" */
  } finally { await L.close(w) }
}
{ /* a desktop: the List's one box */
  const w = await L.world('desk'), p = w.page
  try {
    await L.go(w, 'inputs')
    await w.press('#inListBtn'); await L.sleep(400)
    await w.press('#inNew'); await L.sleep(400)
    await p.locator('#inpEdCal [data-cal]').nth(14).click(); await L.sleep(200)
    await w.press('#inpEditSave'); await L.sleep(900)
    await L.pic(w, 'ring-list-desk')
  } finally { await L.close(w) }
}
{ /* a desktop and a phone: a note added on the Scheduler Board */
  for (const size of ['desk', 'phone']) {
    const w = await L.world(size), p = w.page
    try {
      await L.go(w, 'editsched')
      await p.locator('#eWeek [data-sbday="1"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
      await p.waitForSelector('#schedBoard .sb-sec', { state: 'attached' }); await L.sleep(600)
      await p.locator('#schedBoard [data-nadd="1"]').first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await L.sleep(500)
      await p.locator('#schedBoard .sb-fresh').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
      await L.pic(w, `ring-note-${size}`)
    } finally { await L.close(w) }
  }
}
