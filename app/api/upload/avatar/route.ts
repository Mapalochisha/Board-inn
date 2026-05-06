import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file || file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'Invalid file' }, { status: 400 });

  // Assume Cloudinary SDK usage here
  // await cloudinary.uploader.upload(file, { public_id: user.id, folder: 'board-inn/avatars' });
  
  return NextResponse.json({ url: '...' });
}
