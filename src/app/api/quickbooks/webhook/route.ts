import { Invoice } from "@/app/models/Invoice";
import { connectDB } from "@/lib/mongodb";

// In your webhook handler or sync function
async function POST(invoiceData: Invoice) {
  try {
    await connectDB();
    await Invoice.findOneAndUpdate(
      { Id: invoiceData.Id }, // Use QuickBooks Id as unique identifier
      invoiceData,
      { 
        upsert: true,
        new: true
      }
    );
  } catch (error) {
    console.error('Failed to save invoice:', error);
    throw error;
  }
}
