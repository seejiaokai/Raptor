/* www w1 helpers: Logic page, Insights, reading helpers shared by W1's scripts. Sets WWW_WHO before the lib loads. */
process.env.WWW_WHO = 'w1'
export const X = await import('./www-lib.mjs')
export const { say, sleep, L, nrm } = X

/** the Logic page: open, and Edit mode on (admin) */
export async function logicOpen(w, edit = true) {
  const page = w.page
  await L.go(page, 'logic'); await X.sleep(500)
  if (edit && await page.locator('#lgEdit:visible').count()) { await X.press(w, '#lgEdit'); await X.sleep(300) }
}
export async function logicDone(w) {
  if (await w.page.locator('#lgDone:visible').count()) { await X.press(w, '#lgDone'); await X.sleep(300) }
}
/** type a value into a Logic setting box and leave it with Tab; returns what the box then holds */
export async function setSetting(w, key, value, { leave = 'Tab' } = {}) {
  const page = w.page
  const inp = page.locator(`[data-lgset="${key}"]:visible`).first()
  await inp.waitFor({ state: 'visible', timeout: 6000 })
  await inp.evaluate(e => e.scrollIntoView({ block: 'center' })); await X.sleep(150)
  if (w.phone) await inp.tap(); else await inp.click()
  await inp.fill(String(value))
  if (leave === 'Tab') await page.keyboard.press('Tab')
  else if (leave === 'Enter') await page.keyboard.press('Enter')
  await X.sleep(500)
  return inp.inputValue()
}
export const readSetting = async (w, key) => {
  const l = w.page.locator(`[data-lgset="${key}"]:visible`).first()
  if (await l.count()) return l.inputValue()
  return nrm(await w.page.locator(`[data-lgkey="${key}"] .val`).first().innerText().catch(() => ''))
}
/** the changed-settings strip's own words: the smallest drawn box whose text says "changed from the squadron standard" */
export async function strip(w) {
  return w.page.evaluate(() => {
    const els = [...document.querySelectorAll('#shell *')].filter(e => e.getBoundingClientRect().width > 0 && /changed from the squadron standard/i.test(e.innerText || ''))
    const leaf = els.filter(e => !els.some(o => o !== e && e.contains(o)))
    return leaf.map(l => { let e = l; while (e.parentElement && !/Published days keep/i.test(e.innerText) && e.parentElement.id !== 'shell' && e.parentElement.innerText.length < 400) e = e.parentElement
      return { cls: e.className, id: e.id, text: e.innerText.replace(/[\s ]+/g, ' ').trim(), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) } })
  })
}
/** the person-key of a callsign */
export const pidOf = (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
