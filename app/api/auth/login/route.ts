import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirect = formData.get("redirect") as string || "/dashboard";

  const loginUrl = new URL("/login", request.url);
  const dashUrl  = new URL(redirect, request.url);

  const errorResponse = NextResponse.redirect(
    new URL(`/login?error=1&redirect=${encodeURIComponent(redirect)}`, request.url)
  );

  const successResponse = NextResponse.redirect(dashUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return errorResponse;
  return successResponse;
}
