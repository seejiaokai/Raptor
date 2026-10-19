import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, rec, waveShot, chips, summ, bPublish, pending } from './sf-A-lib.mjs'
console.log('sf-A-s15 v1')
const b = await launch()
const DI = 1
const { ctx, p } = await ctxOpen(b, 's15')
const gi = await addStandby(p, DI, 'sc')
await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
await openBoard(p, DI)
const key = `${DI}.${gi}.0.2`
const badge = `#schedBoard [data-sarole="${key}"]`
const act = () => p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'body'; const cs = getComputedStyle(e); return { tag: e.tagName, safly: e.getAttribute('data-safly'), sarole: e.getAttribute('data-sarole'), cls: e.className.toString().slice(0, 40), txt: (e.innerText || '').trim(), pressed: e.getAttribute('aria-pressed'), label: e.getAttribute('aria-label'), title: e.getAttribute('title'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 80) } })
const litNow = async () => (await chips(p, DI, gi, 0)).map(c => c.chips.some(x => x.on) ? 1 : 0).join('')
const row = () => p.locator(`#schedBoard .sb-line`, { has: p.locator(`[data-sarole="${key}"]`) }).first()
await row().scrollIntoViewIfNeeded()
await p.locator(badge).first().focus(); await sleep(200)
console.log('focus on badge', JSON.stringify(await act()))
await p.keyboard.press('Tab'); await sleep(250)
const a1 = await act()
const r1 = await shot(p, 'A-15-1-tab-to-chip', row())
const ringWord = a1 !== 'body' && (a1.outline.startsWith('solid') || a1.outline.startsWith('auto') || (a1.shadow && a1.shadow !== 'none'))
rec('15', 'focus the SPARE row\'s MAIN/SPARE badge, press Tab', 'focus lands on the dashed Flies chip with a visible focus ring', JSON.stringify(a1), a1 !== 'body' && a1.safly === key && ringWord ? 'PASS' : 'FAIL', r1)
const states = []; const focusAfter = []
for (const k of ['Enter', 'Enter', 'Space', 'Space']) {
  await p.locator(badge).first().focus(); await p.keyboard.press('Tab'); await sleep(150)
  await p.keyboard.press(k); await sleep(450)
  const fa = await act(); focusAfter.push(fa === 'body' ? 'body' : fa.tag + ':' + (fa.safly || fa.sarole || fa.cls))
  states.push(k + '→' + (await litNow()))
}
rec('15', 'Enter, Enter, Space, Space — each time Tab from the badge to the chip first', 'tick, untick, tick, untick (lit 0010, 0000, 0010, 0000)', states.join(' ; '), states.map(s => s.split('→')[1]).join(',') === '0010,0000,0010,0000' ? 'PASS' : 'FAIL')
rec('15', 'where focus is right after the chip is pressed by Enter / Space', 'focus stays on the chip, so a second press unticks without re-tabbing (the same as the older MAIN/SPARE badge behaves: RECORD that too)', `focus after each press: ${focusAfter.join(' ; ')}`, focusAfter.every(f => f.startsWith('BUTTON') || f.includes('safly') || f.includes('1.2.0.2')) ? 'PASS' : 'FAIL')
await p.locator(badge).first().focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Space'); await sleep(450); await p.locator(badge).first().focus(); await p.keyboard.press('Tab'); await sleep(150)
const beforeEsc = await litNow()
await p.keyboard.press('Escape'); await sleep(400)
const afterEsc = await litNow()
rec('15', 'Escape while the chip is focused (lit)', 'nothing changes (still lit), no harm', `before ${beforeEsc}, after ${afterEsc}; board still open: ${await p.locator('#schedBoard').isVisible()}`, beforeEsc === afterEsc && await p.locator('#schedBoard').isVisible() ? 'PASS' : 'FAIL')
/* the name a screen reader gets */
let snap = 'n/a'
try { snap = await p.locator(`#schedBoard [data-safly="${key}"]`).first().ariaSnapshot() } catch (e) { snap = 'ariaSnapshot failed: ' + e.message.slice(0, 80) }
const aOn = await act()
rec('15', 'the accessible name of the (lit, hand-ticked) chip', 'RECORD: name/state a screen reader gets', `ariaSnapshot: ${snap}`, 'RECORD')
await p.locator(badge).first().focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Space'); await sleep(450); await p.locator(badge).first().focus(); await p.keyboard.press('Tab')
const aOff = await act()
let snapOff = 'n/a'
try { snapOff = await p.locator(`#schedBoard [data-safly="${key}"]`).first().ariaSnapshot() } catch (e) { snapOff = 'failed' }
rec('15', 'the accessible name of the dashed chip', 'RECORD', `ariaSnapshot: ${snapOff}; attrs: ${JSON.stringify(aOff)}`, 'RECORD')
/* typed shift: lit chip not pressable */
await p.mouse.click(250, 26)
await bType(p, bf(DI, gi, 0, 'rl'), '0630')
await row().scrollIntoViewIfNeeded()
await p.locator(badge).first().focus(); await sleep(150)
await p.keyboard.press('Tab'); await sleep(250)
const a2 = await act()
const before = await litNow()
await p.keyboard.press('Enter'); await sleep(450); await p.keyboard.press('Space'); await sleep(450)
const after = await litNow()
const c2 = (await chips(p, DI, gi, 0))[2].chips[0]
const r2 = await shot(p, 'A-15-2-typed-shift-lit', row())
rec('15', 'R typed: Tab from the badge to the lit (not pressable) chip, then Enter and Space', 'Enter and Space must not untick or change anything; its explanation (CX the row) readable without hover', `Tab landed on ${JSON.stringify(a2)}; lit before ${before}, after ${after}; chip: tag ${c2.tag} tab ${c2.tab} aria-label "${c2.aria}" title "${c2.title}"`, before === '1111' && after === '1111' ? 'PASS' : 'FAIL', r2)
/* the week's chip takes no focus */
await closeBoard(p); await go(p, 'editsched')
const wchip = await p.evaluate(([d, g]) => { const c = document.querySelector(`#eWeek [data-sarole="${d}.${g}.0.2"]`).parentElement.querySelector('.saflies'); c.scrollIntoView({ block: 'center' }); return { tag: c.tagName, tab: c.tabIndex, focusable: (() => { c.focus(); return document.activeElement === c })() } }, [DI, gi])
const wnames = await p.evaluate(([d, g]) => { const c = document.querySelector(`#eWeek [data-sarole="${d}.${g}.0.2"]`).parentElement.querySelector('.saflies'); return { aria: c.getAttribute('aria-label'), title: c.title, role: c.getAttribute('role') } }, [DI, gi])
rec('15', 'Edit Schedule week: the lit chip', 'takes no focus and no press', `${JSON.stringify(wchip)}; ${JSON.stringify(wnames)}`, !wchip.focusable ? 'PASS' : 'FAIL')
console.log('errors', JSON.stringify(errors))
await ctx.close(); await b.close()
