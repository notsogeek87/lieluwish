export function Flash({ error, success }: { error?: string; success?: string }) {
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>;
  if (success) return <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>;
  return null;
}
