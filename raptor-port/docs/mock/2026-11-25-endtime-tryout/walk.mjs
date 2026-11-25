/* Walks the try-out page (index.html) the whole way at his iPhone's width (402, WebKit, touch) and a desktop's (1536,
   Chromium, mouse): draft → a refused sign-off → fill the times → sign all four → Publish day → clear a time on the
   published day → a refused amendment → fill it → sign → Publish AL1; then the three switches. Pictures go to img/.
   Run from raptor-port/: node docs/mock/2026-11-25-endtime-tryout/walk.mjs */
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdirSync } from 'node:fs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img'); mkdirSync(OUT, { recursive: true })
const req = createRequire(resolve(HERE, '../../../package.json'))
const { chromium, webkit } = req('@playwright/test')
const URL = pathToFileURL(join(HERE, 'index.html')).href
const fails = [], errors = []
const ok = (c, what) => { if (!c) fails.push(what); console.log((c ? '  ok   ' : '  FAIL ') + what) }

async function run(name, phone) {
  console.log(`== ${name}`)
  const browser = phone ? await webkit.launch() : await chromium.launch()
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(`${name} pageerror ${e.message}`))
  p.on('console', m => { if (m.type() === 'error') errors.push(`${name} console ${m.text()}`) })
  await p.goto(URL)
  const press = async sel => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); if (phone) await l.tap(); else await l.click() }
  const st = () => p.evaluate(() => { const s = window.__tryout.state(), m = window.__tryout.missing(); return { n: m.n, boxes: m.boxes.map(b => b.getAttribute('data-txt')), red: document.querySelectorAll('.et-red').length, grey: document.querySelectorAll('.et-miss:not(.et-red)').length, pub: s.published, ver: s.ver, pressed: s.pressed } })
  const note = () => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.style.opacity === '1' ? t.textContent.trim() : '' })
  /* a person's tap and first key are never in the same instant: a short wait, as a hand gives, lets the tap pick the time */
  const typeIn = async (key, v) => { await press(`[data-txt="${key}"]`); await p.waitForTimeout(150); await p.keyboard.type(v); await p.keyboard.press('Enter'); await p.waitForTimeout(80) }
  const shot = async (file, sel, pad = 10) => {
    if (!sel) { await p.screenshot({ path: join(OUT, `${name}-${file}.png`) }); return }
    const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(250)
    const b = await l.boundingBox(); const vp = p.viewportSize()
    const top = Math.max(0, b.y - pad)
    await p.screenshot({ path: join(OUT, `${name}-${file}.png`), clip: { x: 0, y: top, width: vp.width, height: Math.min(vp.height - top, b.height + pad * 2) } })
  }
  /* the amendment mark on a time: its waiting / issued attributes, the underline the app's rule draws, and the try-out's
     invisible "00:00" that carries that line across an emptied box */
  const mark = key => p.evaluate(k => {
    const e = document.querySelector(`[data-txt="${k}"]`), cs = getComputedStyle(e), af = getComputedStyle(e, '::after')
    return { text: e.textContent, aln: e.getAttribute('data-aln'), alc: e.getAttribute('data-alc'), miss: e.classList.contains('et-miss'), red: e.classList.contains('et-red'),
      line: cs.textDecorationLine, style: cs.textDecorationStyle, after: af.content }
  }, key)
  /* a close-up of the SXO desk with the rows either side, across the day only */
  const rowsShot = async file => {
    const box = p.locator('[data-txt="dr:3.0.1.end"]'); await box.scrollIntoViewIfNeeded(); await p.mouse.move(1, 1); await p.waitForTimeout(250)
    const r = await box.evaluate(e => {
      const row = e.closest('.pl-row'), a = row.previousElementSibling, b = row.nextElementSibling, day = e.closest('section.day').getBoundingClientRect()
      const top = (a && a.classList.contains('pl-row') ? a : row).getBoundingClientRect().top, bot = (b && b.classList.contains('pl-row') ? b : row).getBoundingClientRect().bottom
      return { x: day.left, w: day.width, y: top, h: bot - top }
    })
    await p.screenshot({ path: join(OUT, `${file}-${name}.png`), clip: { x: Math.max(0, r.x), y: Math.max(0, r.y - 2), width: Math.min(r.w, p.viewportSize().width), height: r.h + 4 } })
  }
  const sign = async (k, v) => { await p.locator(`select[data-sign="${k}"]`).scrollIntoViewIfNeeded(); await p.selectOption(`select[data-sign="${k}"]`, v); await p.waitForTimeout(60) }

  // 1. drafting
  let s = await st()
  console.log('  missing at start:', s.n, s.boxes.join(' '))
  ok(s.n === 4 && s.grey === s.boxes.length && s.red === 0, 'drafting: 4 items missing, all grey')
  ok(await p.locator('[data-et-count]').innerText().then(t => t.trim() === '4 items missing a time · 4 to sign'), 'count line reads "4 items missing a time · 4 to sign"')
  await shot('1-draft-top', '.tt-strip', 0)
  await shot('2-draft-signoff', '.signoff.day-sign', 60)
  await shot('3-draft-duties', '.sec-duty', 4)

  // 2. a refused sign-off
  await press('[data-et-sgn="cur"]')
  await p.waitForTimeout(250)
  s = await st()
  ok((await note()) === 'Blocked: 4 items are missing a time, each outlined in red. Type the missing times, then sign.', 'sign-off refused with the grey note: ' + await note())
  ok(s.red === s.boxes.length && s.grey === 0, 'boxes turn red once a sign-off is pressed')
  ok(await p.locator('[data-et-sgn="cur"] .v').innerText() === '— name —', 'the box stays "— name —"')
  await shot('4-refused-sign', null)
  // Publish day refused too
  await press('[data-et-publish]'); await p.waitForTimeout(250)
  ok((await note()) === 'Blocked: 4 items are missing a time, each outlined in red. Thursday was not published.', 'Publish day refused: ' + await note())
  await shot('5-refused-publish', null)

  // 3. the count line takes him to the first empty box
  await press('[data-et-count]'); await p.waitForTimeout(600)
  ok(await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-txt')) === s.boxes[0], 'count line focuses the first empty box (' + s.boxes[0] + ')')
  await p.keyboard.type('1600'); await p.keyboard.press('Enter'); await p.waitForTimeout(100)
  ok(await p.evaluate(() => document.querySelector('[data-txt="ap:3.2.end"]').textContent) === '16:00', 'SQN PT end: 1600 typed reads 16:00')
  s = await st(); ok(s.n === 3, 'count drops to 3')
  await typeIn('ff:3.0.0.to', '1240')
  ok(await p.evaluate(() => document.querySelector('[data-txt="ff:3.0.0.to"]').textContent) === '12:40', 'VL take-off: 1240 typed reads 12:40')
  await typeIn('dr:3.0.1.str', '0800'); await typeIn('dr:3.0.1.end', '14:00')
  s = await st(); ok(s.n === 1, 'SXO filled: 1 left (EP-4)')
  ok(await p.locator('[data-et-count]').innerText().then(t => t.trim() === '1 item missing a time · 4 to sign'), 'singular count line')
  await press('[data-et-sgn="sked"]'); await p.waitForTimeout(200)
  ok((await note()) === 'Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.', 'singular refusal: ' + await note())
  await shot('6-one-left', '[data-txt="sr:3.oft.0.str"]', 60)
  await typeIn('sr:3.oft.0.str', '930')
  s = await st(); ok(s.n === 0 && (await p.locator('[data-et-count]').count()) === 0, 'all filled: count line gone')
  ok(await p.locator('.signoff .so-state').innerText() === '4 to sign', 'the app\'s "4 to sign" is back')

  // 4. sign all four, then Publish day
  await sign('cur', 'Ace'); await sign('sked', 'Anvil'); await sign('plan', 'Anvil'); await sign('appr', 'Basher')
  ok(await p.locator('.signoff .so-state').innerText() === 'Signed — this day can be published', 'four signed: "Signed — this day can be published"')
  await shot('7-signed', '.signoff.day-sign', 60)
  await press('[data-et-publish]'); await p.waitForTimeout(250)
  s = await st(); ok(s.pub && (await note()) === 'Thursday published and approved', 'published: ' + await note())
  ok(await p.locator('.dhver .verchip.orig').count() === 1 && await p.locator('.signedln').count() === 1, 'ORIG tag and the Signed line show')
  await shot('8-published', '.day-head', 4)

  // 5. amendments: clear a time on the published day
  await press('[data-txt="dr:3.0.1.end"]'); await p.waitForTimeout(150); await p.keyboard.press('Backspace'); await p.keyboard.press('Enter'); await p.waitForTimeout(100)
  s = await st()
  ok(s.n === 1 && s.red === 1, 'emptied box on a published day counts again, red at once')
  ok(await p.locator('.dpend').innerText().then(t => t.replace(/\s/g, ' ') === '1 pending') && await p.locator('.nysmark').innerText() === 'Not yet signed', '"1 pending" and "Not yet signed" show')
  await shot('9-amend-pending', '.day-head', 4)
  await shot('10-amend-emptied', '[data-txt="dr:3.0.1.end"]', 50)
  let m = await mark('dr:3.0.1.end')
  ok(m.miss && m.red && m.aln === '1', 'step 1: the emptied END keeps its red outline AND wears the waiting AL1 mark')
  ok(m.line === 'underline' && m.style === 'dotted' && m.after === '"00:00"', `step 1: the app's dotted underline runs across the empty box (${m.line} ${m.style} ${m.after})`)
  await rowsShot('amend-1-emptied')
  await press('[data-et-publish]'); await p.waitForTimeout(250)
  ok((await note()) === 'Blocked: 1 item is missing a time, outlined in red. Thursday was not published.', 'Publish AL1 refused: ' + await note())
  await typeIn('dr:3.0.1.end', '15:00')
  s = await st(); ok(s.n === 0, 'filled again')
  m = await mark('dr:3.0.1.end')
  ok(m.text === '15:00' && !m.miss && m.aln === '1' && m.line === 'underline' && m.style === 'dotted' && m.after === 'none', 'step 2: a new time typed: the outline goes, the dotted waiting mark stays under 15:00')
  await rowsShot('amend-2-retyped')
  await sign('cur', 'Anvil'); await sign('sked', 'Basher'); await sign('plan', 'Basher'); await sign('appr', 'Cinch')
  ok(await p.locator('.nysmark').innerText() === 'Not yet published', '"Not yet published" once signed')
  await press('[data-et-publish]'); await p.waitForTimeout(250)
  s = await st(); ok(s.ver === 1 && (await note()) === 'Published AL1 · 1 item on Thu only · approved by Cinch', 'AL1 published: ' + await note())
  ok(await p.locator('.dhver .verchip[data-alc="1"]').count() === 1 && await p.locator('[data-txt="dr:3.0.1.end"][data-alc="1"]').count() === 1, 'AL1 tag, and the changed END wears the AL1 mark')
  await shot('11-al1', '.day-head', 4)
  await shot('12-al1-mark', '[data-txt="dr:3.0.1.end"]', 50)
  m = await mark('dr:3.0.1.end')
  ok(m.alc === '1' && !m.aln && m.line === 'underline' && m.style === 'solid', 'step 3: AL1 published: the mark goes solid with its AL1 tag')
  await rowsShot('amend-3-published')

  // 6. the switches
  await press('#ttReset'); await p.waitForTimeout(100)
  s = await st(); ok(s.n === 4 && !s.pub && s.grey === 4 + 1, 'Reset: back to the draft (5 grey boxes: SXO has two)')
  await press('[data-set="b"][data-val="block"]'); await p.waitForTimeout(80)
  s = await st(); ok(s.n === 5 && s.boxes.includes('ap:3.3.end'), '(b) block too: the dinner counts')
  await press('[data-set="a"][data-val="red"]'); await p.waitForTimeout(80)
  s = await st(); ok(s.red === s.boxes.length, '(a) red always: red while drafting')
  await shot('13-red-always', '.allhands', 4)
  await press('[data-set="a"][data-val="grey"]'); await press('[data-set="b"][data-val="never"]'); await press('[data-set="c"][data-val="grey"]')
  // fill, sign, publish, then empty a box: grey until a sign-off is pressed
  for (const [k, v] of [['ff:3.0.0.to', '1240'], ['dr:3.0.1.str', '0800'], ['dr:3.0.1.end', '1400'], ['sr:3.oft.0.str', '0930'], ['ap:3.2.end', '1600']]) await typeIn(k, v)
  await sign('cur', 'Ace'); await sign('sked', 'Anvil'); await sign('plan', 'Anvil'); await sign('appr', 'Basher')
  await press('[data-et-publish]'); await p.waitForTimeout(150)
  await press('[data-txt="ff:3.0.0.to"]'); await p.waitForTimeout(150); await p.keyboard.press('Backspace'); await p.keyboard.press('Enter'); await p.waitForTimeout(100)
  s = await st(); ok(s.pub && s.n === 1 && s.grey === 1 && s.red === 0, '(c) grey until signing: the emptied take-off is grey')
  m = await mark('ff:3.0.0.to'); ok(m.aln === '1' && m.style === 'dotted' && m.after === '"00:00"', '(c) …and wears the waiting mark under its grey outline')
  await press('[data-et-sgn="cur"]'); await p.waitForTimeout(150)
  s = await st(); ok(s.red === 1, '(c) …and red once a sign-off is pressed')
  await shot('14-grey-until-signing', '[data-txt="ff:3.0.0.to"]', 60)
  // a bad time is refused and put back
  await press('[data-txt="ff:3.0.0.ld"]'); await p.keyboard.type('99x'); await p.keyboard.press('Enter'); await p.waitForTimeout(100)
  ok(await p.evaluate(() => document.querySelector('[data-txt="ff:3.0.0.ld"]').textContent) === '14:10', 'a non-time is put back (14:10)')
  // nothing runs sideways at this width
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no sideways scroll of the page')
  await browser.close()
}

await run('iphone402', true)
await run('desktop1536', false)
console.log(errors.length ? errors.join('\n') : 'no console or page errors')
console.log(fails.length ? `${fails.length} FAILED` : 'ALL PASSED')
