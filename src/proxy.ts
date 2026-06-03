import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password']
const AUTH_PATHS = ['/login', '/forgot-password']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Optimistic check — reads JWT from cookie without a network call.
  // Server components use getUser() for the verified check.
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/')

  // Redirect logged-in users away from login/forgot-password
  if (user && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(roleHomePath(user.app_metadata?.role), request.url))
  }

  // Redirect unauthenticated users to login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access
  if (user) {
    const role = user.app_metadata?.role as string | undefined
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(roleHomePath(role), request.url))
    }
    if (pathname.startsWith('/assistent') && role !== 'assistent') {
      return NextResponse.redirect(new URL(roleHomePath(role), request.url))
    }
  }

  return supabaseResponse
}

function roleHomePath(role: string | undefined): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'assistent') return '/assistent/dashboard'
  return '/login'
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
