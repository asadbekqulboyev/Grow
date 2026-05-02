import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/courses', '/ai-mentor', '/profile', '/admin', '/onboarding', '/shop', '/leaderboard']
const adminEmail = process.env.ADMIN_EMAIL || 'asadbekqulboyev@gmail.com'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for non-protected, non-login routes (landing page, etc.)
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isLoginPage = pathname === '/login'
  
  if (!isProtected && !isLoginPage) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options })
          )
        },
      },
    }
  )

  // getSession reads from cookie — no network call, very fast
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // Protected routes: redirect to login if not authenticated
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin route: only allow admin email
  if (pathname.startsWith('/admin') && user?.email !== adminEmail) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // If user is logged in and tries to go to login page, redirect to dashboard
  if (isLoginPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
