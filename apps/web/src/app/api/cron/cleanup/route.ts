import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Verify cron secret if provided by Vercel
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('guest_users')
      .delete()
      .eq('is_verified', false)
      .lt('created_at', thirtyDaysAgo);

    if (error) {
      console.error('Cleanup Error:', error);
      return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Unverified old accounts wiped' });
  } catch (err) {
    console.error('Cron Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
