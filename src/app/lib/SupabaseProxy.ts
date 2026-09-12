import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: claimsData, error } = await supabase.auth.getClaims();

    const claims = error ? null : claimsData?.claims;

    const pathname = request.nextUrl.pathname;

    const publicPaths = ["/login", "/signup"];

    const isPublicPath = publicPaths.some((path) => {
        return pathname === path || pathname.startsWith(path + "/");
    });

    if (!claims && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";

        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}