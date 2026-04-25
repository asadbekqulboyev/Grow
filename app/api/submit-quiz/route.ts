import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Ushbu API eskirgan. Endi testlar api/complete-lesson ichida tekshiriladi.' }, { status: 410 });
}
