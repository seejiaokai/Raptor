/* The Codex stack check — the HOST reproduces the two high-consequence results of the re-walk on a PUBLISHED day
   (6 Oct 26), on the fixed build, with the real keyboard, and takes the day's HEAD as the picture:
     1. a whole-day Tab pass with nothing typed leaves the published day exactly as it was (W11, H-04, L-11);
     2. one typed word + ONE Tab raises "1 pending" / "Not yet signed" and empties the sign-offs at once, the caret
        still in a text box (W15, R-04 (e)); Undo puts the day back.
   HP_URL=http://localhost:4233 HP_SHOTS=<dir> HP_OUT=<json> node scripts/handpass/stk-host-pub.mjs */
import * as H from './wh-lib.mjs'
const { L, W, judge, row, pic, savePart } = H
const sleep = L.sleep
const { browser, p, errors } = await H.world({ who: 'a' })
if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
await p.waitForSelector('#eWeek .day', { timeout: 15000 })
const DI = 1
await W.showDay(p, DI)
const signed = await W.signDay(p, DI)
const pub = await W.publishDay(p, DI)
await sleep(600)
const headPic = async name => {
  await p.locator(`#eWeek .day[data-day="${DI}"] .day-head`).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(250)
  return pic(p, name)
}
const stored = () => p.evaluate(i => JSON.stringify(window.DAYS[i]), DI)
const h0 = await W.head(p, DI), d0 = await stored()
const p0 = await headPic('pub-0-tuesday-published')
judge('PUB-0', 'Tuesday signed by four and published', [
  ['published', /ORIG/i.test(h0.tag), h0.tag], ['the head carries its signed line', !!h0.signed, h0.signed], ['nothing pending', !/pending/i.test(h0.pending) && !h0.nys, h0.pending],
], [p0])

/* 1. a whole-day Tab pass, nothing typed */
const first = p.locator(`#eWeek .day[data-day="${DI}"] [contenteditable="true"]`).first()
await first.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
await first.click(); await sleep(150)
let n = 0, inText = true
while (n < 260 && inText) {
  await p.keyboard.press('Tab'); n++
  inText = await p.evaluate(i => { const a = document.activeElement; return !!a && a !== document.body && !!a.closest(`#eWeek .day[data-day="${i}"]`) && (a.isContentEditable || a.matches('[data-txt],[data-inp]')) }, DI)
}
await sleep(500)
const h1 = await W.head(p, DI), d1 = await stored()
const p1 = await headPic('pub-1-after-a-whole-day-tab-pass')
judge('PUB-1', `Tab pressed ${n} times from the day's first text box until the caret left the day's boxes, nothing typed`, [
  ['the day reached its last box (many Tabs)', n > 40, n],
  ['still published, same version', h1.tag === h0.tag, h1.tag],
  ['its signed line stands', h1.signed === h0.signed && !!h1.signed, h1.signed],
  ['nothing pending', h1.pending === h0.pending && !/Not yet/i.test(h1.nys), `${h1.pending} | ${h1.nys}`],
  ['the day as stored is byte-identical', d1 === d0],
], [p1])

/* 2. one typed word, ONE Tab — read the head with the caret still in text */
const rm = p.locator(`#eWeek .day[data-day="${DI}"] [data-txt^="fr:${DI}."]`).first()
await rm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
await rm.click(); await p.keyboard.press('End'); await p.keyboard.type(' hostword', { delay: 8 })
await p.keyboard.press('Tab'); await sleep(450)
const caretInText = await p.evaluate(() => { const a = document.activeElement; return !!a && a !== document.body && (a.isContentEditable || a.matches('[data-txt],[data-inp]')) })
const h2 = await W.head(p, DI)
const p2 = await headPic('pub-2-one-word-one-tab-caret-still-in-text')
const stillIn = await p.evaluate(() => { const a = document.activeElement; return !!a && a !== document.body && (a.isContentEditable || a.matches('[data-txt],[data-inp]')) })
judge('PUB-2', 'a word typed at the end of a flying Remarks on the published Tuesday, Tab ONCE; the head read without leaving the text boxes', [
  ['the caret is in a text box', caretInText && stillIn],
  ['the head counts the change', /1 pending/i.test(h2.pending), h2.pending],
  ['"Not yet signed"', /Not yet signed/i.test(h2.nys), h2.nys],
  ['the four sign-off boxes are empty, to be signed again', W.signsEmpty(h2), h2.signs],
  ['Publish AL1 is offered', /AL1/i.test(h2.alpub), h2.alpub],
], [p2])
await p.keyboard.press('Escape'); await sleep(300)
const u = await W.door(p, 'top', 'undo'); await sleep(600)
const h3 = await W.head(p, DI), d3 = await stored()
const p3 = await headPic('pub-3-after-undo')
judge('PUB-3', 'Escape, then Undo from the top bar', [
  ['Undo ran', !!u.pressed, u.title],
  ['nothing pending again', !/pending/i.test(h3.pending) && !h3.nys, `${h3.pending} | ${h3.nys}`],
  ['the day as stored is the published day again', d3 === d0],
  ['its signed line is as published', h3.signed === h0.signed, h3.signed],
], [p3])
row('errors', 'the browser error list', JSON.stringify(errors.slice(0, 5)), errors.length ? 'FAIL' : 'PASS')
row('setup', 'sign and publish', JSON.stringify({ signed, pub }), 'RECORDED')
savePart('host-pub')
await browser.close()
