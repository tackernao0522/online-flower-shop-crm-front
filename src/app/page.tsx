import { formatDate } from "../utils/dateFormatter";

export default function Home() {
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  return (
    <div>
      <h1>今日の日付</h1>
      <p>{formattedDate}</p>
    </div>
  );
}
