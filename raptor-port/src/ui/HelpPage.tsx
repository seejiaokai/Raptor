/* The Help page — the eighth tab, open to EVERYONE (owner, 25 Aug 26 —
   "a new tab called Help, inside it allows anyone to type in Bug reports.
   In which admin can view them"). Two cards in one centred column:

   - REPORT A PROBLEM, for every role: a category picker (BUG_CATS,
     state/reports.ts), a description box, one Send button. Filing needs a
     category and a non-blank description; a blank Send toasts instead of
     silently doing nothing (the 12 Aug 26 audit rule). Below the form a
     member sees THEIR OWN filed reports — the receipt that it went in —
     never anyone else's.

   - BUG REPORTS, admins only: every report, newest first, each with its
     date, filer, category chip and text (owner: "There should be date
     indicated as well, and it should be sorted accordingly to latest input
     then oldest"). Opening this view IS the acknowledgement: the rows that
     were unseen keep a NEW badge for this visit (captured before marking),
     then markReportsSeen() puts the top-bar bell out. The bell itself only
     points here (Shell.tsx) — seeing the list is what clears it, so an
     admin can never lose the alert without the reports on screen. */
import { useEffect, useRef, useState } from 'react'
import { SESSION } from '../state/auth'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { elogWhen } from '../engine/editlog'
import { BUG_CATS, REPORTS, fileReport, reportRows, markReportsSeen, type BugReport } from '../state/reports'
import { useVersion } from './useStore'

/* one report row — the same line for the admin list and a member's own
   list; `who` is dropped on the member's (it is always themselves) */
function Row({ r, fresh, who }: { r: BugReport; fresh?: boolean; who?: boolean }) {
  /* the chip's hue is derived from the category's position, so every
     category keeps one stable colour everywhere without a hand-kept map */
  const hue = (BUG_CATS.indexOf(r.cat) * 47 + 190) % 360
  return (
    <div className="bugrow" data-bugid={r.id}>
      <div className="bughead">
        <span className="bugcat" style={{ ['--h' as any]: hue }}>{r.cat}</span>
        {fresh && <span className="bugnew">NEW</span>}
        <span className="bugwhen">{elogWhen(r.t)}{who ? ` · ${r.who}` : ''}</span>
      </div>
      <div className="bugtext">{r.text}</div>
    </div>
  )
}

export function HelpPage() {
  useVersion()
  const admin = SESSION && SESSION.role === 'admin'
  const me = HOOKS.whoami()
  const catRef = useRef<HTMLSelectElement>(null)
  const txtRef = useRef<HTMLTextAreaElement>(null)
  /* which rows were UNSEEN when this admin opened the page — captured once,
     so the NEW badges survive the markReportsSeen that follows. Local
     chrome, like the Admin page's armed counts. */
  const [fresh, setFresh] = useState<Set<string>>(() => new Set())
  useEffect(() => {
    if (!admin) return
    const un = REPORTS.filter(r => !r.seen).map(r => r.id)
    if (!un.length) return
    setFresh(new Set(un))
    markReportsSeen()
    notify()                      // the bell in the top bar goes out now
  }, [admin])
  const send = () => {
    const r = fileReport(catRef.current!.value, txtRef.current!.value)
    if (!r) return HOOKS.toast('Describe the problem first — a sentence is plenty')
    txtRef.current!.value = ''
    HOOKS.toast('Report sent — thank you')
    notify()
  }
  const rows = reportRows()
  const mine = rows.filter(r => r.who === me)
  return (
    <div className="help-inner">
      <h2>Help</h2>
      <section className="help-card" id="bugFile">
        <h3>Report a problem</h3>
        <p className="adm-note help-lead">Spotted something wrong, or something that could work better? Send it here — the schedulers see every report.</p>
        <div className="mfield"><label>Category</label>
          <select id="bugCat" ref={catRef} aria-label="What the report is about">
            {BUG_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select></div>
        <div className="mfield"><label>What happened</label>
          <textarea id="bugText" ref={txtRef} rows={4} maxLength={1000}
            placeholder="What were you doing, and what went wrong?" /></div>
        <button className="abtn primary" id="bugSend" style={{ width: '100%' }} onClick={send}>Send report</button>
        {!admin && mine.length > 0 && <div className="buglist" id="bugMine">
          <h4 className="adm-sub">Your reports</h4>
          {mine.map(r => <Row key={r.id} r={r} />)}
        </div>}
      </section>
      {admin && <section className="help-card" id="bugAdmin">
        <h3>Bug reports</h3>
        <p className="adm-note help-lead">{rows.length
          ? `${rows.length} report${rows.length === 1 ? '' : 's'}, newest first.`
          : 'No reports yet — anything the squadron files lands here.'}</p>
        <div className="buglist" id="bugList">
          {rows.map(r => <Row key={r.id} r={r} fresh={fresh.has(r.id)} who />)}
        </div>
      </section>}
    </div>
  )
}
