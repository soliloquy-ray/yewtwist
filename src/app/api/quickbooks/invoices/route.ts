import { NextResponse } from 'next/server';
import { SyncService } from '@/lib/sync-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      customerRef: searchParams.get('customerRef') || undefined,
      docNumber: searchParams.get('docNumber') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      id: searchParams.get('id') || undefined,
    };

    const result = await SyncService.queryInvoices(params);
    return NextResponse.json({
      invoices: result.invoices,
      pagination: {
        total: result.pagination.total,
        current: result.pagination.page,
        pageSize: result.pagination.limit,
        pages: result.pagination.pages
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}