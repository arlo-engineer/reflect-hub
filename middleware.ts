import { createMiddlewareClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create middleware client with cookie methods
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createMiddlewareClient({
      getAll() {
        return request.cookies.getAll().map((cookie: any) => ({
          name: cookie.name,
          value: cookie.value,
        }))
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }: any) => {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        })
      },
    })

    // Get current session
    const { data: { session } } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = [
      '/reflection',
      '/setup',
      '/dashboard',
      '/profile'
    ]

    // Auth routes that redirect if already authenticated
    const authRoutes = [
      '/login',
      '/auth/login'
    ]

    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to reflection page if accessing auth route with valid session
    if (isAuthRoute && session) {
      const redirectUrl = new URL('/reflection', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Handle auth callback
    if (request.nextUrl.pathname === '/auth/callback') {
      const code = request.nextUrl.searchParams.get('code')
      
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      // Redirect to setup or reflection based on user profile completion
      const redirectUrl = new URL('/reflection', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to proceed
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}