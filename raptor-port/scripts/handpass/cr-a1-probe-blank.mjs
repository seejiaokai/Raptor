/* Walker A1 — probe: after the board is closed on Saturday, is the week behind it drawn? (pub-03 / pub-05 showed an
   empty black week with "DAY 6–7 OF 7"). Pictures at 0.5 s, 2 s and 5 s, and what the week's scroll box holds. */
import { openA1, boardOn, boardOff, book, go } from './cr-a1-lib.mjs'
const { browser, page, errors } = await openA1('a')
const bk = book('blank')
const probe = () => page.evaluate(() => {
  const out = {}
  for (const id of ['eWeek', 'vWeek']) {
    const w = document.getElementById(id); if (!w || !w.offsetWidth) continue
    const days = [...w.querySelectorAll(':scope .day')].map(d => { const r = d.getBoundingClientRect(); return `${d.dataset.day}:${Math.round(r.left)}..${Math.round(r.right)} h${Math.round(r.height)} kids${d.children.length}` })
    const sc = w.closest('.week') || w
    out[id] = { scrollLeft: Math.round(sc.scrollLeft), scrollWidth: sc.scrollWidth, clientWidth: sc.clientWidth, days }
  }
  return out
})
await boardOn(page, 5)
await boardOff(page)
await page.waitForTimeout(500)
bk.note('edit-500', await probe(), await bk.shot(page, 'edit-after-board-close-500ms'))
await page.waitForTimeout(1500)
bk.note('edit-2000', await probe(), await bk.shot(page, 'edit-after-board-close-2s'))
await page.waitForTimeout(3000)
bk.note('edit-5000', await probe(), await bk.shot(page, 'edit-after-board-close-5s'))
await go(page, 'viewsched')
await page.waitForTimeout(1500)
bk.note('view', await probe(), await bk.shot(page, 'view-after'))
bk.save(errors)
await browser.close()
