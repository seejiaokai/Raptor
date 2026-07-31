/* Engine ↔ reference parity: boot the untouched reference app in jsdom, run
   its engine, and require the ported engine to produce byte-identical results
   on the seed week. This pins the verbatim port far harder than spot
   assertions can — any drift in validate/collectEvents/REST/EVD shows up here. */
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { JSDOM, VirtualConsole } from 'jsdom'
import { validate, WARN, REST, EVD } from './validate'
import { collectEvents } from './events'
import { dayCount } from './waves'
import { DAYS } from './data'

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
})

describe('engine parity with the reference', () => {
  it('collectEvents matches the reference exactly', () => {
    expect(JSON.parse(JSON.stringify(collectEvents()))).toEqual(JSON.parse(JSON.stringify(w.collectEvents())))
  })

  it('validate produces identical WARN {all, byDay, sev, chip}', () => {
    const ref = w.validate()
    const port = validate()
    expect(JSON.parse(JSON.stringify(port.all))).toEqual(JSON.parse(JSON.stringify(ref.all)))
    expect(JSON.parse(JSON.stringify(port.byDay))).toEqual(JSON.parse(JSON.stringify(ref.byDay)))
    expect(JSON.parse(JSON.stringify(port.sev))).toEqual(JSON.parse(JSON.stringify(ref.sev)))
    expect(JSON.parse(JSON.stringify(port.chip))).toEqual(JSON.parse(JSON.stringify(ref.chip)))
    expect(WARN).toBe(port)
  })

  /* top-level let/const in a classic script are not window properties — read
     them out of the page's scope with eval instead */
  it('REST and EVD publish identically', () => {
    validate(); w.validate()
    expect(JSON.parse(JSON.stringify(REST))).toEqual(JSON.parse(w.eval('JSON.stringify(REST)')))
    expect(JSON.parse(JSON.stringify(EVD))).toEqual(JSON.parse(w.eval('JSON.stringify(EVD)')))
  })

  it('seed data matches (DAYS) and day badges agree', () => {
    expect(JSON.parse(JSON.stringify(DAYS))).toEqual(JSON.parse(w.eval('JSON.stringify(DAYS)')))
    DAYS.forEach((d: any, i: number) => expect(dayCount(d)).toBe(w.eval(`dayCount(DAYS[${i}])`)))
  })
})
