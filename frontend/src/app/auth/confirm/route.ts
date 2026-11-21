
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";

  if (!tokenHash || type !== "signup") {
    redirectUrl.searchParams.set(
      "error",
      "Invalid confirmation link"
    );

    return NextResponse.redirect(redirectUrl);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "signup",
  });

  if (error) {
    redirectUrl.searchParams.set(
      "error",
      "Email confirmation failed"
    );
  } else {
    redirectUrl.searchParams.set(
      "verified",
      "true"
    );
  }

  return NextResponse.redirect(redirectUrl);
}
