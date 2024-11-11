import { formatDate } from "../dateFormatter";

describe("dateFormatter ユーティリティ", () => {
  it("日付が正しくフォーマットされること (例: 2024/09/09)", () => {
    const date = new Date(2024, 8, 9); // 2024年9月9日 (月は0が1月、8が9月)
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2024/09/09");
  });

  it("異なる年の日付が正しくフォーマットされること (例: 2000/01/01)", () => {
    const date = new Date(2000, 0, 1); // 2000年1月1日
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2000/01/01");
  });

  it("異なる日付が正しくフォーマットされること (例: 2022/12/31)", () => {
    const date = new Date(2022, 11, 31); // 2022年12月31日
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2022/12/31");
  });

  it("無効な日付の場合は'-'を返すこと", () => {
    expect(formatDate(new Date("invalid date"))).toBe("-");
  });

  it("nullの場合は'-'を返すこと", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("空文字の場合は'-'を返すこと", () => {
    expect(formatDate("")).toBe("-");
  });

  it("文字列の日付をフォーマットできること", () => {
    expect(formatDate("2024-09-09")).toBe("2024/09/09");
  });
});
