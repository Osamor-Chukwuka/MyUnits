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

  //Create the user in the public user table
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('Error fetching user after code exchange:', userError);
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(userError?.message || 'Failed to get user')}`, url.origin));
  }

  const { error: upsertError } = await supabase.from('users').upsert({
    first_name: user.user_metadata.first_name || '',
    last_name: user.user_metadata.last_name || '',
    email: user.email,
    auth_id: user.id,
  }, { onConflict: 'auth_id' });

  if (upsertError) {
    console.log('Error upserting user into database:', upsertError);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(upsertError.message)}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL('/dashboard', url.origin));
}
