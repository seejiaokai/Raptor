// The Event sheet — where an admin writes, ranges, merges, tags and deletes a
// day event (owner, Aug 26: "click on the event and an edit button is at the
// top").
//
// It carries the whole surface the two inline textareas used to be:
//   · open text for the day (or a range);
//   · a range, chosen on the same calendar the bid window uses;
//   · for a range, MERGE (one bar) or REPEAT (the word in each day);
//   · a TAG (off / no-leave / work) for the typed word, which colours it and
//     every future day it appears on — the "define what is a work event and
//     what is an off day" the owner asked for;
//   · and, behind the "Edit types" button at the top, the whole type library.
//
// The tag never shows as words in the grid; it is stored on the type and reads
// only as colour (Matrix paints the column; the word itself goes red for work).

import { useState } from 'react'
import {
  bandAt,
  classifyEvent,
  defKey,
  EVENT_KINDS,
  type EventKind,
} from '../engine'
import {
  addEventBand,
  addEventType,
  getState,
  removeEventBand,
  removeEventType,
  resetEventTypes,
  setDayEvent,
  setDayEventRange,
  updateEventType,
} from '../state/store'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { shortSpan } from './dates'
import { useVersion } from './useStore'
import './eventsheet.css'

const KIND_LABEL: Record<EventKind, string> = {
  off: 'Off day',
  nolv: 'No leave',
  work: 'Work',
}

