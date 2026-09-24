/* w1 — READ-ONLY: every editable address on Saturday's board and week (text boxes, seats, drop zones),
   so the roll-call edits one cell of each kind. No writes. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, board, STATE, WIDTHS } = L
const { browser, page } = await open({ ...WIDTHS.desktop, state: STATE })
await editWeek(page)
const wk = await page.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="5"]')
  return { txt: [...d.querySelectorAll('[data-txt]')].map(e => e.dataset.txt + '=' + e.innerText.trim().slice(0, 16)),
    slots: [...d.querySelectorAll('[data-slot]')].map(e => e.dataset.slot + '=' + (e.innerText || '').trim().slice(0, 10)),
    fills: [...d.querySelectorAll('[data-fill]')].map(e => e.dataset.fill) }
})
console.log('WEEK txt', wk.txt.join(' | '))
console.log('WEEK slots', wk.slots.join(' | '))
console.log('WEEK fills', wk.fills.join(' | '))
await board(page, 5)
const bd = await page.evaluate(() => {
  const d = document.querySelector('#schedBoard')
  const vis = e => !!(e.offsetWidth || e.offsetHeight)
  return { bfld: [...d.querySelectorAll('[data-bfld]')].filter(vis).map(e => e.dataset.bfld + '=' + (e.value || e.innerText || '').trim().slice(0, 14)),
    txt: [...d.querySelectorAll('[data-txt]')].filter(vis).map(e => e.dataset.txt),
    slots: [...d.querySelectorAll('[data-slot]')].filter(vis).map(e => e.dataset.slot + '=' + (e.innerText || '').trim().slice(0, 10)),
    fills: [...d.querySelectorAll('[data-fill]')].filter(vis).map(e => e.dataset.fill) }
})
console.log('BOARD bfld', bd.bfld.join(' | '))
console.log('BOARD txt', bd.txt.join(' | '))
console.log('BOARD slots', bd.slots.join(' | '))
console.log('BOARD fills', bd.fills.join(' | '))
await browser.close()
