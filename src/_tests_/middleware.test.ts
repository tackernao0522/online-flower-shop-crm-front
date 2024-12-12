import { middleware } from '../middleware';

global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
global.Request = class MockRequest extends Object {} as any;
global.Response = class MockResponse extends Object {} as any;
global.Headers = class MockHeaders extends Object {} as any;

jest.mock('next/server', () => {
  class MockNextResponse {
    public status: number | undefined;
    public headers: Map<string, string>;
    public body: string | undefined;

    constructor(
      body?: string,
      init?: { status?: number; headers?: Record<string, string> },
    ) {
      this.body = body;
      this.status = init?.status;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    public static next() {
      return new MockNextResponse();
    }
  }

  return {
    NextResponse: MockNextResponse,
  };
});

const createMockRequest = (opts: {
  pathname?: string;
  headers?: Record<string, string>;
}) => {
  const { pathname = '/', headers = {} } = opts;
  const mockHeaders = new Map<string, string>();
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key.toLowerCase(), value);
  });

  return {
    nextUrl: { pathname },
    headers: {
      get: (key: string) => mockHeaders.get(key.toLowerCase()),
    },
  };
};

describe('middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('ヘルスチェックの処理', () => {
    test('ALBのヘルスチェッカーからのリクエストは認証をスキップする', () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'ELB-HealthChecker/2.0',
        },
      });

      const response = middleware(req as any);
      expect(response.status).toBeUndefined();
    });

    test('通常のユーザーエージェントは認証チェックを行う', () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      const req = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      });

      const response = middleware(req as any);
      expect(response.status).toBe(401);
    });
  });

  describe('環境による認証制御', () => {
    test('本番環境以外では認証をスキップする', () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'development';
      const req = createMockRequest({});

      const response = middleware(req as any);
      expect(response.status).toBeUndefined();
    });

    test('本番環境では認証を要求する', () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      const req = createMockRequest({});

      const response = middleware(req as any);
      expect(response.status).toBe(401);
    });
  });

  describe('Basic認証の検証', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      process.env.BASIC_AUTH_USER = 'testuser';
      process.env.BASIC_AUTH_PASS = 'testpass';
    });

    test('有効な認証情報の場合はアクセスを許可する', () => {
      const authString = Buffer.from('testuser:testpass').toString('base64');
      const req = createMockRequest({
        headers: {
          authorization: `Basic ${authString}`,
        },
      });

      const response = middleware(req as any);
      expect(response.status).toBeUndefined();
    });

    test('認証情報が無い場合は401を返す', () => {
      const req = createMockRequest({});

      const response = middleware(req as any);
      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe(
        'Basic realm="Secure Area"',
      );
    });

    test('不正な認証情報の場合は401を返す', () => {
      const authString = Buffer.from('wronguser:wrongpass').toString('base64');
      const req = createMockRequest({
        headers: {
          authorization: `Basic ${authString}`,
        },
      });

      const response = middleware(req as any);
      expect(response.status).toBe(401);
    });
  });

  describe('保護対象パスの判定', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
    });

    test('APIルートは認証をスキップする', () => {
      const req = createMockRequest({
        pathname: '/api/users',
      });

      const response = middleware(req as any);
      expect(response.status).toBeUndefined();
    });

    test('静的アセットは認証をスキップする', () => {
      const req = createMockRequest({
        pathname: '/_next/static/chunks/main.js',
      });

      const response = middleware(req as any);
      expect(response.status).toBeUndefined();
    });

    test('faviconは認証をスキップする', () => {
      const req = createMockRequest({
        pathname: '/favicon.ico',
      });

      const response = middleware(req as any);
      expect(response.status).toBeUndefined();
    });

    test('通常のページは認証を要求する', () => {
      const req = createMockRequest({
        pathname: '/dashboard',
      });

      const response = middleware(req as any);
      expect(response.status).toBe(401);
    });
  });

  describe('エッジケース', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      process.env.BASIC_AUTH_USER = 'testuser';
      process.env.BASIC_AUTH_PASS = 'testpass';
    });

    test('Basic認証ヘッダーの形式が不正な場合は401を返す', () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Invalid Format',
        },
      });

      const response = middleware(req as any);
      expect(response.status).toBe(401);
    });

    test('環境変数が設定されていない場合は認証に失敗する', () => {
      delete process.env.BASIC_AUTH_USER;
      delete process.env.BASIC_AUTH_PASS;

      const authString = Buffer.from('testuser:testpass').toString('base64');
      const req = createMockRequest({
        headers: {
          authorization: `Basic ${authString}`,
        },
      });

      const response = middleware(req as any);
      expect(response.status).toBe(401);
    });
  });
});
