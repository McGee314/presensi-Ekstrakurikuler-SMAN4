import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/siswa', '/pelatih', '/supervisor', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  if (token && isProtectedRoute) {
    if (pathname.startsWith('/siswa') && token.role !== 'SISWA') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/pelatih') && token.role !== 'PELATIH') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/supervisor') && token.role !== 'SUPERVISOR') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (token && pathname === '/login') {
    if (token.role === 'SISWA') {
      return NextResponse.redirect(new URL('/siswa', request.url))
    }
    if (token.role === 'PELATIH') {
      return NextResponse.redirect(new URL('/pelatih', request.url))
    }
    if (token.role === 'SUPERVISOR') {
      return NextResponse.redirect(new URL('/supervisor', request.url))
    }
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/siswa/:path*', '/pelatih/:path*', '/supervisor/:path*', '/admin/:path*', '/login']
}
