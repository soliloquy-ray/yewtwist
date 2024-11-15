// lib/quickbooks-api.ts

export interface Customer {
  Id: string;
  DisplayName: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
}

interface CustomerSearchResult {
  QueryResponse: {
    Customer: Customer[];
  };
}

interface InvoiceQueryParams {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  limit?: number;
  id?: string;
}

// Function to search customers by name
export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  const response = await fetch(`/api/quickbooks/customers?searchTerm=${encodeURIComponent(searchTerm)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  
  const data = await response.json();
  return data.QueryResponse.Customer || [];
}

// Function to fetch invoices with filters
export async function fetchInvoices(params: {
  startDate?: string;
  endDate?: string;
  customerRef?: string;
  page?: number;
  limit?: number;
  id?: string;
}) {
  const response = await fetch(
    `/api/quickbooks/invoices?` + 
    new URLSearchParams({
      ...params,
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '10'
    })
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  
  return response.json();
}
