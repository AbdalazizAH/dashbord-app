import { NextResponse } from 'next/server';

export function middleware(request) {
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

    // Authentication check for dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            const url = new URL('/login', request.url);
            url.searchParams.set('from', request.nextUrl.pathname);
            return NextResponse.redirect(url);
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