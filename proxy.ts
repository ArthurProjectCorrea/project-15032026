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

      // Auto-logout: Clear Supabase session cookies if they exist to prevent stale session errors
      const cookies = request.cookies.getAll();
      const hasSupabaseCookie = cookies.some((c) => c.name.startsWith('sb-'));

      if (hasSupabaseCookie) {
        console.log(
          'Middleware - Auth failed with existing cookies. Clearing and force redirecting to /login.'
        );
        const response = NextResponse.redirect(new URL('/login', request.url));
        cookies.forEach((c) => {
          if (c.name.startsWith('sb-')) {
            response.cookies.delete(c.name);
          }
        });
        return response;
      }

      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based redirection and protection
    // Source of Truth: profiles table (per user request)
    let role: string | undefined;

    console.log(
      `Middleware - Checking role for ${user.email} (ID: ${user.id})`
    );

    // 1. Try profiles table (MASTER source)
    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Middleware - Profiles Fetch Error:', profileError.message);
    }

    if (profileRow?.role) {
      role = profileRow.role as string;
      console.log(`Middleware - Role from profiles (MASTER): ${role}`);
    }

    // 2. Try user_roles table (Fallback)
    if (!role) {
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error(
          'Middleware - user_roles Fetch Error:',
          roleError.message
        );
      }

      const rawRole = userRole?.role;
      if (rawRole) {
        if (Array.isArray(rawRole)) {
          role = (rawRole[0] as { name: string })?.name;
        } else {
          role = (rawRole as { name: string }).name;
        }
        console.log(`Middleware - Role from user_roles: ${role}`);
      }
    }

    // 3. Fallback to app_metadata
    if (!role) {
      role = user.app_metadata?.role as string | undefined;
      console.log(`Middleware - Role from metadata: ${role}`);
    }

    const dest = role === 'Admin' ? '/admin' : '/';
    console.log(
      `Middleware - Final - Path: ${pathname}, Role: ${role}, Dest: ${dest}`
    );

    // If on /private, redirect to the correct dashboard
    if (pathname === '/private' || pathname.startsWith('/private/')) {
      console.log(`Middleware - Redirecting /private to ${dest}`);
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Admin redirection: If on root, go to /admin
    if (role === 'Admin') {
      if (pathname === '/') {
        console.log('Middleware - Admin on root, redirecting to /admin');
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    // Client protection: If on /admin, go to /
    if (role === 'Clients' || !role) {
      if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        console.log('Middleware - Non-admin on admin path, redirecting to /');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirect logged in users away from auth pages
  // ONLY if they are NOT in a redirect loop situation
  if (user && (pathname === '/login' || pathname === '/signup')) {
    // Reuse the same logic or fetch if needed
    const role = user.app_metadata?.role as string | undefined;

    // We can't easily fetch from DB here without duplicating logic or moving it up
    // But for login/signup, usually metadata is enough if we sync it correctly
    if (role) {
      const dest = role === 'Admin' ? '/admin' : '/';
      console.log(`Middleware - Auth page redirect: ${pathname} -> ${dest}`);
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
