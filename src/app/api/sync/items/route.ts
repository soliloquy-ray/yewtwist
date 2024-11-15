import { NextResponse } from 'next/server';
import { SyncService } from '@/lib/sync-service';

export async function GET() {
  try {
    const result = await SyncService.syncItems();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}