// lib/token-service.ts
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class TokenService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number | null = null;

  static async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('/api/refresh-token');
    const data: TokenResponse = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return this.accessToken;
  }
}
