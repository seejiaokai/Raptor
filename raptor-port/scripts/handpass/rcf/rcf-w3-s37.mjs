/* rcf-w3 S37 v1 — the duty-template notes (D1994, D1997), from Admin and from the board's + Block pencil.
   usage: RCF_RUN=s37-r1 node scripts/handpass/rcf/rcf-w3-s37.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s37 v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()

const WANT = {
  avalon: 'The AVALON desk — until the AVALON flies, checked only for overseas or medically down (ATT B may still man it), and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated.',
  bb: 'The BB desk — the same rules as the AVALON desk: until the BB flies,',
}
const tplText = () => page.evaluate(() => {
  // the words of the window itself, drawn elements only
  const root = document.querySelector('#tplClose')?.closest('[role=dialog], .win, .modal, .tpl, [class*=tpl]') || document.body
  return (root.innerText || '').replace(/ /g, ' ').replace(/\s+/g, ' ')
})
const noteOf = async (v) => {
  const wave = page.locator('.tpl-wave select').first()
  await wave.selectOption(v); await page.waitForTimeout(350)
  const all = nrm(await page.evaluate(() => document.body.innerText))
  const i = all.indexOf('The ' + v.toUpperCase() + ' desk')
  return { all, note: i >= 0 ? all.slice(i, i + 330) : '(no "The ' + v.toUpperCase() + ' desk" text)' }
}

async function viaAdmin() {
  await page.locator('a[data-page="admin"]:visible').first().click(); await page.waitForTimeout(500)
  await page.getByText('Squadron config', { exact: true }).first().click(); await page.waitForTimeout(300)
  await page.locator('#admDutyTpl:visible').click()
  await page.waitForSelector('#tplClose'); await page.waitForTimeout(300)
}
await viaAdmin()
await L.shot(page, 'a-open')
for (const v of ['avalon', 'bb']) {
  const { note } = await noteOf(v)
  const full = v === 'avalon' ? WANT.avalon : null
  check(`S37 admin ${v} note`, v === 'avalon' ? note.startsWith(WANT.avalon) : note.startsWith(WANT.bb) && note.includes('Switch it on in OIL Earn if activated.'), `read: "${note}"`)
  await L.shot(page, `a-${v}`)
}
// the note's own element, cropped
for (const v of ['avalon', 'bb']) {
  await page.locator('.tpl-wave select').first().selectOption(v); await page.waitForTimeout(300)
  const loc = page.locator(`text=/The ${v.toUpperCase()} desk/`).first()
  if (await loc.count()) await L.shot(page, `a-${v}-note-crop`, loc)
}
// the BB note, in full as read (the owner's words only quoted for the head)
await page.locator('.tpl-wave select').first().selectOption('bb'); await page.waitForTimeout(300)
const bbFull = (await noteOf('bb')).note
say('RECORD BB note full:', bbFull)
check('S37 admin bb note full wording', bbFull.includes('The BB desk — the same rules as the AVALON desk: until the BB flies, checked only for overseas or medically down (ATT B may still man it), and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated.'), bbFull)

// the close routes: each opens fresh, closes by one route, and says whether it closed
const isOpen = () => page.locator('#tplClose:visible').count()
async function reopen() { if (!(await isOpen())) await viaAdminAgain() }
async function viaAdminAgain() {
  // we are still on Admin → Squadron config after a close
  await page.locator('#admDutyTpl:visible').click(); await page.waitForSelector('#tplClose'); await page.waitForTimeout(300)
}
const closes = {}
// ✕ (#tplClose)
await page.locator('#tplClose').click(); await page.waitForTimeout(400); closes['✕'] = !(await isOpen())
await reopen()
// Done
const done = page.getByRole('button', { name: /^Done$/ }).first()
if (await done.count() && await done.isVisible()) { await done.click(); await page.waitForTimeout(400); closes['Done'] = !(await isOpen()) } else closes['Done'] = 'no Done button'
await reopen()
// Escape
await page.keyboard.press('Escape'); await page.waitForTimeout(400); closes['Escape'] = !(await isOpen())
await reopen()
// press outside (the dark area beside the window)
await page.mouse.click(8, 400); await page.waitForTimeout(400); closes['outside press'] = !(await isOpen())
say('RECORD which closes close the Admin duty-template window:', JSON.stringify(closes))
check('S37 admin close routes recorded', 'RECORD', JSON.stringify(closes))
await reopen(); await page.locator('#tplClose').click(); await page.waitForTimeout(300)

// from the board: + Block menu pencil
await L.board(page, 4)
await L.tap(page, '[data-dwadd="4"]'); await page.waitForTimeout(500)
await L.shot(page, 'b-plusblock-menu')
const pencil = await page.evaluate(() => {
  const cand = [...document.querySelectorAll('button, [role=button], svg, a')].filter(e => e.offsetWidth > 0 && /manage|edit|templates|pencil|gear|settings/i.test((e.title || '') + (e.getAttribute('aria-label') || '') + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className)))
  return cand.slice(0, 8).map(e => e.tagName + '|' + (e.title || '') + '|' + (e.getAttribute('aria-label') || '') + '|' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 40) + '|' + (e.getAttribute('data-act') || ''))
})
say('candidates for the pencil:', pencil.join(' ;; '))
const menuText = await page.evaluate(() => { const m = [...document.querySelectorAll('body *')].filter(e => e.offsetWidth > 0 && /^ADD\b/.test((e.innerText || '').trim()) && e.children.length > 1); return m.length ? m[m.length - 1].innerText.replace(/\s+/g, ' ') : null })
say('menu text:', menuText)
await browser.close()
W.summary()
