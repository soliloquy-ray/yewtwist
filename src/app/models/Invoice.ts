// models/Invoice.ts
import mongoose from 'mongoose';

const LineItemSchema = new mongoose.Schema({
  Id: String,
  Amount: Number,
  Description: String,
  DetailType: String,
  SalesItemLineDetail: {
    ItemRef: {
      value: String,
      name: String
    },
    Qty: Number,
    UnitPrice: Number
  },
  GroupLineDetail: {
    GroupItemRef: {
      value: String,
      name: String
    },
    Quantity: Number,
    Line: [{
      Id: String,
      LineNum: Number,
      Amount: Number,
      LinkedTxn: [],
      DetailType: String,
      SalesItemLineDetail: {
        ItemRef: {
          value: String,
          name: String
        },
        UnitPrice: Number,
        Qty: Number,
        TaxCodeRef: Map
      }
    }]
  },
  DiscountLineDetail: {
    PercentBased: Boolean,
    DiscountPercent: Number,
    DiscountAccountRef: {
      value: String,
      name: String
    }
  },
  Others: mongoose.Schema.Types.Mixed
});

const InvoiceSchema = new mongoose.Schema({
  Id: String,
  DocNumber: String,
  TxnDate: String,
  ShipDate: String,
  DueDate: String,
  TotalAmt: Number,
  Balance: Number,
  domain: String,
  PrivateNote: String,
  CustomField: [{
    Name: String,
    Type: String,
    StringValue: String
  }],
  CustomerRef: {
    value: String,
    name: String
  },
  BillAddr: {
    Line1: String,
    City: String,
    Country: String,
    State: String,
    PostalCode: String,
    Line2: String,
    Line3: String,
    Line4: String
  },
  ShipAddr: {
    Line1: String,
    City: String,
    Country: String,
    State: String,
    PostalCode: String,
    Line2: String,
    Line3: String,
    Line4: String
  },
  Line: [LineItemSchema],
  ShipMethodRef: {
    name: String,
    value: String
  },
  CurrencyRef: {
    value: String,
    name: String
  },
  CustomerMemo: {
    value: String,
  },
  BillEmail: {
    Address: String,
  },
  Others: mongoose.Schema.Types.Mixed
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes for common queries
InvoiceSchema.index({ Id: 1 }, { unique: true });
InvoiceSchema.index({ DocNumber: 1 });
InvoiceSchema.index({ TxnDate: 1 });
InvoiceSchema.index({ 'CustomerRef.value': 1 });
InvoiceSchema.index({ 'CustomerRef.name': 1 });

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
