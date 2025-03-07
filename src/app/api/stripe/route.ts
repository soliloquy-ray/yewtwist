// app/api/payment-links/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export type LineItemInput = {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
}

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  typescript: true
});

async function getOrCreatePrice(item: LineItemInput) {
  // Search for existing price
  const prices = await stripe.prices.list({
    lookup_keys: [`${item.name}-${item.amount}-${item.currency}`],
    limit: 1,
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  // Create new product and price if not found
  const product = await stripe.products.create({
    name: item.name,
    description: item.description,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(item.amount * 100),
    currency: item.currency,
    lookup_key: `${item.name}-${item.amount}-${item.currency}`,
  });

  return price.id;
}

export async function POST(req: Request) {
  try {
    const { items, invoiceId } = await req.json();
    
    // Convert each line item to a price ID
    const lineItems = await Promise.all(
      items.map(async (item: LineItemInput) => {
        const priceId = await getOrCreatePrice(item);
        return {
          price: priceId,
          quantity: item.quantity
        };
      })
    );
    
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: {
        description: `Payment for invoice #${invoiceId}`,
        invoice_id: invoiceId
      },
      payment_intent_data: {
        statement_descriptor: "Test"
      },
      custom_text: {
        submit: {
          message: "Pay Yewtwist"
        },
      },
      custom_fields: [{
        key: "company",
        type: 'text',
        label: {
          type: 'custom',
          custom: 'company'
        },
      }]
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Payment link creation failed' },
      { status: 500 }
    );
  }
}
