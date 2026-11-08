// the SANS add on the board, as a scheduler files it: + Add under SANS Avail, the dialog's default SANS man, Save
export async function fileSansOnBoard(w, sleep) {
  const { page } = w
  const add = page.locator('#schedBoard [data-inpadd="5.s"]').filter({ visible: true }).first()
  await add.scrollIntoViewIfNeeded(); console.log("hit", await add.evaluate(e => { const r = e.getBoundingClientRect(); const a = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return a ? a.tagName + "." + a.className + " " + (a.textContent || "").slice(0, 30) : "none" })); if (w.phone) await add.tap(); else await add.click(); await sleep(600); console.log("float", JSON.stringify(await page.evaluate(() => [...document.querySelectorAll(".floatwin")].map(e => (e.dataset.testid || e.className) + ":" + e.getBoundingClientRect().width))))
  await page.locator("#inpEditSave").waitFor({ state: "visible", timeout: 8000 }).catch(e => console.log("no save button", e.message.slice(0, 80))); await sleep(300)
  await page.fill('#inpEditRmk', 'R-SANS').catch(() => {})
  await page.getByLabel('Fly', { exact: true }).check()
  await page.locator('#inpEditSave').click(); await sleep(600)
  const nd = page.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click(); await sleep(500) }

  const rec = await page.evaluate(() => { const x = window.INPUTS.find(i => i.remarks === 'R-SANS'); return x ? { person: x.person, cs: (window.PEOPLE[x.person] || {}).cs, type: x.type, allday: x.allday } : null })
  for (let i = 0; i < 3; i++) { const n = await page.evaluate(() => { const x = [...document.querySelectorAll('.floatwin .win-x')].find(e => e.getBoundingClientRect().width > 0 && !e.closest('#schedBoard')); if (x) x.click(); return !!x }); if (!n) break; await sleep(300) }
  return rec
}
