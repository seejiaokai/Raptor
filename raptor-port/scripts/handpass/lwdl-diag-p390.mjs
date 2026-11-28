// lwdl-diag-p390.mjs — walks two Approvals presses at 390 wide that did not land: the point pressed, what stands there, the state after. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// why did two Approvals presses at 390 not land? each press: the point, what stands there, the state after
import { run, signIn, press, readDecide, pic, T, sleep, closeBrowsers } from './lwdl-lib.mjs'
await run('DIAG390', (process.env.SZ || 'p390').split(','), async S => {
  const page = S.page
  await signIn(S); await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  const tag = () => page.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; ls.forEach((l, i) => l.setAttribute('data-lwdl', String(i))); return ls.length })
  const n = await tag()
  for (const [i, w] of [[0, 'approve'], [n - 1, 'refuse'], [3, 'approve'], [4, 'approve']]) {
    await tag()
    const loc = page.locator(`[data-lwdl="${i}"] [data-testid="appr-${w}"]`)
    await loc.scrollIntoViewIfNeeded()
    const bb = await loc.boundingBox()
    const at = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return (e?.dataset?.testid || e?.className?.toString() || e?.tagName) + ' in ' + (e?.closest('[data-lwdl]')?.dataset.lwdl ?? '-') }, { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 })
    const sy = await page.evaluate(() => scrollY)
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await sleep(page, 600)
    await tag()
    const d = await readDecide(page, `[data-lwdl="${i}"]`)
    S.note(`line ${i} ${w}: box ${JSON.stringify(bb)} scrollY ${sy} at-point "${at}" → ${d.map(b => b.cls).join(' / ')}`)
    await pic(S, `line${i}-${w}`, [`[data-lwdl="${i}"]`], { pad: 30 })
  }
})
await closeBrowsers()
