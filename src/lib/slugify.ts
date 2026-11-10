export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/** The path of a player's public profile page. */
export function playerProfilePath(name: string): string {
  return `/players/${slugify(name)}`;
}
