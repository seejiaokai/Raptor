// draw-e7 - bug reports (his D2628 C5): Help's "Bug reports" as an admin - one list, newest first, reports from 142, 149
// and 150, each wearing its squadron's grey number on its title line, no headings.
// THE REPORTS, raised by the app's own Help → "Report a problem" (Category, What happened, Send report), Saber filing
// each with that squadron picked: 142, then 149, then 150. All in one browser page: today the app keeps reports only
// while the page is open (no Logout, no reload, between filing and reading - a Logout or a reload loses them, the fault
// found with C5), so a member on 142 and one on 149 cannot each file and leave them for the admin here. The report texts
// ("Test report - …") are the case's data, not words of the drawing.
// Today a report keeps no squadron: the number each wears is the squadron in view when it was sent, known from these
// presses. THE CHANGE DRAWN: the app's grey squadron badge (`.bl-sqn`, the bell's) first on each report's title line.
//  e7t-d  today's list (for comparison)        e7-d  the list with the numbers
//   node raptor-port/scripts/handpass/n176/draw-e7.mjs
import { run, as, FACT, wait, hit, reachPick, shot, box, words, closeAll, barSq } from './draw-lib.mjs'
import { go, toastNow } from '../n175/p6-lib.mjs'
const FILE = [['142', 'Schedule board', 'Test report - the week did not load'], ['149', 'Inputs & calendar', 'Test report - a leave shows twice'], ['150', 'Inputs & calendar', 'Test report - a holiday is missing']]
try {
  await run('e7', 'd', async s => {
    await as(s, 'saber')
    const mine = []
    for (const [num, cat, text] of FILE) {
      await reachPick(s, Number(num), 'bar'); await go(s, 'help'); await wait(s, 500)
      await s.page.selectOption('#bugCat', cat); await s.page.fill('#bugText', text); await hit(s, '#bugSend', 600)
      FACT(`e7.filed.${num}`, { squadronInView: await barSq(s), toast: await toastNow(s) })
      mine.push({ num, text }); await wait(s, 1100)
    }
    await reachPick(s, 142, 'bar'); await go(s, 'help'); await wait(s, 600)
    FACT('e7.today', { lead: await words(s, '#bugAdmin .help-lead'), rows: await words(s, '#bugList .bugrow') })
    const at = async () => { await s.page.evaluate(() => { document.querySelector('#bugAdmin').scrollIntoView({ block: 'start' }); scrollBy(0, -80) }); await wait(s, 300) }
    await at()
    await shot(s, 'e7t-d-today', [await box(s, '#bugAdmin')])
    const r = await s.page.evaluate(mine => [...document.querySelectorAll('#bugList .bugrow')].map(row => {
      const text = row.querySelector('.bugtext').textContent
      const num = mine.find(m => m.text === text)?.num || '142'
      const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = num; m.style.marginLeft = '0'
      row.querySelector('.bughead').prepend(m)
      return `${num} | ${row.querySelector('.bughead').innerText.replace(/\s+/g, ' ').trim()} | ${text}`
    }), mine)
    FACT('e7.drawn', r)
    await at()
    await shot(s, 'e7-d-numbers', [await box(s, '#bugAdmin')])
  })
} finally { await closeAll() }
