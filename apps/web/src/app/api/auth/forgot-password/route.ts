import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }
    const resend = new Resend(resendApiKey);

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check user exists
    const { data: user } = await supabase
      .from('guest_users')
      .select('email')
      .eq('email', email.trim())
      .single();

    if (!user) {
      // Return generic success to prevent user enumeration attacks
      return NextResponse.json({ success: true });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    const { error: dbError } = await supabase
      .from('guest_users')
      .update({ otp_code: otp })
      .eq('email', email.trim());

    if (dbError) {
      return NextResponse.json({ error: 'Failed to generate reset code' }, { status: 500 });
    }

    // Send the password reset email via Resend
    const { error: resendError } = await resend.emails.send({
      from: 'DhyanLok <noreply@priyanshudays.me>',
      to: email,
      subject: 'Reset Your DhyanLok Password',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #e5e5e5; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 56px; height: 56px; background: #1a1a1a; border: 1px solid #333; border-radius: 14px; line-height: 56px; font-size: 24px;">✦</div>
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 8px 0; text-align: center;">Password Reset</h1>
          <p style="color: #888; text-align: center; margin-bottom: 32px; font-size: 14px;">Enter this 6-digit code to reset your DhyanLok password.</p>
          <div style="background: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 12px; text-align: center; font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #ffffff; margin: 0 0 32px 0; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #555; font-size: 12px; text-align: center;">This code expires in 15 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `
    });

    if (resendError) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
