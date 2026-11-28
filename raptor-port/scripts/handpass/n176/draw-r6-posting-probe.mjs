// draw-r6-posting-probe - reads (never changes) Admin → Users' own parts for the posting drawings: Cinch's opened row and
// an archived man's opened row (its "Post in" date box and note), their HTML and pictures into .tmp/n176-draw/.
import { run, as, FACT, wait, hit, vis, usersTab, closeAll, TMP, scratch } from './draw-r5b-lib.mjs'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const ST = resolve(TMP, 'r6-users-state.json')
try {
  for (const sz of ['d', 'p']) await run(`p6.probe.${sz}`, sz, async s => {
    await as(s, 'hunter'); await usersTab(s); await wait(s, 500)
    await hit(s, s.page.locator('[data-testid="acc-groups"] [data-person="snap"] .acc-tap').first(), 700)
    await s.page.evaluate(() => { const c = document.querySelector('.acc-row.od-row-on'); scrollBy(0, c.getBoundingClientRect().top - 110) }); await wait(s, 300)
    writeFileSync(resolve(TMP, `p6-probe-${sz}-cinch.html`), await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on').outerHTML))
    await scratch(s, `p6-probe-${sz}-cinch`)
    await hit(s, '#accEdCancel', 400)
    const arch = await s.page.evaluate(() => { const b = document.querySelector('#accArchived button'); return b ? b.textContent : null })
    FACT(`probe.${sz}.arch`, arch)
    if (arch) { await hit(s, '#accArchived button', 500)
      const first = s.page.locator('#accArchList .acc-row .acc-tap').first()
      if (await first.count()) { await hit(s, first, 700)
        await s.page.evaluate(() => { const c = document.querySelector('.acc-row.od-row-on'); scrollBy(0, c.getBoundingClientRect().top - 110) }); await wait(s, 300)
        writeFileSync(resolve(TMP, `p6-probe-${sz}-arch.html`), await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on').outerHTML))
        await scratch(s, `p6-probe-${sz}-arch`) } }
  }, { state: ST })
} finally { await closeAll() }
