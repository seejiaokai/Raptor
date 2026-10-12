// does View-only Sched draw a Personal Inputs line at all? (read only)
import * as K from './or-K-lib.mjs'
const { ctx, page: p } = await K.openWorld({ fresh: false })
const filed = await K.fileInput(p, { type: 'Meeting', people: ['Ranger', 'Tally', 'Hex'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE })
await K.goView(p)
await p.locator('button[data-wk]:visible', { hasText: 'Jul 13' }).first().click().catch(() => {}); await p.waitForTimeout(800)
const r = await p.evaluate(() => ({ secInp: document.querySelectorAll('#vWeek .sec-inp').length, pitog: document.querySelectorAll('#vWeek [data-pitog]').length, personalText: [...document.querySelectorAll('#vWeek *')].filter(e => /personal inputs/i.test(e.textContent) && e.children.length === 0).map(e => e.textContent.trim().slice(0, 60)), wedHead: (document.querySelectorAll('#vWeek .day:not(.peek)')[2] || {}).innerText?.slice(0, 80), sections: [...(document.querySelectorAll('#vWeek .day:not(.peek)')[2]?.querySelectorAll('[class*=sec-]') || [])].map(e => e.className.slice(0, 40)) }))
console.log(JSON.stringify(r))
// the edit page for comparison: is the line folded?
await K.goWeek(p)
const e = await p.evaluate(() => ({ pitog: document.querySelectorAll('#eWeek [data-pitog]').length, secInp: document.querySelectorAll('#eWeek .day:not(.peek) .sec-inp').length, fold: [...document.querySelectorAll('#eWeek [data-pitog]')].slice(0, 3).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 80)) }))
console.log(JSON.stringify(e))
console.log('ERRS', JSON.stringify(K.errs))
await ctx.close(); await K.browser.close()
