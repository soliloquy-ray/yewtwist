import { NextResponse } from 'next/server';
import { SyncService } from '@/lib/sync-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const result = await SyncService.syncInvoices(startDate || undefined, endDate || undefined);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync invoices' },
      { status: 500 }
    );
  }
}