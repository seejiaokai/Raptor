import { launch, ctxOpen, SIZES, sleep, shot, buildSat, rlBox, val, model, rec, errors, status } from './lib.mjs'
console.log('sc08b v1')
const b = await launch()
const R = rlBox(5, 0, 0)
const toSign = p => p.evaluate(() => (document.querySelector('#schedBoard').innerText.match(/(\d+) to sign[^\n]*/) || ['signed'])[0])
const { ctx, p } = await ctxOpen(b, SIZES.desk, '8c')
await buildSat(p)
const sels = p.locator('#schedBoard [data-signday="5"]:visible'); const n = await sels.count()
for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && !/^—/.test(v))); await sels.nth(i).selectOption(opts[i]); await sleep(200) }
const s1 = await toSign(p)
const e = p.locator(R + ':visible').first(); await e.click(); await e.fill(''); await p.keyboard.type('0830')
const s2 = await toSign(p)
const beak = p.locator('#schedBoard [data-beak="5"]:visible').first()
const dis = await beak.isDisabled()
console.log('before press: signed state', s1, '| after typing R:', s2, '| publish disabled:', dis)
await beak.click({ force: true }).catch(e => console.log('click err', String(e).slice(0, 100))); await sleep(1200)
const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) }
const st = await status(p); const m = await model(p, 5, 0, 0)
rec('8', 'desk', 'sign all four, type R 0830 (no leaving), press "Publish day" once', 'publishes on that first press, with R 08:30', { signedBefore: s1, afterTyping: s2, disabledAtPress: dis, st, rl: m.rl }, st.chip === 'ORIG' && m.rl === '08:30' ? 'PASS' : 'FAIL', await shot(p, 'A08-publish2'))
// control: same without a changed box
await ctx.close()
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '8d')
  await buildSat(p)
  await p.locator(R + ':visible').first().click(); await p.keyboard.type('0830'); await p.keyboard.press('Tab'); await sleep(500)
  const sels = p.locator('#schedBoard [data-signday="5"]:visible'); const n = await sels.count()
  for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && !/^—/.test(v))); await sels.nth(i).selectOption(opts[i]); await sleep(200) }
  const s1 = await toSign(p)
  const beak = p.locator('#schedBoard [data-beak="5"]:visible').first()
  console.log('control: signed state', s1, 'disabled', await beak.isDisabled())
  await ctx.close()
}
console.log('errors', JSON.stringify(errors)); await b.close()
