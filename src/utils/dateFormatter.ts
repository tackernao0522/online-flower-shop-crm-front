export function formatDate(date: string | Date | null): string {
  if (!date) return "-"; // 日付がnullまたは空の場合は"-"を返す

  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return "-"; // 不正な日付なら"-"を返す

  const formatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(parsedDate); // "yyyy/MM/dd" 形式で返す
}
