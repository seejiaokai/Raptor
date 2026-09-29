/* F — [REQ-DOOR-WORDS] 1: the preview banner's "Switch to this plan" was made to say the switch in the plans menu's own
   words (the unit test pins the handler: ui/interactions.ts data-draftgo → board.ts switchDraft). The WALK asks whether a
   person can reach that button at all. On the never-published Friday a second plan is made ("+ Alt Plan"), previewed
   from View-only Sched's plan picker, then Edit Schedule is opened:
   F1 View-only Sched shows the plan's banner READ-ONLY — no Switch (it is an edit-surface button, `vsel`);
   F2 Edit Schedule draws no plan preview at all — its plans menu previews issued versions only and switches plans
      directly, and a view page's preview does not carry over.
   So no screen route reaches "Switch to this plan" today — the walk's finding, filed as [PLAN-BANNER-DOOR] (retire the
   door or give it a route). Both facts are asserted, so the day a route appears this walk goes red and says so.
   Usage: node sf-f-banner.mjs [outdir-suffix] */
const OUT = 'f-banner' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, editWeek, altPlan, screen, check, note, summary, SF_STATE, DESK } = L
const DI = 4                                     // Friday — never published

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
await editWeek(page)
const made = await altPlan(page, DI)
const plans = await page.evaluate(di => ({ all: window.dayDrafts(di).map(t => ({ id: t.id, name: t.name })), live: window.curDraftId(di) }), DI)
const other = plans.all.find(t => t.id !== plans.live)
note('the plans after "+ Alt Plan"', JSON.stringify({ made, plans }))
check('setup: Friday has a second plan besides the live one', !!other, JSON.stringify(plans))

await go(page, 'viewsched'); await page.waitForTimeout(600)
await L.viewPick(page, DI, 'd:' + other.id)
const v = await page.evaluate(() => [...document.querySelectorAll('#vWeek .dprev-bar')].filter(e => e.offsetWidth).map(b => ({ text: b.textContent.replace(/\s+/g, ' ').trim(), switch: !!b.querySelector('[data-draftgo]') })))
await screen(page, 'f1-view-plan-banner')
note('F1 View-only Sched', JSON.stringify(v))
check('F1 View-only Sched shows the plan\'s banner read-only, with no Switch', v.length === 1 && /Viewing plan/.test(v[0].text) && !v[0].switch, JSON.stringify(v))

await go(page, 'editsched'); await page.waitForTimeout(700)
const e = await page.evaluate(() => ({ bars: [...document.querySelectorAll('#eWeek .dprev-bar')].filter(x => x.offsetWidth).length,
  switches: [...document.querySelectorAll('[data-draftgo]')].filter(x => x.offsetWidth).length }))
await screen(page, 'f2-edit-no-plan-preview')
note('F2 Edit Schedule', JSON.stringify(e))
check('F2 Edit Schedule draws no plan preview, so no "Switch to this plan" anywhere ([PLAN-BANNER-DOOR])', e.bars === 0 && e.switches === 0, JSON.stringify(e))

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-f-banner') ? 1 : 0
