// Walk step 0: what each of the five sign-ins sees on arrival — the top bar's tabs and buttons, the Schedules menu's rows.
import { serve, stop, session, shot, menuRows, note, save, errs, facts } from './lib.mjs'
await serve()
try {
  for (const sz of ['d', 'p']) {
    for (const [who, u, p] of [['saber', 'ad', 'a'], ['hunter', 'ad2', 'a2'], ['ranger', 'us', 'us'], ['kestrel', 'ad9', 'a9'], ['osprey', 'us9', 'us9']]) {
      const s = await session(sz, u, p)
      const bar = await s.page.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.top < 120 }).map(e => `${e.id || e.className.toString().slice(0, 30)}|${e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)}`))
      facts[`${sz}-${who}-bar`] = bar
      facts[`${sz}-${who}-menu`] = await menuRows(s)
      await shot(s, `w0-${sz}-${who}.png`)
      note(sz, who, JSON.stringify(facts[`${sz}-${who}-menu`]))
      await s.ctx.close()
    }
  }
} finally { save('w0'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
