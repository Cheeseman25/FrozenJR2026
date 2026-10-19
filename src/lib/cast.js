// Parses cast sheet rows (from Apps Script or the published CSV) into actor cards.

export function processCastRows(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return [];

  const headers = rows[0].map(h => String(h || '').toLowerCase().trim());
  const hasCastHeaders = headers.some(h => 
    h.includes('role') || h.includes('character') || h.includes('part') || 
    h.includes('summer') || h.includes('winter') || h.includes('actor')
  );
  if (!hasCastHeaders) return [];

  const catIdx = headers.findIndex(h => h.includes('cat') || h.includes('type') || h.includes('group') || h.includes('tier'));
  const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('character') || h.includes('part'));
  const col2Idx = headers.findIndex(h => h.includes('summer') || h.includes('snow') || h.includes('cast a') || h.includes('actor') || h.includes('name'));
  const col3Idx = headers.findIndex(h => h.includes('winter') || h.includes('ice') || h.includes('cast b'));

  const effectiveCatCol = catIdx !== -1 ? catIdx : 0;
  const effectiveRoleCol = roleIdx !== -1 ? roleIdx : 1;
  const effectiveCol2 = col2Idx !== -1 ? col2Idx : 2;
  const effectiveCol3 = col3Idx !== -1 ? col3Idx : 3;

  const rawItems = [];
  rows.slice(1).forEach((cols, rowIdx) => {
    const category = String(cols[effectiveCatCol] || 'Company').trim();
    const role = String(cols[effectiveRoleCol] || `Role #${rowIdx + 1}`).trim();
    const valCol2 = String(cols[effectiveCol2] || '').trim();
    const valCol3 = String(cols[effectiveCol3] || '').trim();

    const catLower = category.toLowerCase();
    const roleLower = role.toLowerCase();

    const isFeaturedEnsembleOrChorus = 
      catLower.includes('featured ensemble') || 
      roleLower.includes('featured ensemble') || 
      catLower.includes('chorus') || 
      roleLower.includes('chorus') || 
      catLower.includes('ensemble') || 
      roleLower.includes('ensemble');

    const actors = [valCol2, valCol3].filter(v => v && v.toLowerCase() !== 'tbd');

    if (actors.length === 0) {
      rawItems.push({
        id: 'actor-unassigned-' + rowIdx,
        actorName: 'Pending Assignment',
        role,
        category,
        isFeaturedEnsembleOrChorus
      });
    } else {
      actors.forEach((act, actIdx) => {
        rawItems.push({
          id: `actor-${rowIdx}-${actIdx}`,
          actorName: act,
          role,
          category,
          isFeaturedEnsembleOrChorus
        });
      });
    }
  });

  const actorMap = new Map();
  rawItems.forEach(item => {
    const key = item.actorName.toLowerCase().trim();
    if (!actorMap.has(key)) {
      actorMap.set(key, {
        id: item.id,
        actorName: item.actorName,
        roles: [item.role],
        categories: [item.category],
        isFeaturedEnsembleOrChorus: item.isFeaturedEnsembleOrChorus
      });
    } else {
      const existing = actorMap.get(key);
      if (!existing.roles.includes(item.role)) existing.roles.push(item.role);
      if (!existing.categories.includes(item.category)) existing.categories.push(item.category);
    }
  });

  return Array.from(actorMap.values())
    .map(a => ({
      ...a,
      role: a.roles.join(', '),
      category: a.categories.join(' / ')
    }))
    .sort((a, b) => a.actorName.localeCompare(b.actorName, undefined, { sensitivity: 'base' }));
}
