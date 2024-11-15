// lib/tokenService.ts
import { QuickBooksToken } from '@/app/models/QuickBooksToken';
import { connectDB } from '@/lib/mongodb';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
}

export class TokenService {
  private static readonly REALM_ID = process.env.NEXT_QUICKBOOKS_REALM_ID!;
  private static readonly CLIENT_ID = process.env.NEXT_QUICKBOOKS_CLIENT_ID!;
  private static readonly CLIENT_SECRET = process.env.NEXT_QUICKBOOKS_CLIENT_SECRET!;

  static async getValidToken(): Promise<string> {
    await connectDB();
    
    const tokenDoc = await QuickBooksToken.findOne({ 
      realmId: this.REALM_ID 
    });

    console.log(tokenDoc);

    if (!tokenDoc) {
      throw new Error('No token found for this realm');
    }

    // Check if access token is still valid (with 5 minute buffer)
    if (tokenDoc.accessTokenExpiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
      return tokenDoc.accessToken;
    }

    // If refresh token is expired, throw error
    if (tokenDoc.refreshTokenExpiresAt.getTime() <= Date.now()) {
      throw new Error('Refresh token has expired. Need manual reauthorization.');
    }

    // Refresh the token
    return await this.refreshToken(tokenDoc.refreshToken);
  }

  static async refreshToken(refreshToken: string): Promise<string> {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${this.CLIENT_ID}:${this.CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
    }

    const data: TokenResponse = await response.json();

    console.log({tokenData: data});

    // Update tokens in database
    await this.updateTokens(data);

    return data.access_token;
  }

  private static async updateTokens(tokenData: TokenResponse) {
    const now = new Date();
    
    await QuickBooksToken.findOneAndUpdate(
      { realmId: this.REALM_ID },
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accessTokenExpiresAt: new Date(now.getTime() + tokenData.expires_in * 1000),
        refreshTokenExpiresAt: new Date(now.getTime() + tokenData.x_refresh_token_expires_in * 1000)
      },
      { upsert: true }
    );
  }

  // Initial token storage (use this when you first get tokens)
  static async storeInitialTokens(tokenData: TokenResponse) {
    await connectDB();
    const now = new Date();

    await QuickBooksToken.create({
      realmId: this.REALM_ID,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      accessTokenExpiresAt: new Date(now.getTime() + tokenData.expires_in * 1000),
      refreshTokenExpiresAt: new Date(now.getTime() + tokenData.x_refresh_token_expires_in * 1000)
    });
  }
}
