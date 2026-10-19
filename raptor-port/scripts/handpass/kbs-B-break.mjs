// Walker B — the two break tests, run in a console step (no source touched). VERSION 1
//  (a) remove the box's class, press, type: typing must ADD again (proves the class list is what arms it)
//  (b) B8: no press at all — focus by script and type, and write through the box's own value setter: nothing replaces
import { launch, RES } from './kbs-B-lib.mjs'
import { appendFileSync } from 'node:fs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-break VERSION 3', size)
const A = await launch(size)
const { page } = A
const T = id => page.locator(`[data-testid="${id}"]`)
const vis = async id => (await T(id).count()) > 0 && (await T(id).first().isVisible().catch(() => false))
const rec = (id, did, expected, shown, result, pics, note) => { const r = { id, box: 'break test', size, step: 'BRK', did, expected, shown, result, pics: pics || [], note: note || '' }; appendFileSync(RES, JSON.stringify(r) + '\n'); console.log(`  [${id} ${size}] ${result} — ${JSON.stringify(shown)} ${note || ''}`) }

async function breakA(id, name, loc, cls, prior, typed) {
  const l = loc()
  await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  await l.fill(prior); await l.evaluate(e => e.blur()); await page.waitForTimeout(750)
  const h = await l.elementHandle()
  const before = await h.evaluate(e => e.className)
  await h.evaluate((e, c) => e.classList.remove(c), cls)
  const after = await h.evaluate(e => e.className)
  // press at the box's centre (a handle, so the class being gone does not lose the box)
  const b = await h.boundingBox()
  if (A.S.touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(150)
  const atPress = await h.evaluate(e => ({ cls: e.className, connected: e.isConnected, focused: e === document.activeElement }))
  await page.keyboard.type(typed, { delay: 45 }); await page.waitForTimeout(150)
  const st = await h.evaluate(e => ({ v: e.value, cls: e.className, connected: e.isConnected, focused: e === document.activeElement }))
  const pic = await A.shot(`BREAK-a-${id}`)
  // red = the break made typing ADD again (the value is not just what was typed)
  const added = st.v !== typed && st.v.includes(typed)
  const note = `at the press: class list "${atPress.cls}", box still in the page ${atPress.connected}, box focused ${atPress.focused}; after typing: class list "${st.cls}", in page ${st.connected}, focused ${st.focused}`
  rec(id, `(a) ${name}: removed the class "${cls}" in the console (class list "${before}" -> "${after}"), pressed once, typed "${typed}" (box held "${prior}")`, 'typing ADDS again (value is the old text with the typed text in it) — so the step "typing replaces" goes red', st.v, added ? 'PASS (break turned replace into add)' : 'FAIL (break had no effect: typing still replaced, or the typed text did not land)', [pic], note)
}
const sect = async (id, fn) => {
  try { await fn() } catch (e) {
    let pic = ''
    try { pic = await A.shot(`BREAK-failed-${id}`) } catch {}
    rec(id, `break test setup for ${id}`, 'the box reached', String(e).slice(0, 160), 'NOT REACHED', pic ? [pic] : [], 'script step failed: ' + String(e).split('\n')[0].slice(0, 200))
  }
}
const cancelAll = async () => {
  for (let i = 0; i < 3; i++) { const x = page.locator('.bidsheet button.x:visible').first(); if (await x.count()) await x.click().catch(() => {}); await page.waitForTimeout(250) }
  for (const t of ['Cancel']) { const b = page.locator('button:visible', { hasText: new RegExp('^\\s*' + t + '\\s*$') }).last(); if (await b.count()) await b.click().catch(() => {}); await page.waitForTimeout(250) }
}
// B7 — the SANS gear
await sect('B7', async () => {
  await A.go('inputs'); await page.waitForTimeout(700)
  await A.tap('#inSansMode'); await page.waitForTimeout(700)
  await A.tap('.sc-gear'); await page.waitForTimeout(500)
  await breakA('B7', 'SANS ⚙ Yellow from', () => T('sset-yellow'), 'sset-num', '1', '2')
  await cancelAll()
})
// B6 — the Inputs gear
await sect('B6', async () => {
  await A.go('inputs'); await page.waitForTimeout(600)
  await A.tap('#inMemberMode'); await page.waitForTimeout(600)
  await A.tap('#inGear'); await page.waitForTimeout(500)
  await breakA('B6', 'Inputs ⚙ Days before the week starts', () => T('iset-lead'), 'sset-num', '14', '10')
  await cancelAll()
})
// B8 — the Logic page
await sect('B8', async () => {
  await A.go('logic'); await page.waitForTimeout(600)
  if (!(await page.locator('.lgin').first().isVisible().catch(() => false))) { await page.click('#lgEdit'); await page.waitForTimeout(600) }
  const crew = () => page.locator('input.lgin[aria-label="Crew rest"]')
  await crew().first().waitFor({ state: 'attached', timeout: 5000 })
  await breakA('B8', 'Logic Crew rest', crew, 'lgin', '12h', '11h')
  await page.evaluate(() => document.querySelectorAll('input[aria-label="Crew rest"]').forEach(e => e.classList.add('lgin')))
  // (b) on B8: no press — focus by script then type; and the box's own value setter
  const l = crew()
  await l.fill('12h'); await l.evaluate(e => e.blur()); await page.waitForTimeout(750)
  await l.evaluate(e => { e.classList.add('lgin') })
  await l.evaluate(e => { e.focus(); e.setSelectionRange(e.value.length, e.value.length) }); await page.waitForTimeout(200)
  await page.keyboard.type('5', { delay: 45 }); await page.waitForTimeout(150)
  const v1 = await A.val(l)
  const pic1 = await A.shot('BREAK-b-B8-focus-only')
  rec('B8', '(b) no press at all: focused the Crew rest box by script (caret at the end, box held "12h"), typed "5"', 'nothing replaces: the box holds "12h5"', v1, v1 === '12h5' ? 'PASS' : 'FAIL', [pic1])
  await l.fill('12h'); await l.evaluate(e => e.blur()); await page.waitForTimeout(500)
  const v2 = await l.evaluate(e => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, e.value + '9'); e.dispatchEvent(new Event('input', { bubbles: true })); return e.value })
  await page.waitForTimeout(200)
  const pic2 = await A.shot('BREAK-b-B8-value-setter')
  rec('B8', '(b) typed through the box\'s own value setter only (no press, no keys): "9" appended to "12h" and an input event sent', 'nothing replaces: the box holds "12h9"', v2, v2 === '12h9' ? 'PASS' : 'FAIL', [pic2])
  await l.fill('12h'); await l.evaluate(e => e.blur())
})
// B3 — the counter form
await sect('B3', async () => {
  await A.go('leavewar'); await page.waitForTimeout(1200)
  await A.tap(T('settings-open')); await page.waitForTimeout(500); await A.tap(T('counter-add')); await page.waitForTimeout(500)
  await breakA('B3', 'Leave War counter form Amber below', () => T('cform-amber'), 'mth-in', '0', '3')
  await cancelAll()
})
// B5 — the OIL credit days
await sect('B5', async () => {
  await cancelAll()
  await A.tap(T('oil-tracker')); await page.waitForTimeout(700)
  await A.tap(page.locator('[data-testid="oil-list"] >> text=Reaper').first()); await page.waitForTimeout(500)
  await breakA('B5', 'OIL tracker credit days', () => T('oil-amt'), 'oil-num', '1', '2')
  if (await vis('oil-close')) await A.tap(T('oil-close'))
  await page.waitForTimeout(400)
})
// B1 — Duty templates (on Admin)
await sect('B1', async () => {
  await A.go('admin'); await page.waitForTimeout(500)
  await page.evaluate(() => document.getElementById('admDutyTpl').click()); await page.waitForTimeout(600)
  await breakA('B1', 'Duty templates Start', () => page.locator('input.tm:visible').first(), 'tm', '0700', '0800')
})
// B11 — the Scheduler Board take-off
await sect('B11', async () => {
  await A.go('editsched'); await page.waitForTimeout(500)
  await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
  await breakA('B11', 'Scheduler Board take-off', () => page.locator('[data-bfld="ff:0.0.0.to"]').first(), 'tm', '0900', '1000')
})
console.log('errors', A.errors)
await A.close()
