// src/app/api/quickbooks/customers/route.ts

import { NextResponse } from 'next/server';
import { QB_CONFIG } from '@/lib/config';
import { TokenService } from '@/lib/tokenService';

export async function GET(request: Request) {
  try {
    // Get access token (reuse your token logic)
    
    const accessToken = await TokenService.getValidToken();

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm');

    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    // Query to search customers by display name or company name
    const query = `SELECT * FROM Customer WHERE DisplayName = '${searchTerm}' MAXRESULTS 100`;

    const response = await fetch(
      `${QB_CONFIG.baseUrl}/${QB_CONFIG.realmId}/query?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Customer search error:', error);
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 }
    );
  }
}
