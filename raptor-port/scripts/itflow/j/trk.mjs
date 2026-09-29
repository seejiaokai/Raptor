/* J11 — the Tracker in full (D414): find your way; make a flow chart (every tool, joining events, the poke-ball
   editor); edit an event's details; mark progress and the other ways to update; what it refuses; students and
   courses; export and import. Everyone has the same access (D121). Its undo sits in RAPTOR's top bar (D347). */
import { go } from '../lib.mjs'

const ball = id => `#flowSvg .ball[data-id="${id}"]`
const tool = t => `#arrTools button:has-text("${t}")`

async function open(page) {
  await go(page, 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await page.waitForTimeout(800)
}
async function ok(page) { await page.click('#dlgOk'); await page.waitForTimeout(500) }
async function center(page, sel) {
  const b = await page.locator(sel).first().boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
async function dragBy(page, sel, dx, dy) {
  const c = await center(page, sel)
  await page.mouse.move(c.x, c.y); await page.mouse.down()
  await page.mouse.move(c.x + dx, c.y + dy, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(400)
}

export default async function ({ fresh, shot, around }) {
  // T1 — find your way
  let page = await fresh('us')
  await open(page)
  await shot(page, 'trk-1', { x: 0, y: 56, w: 640, h: 480 }, [
    { n: 1, sel: '#activeSel', pos: 'b' }, { n: 2, sel: '#courseSel', pos: 'b' }, { n: 3, sel: '#sylSel', pos: 'b' }, { see: true, sel: ball('ST-01') },
  ])
  await shot(page, 'trk-2', { x: 800, y: 142, w: 640, h: 480 }, [{ see: true, sel: '#side .c-students' }, { see: true, sel: '#side .c-overall' }])
  await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel')
  await shot(page, 'trk-3', { x: 340, y: 54, w: 760, h: 570 }, [{ n: 4, sel: '#saSearch' }, { see: true, sel: '#showAllPanel .sarow' }])
  await page.click('#saClose'); await page.waitForTimeout(300)
  await page.fill('#hSearch', 'BFM'); await page.waitForTimeout(600)
  await shot(page, 'trk-4', { x: 220, y: 56, w: 800, h: 600 }, [{ n: 5, sel: '#hSearch', pos: 'b' }, { see: true, sel: '#hSearchList' }])
  await page.context().close()

  // T2 — make a flow chart: a new empty syllabus, the tools, join two events, the poke-ball editor, save
  page = await fresh('us')
  await open(page)
  await page.click('#sylMenuBtn'); await page.waitForTimeout(400)
  await shot(page, 'chart-1', { x: 300, y: 56, w: 560, h: 420 }, [
    { n: 1, sel: '#sylMenuBtn', pos: 'b' }, { n: 2, sel: '#addSyl' }, { n: 3, sel: '#arrangeBtn' },
  ])
  await page.click('#addSyl'); await page.fill('#dlgInput', 'IT TEST CHART'); await ok(page)
  await page.click('#sylMenuBtn'); await page.click('#arrangeBtn'); await page.waitForTimeout(700)
  for (const [t, name, dx, dy] of [['+ Acad', 'A-01', 0, -150], ['+ Flight', 'F-01', 0, 60], ['+ Sim', 'S-01', 160, -60]]) {
    await page.click(tool(t)); await page.fill('#dlgInput', name); await ok(page)
    await page.click(tool('Move')); await dragBy(page, ball(name), dx, dy)
  }
  await page.click(tool('Connect'))
  await page.click(ball('A-01')); await page.click(ball('F-01'))
  await page.click(ball('S-01')); await page.click(ball('F-01')); await page.waitForTimeout(400)
  await shot(page, 'chart-2', { x: 0, y: 100, w: 960, h: 720 }, [
    { n: 4, sel: tool('+ Acad'), pos: 'b' }, { n: 5, sel: tool('Move'), pos: 'b' }, { n: 6, sel: tool('Connect'), pos: 'b' },
    { see: true, sel: ball('F-01') },
  ])
  await page.click(tool('Text')); await page.click(ball('F-01')); await page.waitForSelector('#editModal')
  await page.fill('#edText', 'FAM-1'); await page.fill('#edNum', '1'); await page.fill('#edCrew', 'IP / UW')
  await shot(page, 'chart-3', { x: 420, y: 100, w: 720, h: 540 }, [
    { n: 7, sel: '#edText' }, { n: 8, sel: '#edSave', pos: 'r' }, { see: true, sel: '#edLinks' },
  ])
  await page.click('#edSave'); await page.waitForTimeout(500)
  await shot(page, 'chart-4', { x: 480, y: 50, w: 960, h: 720 }, [{ n: 9, sel: '#saveChanges', pos: 'b' }, { see: true, sel: ball('F-01') }])
  await page.context().close()

  // an event's details (name, type, hours, crew, prerequisites): from its pop-up, or from Show All
  page = await fresh('us')
  await open(page)
  await page.click(ball('ST-01')); await page.waitForSelector('#pop')
  await page.click('#popEditInfo'); await page.waitForTimeout(400)
  await page.fill('#ifHrs', '3.5 Hrs')
  await shot(page, 'detail-1', await around(page, '#ifSave', 560, 420, 0.6, 0.75), [{ n: 1, sel: '#ifHrs' }, { n: 2, sel: '#ifSave', pos: 'r' }])
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await page.click('#showAllBtn'); await page.fill('#saSearch', 'ST-01'); await page.waitForTimeout(300)
  await page.click('#showAllPanel .sarow .sedit'); await page.waitForTimeout(400)
  await shot(page, 'detail-2', { x: 340, y: 210, w: 760, h: 570 }, [{ n: 1, sel: '#saSearch' }, { n: 2, sel: '#showAllPanel .saedit-btns button.primary', pos: 'r' }])
  await page.context().close()

  // T3 — mark progress
  page = await fresh('us')
  await open(page)
  await page.click(ball('ST-01')); await page.waitForSelector('#pop')
  const dco = '#pop .opts button:has-text("DCO")'
  await shot(page, 'mark-1', { x: 380, y: 95, w: 600, h: 450 }, [{ n: 1, sel: ball('ST-01'), pos: 'r' }, { n: 2, sel: dco }, { see: true, sel: '#popDoneDate' }])
  await page.click(dco); await page.waitForTimeout(600)
  await shot(page, 'mark-2', { x: 440, y: 140, w: 1000, h: 750 }, [{ see: true, sel: ball('ST-01') }, { see: true, sel: '#side .c-overall .big' }])
  await page.click(ball('ST-02')); await page.waitForSelector('#pop')
  await page.click('#popFailPlus'); await page.click('#popFailPlus'); await page.waitForTimeout(400)
  await shot(page, 'mark-3', { x: 380, y: 210, w: 640, h: 480 }, [{ n: 3, sel: '#popFailPlus' }, { see: true, sel: '#popFailDates' }])
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  // other ways: another student's wedge; the Failures list; the top bar's undo
  const b = await page.locator(ball('ST-01')).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2 + b.width / 2 * 0.82); await page.waitForTimeout(500)
  await shot(page, 'mark-w1', { x: 0, y: 56, w: 640, h: 480 }, [{ n: 1, sel: `${ball('ST-01')} path.wedge[data-wi="1"]`, pos: 'r' }, { see: true, sel: '#activeSel' }])
  await page.selectOption('#activeSel', { label: 'STUDENT A' }); await page.waitForTimeout(400)
  await page.locator('#failsCard').scrollIntoViewIfNeeded(); await page.click('#failTitle'); await page.waitForTimeout(500)
  await shot(page, 'mark-w2', { x: 540, y: 225, w: 900, h: 675 }, [{ n: 1, sel: '#failTitle' }, { n: 2, sel: '#failLog .frow input' }])
  await page.keyboard.press('Escape'); await page.mouse.click(300, 700); await page.waitForTimeout(300)
  await shot(page, 'mark-w3', { x: 800, y: 0, w: 640, h: 480 }, [{ n: 1, sel: '#trUndoBtn', pos: 'b' }, { see: true, sel: '#trRedoBtn' }])
  await page.context().close()

  // T4 — what it refuses: an N.A. cannot be failed; a day not yet come; a loop in the chart
  page = await fresh('us')
  await open(page)
  await page.click(ball('ST-02')); await page.waitForSelector('#pop')
  await page.click('#pop .opts button:has-text("N.A.")'); await page.waitForTimeout(400)
  await page.click(ball('ST-02')); await page.waitForSelector('#pop'); await page.click('#popFailPlus'); await page.waitForTimeout(300)
  await shot(page, 'refuse-1', { x: 380, y: 100, w: 640, h: 480 }, [{ n: 1, sel: '#popFailPlus' }, { see: true, sel: '#popFailWarn' }])
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await page.click(ball('ST-03')); await page.waitForSelector('#pop')
  await page.fill('#popDoneDate', '2026-10-05'); await page.click('#pop .opts button:has-text("DCO")'); await page.waitForTimeout(400)
  await shot(page, 'refuse-2', { x: 237, y: 82, w: 560, h: 420 }, [{ n: 1, sel: '#popDoneDate', pos: 'r' }, { see: true, sel: '#popDoneWarn' }])
  await page.context().close()
  page = await fresh('us')
  await open(page)
  await page.click('#sylMenuBtn'); await page.click('#arrangeBtn'); await page.waitForTimeout(700)
  await page.click(tool('Connect'))
  for (const id of ['ACG-01', 'ST-01']) { await page.locator(ball(id)).scrollIntoViewIfNeeded().catch(() => {}); await page.locator(ball(id)).click({ force: true }); await page.waitForTimeout(300) }
  await shot(page, 'refuse-3', { x: 440, y: 280, w: 560, h: 420 }, [{ see: true, sel: '#dlgMsg' }, { n: 1, sel: '#dlgOk', pos: 'r' }])
  await page.context().close()

  // T5 — students and courses
  page = await fresh('us')
  await open(page)
  await page.click('#addStu'); await page.waitForTimeout(500)
  await shot(page, 'stu-1', { x: 500, y: 140, w: 940, h: 705 }, [{ n: 1, sel: '#addStu', pos: 'b' }, { n: 2, sel: '#dlgFilter' }, { n: 3, sel: '#dlgList .dlg-item >> nth=2' }])
  await page.click('#dlgList .dlg-item >> nth=2'); await page.waitForTimeout(600)
  await shot(page, 'stu-2', { x: 800, y: 130, w: 640, h: 480 }, [
    { see: true, sel: '.c-students .chip.linked' },
    { n: 4, sel: '.c-students .chip:has-text("STUDENT B") .ren', pos: 'b' }, { n: 5, sel: '.c-students .chip:has-text("STUDENT B") .x', pos: 'r' },
  ])
  await page.click('#courseMenuBtn'); await page.waitForTimeout(400)
  await shot(page, 'stu-3', { x: 0, y: 56, w: 640, h: 480 }, [{ n: 6, sel: '#courseMenuBtn', pos: 'b' }, { n: 7, sel: '#addCourse' }, { see: true, sel: '#delCourse' }])
  await page.click('#addCourse'); await page.fill('#dlgInput', '27ABSG'); await ok(page)
  await page.click('#courseMenuBtn'); await page.click('#delCourse'); await ok(page)
  await page.click('#courseMenuBtn'); await page.click('#ordCourse'); await page.waitForTimeout(500)
  await shot(page, 'stu-4', { x: 460, y: 250, w: 560, h: 420 }, [{ n: 8, sel: '#ordHidden button' }, { n: 9, sel: '#ordSave', pos: 'r' }])
  await page.context().close()

  // T6 — export and import (the File menu; the save and open windows are stepped round, not opened)
  page = await fresh('us')
  await open(page)
  await page.evaluate(() => { window.showSaveFilePicker = undefined })
  await page.click('#fileMenuBtn'); await page.waitForTimeout(400)
  await shot(page, 'file-1', { x: 400, y: 56, w: 560, h: 420 }, [{ n: 1, sel: '#fileMenuBtn', pos: 'b' }, { n: 2, sel: '#exportBtn' }, { see: true, sel: '#importFileBtn' }])
  await page.click('#exportBtn'); await page.waitForTimeout(500)
  await page.check('#copyStudents'); await page.click('#copyTickAll'); await page.waitForTimeout(300)
  await shot(page, 'file-2', { x: 420, y: 230, w: 600, h: 450 }, [
    { n: 3, sel: '#copyStudents' }, { n: 4, sel: '#copyTickAll', pos: 'r' }, { n: 5, sel: '#copyOk', pos: 'r' }, { see: true, sel: '#copyWarn' },
  ])
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#copyOk')])
  const text = await (await import('node:fs/promises')).readFile(await dl.path(), 'utf8')
  await page.waitForTimeout(500)
  await shot(page, 'file-3', { x: 440, y: 280, w: 560, h: 420 }, [{ see: true, sel: '#dlgMsg' }])
  await ok(page)
  await page.evaluate(t => { window.__pickOpenForTests = async () => ({ name: 'backup.json', text: t }) }, text)
  await page.click('#fileMenuBtn'); await page.click('#importFileBtn'); await page.waitForTimeout(700)
  await shot(page, 'file-4', { x: 440, y: 280, w: 560, h: 420 }, [{ see: true, sel: '#dlgMsg' }, { n: 6, sel: '#dlgOk', pos: 'r' }])
  await page.context().close()
}
