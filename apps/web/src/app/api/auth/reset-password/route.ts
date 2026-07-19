import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { email, otp, newPasswordHash, sfk } = await request.json();

    if (!email || !otp || !newPasswordHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify OTP
    const { data: user } = await supabase
      .from('guest_users')
      .select('otp_code')
      .eq('email', email.trim())
      .single();

    if (!user || user.otp_code !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Update password and clear OTP
    let { error: updateError } = await supabase
      .from('guest_users')
      .update({
        password_hash: newPasswordHash,
        sync_fallback: sfk,
        otp_code: null,
        is_verified: true, // Also mark as verified since they proved email ownership
      })
      .eq('email', email.trim());

    if (updateError && (updateError.message?.includes('sync_fallback') || updateError.code === 'PGRST204')) {
      const fallbackRes = await supabase
        .from('guest_users')
        .update({
          password_hash: newPasswordHash,
          plaintext_password: sfk,
          otp_code: null,
          is_verified: true,
        })
        .eq('email', email.trim());
      updateError = fallbackRes.error;
    }

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset Password Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
