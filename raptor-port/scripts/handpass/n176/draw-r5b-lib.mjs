// draw-r5b-lib - round 5's redraws (chat 187, 25 Nov 26; brief docs/superpowers/briefs/2026-11-25-msq-q3-redraw-brief.md):
// the shared set-up and helpers over ./draw-lib.mjs. Nothing here writes the app's code.
// THE R5B WORLD (state-r5b.json), made by Saber's presses from the round's world (./world.mjs), saved once (FRESH=1 remakes):
//   142: Blade's row → Sign-in "blade", Role Admin → "Give sign-in"   (a 142 admin with a sign-in, near the top of 142's list)
//   142: Bolt's row → Sign-in "bolt" (Member) → "Give sign-in"; then Access to 149: View → Save
//        (a 142 man who already holds View of 149, near the top of 142's list so the group's picture shows him)
//   149: Osprey's row → Role: Admin → Save                              (a second admin of 149, for the bell, item 7)
// Every word a drawing adds comes from ./words.mjs (W) - round 5's words added there under "round 5".
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, FACT, wait, vis, hit, usersTab, reachPick, give, toastNow, world, TMP, DRAWN, note } from './draw-lib.mjs'
import { windowsNow } from '../n175/p6-lib.mjs'
export * from './draw-lib.mjs'
export const R5B = resolve(TMP, 'state-r5b.json')
async function okDialogs(s) { for (let i = 0; i < 3; i++) { if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 500) } }
export async function r5bWorld() {
  if (existsSync(R5B) && !process.env.FRESH) return R5B
  await run('r5b.setup', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 500)
    /* Blade: a sign-in and Admin */
    await hit(s, s.page.locator('[data-person="slash"] .acc-tap').first(), 700)
    await s.page.fill('#accGiveName', 'blade'); await wait(s, 200)
    await s.page.selectOption('#accGiveRole', 'admin')
    await hit(s, '#accGive', 800); FACT('r5b.setup.blade.asked', (await windowsNow(s)).map(w => w.words.slice(0, 160))); await okDialogs(s)
    FACT('r5b.setup.blade', { toast: await toastNow(s), row: await s.page.evaluate(() => document.querySelector('[data-person="slash"]')?.innerText.replace(/\s+/g, ' ').trim()) })
    /* Bolt: a sign-in (Member), then View of 149 */
    const bolt = await s.page.evaluate(() => [...document.querySelectorAll('.acc-row[data-person]')].find(e => e.querySelector('.acc-name')?.childNodes[0]?.textContent === 'Bolt')?.dataset.person)
    await hit(s, s.page.locator(`[data-person="${bolt}"] .acc-tap`).first(), 700)
    await s.page.fill('#accGiveName', 'bolt'); await wait(s, 200)
    await hit(s, '#accGive', 800); await okDialogs(s)
    FACT('r5b.setup.bolt.signIn', { pid: bolt, toast: await toastNow(s) })
    FACT('r5b.setup.bolt.view149', await give(s, bolt, '149', 'view'))
    FACT('r5b.setup.bolt.row', await s.page.evaluate(p => document.querySelector(`[data-person="${p}"]`)?.innerText.replace(/\s+/g, ' ').trim(), bolt))
    /* Osprey: Admin of 149 */
    await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 500)
    await hit(s, s.page.locator('[data-person="osp9"] .acc-tap').first(), 700)
    await s.page.selectOption('#accEdRole', 'admin'); await wait(s, 200)
    await hit(s, '#accEdSave', 800); FACT('r5b.setup.osprey.asked', (await windowsNow(s)).map(w => w.words.slice(0, 160))); await okDialogs(s)
    FACT('r5b.setup.osprey', { toast: await toastNow(s), row: await s.page.evaluate(() => document.querySelector('[data-person="osp9"]')?.innerText.replace(/\s+/g, ' ').trim()) })
    FACT('r5b.setup.149rows', await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70))))
    await reachPick(s, 142, 'bar'); await wait(s, 600)
    writeFileSync(R5B, JSON.stringify(await s.ctx.storageState()))
  }, { state: await world() })
  return R5B
}
/* the pink mark (n175's: 3px #e6007e, 4px clear of the thing) round a box, drawn into the page for the picture */
export const ring = (s, b) => s.page.evaluate(b => { const d = document.createElement('div'); d.className = '__r5bring'; Object.assign(d.style, { position: 'absolute', left: (b.x - 4 + scrollX) + 'px', top: (b.y - 4 + scrollY) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: '3px solid #e6007e', zIndex: 2147483647, pointerEvents: 'none' }); document.body.appendChild(d) }, b)
/* "VISIBLY GREYED" (the host's note on item 4): a main (cyan) button greyed by its own disabled state still reads as a
   lit, dimmed cyan; so a greyed main button takes the app's greyed PLAIN button look - a plain `.abtn` disabled beside it,
   its colours read and copied - the button itself disabled too */
export const greyLook = (s, sel) => s.page.evaluate(sel => {
  const b = document.querySelector(sel); b.disabled = true
  const t = document.createElement('button'); t.className = 'abtn'; t.disabled = true; t.textContent = 'x'; b.parentElement.appendChild(t)
  const c = getComputedStyle(t); const look = { background: c.backgroundColor, color: c.color, borderColor: c.borderColor, opacity: c.opacity }
  t.remove(); Object.assign(b.style, look)
  return look
}, sel)
/* a picture pair where the crop may reach below the screen: the whole screen as seen, the crop cut from the whole page */
export async function shotTall(s, name, rect, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${DRAWN}/${name}.png` })
  const sy = await page.evaluate(() => scrollY)
  const clip = { x: Math.max(0, rect.x - pad), y: Math.max(0, rect.y + sy - pad), width: rect.w + 2 * pad, height: rect.h + 2 * pad }
  await page.screenshot({ path: `${DRAWN}/${name}-crop.png`, clip, fullPage: true })
  FACT(`${name}.crop`, clip); note('picture', `${name}.png + -crop`)
}
