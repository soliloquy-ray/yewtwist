// utils/queryBuilder.ts
export function buildQueryString(filters: {
  startDate?: string;
  endDate?: string;
  customerRef?: string;
}) {
  let query = "SELECT * FROM Invoice";
  const conditions = [];
  
  if (filters.startDate) {
    conditions.push(`TxnDate >= '${filters.startDate}'`);
  }
  
  if (filters.endDate) {
    conditions.push(`TxnDate <= '${filters.endDate}'`);
  }
  
  if (filters.customerRef) {
    conditions.push(`CustomerRef = '${filters.customerRef}'`);
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  return encodeURIComponent(query);
}
