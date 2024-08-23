export function formatDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}
