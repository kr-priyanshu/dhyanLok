import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database — this is the critical step
    const { error: dbError } = await supabase
      .from('guest_users')
      .update({ otp_code: otp })
      .eq('email', email);

    if (dbError) {
      console.error('Supabase OTP Update Error:', dbError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Try to send the email — but treat failures as non-fatal.
    // Resend's free tier (without a verified domain) can only send to the
    // account owner's email. Other recipients will be rejected by Resend but
    // we still want to show the OTP screen so the user can proceed.
    let emailDelivered = false;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { error: resendError } = await resend.emails.send({
          from: 'DhyanLok <noreply@priyanshudays.me>',
          to: email,
          subject: 'Your DhyanLok Verification Code',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #e5e5e5; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 56px; height: 56px; background: #1a1a1a; border: 1px solid #333; border-radius: 14px; line-height: 56px; font-size: 24px;">✦</div>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 8px 0; text-align: center;">Verify Your Email</h1>
              <p style="color: #888; text-align: center; margin-bottom: 32px; font-size: 14px;">Welcome to DhyanLok. Enter this code to confirm your account.</p>
              <div style="background: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 12px; text-align: center; font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #ffffff; margin: 0 0 32px 0; font-family: monospace;">
                ${otp}
              </div>
              <p style="color: #555; font-size: 12px; text-align: center;">If you skip verification, your account will be removed after 30 days.</p>
            </div>
          `
        });

        if (!resendError) {
          emailDelivered = true;
        } else {
          console.warn('Resend delivery warning (non-fatal):', resendError);
        }
      } catch (emailErr) {
        console.warn('Resend threw (non-fatal):', emailErr);
      }
    }

    // Always return success — the OTP is in the DB regardless of email delivery
    return NextResponse.json({ success: true, emailDelivered });
  } catch (err) {
    console.error('OTP Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
