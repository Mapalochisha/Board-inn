import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role || 'renter';
  const path = request.nextUrl.pathname;

  // 1. Auth Protection: Ensure user is logged in for protected routes
  const protectedPaths = ['/bookings', '/profile', '/landlord', '/admin'];
  const isProtected = protectedPaths.some(p => path.startsWith(p));
  
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Role-Based Access Control (RBAC)
  if (user) {
    // Admin only routes
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(role === 'landlord' ? '/landlord/listings' : '/bookings', request.url));
    }

    // Landlord only routes (Admins allowed)
    if (path.startsWith('/landlord') && role !== 'landlord' && role !== 'admin') {
      return NextResponse.redirect(new URL('/bookings', request.url));
    }

    // Renter only routes (Admins allowed)
    if (path.startsWith('/bookings') && role !== 'renter' && role !== 'admin') {
      return NextResponse.redirect(new URL('/landlord/listings', request.url));
    }
  }

  return response;
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
