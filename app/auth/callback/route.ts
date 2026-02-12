import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server'; // your createServerClient helper

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_code', url.origin));
  }

  const supabase = await supabaseServer();

  // Exchanges the code for a session and write the auth cookies via the setAll()
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  return NextResponse.redirect(new URL('/dashboard', url.origin));
}
