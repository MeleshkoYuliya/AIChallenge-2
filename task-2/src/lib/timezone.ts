/**
 * Convert a wall-clock datetime ("YYYY-MM-DDTHH:mm") in the given IANA timezone
 * to a UTC Date. Uses Intl to compute the offset for that wall-clock instant.
 */
export function zonedToUTC(local: string, timeZone: string): Date {
  const [datePart, timePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  const asUTC = Date.UTC(y, m - 1, d, hh, mm, 0);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(asUTC));
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  let hr = g("hour");
  if (hr === 24) hr = 0;
  const tzAsUTC = Date.UTC(g("year"), g("month") - 1, g("day"), hr, g("minute"), g("second"));
  const offset = tzAsUTC - asUTC;
  return new Date(asUTC - offset);
}

/**
 * Convert a UTC Date (or ISO string) to a wall-clock "YYYY-MM-DDTHH:mm" string
 * in the given IANA timezone, suitable for <input type="datetime-local">.
 */
export function utcToZoned(utc: Date | string, timeZone: string): string {
  const date = typeof utc === "string" ? new Date(utc) : utc;
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  let hh = g("hour");
  if (hh === "24") hh = "00";
  return `${g("year")}-${g("month")}-${g("day")}T${hh}:${g("minute")}`;
}
