import mongoose, { Schema } from 'mongoose';

const ExpenseCategoryDetailSchema = new Schema({
  category: {
    value: String,
    name: String
  },
  description: String,
  amount: Number,
  salesTax: Number,
  billable: Boolean,
  customer: {
    value: String,
    name: String
  },
  class: String
});

const ExpenseItemDetailSchema = new Schema({
  productService: {
    value: String,
    name: String
  },
  description: String,
  qty: Number,
  rate: Number,
  amount: Number,
  salesTax: Number,
  billable: Boolean,
  customer: {
    value: String,
    name: String
  },
  class: String
});

const ExpenseSchema = new Schema({
  Id: { type: String, required: true, unique: true },
  date: String,
  type: String,
  no: String,
  payee: String,
  class: String,
  category: String,
  totalBeforeSalesTax: Number,
  salesTax: Number,
  total: Number,
  paymentAccount: {
    value: String,
    name: String
  },
  paymentMethod: String,
  refNo: String,
  tags: [String],
  memo: String,
  categoryDetails: [ExpenseCategoryDetailSchema],
  itemDetails: [ExpenseItemDetailSchema],
  attachments: [{
    fileName: String,
    url: String
  }]
}, {
  timestamps: true
});

ExpenseSchema.index({ date: 1 });
ExpenseSchema.index({ payee: 1 });
ExpenseSchema.index({ category: 1 });

export const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);