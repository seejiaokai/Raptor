/* The public-repo scrub, pinned (owner, 9 Sep 26 — "put more made up areas and
   generic wording", "remove the traces that the source paper trail was read
   from a master syllabus", "remove the history traces that the notes came
   from the real crew workbook"). The demo data is invented, but its SHAPE
   used to name real airspace, an orders reference, a visiting aircraft, real
   exercises, and the document the course maps were transcribed from. This
   test is the tripwire: a future demo edit or a re-bake that pastes any of
   that back in fails here, the way the smoke suite fails on a real student
   name. It reads the shipped seeds and the two course-map files directly. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { WEEK2_DAYS } from './week2'
import { noteText } from './note'
import { DEMO_OIL } from '../leavewar/state/demoworld'
import { seedLedger } from '../leavewar/engine/seed'

const AREAS = new Set(['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH+EAST'])
/* a real airspace designator, a real orders citation, a real type, a real EP */
const REAL = /\bD\d{4}\b|\bAA2NS\b|\bD15R\b|D15HOH|\bG550\b|FG SOP|\bCHAP \d|\bPARA \d|BURN THROUGH/

describe('the demo weeks carry invented areas and generic wording', () => {
  for (const [name, days] of [['week 1', DAYS], ['week 2', WEEK2_DAYS]] as const) {
    it(`${name}: every flying area is one of the made-up ones`, () => {
      for (const d of days as any[])
        for (const wv of d.waves || [])
          for (const f of wv.formations || [])
            for (const a of f.aircraft || [])
              expect(AREAS.has(a.area), `${d.dow} ${wv.label} ${f.cs}: ${a.area}`).toBe(true)
    })
    it(`${name}: notes, traffic, in-times and remarks name nothing real`, () => {
      for (const d of days as any[]) {
        for (const n of d.notes || []) expect(noteText(n), `${d.dow} note`).not.toMatch(REAL)
        for (const wv of d.waves || []) {
          for (const t of wv.traffic || []) expect(t, `${d.dow} traffic`).not.toMatch(REAL)
          for (const t of wv.intimes || []) expect(t, `${d.dow} in-time`).not.toMatch(REAL)
          for (const f of wv.formations || [])
            for (const a of f.aircraft || []) expect(a.rmks || '', `${d.dow} rmks`).not.toMatch(REAL)
        }
      }
    })
  }
})

describe('the Leave War demo names no real exercise', () => {
  it('every ledger reason is generic', () => {
    const reasons = [...seedLedger(), ...DEMO_OIL.ledger].map((l: any) => l.reason)
    expect(reasons.length).toBeGreaterThan(0)
    for (const r of reasons) expect(r).not.toMatch(/\bEx\b|Forging|Cope|Sabre|Tiger/i)
  })
})

describe('the course-map files carry no trail back to their source', () => {
  const files = ['scripts/tracker/course-map-2026.json', 'scripts/tracker/course-map-agaa-2026.json']
  const TRAIL = /Master Syll|Annex|EFF DATE|IMG_\d|\.docx|screenshot|\bB-\d\d\b/i
  for (const f of files) {
    it(`${f} has no source/read_from fields and no document reference`, () => {
      const text = readFileSync(f, 'utf8')
      const j = JSON.parse(text)
      expect(j.source).toBeUndefined()
      expect(j.read_from).toBeUndefined()
      expect(text).not.toMatch(TRAIL)
      /* the map itself is intact — the edges are what the smoke suite pins */
      expect(Object.keys(j.edges).length).toBeGreaterThan(100)
    })
  }
})
