// models/Item.ts
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  quickbooksId: String,  // Id from QuickBooks
  name: String,
  description: String,
  active: Boolean,
  fullyQualifiedName: String,
  taxable: Boolean,
  unitPrice: Number,
  type: {
    type: String,
    enum: ['Inventory', 'NonInventory', 'Service', 'Bundle']
  },
  incomeAccountRef: {
    value: String,
    name: String
  },
  expenseAccountRef: {
    value: String,
    name: String
  },
  assetAccountRef: {
    value: String,
    name: String
  },
  trackQtyOnHand: Boolean,
  qtyOnHand: Number,
  invStartDate: String,
  purchaseCost: Number,
  metadata: {
    createTime: Date,
    lastUpdatedTime: Date
  },
  lastSyncedAt: Date
}, {
  timestamps: true
});

// Create compound text index
ItemSchema.index({ 
  name: 'text', 
  description: 'text',
  fullyQualifiedName: 'text'
}, {
  name: "ItemTextIndex",
  weights: {
    name: 10,          // Higher weight for name matches
    description: 5,    // Medium weight for description
    fullyQualifiedName: 3  // Lower weight for fullyQualifiedName
  }
});

// Create regular indexes
ItemSchema.index({ quickbooksId: 1 });
ItemSchema.index({ type: 1 });
ItemSchema.index({ active: 1 });

// Create and initialize the model
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

// Ensure indexes are created
const createIndexes = async () => {
  try {
    await Item.createIndexes();
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

createIndexes();

export { Item };