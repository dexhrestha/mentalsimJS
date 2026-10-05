export function parseCsv(text) {
  const rows = [];
  const table = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value !== "")) table.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.some((value) => value !== "")) table.push(row);
  if (table.length === 0) return rows;

  const headers = table[0].map((value) => value.trim());
  for (const values of table.slice(1)) {
    const item = {};
    headers.forEach((header, index) => {
      const raw = values[index] ?? "";
      const numeric = Number(raw);
      item[header] = raw !== "" && Number.isFinite(numeric) ? numeric : raw;
    });
    rows.push(item);
  }
  return rows;
}
