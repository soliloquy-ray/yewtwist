'use client';

import { useParams } from "next/navigation";
import CertificateForm from "../certificate-form"
import { useEffect, useState } from "react";
import { fetchInvoices } from "@/lib/quickbooks-api";

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice>();
    useEffect(() => {
      if (id) {
        fetchInvoiceData(id as string);
      }
    }, [id]);
  
    const fetchInvoiceData = async (id: string) => {
      const results = await fetchInvoices({id});
      console.log({results, id});
      setInvoice(results.invoices[0] || []);
    }
  
  return (
    <div className="w-full flex items-center justify-center">
      {invoice && <CertificateForm {...invoice} />}
    </div>
  )
}