export function EventSheet({ line, date, onClose }: { line: 0 | 1; date: string; onClose: () => void }) {
  useVersion()
  const { period, eventDefs: defs } = getState()
  // The band (if any) that owns this cell. Editing it means replacing it, so
  // it is captured up front and removed on apply/delete.
  const band = bandAt(period.bands, line, date)
  const day = period.days.find(d => d.date === date)

  const [text, setText] = useState(band ? band.text : (day?.events[line] ?? ''))
  const [scope, setScope] = useState<'day' | 'range'>(band ? 'range' : 'day')
  const [mode, setMode] = useState<'merge' | 'repeat'>(band ? 'merge' : 'repeat')
  const [range, setRange] = useState<Range | null>(
    band ? { from: band.from, to: band.to } : { from: date, to: date },
  )
  const [view, setView] = useState<'event' | 'types'>('event')
  const [problem, setProblem] = useState('')

  const tagged = classifyEvent(defs, text)

  const apply = () => {
    setProblem('')
    const t = text.trim()

    if (scope === 'day') {
      if (band) removeEventBand(line, band.from)
      setDayEvent(date, line, t)
      return onClose()
    }

    if (!range) return setProblem('Pick the dates first.')

    if (mode === 'repeat') {
      if (band) removeEventBand(line, band.from)
      setDayEventRange(range.from, range.to, line, t)
      return onClose()
    }

    // Merge: one bar across the range. Remove the band being edited first, so
    // it does not read as an overlap with itself — and restore it if the new
    // one is refused, so a failed edit never loses the original.
    if (!t) return setProblem('A merged event needs a label.')
    if (band) removeEventBand(line, band.from)
    const r = addEventBand(line, range.from, range.to, t)
    if (r === 'set') return onClose()
    if (band) addEventBand(line, band.from, band.to, band.text)
    setProblem(
      r === 'overlap'
        ? 'Those dates already carry a merged event on this line.'
        : r === 'outside'
          ? 'Those dates leave this leave war.'
          : r === 'backwards'
            ? 'The end date is before the start date.'
            : 'Only an admin can edit events.',
    )
  }

  const del = () => {
    if (band) removeEventBand(line, band.from)
    else setDayEvent(date, line, '')
    onClose()
  }

  // Tag the typed word: update the matching type, or add it if it is new. The
  // colour follows on the next render, here and on the grid.
  const tag = (kind: EventKind) => {
    const t = text.trim()
    if (!t) return setProblem('Type a word before tagging it.')
    const i = defs.findIndex(d => defKey(d.name) === defKey(t))
    const err = i >= 0 ? updateEventType(i, { kind }) : addEventType(t, kind)
    setProblem(err ?? '')
  }

  if (view === 'types') {
    return (
      <Sheet testid="event-types-sheet" label="Event types" onClose={onClose}>
        <div className="bidsheet-hd">
          <span className="who">EVENT TYPES</span>
          <span className="dt">off day · no leave · work</span>
          <button className="x" data-testid="types-back" onClick={() => setView('event')} aria-label="Back">
            ‹
          </button>
        </div>
        <div className="evtypes">
          {defs.map((d, i) => (
            <div className="evtype" key={i} data-testid={`evtype-${i}`}>
              <input
                className="evtype-name"
                defaultValue={d.name}
                aria-label={`Name of event type ${i + 1}`}
                data-testid={`evtype-name-${i}`}
                onBlur={e => {
                  const err = updateEventType(i, { name: e.target.value })
                  setProblem(err ?? '')
                }}
                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
              <div className="evkinds">
                {EVENT_KINDS.map(k => (
                  <button
                    key={k}
                    className={`evkind ${k}${d.kind === k ? ' on' : ''}`}
                    data-testid={`evtype-kind-${i}-${k}`}
                    aria-pressed={d.kind === k}
                    onClick={() => setProblem(updateEventType(i, { kind: k }) ?? '')}
                  >
                    {KIND_LABEL[k]}
                  </button>
                ))}
              </div>
              <button
                className="evtype-del"
                data-testid={`evtype-del-${i}`}
                aria-label={`Delete ${d.name}`}
                onClick={() => removeEventType(i)}
              >
                ✕
              </button>
            </div>
          ))}
          <AddType onProblem={setProblem} />
        </div>
        <div className="bidsheet-row">
          <button className="dchip" data-testid="types-reset" onClick={() => resetEventTypes()}>
            Reset to standard
          </button>
          <button className="dchip approve" data-testid="types-done" onClick={() => setView('event')}>
            Done
          </button>
          {problem && <span className="note warn" data-testid="event-problem">{problem}</span>}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet testid="event-sheet" label="Edit event" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">EVENT {line + 1}</span>
        <span className="dt">{scope === 'range' && range ? shortSpan(range.from, range.to) : shortSpan(date, date)}</span>
        <button className="evtypes-open" data-testid="event-edit-types" onClick={() => setView('types')}>
          Edit types
        </button>
        <button className="x" data-testid="event-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>

      <div className="bidsheet-row">
        <input
          className="evtext"
          data-testid="event-text"
          placeholder="Type an event…"
          value={text}
          autoFocus
          onChange={e => setText(e.target.value)}
        />
      </div>

      {/* The saved words, one tap to fill the field. */}
      {defs.length > 0 && (
        <div className="bidsheet-row evquick" data-testid="event-quickpicks">
          {defs.map((d, i) => (
            <button key={i} className={`evchip ${d.kind}`} data-testid={`event-quick-${i}`} onClick={() => setText(d.name)}>
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* Tag the word. The active tag is lit; tapping one sets it on the type. */}
      <div className="bidsheet-row evtagrow">
        <span className="lab">Tag</span>
        {EVENT_KINDS.map(k => (
          <button
            key={k}
            className={`evkind ${k}${tagged === k ? ' on' : ''}`}
            data-testid={`event-tag-${k}`}
            aria-pressed={tagged === k}
            onClick={() => tag(k)}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
        <span className="evtag-cur" data-testid="event-tag-current">
          {tagged ? KIND_LABEL[tagged] : 'untagged'}
        </span>
      </div>

      {/* One day, or a span. */}
      <div className="bidsheet-row evscope">
        <button
          className={`dchip${scope === 'day' ? ' approve' : ''}`}
          data-testid="event-scope-day"
          onClick={() => setScope('day')}
        >
          This day
        </button>
        <button
          className={`dchip${scope === 'range' ? ' approve' : ''}`}
          data-testid="event-scope-range"
          onClick={() => setScope('range')}
        >
          A range
        </button>
      </div>

      {scope === 'range' && (
        <>
          <div className="bidsheet-row evmode">
            <button
              className={`dchip${mode === 'merge' ? ' approve' : ''}`}
              data-testid="event-mode-merge"
              onClick={() => setMode('merge')}
            >
              One merged bar
            </button>
            <button
              className={`dchip${mode === 'repeat' ? ' approve' : ''}`}
              data-testid="event-mode-repeat"
              onClick={() => setMode('repeat')}
            >
              Repeat each day
            </button>
          </div>
          <div className="bidsheet-row">
            <RangePicker
              testid="event"
              min={period.start}
              max={period.end}
              value={range}
              onChange={setRange}
            />
          </div>
        </>
      )}

      <div className="bidsheet-row">
        <button className="dchip approve" data-testid="event-apply" onClick={apply}>
          Save
        </button>
        {(band || (day && day.events[line])) && (
          <button className="dchip refuse" data-testid="event-delete" onClick={del}>
            Delete
          </button>
        )}
        {problem && <span className="note warn" data-testid="event-problem">{problem}</span>}
      </div>
    </Sheet>
  )
}

/** The add-a-type row, its own small state so the name field clears on add. */
function AddType({ onProblem }: { onProblem: (s: string) => void }) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<EventKind>('off')
  const add = () => {
    const err = addEventType(name, kind)
    if (err) return onProblem(err)
    setName('')
    onProblem('')
  }
  return (
    <div className="evtype evtype-add" data-testid="evtype-add">
      <input
        className="evtype-name"
        placeholder="New type…"
        aria-label="New event type name"
        data-testid="evtype-add-name"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && add()}
      />
      <div className="evkinds">
        {EVENT_KINDS.map(k => (
          <button
            key={k}
            className={`evkind ${k}${kind === k ? ' on' : ''}`}
            data-testid={`evtype-add-kind-${k}`}
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <button className="evtype-add-btn" data-testid="evtype-add-btn" onClick={add} aria-label="Add event type">
        ＋
      </button>
    </div>
  )
}
