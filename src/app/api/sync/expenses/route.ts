import { NextResponse } from 'next/server';
import { SyncService } from '@/lib/sync-service';
import { handleMongooseError } from '@/lib/error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    };

    const result = await SyncService.syncExpenses(params);
    return NextResponse.json(result);
  } catch (error) {
    const handledError = handleMongooseError(error);
    return NextResponse.json(
      { 
        error: handledError.message,
        status: handledError.status 
      },
      { status: handledError.statusCode }
    );
  }
}