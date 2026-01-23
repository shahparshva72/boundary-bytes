export function normalizeTeamResults(rows: unknown[]): unknown[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return rows || [];
  }

  const canonicalMap: Record<string, string> = {
    'Royal Challengers Bengaluru': 'Royal Challengers Bangalore',
    'Delhi Daredevils': 'Delhi Capitals',
    'Kings XI Punjab': 'Punjab Kings',
    'Rising Pune Supergiants': 'Rising Pune Supergiant',
  };

  const agg: Record<string, Record<string, unknown>> = {};

  for (const r of rows as Array<Record<string, unknown>>) {
    const keys = Object.keys(r);
    if (keys.length === 0) {
      continue;
    }
    const teamKey =
      keys.find((k) => /^(team|winner|batting_team|bowling_team)$/i.test(k)) || keys[0];
    let name = String(r[teamKey] ?? '').trim();
    if (!name) {
      continue;
    }
    name = canonicalMap[name] || name;

    const current = agg[name] || { [teamKey]: name };

    for (const [k, v] of Object.entries(r)) {
      if (k === teamKey) {
        continue;
      }
      if (typeof v === 'number') {
        const prev = current[k];
        current[k] = typeof prev === 'number' ? prev + v : v;
      } else {
        current[k] = v;
      }
    }

    agg[name] = current;
  }

  return Object.values(agg);
}
