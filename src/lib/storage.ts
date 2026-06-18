export function extractStoragePath(fileUrl: string): string | null {
  const patterns = [
    "/storage/v1/object/public/documents/",
    "/public/documents/",
    "/storage/v1/object/documents/",
  ];
  for (const p of patterns) {
    const idx = fileUrl.indexOf(p);
    if (idx !== -1) return fileUrl.slice(idx + p.length);
  }
  return null;
}
