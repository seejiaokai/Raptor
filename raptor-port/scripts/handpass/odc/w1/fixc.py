s = open('c.mjs', newline='').read()
s = s.replace("for (let k = 0; k < 9; k++) { await fingerScroll('dcal-months', -110); mLog.push(await sel('dcal-months')) }",
              "for (let k = 0; k < 15; k++) { await fingerScroll('dcal-months', -44); mLog.push(await sel('dcal-months')) }")
s = s.replace("return { iso: e.getAttribute('data-iso'), bg: s.backgroundColor, col: b.color, picked: !!document.querySelector('.dcal-d.is-sel') }",
              "const bb = e.querySelector('b') ? getComputedStyle(e.querySelector('b')).backgroundColor : null; return { iso: e.getAttribute('data-iso'), bgBtn: s.backgroundColor, bgNumber: bb, col: b.color, picked: !!document.querySelector('.dcal-d.is-sel'), pickedIso: (document.querySelector('.dcal-d.is-sel') || {}).dataset ? document.querySelector('.dcal-d.is-sel').dataset.iso : null }")
s = s.replace("!today.picked &&", "today.bgNumber !== 'rgba(0, 0, 0, 0)' &&")
s = s.replace("const wrapped = mLog.some((m, i) => /^Dec/.test(m) && /^Jan/.test(mLog[i + 1] || ''))", "const wrapped = mLog.some((m, i) => /^Dec/.test(m) && /^Jan/.test(mLog[i + 1] || ''))")
s = s.replace("await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800)\n  const open2 = await vis(L, '[data-testid=\"dcal-card\"]')",
              "await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800)\n  const open2 = await vis(L, '[data-testid=\"dcal-card\"]')\n  const early = open2 ? await cardOnTop({ page, W: 390, H: 844 }, 'back-early') : null\n  await page.waitForTimeout(3000)")
s = s.replace("After turning back to 390x844: calendar ${open2 ? 'stayed open' : 'closed'} ${D(c2)};", "After turning back to 390x844: calendar ${open2 ? 'stayed open' : 'closed'}, at 0.8s ${D(early)}, at 4s ${D(c2)};")
s = s.replace("VERSION 1", "VERSION 2")
open('c.mjs', 'w', newline='').write(s)
