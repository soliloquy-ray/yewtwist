import { NextResponse } from 'next/server';
import { QB_CONFIG } from '@/lib/config';
import { TokenService } from '@/lib/tokenService';

export async function GET(request: Request) {
  try {
    /* const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${QB_CONFIG.clientId}:${QB_CONFIG.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: QB_CONFIG.refreshToken!,
      })
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Token Response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      data: tokenData
    }); */
    const accessToken = await TokenService.getValidToken(); //tokenData.access_token;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');
    const id = searchParams.get('id');
    const limit = searchParams.get('limit') || '1000';

    let query = `SELECT * FROM Invoice`;
    const conditions = [];
    
    if (startDate) conditions.push(`TxnDate >= '${startDate}'`);
    if (endDate) conditions.push(`TxnDate <= '${endDate}'`);
    if (customerId) conditions.push(`CustomerRef = '${customerId}'`);
    if (id) conditions.push(`DocNumber = '${id}'`);
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` MAXRESULTS ${limit}`;

    const response = await fetch(
      `${QB_CONFIG.baseUrl}/${QB_CONFIG.realmId}/query?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
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
    console.error('Invoice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
