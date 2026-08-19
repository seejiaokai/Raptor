// What a manning count row MEANS, and where its colours turn on.
//
// The owner's ask (19 Aug 26): "create a bubble when I tap on the individual
// crew counter in which, for example, crew sets means Pilot + Wso… you should
// also allow me to edit when the amber shows or red shows." So a tap on any
// count row's name opens this sheet — the same bottom-sheet idiom every other
// decision in this app uses — with the row's plain-words definition, the
// current amber/red lines spelt out, and (admin only) the two numbers
// editable. Since rules became data (same day — "make it editable… and these
// counters can also be deleted"), the definition is either the seeded rule's
// hand wording or written from the rule itself (`describeRule`), and the
// sheet's admin footer opens the full counter form (`CounterForm`) where the
// WHO and the shape are edited, or the counter deleted.

import { useEffect, useState } from 'react'
import { describeRule, seedRequirements, type Threshold } from '../engine'
import { getState, resetManningThreshold, setManningThreshold } from '../state/store'
import { Sheet } from './Sheet'
import { useVersion } from './useStore'
import './bidpicker.css'

const show = (n: number) => String(Math.round(n * 10) / 10)

/** The colour rule in a sentence. `judge` paints red below `red` and amber
 *  below `amber`, so an amber at or under the red line means there is no
 *  amber band at all — say that, rather than printing a number that never
 *  fires. Both at zero means the row never judges the day. */
function whenColours(t: Threshold): string {
  if (t.amber <= 0 && t.red <= 0) return 'Never amber or red — this row just shows the number.'
  if (t.red <= 0) return `Amber when the day's number drops below ${show(t.amber)}. Never red.`
  if (t.amber <= t.red) return `Red when the day's number drops below ${show(t.red)} — no amber band.`
  return `Amber when the day's number drops below ${show(t.amber)} · red below ${show(t.red)}.`
}

export function ManningSheet({ ruleId, onClose, onEdit }: {
  ruleId: string
  onClose: () => void
  /** Open the full counter form on this rule — the admin's road to renaming,
   *  redefining or deleting it. */
  onEdit: (ruleId: string) => void
}) {
  // Its own subscription, not just the Matrix's: a Save from this sheet must
  // repaint the sentence above the fields even where the sheet is mounted
  // alone (the tests do; a future surface might).
  useVersion()
  const { requirements, qualCatalog, role } = getState()
  const rule = requirements.default.rules.find(r => r.id === ruleId)
  const label = rule?.label ?? ruleId
  const qualLabel = (k: string) => qualCatalog.find(q => q.k === k)?.label ?? k.toUpperCase()
  const desc = rule ? rule.desc ?? describeRule(rule, qualLabel) : ''
  const threshold: Threshold | null = rule?.threshold ?? null

  // The built-in numbers, for the "Default" note and to know whether Reset
  // has anything to do. Read off a fresh seed so a customised store cannot
  // shadow them; a counter the admin built has no seed twin and no Reset.
  const seedT = seedRequirements().default.rules.find(r => r.id === ruleId)?.threshold ?? null
  const customised = !!threshold && !!seedT && (threshold.amber !== seedT.amber || threshold.red !== seedT.red)

  // Draft fields, re-synced whenever the stored numbers move (a save from
  // this sheet, a Reset, or another admin elsewhere) — never mid-keystroke.
  const [amber, setAmber] = useState(threshold ? String(threshold.amber) : '')
  const [red, setRed] = useState(threshold ? String(threshold.red) : '')
  useEffect(() => {
    setAmber(threshold ? String(threshold.amber) : '')
    setRed(threshold ? String(threshold.red) : '')
    // Re-sync on the STORED numbers only — local typing must survive a repaint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold?.amber, threshold?.red])

  const a = parseFloat(amber)
  const r = parseFloat(red)
  const valid = Number.isFinite(a) && a >= 0 && Number.isFinite(r) && r >= 0
  const dirty = !!threshold && valid && (a !== threshold.amber || r !== threshold.red)

  return (
    <Sheet testid="manning-sheet" label={`${label} — what this row counts`} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{label}</span>
        <span className="dt">what this row counts</span>
        <button className="x" data-testid="manning-info-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="mdef" data-testid="manning-desc">{desc}</div>

      {threshold && (
        <div className="mwhen" data-testid="manning-when">
          {whenColours(threshold)}
          {seedT && customised && (
            <span className="mdefault"> Default: amber {show(seedT.amber)} · red {show(seedT.red)}.</span>
          )}
        </div>
      )}

      {/* The two lines are management's to set, so the fields render for an
          admin only — the store refuses a member's write anyway, and a
          control that does nothing is worse than no control. */}
      {role === 'admin' && threshold && (
        <>
          <div className="mth-edit">
            <label className="mth-field">
              <span className="lab">Amber below</span>
              <input
                className="mth-in"
                data-testid="thresh-amber"
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={amber}
                onChange={e => setAmber(e.target.value)}
              />
            </label>
            <label className="mth-field">
              <span className="lab">Red below</span>
              <input
                className="mth-in"
                data-testid="thresh-red"
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={red}
                onChange={e => setRed(e.target.value)}
              />
            </label>
          </div>
          <div className="cfoot mth-foot">
            <button
              className="creset pri"
              data-testid="thresh-save"
              disabled={!dirty}
              onClick={() => setManningThreshold(ruleId, a, r)}
            >
              Save
            </button>
            {customised && (
              <button
                className="creset"
                data-testid="thresh-reset"
                onClick={() => resetManningThreshold(ruleId)}
              >
                Reset to default
              </button>
            )}
            {/* The road to the counter itself — who it counts, its name, its
                shape, or deleting it outright (owner, 19 Aug 26). */}
            <button
              className="creset"
              data-testid="counter-edit-open"
              onClick={() => onEdit(ruleId)}
            >
              Edit counter…
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}
