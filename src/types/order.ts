export interface Order {
  id: number;
  customerName: string;
  date: string; // YYYY-MM-DDの形式を期待
  amount: number;
  status: "準備中" | "配送中" | "配達完了"; // 状態のリテラル型
}
