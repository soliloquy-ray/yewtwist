import mongoose, { Schema } from 'mongoose';

const ExpenseLineSchema = new mongoose.Schema({
  Id: String,
  Amount: Number,
  Description: String,
  DetailType: String,
  LinkedTxn: [{
    TxnId: String,
    TxnType: String,
  }],
  AccountBasedExpenseLineDetail: {
    AccountRef: {
      value: String,
      name: String
    },
    BillableStatus: String,
    TaxCodeRef: {
      value: String
    },
    CustomerRef: {
      value: String,
      name: String
    }
  }
});

const ExpenseSchema = new mongoose.Schema({
  Id: String,
  PaymentType: String,
  TxnDate: String,
  AccountRef: {
    value: String,
    name: String
  },
  EntityRef: {
    type: new Schema({
      value: String,
      name: String,
      type: String
    }, { _id: false })
  }, // Changed from string to object
  DepartmentRef: {
    value: String,
    name: String
  },
  CurrencyRef: {
    value: String,
    name: String
  },
  TotalAmt: Number,
  Line: [ExpenseLineSchema],
  PaymentMethodRef: {
    value: String,
    name: String
  },
  Others: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Add indexes
ExpenseSchema.index({ Id: 1 }, { unique: true });
ExpenseSchema.index({ TxnDate: 1 });
ExpenseSchema.index({ 'EntityRef.value': 1 });
ExpenseSchema.index({ 'AccountRef.value': 1 });

export const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);