// pages/api/invoices.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { queryInvoices } from '@/app/utils/quickbooks';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { realmId, startDate, endDate, customerRef } = req.query;
    const result = await queryInvoices(
      realmId as string,
      process.env.QUICKBOOKS_ACCESS_TOKEN as string,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        customerRef: customerRef as string
      }
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}
