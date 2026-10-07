import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(600)
async function clickBox(sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(200)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(300)
  return b
}
const act = () => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.atime ? 'atime ' + a.dataset.atime : a.dataset.txt ? 'txt ' + a.dataset.txt : a.tagName) : null })
const TO = '#eWeek [data-txt="ff:0.0.0.to"]', LD = '#eWeek [data-txt="ff:0.0.0.ld"]', AT = '#eWeek [data-atime="0.0.0"]', CS = '#eWeek [data-txt="ff:0.0.0.cs"]', RM = '#eWeek [data-txt^="ff:0.0.0"][data-txt$=".rmks"]'
// 1: type a changed take-off then click landing
await clickBox(TO); await p.keyboard.press('Control+A'); await p.keyboard.type('1255')
await clickBox(LD); console.log('after typing changed TO and clicking LD: focus =', await act())
await p.evaluate(() => document.activeElement.blur())
// 2: same take-off typed (unchanged) then click area
await clickBox(TO); await p.keyboard.press('Control+A'); await p.keyboard.type('12:55')
await clickBox(AT); console.log('after typing UNCHANGED TO and clicking AT: focus =', await act())
// 3: click AT directly (no prior edit)
await p.evaluate(() => document.activeElement.blur())
await clickBox(AT); console.log('click AT directly: focus =', await act())
await p.evaluate(() => document.activeElement.blur())
// 4: changed TO then click AT, then click AT again
await clickBox(TO); await p.keyboard.press('Control+A'); await p.keyboard.type('1310')
await clickBox(AT); console.log('changed TO then click AT: focus =', await act())
await clickBox(AT); console.log('...and click AT again: focus =', await act(), 'text', await p.evaluate(() => document.activeElement.innerText))
await browser.close()
