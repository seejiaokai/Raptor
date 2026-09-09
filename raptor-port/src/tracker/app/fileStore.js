/* Wraps the browser's file pickers. Since 9 Sep 26 the file is a FORMAT, not a
   store (core.js, the File-menu note): the app only ever reads a whole file in
   (Import) or writes a whole copy out (Export), so nothing here keeps
   a handle between calls. Export writes in place through the File System
   Access API where Chrome and Edge offer it, and downloads elsewhere — saying
   so plainly rather than leaving the user to think a save happened.

   Every picker call MUST run directly inside a click handler with no await
   before it, or the browser discards the user gesture and rejects it.

   See docs/superpowers/specs/2026-08-07-syllabus-file-design.md (superseded
   in part — its note at the top says which part). */
const TYPES = [{ description: 'OCU Tracker file', accept: { 'application/json': ['.json'] } }];

export function canWriteInPlace() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

export async function pickSave(suggestedName) {
  try { return await window.showSaveFilePicker({ suggestedName, types: TYPES }); }
  catch (e) { if (e && e.name === 'AbortError') return null; throw e; }
}

/* Read one file: `{ name, text }`, or null when the user cancels. Chrome/Edge
   get the native picker; every other browser (the owner's iPhone included)
   gets a plain file input — reading needs no write permission, so there is no
   reason to refuse Safari/Firefox the way the old "Use Chrome or Edge" alert
   did. The input's own cancel fires no reliable event everywhere, so a cancel
   is read as "no change within a beat of the dialog closing". */
export async function pickOpen() {
  if (typeof window !== 'undefined' && typeof window.showOpenFilePicker === 'function') {
    try {
      const [handle] = await window.showOpenFilePicker({ types: TYPES, multiple: false });
      const file = await handle.getFile();
      return { name: file.name || handle.name, text: await file.text() };
    } catch (e) { if (e && e.name === 'AbortError') return null; throw e; }
  }
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);
    const done = v => { input.remove(); resolve(v); };
    input.addEventListener('change', async () => {
      const f = input.files && input.files[0];
      if (!f) { done(null); return; }
      try { done({ name: f.name, text: await f.text() }); } catch (_) { done(null); }
    });
    input.addEventListener('cancel', () => done(null));
    input.click();
  });
}

/* Browsers drop write permission between sessions. Returns false when declined,
   so the caller can say so instead of failing silently. */
export async function ensureWritable(handle) {
  if (!handle || !handle.queryPermission) return false;
  try {
    if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
    /* Throws when the click that triggered this has already expired — asking for
       write permission needs live user activation. Never let that escape as an
       unhandled rejection, or the button just appears dead. */
    return await handle.requestPermission({ mode: 'readwrite' }) === 'granted';
  } catch (_) { return false; }
}

/* Writes, then reads the file back and checks it is really the size we wrote.
   A write that fails part-way, or is silently dropped, otherwise leaves the app
   reporting success while the file on disk is stale — the worst possible
   outcome for someone relying on that file as their only copy. */
export async function writeTo(handle, text) {
  const w = await handle.createWritable();
  await w.write(text); await w.close();
  if (handle.getFile) {
    const onDisk = await handle.getFile();
    const wrote = new Blob([text]).size;
    if (onDisk.size !== wrote)
      throw new Error(`the file holds ${onDisk.size} bytes but ${wrote} were written`);
  }
  return true;
}

export function downloadInstead(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
