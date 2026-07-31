/* UI markup parity: the ported day/legend builders must produce byte-identical
   markup to the untouched reference for every day of the seed week. Combined
   with the verbatim stylesheet, what the React app paints is what the
   reference paints. */
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { JSDOM, VirtualConsole } from 'jsdom'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'
import { dayHTML, legendHTML } from './html'

let w: any

beforeAll(async () => {
  const html = readFileSync('reference/scheduler.html', 'utf8')
  const vc = new VirtualConsole()
  vc.on('jsdomError', () => {})
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true })
  w = dom.window
  w.URL.createObjectURL = () => 'blob:x'
  w.HTMLElement.prototype.scrollIntoView = () => {}
  await new Promise(r => setTimeout(r, 300))
  w.eval('validate()')
  validate()
})

describe('view-week markup parity with the reference', () => {
  it('every day of the read-only week is byte-identical', () => {
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},false)`)
      expect(dayHTML(di, false), 'day ' + di).toBe(ref)
    })
  })

  it('the edit-mode markup is byte-identical too', () => {
    DAYS.forEach((_: any, di: number) => {
      const ref = w.eval(`dayHTML(${di},true)`)
      expect(dayHTML(di, true), 'day ' + di).toBe(ref)
    })
  })

  it('the legend is byte-identical', () => {
    expect(legendHTML()).toBe(w.eval('legendHTML()'))
  })
})
