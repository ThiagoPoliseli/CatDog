import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/minhas-solicitacoes", "/admin"];
const AUTH_PAGES = ["/entrar", "/cadastro", "/login"];

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

function redirectToPlatform(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/animais";
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPage = AUTH_PAGES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtected) {
      return redirectToLogin(request);
    }

    if (user && isAuthPage) {
      return redirectToPlatform(request);
    }

    return supabaseResponse;
  } catch {
    if (isProtected) {
      return redirectToLogin(request);
    }

    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
