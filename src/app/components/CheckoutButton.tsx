// components/CheckoutButton.tsx
'use client';
import { useState } from 'react';
import { LineItemInput } from '../api/stripe/route';
import { Badge, Row } from 'antd';

export default function CheckoutButton({
  items, email, invoiceId, chargeShipping, company
}: { items: LineItemInput[], email: string, invoiceId: string, chargeShipping: boolean, company: string }) {
  const [loading, setLoading] = useState(false);
  const [payLink, setPayLink] = useState("");
  const [hasError, setHasError] = useState(false);

  const createPaymentLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          invoiceId,
          company
        })
      });
      if (response.status === 500) setHasError(true);

      const { url } = await response.json();
      setPayLink(url);
    } finally {
      setLoading(false);
    }
  };

  if (hasError) return <Row>Invalid Line items</Row>;

  if (payLink === "") return <button 
    onClick={createPaymentLink}
    disabled={loading}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    {loading ? 'Processing...' : `${chargeShipping ? "Generate Link (charge shipping)" : "Generate Link"}`}
  </button>;

  return <Badge style={{margin: 5}} onClick={() => {
    navigator.clipboard.writeText(`${payLink}?prefilled_email=${encodeURIComponent(email)}`); alert("Link copied to clipboard!");
  }}>Copy Link</Badge>
}
