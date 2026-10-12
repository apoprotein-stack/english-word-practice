/** Local calendar date as YYYY-MM-DD, so days roll over at the learner's midnight rather than UTC midnight. */
export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

export function previousDateKey(dateKey: string) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

/** Monday of the week containing the given date key. */
export function weekStartKey(dateKey: string) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return localDateKey(date);
}

/** Days since the Unix epoch for the local calendar date; unique per day. */
export function localDayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}
