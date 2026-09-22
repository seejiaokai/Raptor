/* THE DOOR HUNT (22 Sep 26) — why the request's own edit button is not in the
   DOM on the board the driver opens.

   HOOKS.editMode() = canEditSched() && CURPAGE==='editsched' && !protectedWeek()
   and board-html's sbInpRow draws a plain <span> instead of the button whenever
   RO (= pv || !editMode()) is true. So one of those three is false. Report all
   three, on the saved Saturday world and on a fresh one. */
import { open, board } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const out = {}
for (const [tag, opts] of [['saved-world', { state: STATE }], ['fresh', { fresh: true }]]) {
  const { browser, page, errors } = await open(opts)
  await board(page, 5)
  out[tag] = await page.evaluate(() => ({
    CURPAGE: window.CURPAGE,
    editMode: window.editMode(),
    SBDAY: window.SBDAY,
    CURWEEK: window.CURWEEK,
    inpeditInDom: document.querySelectorAll('[data-inpedit]').length,
    inpeditVisible: [...document.querySelectorAll('[data-inpedit]')].filter(e => e.offsetParent).length,
    inputsTotal: (window.INPUTS || []).length,
    dayApproved: window.dayApproved ? window.dayApproved(window.SBDAY) : null,
  }))
  out[tag].errors = errors.slice(0, 4)
  await browser.close()
}
console.log(JSON.stringify(out, null, 1))
