/* w3 PROBE 3 — the week navigation controls a person has on the edit and view pages, at both widths. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, go, shot } = L
for (const w of ['desktop', 'phone']) {
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  for (const pg of ['editsched', 'viewsched']) {
    await go(page, pg)
    const c = await page.evaluate(() => [...document.querySelectorAll('[data-wk], #weekCal, [id*=Cal], [id*=cal], button[title*="week" i], button[title*="date" i]')]
      .filter(e => e.offsetWidth || e.offsetHeight).map(e => `${e.tagName}#${e.id}.${String(e.className).slice(0, 30)} wk=${e.dataset.wk || ''} "${(e.innerText || '').trim().slice(0, 20)}" title="${(e.title || '').slice(0, 50)}"`))
    console.log(w, pg, JSON.stringify(c, null, 0))
    await shot(page, `probe-nav-${w}-${pg}`)
  }
  console.log('errors', errors)
  await browser.close()
}
