import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/app/lib/db';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id || (session.user as any).role !== 'vendor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sql<{ count: string }[]>`
      SELECT COUNT(*) as count
      FROM orders
      WHERE vendor_id = ${session.user.id}
        AND status = 'new'
    `;
    
    return NextResponse.json({ 
      count: Number(result[0]?.count || 0) 
    });
  } catch (error) {
    console.error('Error fetching new orders count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
