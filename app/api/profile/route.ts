import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const { error } = await supabase.from('profiles').update(body).eq('id', user.id);
  
  return error ? NextResponse.json({ error }, { status: 500 }) : NextResponse.json({ success: true });
}
