import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'ad', 'a', true)
console.log(await p.evaluate(() => window.INPUTS.filter(r => /ALL/.test(String(r.person)) || /ALL/.test(String(window.PEOPLE[r.person] && window.PEOPLE[r.person].cs))).map(r => ({ person: r.person, cs: window.PEOPLE[r.person] && window.PEOPLE[r.person].cs, title: r.title, type: r.type, date: r.date }))))
console.log(await p.evaluate(() => Object.keys(window.PEOPLE).filter(k => /all/i.test(k) || /ALL/.test(window.PEOPLE[k].cs))))
await browser.close()
