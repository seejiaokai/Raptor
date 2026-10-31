/* THE GRADES WINDOW'S WORDS — moved out of GradesSheet.tsx so that file exports only its components (React's quick
   reload keeps a component's state only in a file of components) */

/** what Delete asks first ("3 people hold Junior WSO: they become No grade") */
export const deleteAsk = (n: number, name: string) => `${n === 1 ? '1 person holds' : `${n} people hold`} ${name}: ${n === 1 ? 'he becomes' : 'they become'} No grade`
