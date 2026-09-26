// THE READ-ONLY SHEET FOR AN ABSENCE FILED ON THE INPUTS PAGE (the absence-record re-test, AB9, 26 Sep 26).
//
// A tap on an Inputs-filed absence opens this sheet, and it said the same thing for all of them: "<code> · approved"
// and "Filed on the Inputs page, so it is already approved — change it there, not here." That is leave's sentence
// (Q14: leave filed on the Inputs page counts as already approved). A medical, a course or overseas duty is not
// something anybody approves — tapping a man's ATT C read "ATTC · APPROVED … already approved". Found on the walk (H4).
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RaptorSheet } from './BidPicker'

const open = (code: string) => render(<RaptorSheet callsign="Grit" date="2026-07-14" code={code} onClose={() => {}} />)

describe('the read-only sheet names an Inputs-filed absence in its own words', () => {
  for (const code of ['LL', 'OL', '*LL', 'CL']) {
    it(`${code} — leave — reads as approved`, () => {
      open(code)
      expect(screen.getByTestId('raptor-sheet').textContent).toMatch(/approved/i)
      expect(screen.getByTestId('raptor-note').textContent).toContain('change it there, not here')
    })
  }
  for (const code of ['ATTC', 'HL', 'OML', 'ATTB', 'CSE', 'OD']) {
    it(`${code} — not leave — is never called approved, and still points at the Inputs page`, () => {
      open(code)
      expect(screen.getByTestId('raptor-sheet').textContent).not.toMatch(/approved/i)
      expect(screen.getByTestId('raptor-note').textContent).toBe('Filed on the Inputs page — change it there, not here.')
    })
  }
})
