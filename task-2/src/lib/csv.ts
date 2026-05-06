// CSV export helpers — produces UTF-8 BOM + CRLF, Excel/Sheets-friendly.

const escapeCell = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : String(v);
  // Prefix leading =, +, -, @ with apostrophe to neutralize formula injection
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  if (/[",\r\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
};

export const toCSV = (headers: string[], rows: unknown[][]): string => {
  const lines = [headers.map(escapeCell).join(",")];
  for (const r of rows) lines.push(r.map(escapeCell).join(","));
  // BOM ensures Excel detects UTF-8; CRLF line endings for Excel compatibility.
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
};

export const downloadCSV = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
