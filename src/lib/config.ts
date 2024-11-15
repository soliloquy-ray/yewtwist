// lib/quickbooks-config.ts
export const QB_CONFIG = {
  clientId: process.env.NEXT_QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.NEXT_QUICKBOOKS_CLIENT_SECRET,
  refreshToken: process.env.NEXT_QUICKBOOKS_REFRESH_TOKEN,
  baseUrl: 'https://quickbooks.api.intuit.com/v3/company',
  realmId: process.env.NEXT_QUICKBOOKS_REALM_ID
}
