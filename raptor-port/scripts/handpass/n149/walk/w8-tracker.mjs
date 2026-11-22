// Walk step 8 — the Tracker after a pick (D2318, plan §16 D2′): case (a) — Saber opened it on 142, picks 149: the band
// "This is 142's Tracker. Pick 142 to change it…" and the page read only, no control offered. Each control of the page
// pressed: + Add (students), Reorder, a student's ✕ and ✎, the course and syllabus pencils, File ▾, the settings gear, a
// node of the chart, the crew list; what opens, and whether the page's "saved" mark or the students change.
// Case (b) — Hunter with Plan of 149 opens it on 149, then Saber (same browser, after sign-out) takes the Plan away and
// Hunter signs in again: (a fresh sign-in reloads the Tracker — recorded as it is).
// Then the member view (Hunter with Plan, Tracker opened on 149, member view): its own line.
import { serve, stop, newPage, signIn, shot, pick, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
const band = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('#page-tracker *')].find(x => /Tracker\./.test(x.textContent) && x.children.length < 4 && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().height < 80); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null })
const openWins = s => s.page.evaluate(() => [...document.querySelectorAll('dialog[open], [role=dialog], .modal, .menu, .dd-menu, .popover')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 30 && b.height > 30 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' }).map(e => (e.id || e.className.toString().slice(0, 30)) + ': ' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))
const students = s => s.page.evaluate(() => [...document.querySelectorAll('#page-tracker')].map(p => (p.innerText.match(/STUDENTS[\s\S]{0,200}/) || [''])[0].replace(/\s+/g, ' ')).join(''))
async function pressAll(s, P) {
  const targets = [['+ Add', '#page-tracker button:visible', /^\+ Add$/], ['Reorder', '#page-tracker button:visible', /Reorder/], ['File', '#fileMenuBtn', null], ['course pencil', '#courseMenuBtn', null],
    ['syllabus pencil', '#sylMenuBtn', null], ['legend', '#legendBtn', null], ['gear', '#page-tracker button[title*="ettings"]:visible, #flexBtn', null]]
  for (const [nm, sel, re] of targets) {
    await step(`press ${nm}`, async () => {
      const loc = re ? s.page.locator(sel, { hasText: re }).first() : s.page.locator(sel).first()
      if (!(await loc.count())) { facts[`${P}-press-${nm}`] = 'not found'; return }
      const pe = await loc.evaluate(e => ({ disabled: e.disabled, pe: getComputedStyle(e).pointerEvents, aria: e.getAttribute('aria-disabled') }))
      await loc.click({ timeout: 3000 }).catch(e => { pe.clickErr = String(e).split('\n')[0].slice(0, 80) })
      await s.page.waitForTimeout(400)
      facts[`${P}-press-${nm}`] = { ...pe, opens: await openWins(s), toast: await toastText(s) }
      await shot(s, `${P}-press-${nm.replace(/\W+/g, '')}.png`)
      await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(250)
    })
  }
  await step('press a node', async () => {
    const n = s.page.locator('#page-tracker svg g[data-id], #page-tracker .node, #page-tracker [data-ev]').first()
    if (!(await n.count())) { facts[`${P}-press-node`] = 'not found'; return }
    await n.click({ timeout: 3000 }).catch(() => {}); await s.page.waitForTimeout(400)
    facts[`${P}-press-node`] = { opens: await openWins(s) }; await shot(s, `${P}-press-node.png`); await s.page.keyboard.press('Escape')
  })
  facts[`${P}-saved-mark`] = await s.page.evaluate(() => { const e = [...document.querySelectorAll('#page-tracker *')].find(x => /^● ?saved$|^saved$/.test(x.textContent.trim())); return e ? e.textContent.trim() : null })
  facts[`${P}-students-after`] = await students(s)
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `w8-${sz}`
    await signIn(s, 'ad', 'a')
    await step('a: open on 142, pick 149', async () => {
      await navTo(s, 'Tracker'); await s.page.waitForTimeout(2500)
      facts[`${P}-students-before`] = await students(s)
      await pick(s, '149'); await s.page.waitForTimeout(800)
      facts[`${P}-band-a`] = await band(s)
      await shot(s, `${P}-a-band.png`)
    })
    await pressAll(s, `${P}-a`)
    await step('member view', async () => {
      // a fresh sign-in, 149 picked first, the Tracker opened on 149, then the member view
      if (await s.page.locator('#logout:visible').count()) await s.page.click('#logout'); else { await s.page.click('#burger'); await s.page.click('#drawerLogout') }
      await s.page.waitForTimeout(1200)
      if (await s.page.locator('[role=dialog] button:visible', { hasText: /Discard/ }).count()) await s.page.locator('[role=dialog] button:visible', { hasText: /Discard/ }).first().click()
      await s.page.waitForSelector('#luser', { timeout: 20000 })
      await signIn(s, 'ad', 'a'); await pick(s, '149'); await navTo(s, 'Tracker'); await s.page.waitForTimeout(2500)
      facts[`${P}-bound149-band`] = await band(s)
      await s.page.locator('#roleBadge:visible').first().click().catch(async () => { await s.page.click('#burger'); await s.page.click('#drawerRole') }); await s.page.waitForTimeout(800)
      await navTo(s, 'Tracker'); await s.page.waitForTimeout(800)
      facts[`${P}-member-band`] = await band(s); facts[`${P}-member-badge`] = await text(s, '#roleBadge')
      await shot(s, `${P}-member-tracker.png`)
      await pick(s, '149'); await s.page.waitForTimeout(800)
      facts[`${P}-member-149-band`] = await band(s)
      await shot(s, `${P}-member-149-tracker.png`)
    })
    await s.ctx.close()
  }
} finally { save('w8'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
