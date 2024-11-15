// app/api/quickbooks/setup-webhook/route.ts
import { QB_CONFIG } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Call QuickBooks API to set up webhook subscription
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
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
    });
    const accessToken = tokenData.access_token;

    const response = await fetch('https://developer.api.intuit.com/v2/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        webhookUrl: `${process.env.BASE_URL}/api/quickbooks/webhook`,
        entities: [{ type: 'Invoice' }],
        eventTypes: ['Create', 'Update', 'Delete']
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set up webhook' }, { status: 500 });
  }
}
