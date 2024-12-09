import { isTokenExpired } from '../tokenUtils';

describe('isTokenExpired', () => {
  let originalDateNow: () => number;

  beforeAll(() => {
    originalDateNow = Date.now;
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  beforeEach(() => {
    Date.now = originalDateNow;
  });

  it('有効期限内のトークンに対してfalseを返す', () => {
    const mockNow = new Date('2024-01-01T12:00:00Z').getTime();
    Date.now = jest.fn(() => mockNow);

    const payload = {
      exp: mockNow / 1000 + 3600,
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;

    expect(isTokenExpired(token)).toBe(false);
  });

  it('有効期限切れのトークンに対してtrueを返す', () => {
    // 2024-01-01 12:00:00 に固定
    const mockNow = new Date('2024-01-01T12:00:00Z').getTime();
    Date.now = jest.fn(() => mockNow);

    // exp: 2024-01-01 11:00:00 (1時間前)のトークン
    const payload = {
      exp: mockNow / 1000 - 3600, // 1時間前
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;

    expect(isTokenExpired(token)).toBe(true);
  });

  it('トークンの形式が不正な場合はtrueを返す', () => {
    const invalidTokens = [
      'invalid-token',
      'header.invalid-payload.signature',
      'header..signature',
      '',
    ];

    invalidTokens.forEach(token => {
      expect(isTokenExpired(token)).toBe(true);
    });
  });

  it('ペイロードのexpが存在しない場合はfalseを返す', () => {
    const payload = {
      someOtherField: 'value',
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;

    expect(isTokenExpired(token)).toBe(false);
  });

  it('現在時刻がexpと等しい場合はtrueを返す', () => {
    const mockNow = new Date('2024-01-01T12:00:00Z').getTime();
    Date.now = jest.fn(() => mockNow);

    const payload = {
      exp: mockNow / 1000,
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;

    expect(isTokenExpired(token)).toBe(true);
  });
});
