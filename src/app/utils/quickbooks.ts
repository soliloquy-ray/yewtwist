import { buildQueryString } from "./queryBuilder";

// utils/quickbooks.ts
const QUICKBOOKS_API_URL = 'https://quickbooks.api.intuit.com/v3/company/{realmId}';

export async function queryInvoices(
  realmId: string, 
  accessToken: string, 
  filters: {
    startDate?: string;
    endDate?: string;
    customerRef?: string;
  }
) {
  const query = buildQueryString(filters);
  const response = await fetch(
    `${QUICKBOOKS_API_URL.replace('{realmId}', realmId)}/query?query=${query}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }
  );
  return response.json();
}
