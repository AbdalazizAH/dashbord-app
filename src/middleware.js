import { NextResponse } from 'next/server';

// تحديد المسارات المحمية وأدوار المستخدمين المسموح لهم
const protectedRoutes = {
    "/dashboard/settings": ["manager"],
    "/dashboard/reports": ["manager", "admin"],
    // يمكنك إضافة المزيد من المسارات المحمية هنا
};

export async function middleware(request) {
    // CSRF token check
    if (request.method !== 'GET') {
        const csrfToken = request.cookies.get('XSRF-TOKEN')?.value;
        const headerToken = request.headers.get('X-XSRF-TOKEN');

        if (!csrfToken || csrfToken !== headerToken) {
            return new NextResponse(
                JSON.stringify({ message: 'Invalid CSRF token' }),
                {
                    status: 403,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    }

    const token = request.cookies.get("token")?.value;
    const path = request.nextUrl.pathname;

    // Authentication check for dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            const url = new URL('/login', request.url);
            url.searchParams.set('from', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    }

    // Role-based protection check
    const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
        path.startsWith(route)
    );

    if (isProtectedRoute && token) {
        try {
            const response = await fetch(
                "https://backend-v1-psi.vercel.app/dashboard/users/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            const userData = await response.json();
            const userRole = userData.role;

            const allowedRoles = Object.entries(protectedRoutes).find(([route]) =>
                path.startsWith(route)
            )?.[1];

            if (allowedRoles && !allowedRoles.includes(userRole)) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Security headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'same-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/api/:path*']
}; 