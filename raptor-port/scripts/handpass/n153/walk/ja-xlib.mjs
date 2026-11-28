// Walker A: File → Export and Import through the app's own window. Files land in the walker's scratch folder only. ja-xlib v1
import { mkdirSync, readFileSync } from 'node:fs'
import { hit, menuItem, ask, note, sleep } from './ja-lib.mjs'
const DIR = `${process.env.MQ_OUT}/exports`
mkdirSync(DIR, { recursive: true })
let n = 0
/* opts: charts, students (the two ticks), all (the All button of the syllabus list); returns the file read back */
export async function exportIt(s, tag, { charts = true, students = false, all = false } = {}) {
  await menuItem(s, 'file', 'exportBtn')
  await s.page.waitForSelector('#copyModal', { timeout: 5000 })
  await s.page.locator('#copyCharts').setChecked(charts)
  await s.page.locator('#copyStudents').setChecked(students)
  if (all) await hit(s, '#copyTickAll', 150)
  const ticked = await s.page.evaluate(() => [...document.querySelectorAll('#copySylList label')].filter(l => l.querySelector('input').checked).map(l => l.textContent.trim()))
  const warn = await s.page.evaluate(() => document.getElementById('copyWarn')?.textContent.trim())
  const dl = s.page.waitForEvent('download', { timeout: 20000 })
  await hit(s, '#copyOk', 0)
  const d = await dl
  const path = `${DIR}/${s.sz}-${process.pid}-${++n}-${tag}.json`
  await d.saveAs(path)
  await s.page.waitForSelector('#dlgModal', { timeout: 6000 })
  const said = (await ask(s)).msg
  await hit(s, '#dlgOk', 350)
  const text = readFileSync(path, 'utf8')
  return { path, doc: JSON.parse(text), text, ticked, warn, said, suggested: d.suggestedFilename() }
}
/* answers: charts 'replace' | 'skip' | a new name; students true | false. Returns every question and the closing report. */
export async function importIt(s, path, { charts = 'replace', students = false } = {}) {
  const fc = s.page.waitForEvent('filechooser', { timeout: 12000 })
  await menuItem(s, 'file', 'importFileBtn')
  const chooser = await fc
  await chooser.setFiles(path)
  const said = []
  for (let i = 0; i < 30; i++) {
    let up = false
    for (let k = 0; k < 40 && !up; k++) { up = (await s.page.locator('#dlgModal').count()) > 0; if (!up) await s.page.waitForTimeout(100) }
    if (!up) { note(`[${s.sz}] import: no further question`); break }
    const q = await ask(s); said.push(q.msg)
    if (/already exists/.test(q.msg)) {
      if (charts === 'replace') await hit(s, '#dlgOk', 400)
      else if (charts === 'skip') await hit(s, '#dlgCancel', 400)
      else await hit(s, '#dlgAlt', 400)
    } else if (/Name for the incoming/.test(q.msg)) {
      await s.page.locator('#dlgInput').fill(`${charts}${said.filter(x => /Name for/.test(x)).length}`); await hit(s, '#dlgOk', 500)
    } else if (/also contains students/.test(q.msg)) {
      await hit(s, students ? '#dlgOk' : '#dlgCancel', 600)
    } else { await hit(s, '#dlgOk', 400); await sleep(s, 200); if (!(await s.page.locator('#dlgModal').count())) break }
  }
  return said
}
export const holds = (x, w) => x.text.includes(w)
