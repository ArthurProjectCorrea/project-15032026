import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Authentication check for private routes
  if (
    pathname === '/private' ||
    pathname.startsWith('/private/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/'
  ) {
    // Skip auth check if it is explicitly a public route
    if (pathname.startsWith('/public/')) {
      return supabaseResponse;
    }

    if (!user) {
      // Avoid redirect loops if already on login
      if (pathname === '/login') return supabaseResponse;
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based redirection and protection using JWT claims (app_metadata)
    // This is MUCH faster as it doesn't require a DB query in the middleware
    let role = user.app_metadata?.role as string | undefined;

    // Fallback: If role is not in metadata (legacy users or sync delay), fetch it
    if (!role) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .single();
      const data = userRole as unknown as { roles: { name: string } | null };
      role = data?.roles?.name;
    }

    const dest = role === 'Admin' ? '/admin' : '/';

    // If on /private, redirect to the correct dashboard
    if (pathname === '/private' || pathname.startsWith('/private/')) {
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Admin redirection: If on root, go to /admin
    if (role === 'Admin') {
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    // Client protection: If on /admin, go to /
    if (role === 'Clients') {
      if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirect logged in users away from auth pages
  // ONLY if they are NOT in a redirect loop situation
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const role = user.app_metadata?.role as string | undefined;

    // If we don't know the role yet, don't redirect away from login yet
    // to avoid infinite loops if the destination page also redirects back
    if (role) {
      const dest = role === 'Admin' ? '/admin' : '/';
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
