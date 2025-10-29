import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const validUser = process.env.BASIC_AUTH_USER
  const validPass = process.env.BASIC_AUTH_PASS

  // If credentials not configured, return 503
  if (!validUser || !validPass) {
    return new NextResponse("Admin authentication not configured", {
      status: 503,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  // Get authorization header
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Panel"',
      },
    })
  }

  // Parse Basic Auth header
  const base64Credentials = authHeader.split(" ")[1]

  // Edge-compatible base64 decoding
  const credentials = atob(base64Credentials)
  const [username, password] = credentials.split(":")

  // Verify credentials
  if (username === validUser && password === validPass) {
    return NextResponse.next()
  }

  // Invalid credentials
  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Panel"',
    },
  })
}

export const config = {
  matcher: "/admin/:path*",
}
