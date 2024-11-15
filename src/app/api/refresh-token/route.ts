// src/app/api/refresh-token/route.ts
import { NextResponse } from 'next/server';
import { QB_CONFIG } from '@/lib/config';

export async function GET() {
  try {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${QB_CONFIG.clientId}:${QB_CONFIG.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: QB_CONFIG.refreshToken!,
        client_id: QB_CONFIG.clientId!,
        client_secret: QB_CONFIG.clientSecret!
      })
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
