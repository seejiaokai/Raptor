/* wwf w2 R4 — the Logic page's crew-rest fold. usage: [PHONE=1] [WHO=u] node scripts/handpass/wwf/wwf-w2-r4.mjs */
import * as H from './wwf-w2-lib.mjs'
const PHONE = process.env.PHONE === '1'
const WHO = process.env.WHO || 'a'
const RUN = `r4-${PHONE ? 'p' : 'd'}-${WHO}`
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE, who: WHO })
const { page } = w
const SZ = (PHONE ? 'phone' : 'desktop') + (WHO === 'a' ? ' admin' : ' member')
const WANT = 'A standby shift, or a desk made from an SC, AVALON or BB template, with START typed and END blank is left out until its END is typed.'
const nrm = H.nrm
await X.L.go(page, 'logic'); await sleep(1500)
await pic(w, '01-logic-top')
const found = await page.evaluate(() => {
  const ds = [...document.querySelectorAll('details')].filter(d => /standby shift/i.test(d.textContent) && d.dataset.how === "crewrest")
  ds.forEach((d, i) => d.setAttribute('data-w2fold', String(i)))
  return ds.map(d => ({ open: d.open, sum: (d.querySelector('summary') || {}).innerText, ctx: (d.closest('section, .lgset, .card, li, div[class]') || d).className }))
})
say('folds containing "standby shift"', JSON.stringify(found))
const sum = page.locator('[data-w2fold="0"] > summary').first()
const cnt = await sum.count()
if (cnt) {
  await sum.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await pic(w, '02-fold-closed')
  if (PHONE) await sum.tap(); else await sum.click()
  await sleep(500)
  await pic(w, '03-fold-open')
}
const info = await page.evaluate(() => {
  const d = document.querySelector('[data-w2fold="0"]')
  if (!d) return null
  const heading = (d.closest('section, .lgset, .card, li') || d.parentElement).innerText.slice(0, 120).replace(/\s+/g, ' ')
  return { open: d.open, heading, text: d.innerText.replace(/ /g, ' ').replace(/\s+/g, ' '), items: [...d.querySelectorAll('li, p')].map(e => e.innerText.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()), visible: d.offsetWidth > 0 }
})
say('fold', JSON.stringify(info))
const hit = info && info.items[1] && nrm(info.items[1]).endsWith(WANT)
const inText = info && nrm(info.text).includes(WANT)
const second = info && info.items.filter(t => /standby shift/i.test(t))
row('R4', SZ, 'Logic page, crew-rest check, open its "How it works" fold', 'its second line reads word for word: ' + WANT, `fold open ${info && info.open}; heading ${info && info.heading}; lines containing "standby shift": ${JSON.stringify(second)}; second line ends exactly with it: ${hit ? "yes" : "no"}; second line: ${info && info.items[1]}; sentence inside fold text ${inText}`, info && info.open && inText && hit ? 'PASS' : 'FAIL', `w2/${RUN}/03-fold-open.png`)
// also: the whole page, any other "clash"/"Wrong seat" words
const all = await page.evaluate(() => { document.querySelectorAll('details').forEach(d => { d.open = true }); return document.body.innerText.replace(/\s+/g, ' ') })
say('other mentions of standby shift', JSON.stringify([...all.matchAll(/.{0,60}standby shift.{0,160}/gi)].map(m => m[0])))
await X.fin(w)
