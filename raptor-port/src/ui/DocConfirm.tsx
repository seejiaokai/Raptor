/* THE MEDICAL-DOCUMENT ASK (owner, [SYNC-INTEG] — "prompt once: Upload or No
   document"). Filing a medical input used to be HARD-refused without its
   certificate; now every editor that can save one opens this sheet BEFORE the
   write when a NEW medical (or one retyped into the medical group) has no
   document attached. Two choices, no default:
   - Upload — dismiss and go back to the editor, where the upload control sits;
     the filer attaches the certificate and saves again.
   - No document — file it with none, for when the record genuinely isn't
     available yet. The save resumes with the document treated as resolved.
   Mirrors OilConfirm's shape (scrim click + its own Escape = cancel = Upload),
   so the two save-time asks read and behave the same. */
import { useEffect } from 'react'

export function DocConfirm({ who, typeLabel, onUpload, onNoDoc }: {
  who: string
  typeLabel: string
  /** dismiss and return to the editor's upload control */
  onUpload: () => void
  /** file the input with no document */
  onNoDoc: () => void
}) {
  /* its own Escape = the safe choice (Upload = keep filling), the OilConfirm
     idiom — cancel THIS sheet only, don't let it bubble to close the editor */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onUpload() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
  return (
    <div className="airpop upconf-pop docconf-pop" data-testid="docconf"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('docconf-pop')) onUpload() }}>
      <div className="airpop-box upconf-box">
        <div className="airpop-head"><b>No medical document — {who}, {typeLabel}</b>
          <button className="x" aria-label="Close" onClick={onUpload}>✕</button></div>
        <div className="airpop-body upconf-body">
          <div className="upconf-h">This {typeLabel} has no certificate attached.</div>
          <div className="docconf-what">Attach one now, or file it without — for when the record genuinely isn’t available yet.</div>
        </div>
        <div className="airpop-foot upconf-foot">
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" data-testid="docconf-nodoc" onClick={onNoDoc}>No document</button>
          <button className="abtn primary" data-testid="docconf-upload" onClick={onUpload}>Upload</button>
        </div>
      </div>
    </div>
  )
}
