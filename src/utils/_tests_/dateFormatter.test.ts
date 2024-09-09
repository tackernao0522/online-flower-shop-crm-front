import { formatDate } from "../dateFormatter";

describe("dateFormatter ユーティリティ", () => {
  it("日付が正しくフォーマットされること (例: 2024年9月9日)", () => {
    const date = new Date(2024, 8, 9); // 2024年9月9日 (月は0が1月、8が9月)
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2024年9月9日");
  });

  it("異なる年の日付が正しくフォーマットされること (例: 2000年1月1日)", () => {
    const date = new Date(2000, 0, 1); // 2000年1月1日
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2000年1月1日");
  });

  it("異なる日付が正しくフォーマットされること (例: 2022年12月31日)", () => {
    const date = new Date(2022, 11, 31); // 2022年12月31日
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2022年12月31日");
  });

  it("無効な日付が渡された場合エラーが発生すること", () => {
    expect(() => formatDate(new Date("invalid date"))).toThrowError();
  });
});
