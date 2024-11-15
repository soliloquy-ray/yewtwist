// models/QuickBooksToken.ts
import mongoose from 'mongoose';

const QuickBooksTokenSchema = new mongoose.Schema({
  realmId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  accessTokenExpiresAt: {
    type: Date,
    required: true
  },
  refreshTokenExpiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export const QuickBooksToken = mongoose.models.QuickBooksToken || 
  mongoose.model('QuickBooksToken', QuickBooksTokenSchema);
