// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ALBのヘルスチェックかどうかを確認する関数
const isHealthCheck = (req: NextRequest): boolean => {
  const userAgent = req.headers.get("user-agent") || "";
  return userAgent.includes("ELB-HealthChecker");
};

// Basic認証をチェックする関数
const basicAuthCheck = (req: NextRequest): boolean => {
  const basicAuth = req.headers.get("authorization");

  if (!basicAuth) {
    return false;
  }

  const authValue = basicAuth.split(" ")[1];
  const [user, pwd] = atob(authValue).split(":");

  // Edge Runtimeで環境変数を取得
  const expectedUser = process.env.BASIC_AUTH_USER || "";
  const expectedPass = process.env.BASIC_AUTH_PASS || "";

  return user === expectedUser && pwd === expectedPass;
};

// Basic認証が必要なパスかどうかをチェック
const isProtectedPath = (pathname: string): boolean => {
  // APIルートと_nextは除外（静的アセット配信のため）
  const excludedPaths = ["/api/", "/_next/", "/favicon.ico"];
  return !excludedPaths.some((path) => pathname.startsWith(path));
};

export function middleware(req: NextRequest) {
  // ヘルスチェックの場合は認証をスキップ
  if (isHealthCheck(req)) {
    return NextResponse.next();
  }

  // 本番環境でのみBasic認証を有効化
  if (process.env.NEXT_PUBLIC_APP_ENV !== "production") {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  // 保護対象のパスかチェック
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Basic認証のチェック
  if (!basicAuthCheck(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
