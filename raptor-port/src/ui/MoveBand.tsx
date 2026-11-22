/* THE BAND WHEN HIS SQUADRON CHANGES UNDER A PAGE HE IS TYPING IN (his D2243 Q7, "as drawn" — docs/mock/
   2026-11-20-multi-sqn-reshape/page.html §7, D1478): one look for both places that carry it — across an open Leave War
   window, under its title strip (leavewar/ui/Sheet.tsx), and across the Tracker's chart editor (tracker/TrackerPage.tsx).
   The failed-save band's own classes and look (ui/scheduler/17-save-status.css, `.saveband.moveband`): the drawn sign,
   the lead in bold, the rest quieter, then one button, "Close", in the look of the buttons beside it (the window's chip,
   the editor's own button). The words are state/store.ts's (state/typing-hold.ts).
   The same band stands across the whole Tracker page after a pick (§16 D2′, his D2318 — the drawings f2a–f2c) with no
   button: the page has nothing to close, so `onClose` is left out and no Close is drawn. */
export function MoveBandView({ band, onClose, testid, closeClass }: {
  band: { lead: string; rest: string }
  onClose?: () => void
  testid: string
  closeClass?: string
}) {
  return (
    <div className="saveband moveband" role="status" data-testid={testid}>
      <span className="sv-msg">
        <span className="sv-sign" aria-hidden="true" /><b>{band.lead}</b>
        {band.rest ? <><span className="sv-sep"> </span><span className="sv-rest">{band.rest}</span></> : null}
      </span>
      {onClose ? <button type="button" className={closeClass} onClick={onClose}>Close</button> : null}
    </div>
  )
}
