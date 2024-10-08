'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@utils/supabase/middleware';

export async function middleware(req: NextRequest) {
    // **Step 1: Update Supabase Auth Session**
    // Call the updateSession function and get the supabaseResponse
    let supabaseResponse = await updateSession(req);

    // **Step 2: Handle Subdomain and Path Routing**
    const host = req.headers.get('host'); // Get the host (localhost, dashboard.localhost, etc.)
    const url = new URL(req.url);         // Extract the URL of the request
    const path = url.pathname;            // Get the path of the request (e.g., /appointments)

    // **Step 3: Generate Nonce for CSP**
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

    // **Step 4: Set Content Security Policy (CSP) Headers**


    // Pass the nonce to the request headers for later use if needed
    //req.headers.set('csp-nonce', nonce);

    // **Step 5: Handle Subdomain Rewrites**
    if (host === 'dashboard.localhost:3000') {
        if (path.startsWith('/appointments')) {
            return NextResponse.rewrite(new URL('/dashboard/appointments', req.url));
        } else if (path.startsWith('/services')) {
            return NextResponse.rewrite(new URL('/dashboard/services', req.url));
        } else if (path.startsWith('/settings')) {
            // const response = NextResponse.rewrite(new URL('/dashboard/settings', req.url));
            // response.headers.set('x-nonce', nonce)

            // response.headers.set(
            //     'Content-Security-Policy',
            //     `script-src 'self' https://js.stripe.com https://connect-js.stripe.com 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'; frame-src https://connect-js.stripe.com https://js.stripe.com;`
            // );

            // return response;
            return NextResponse.rewrite(new URL('/dashboard/settings', req.url));

        }
        return NextResponse.rewrite(new URL('/dashboard', req.url));
    }

    // For the main domain (localhost:3000)
    if (host === 'localhost:3000') {
        return supabaseResponse;  // Return the response from updateSession for the main domain
    }

    // Default response (if none of the above conditions apply)
    return supabaseResponse;  // Return the Supabase response
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
