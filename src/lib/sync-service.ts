import { connectDB } from './mongodb';
import { TokenService } from './tokenService';
import { QB_CONFIG } from './config';
import { Item } from '@/app/models/Item';
import { Invoice } from '@/app/models/Invoice';
/* eslint-disable @typescript-eslint/no-explicit-any */
export class SyncService {
  static async syncItems() {
    try {
      await connectDB();
      const accessToken = await TokenService.getValidToken();
      
      // Query QuickBooks for items
      const query = 'SELECT * FROM Item MAXRESULTS 1000';
      const response = await fetch(
        `${QB_CONFIG.baseUrl}/${QB_CONFIG.realmId}/query?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch items from QuickBooks');
      }

      const data = await response.json();
      const items: Item[] = data.QueryResponse.Item || [];

      // Bulk upsert to MongoDB
      const operations = items.map(item => ({
        updateOne: {
          filter: { quickbooksId: item.Id },
          update: {
            $set: {
              quickbooksId: item.Id,
              name: item.Name,
              description: item.Description,
              active: item.Active,
              fullyQualifiedName: item.FullyQualifiedName,
              taxable: item.Taxable,
              unitPrice: item.UnitPrice,
              type: item.Type,
              incomeAccountRef: item.IncomeAccountRef,
              expenseAccountRef: item.ExpenseAccountRef,
              assetAccountRef: item.AssetAccountRef,
              trackQtyOnHand: item.TrackQtyOnHand,
              qtyOnHand: item.QtyOnHand,
              invStartDate: item.InvStartDate,
              purchaseCost: item.PurchaseCost,
              metadata: {
                createTime: new Date(item.MetaData.CreateTime),
                lastUpdatedTime: new Date(item.MetaData.LastUpdatedTime)
              },
              lastSyncedAt: new Date()
            }
          },
          upsert: true
        }
      }));

      await Item.bulkWrite(operations);
      
      return {
        success: true,
        count: items.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  static async queryItems(params: {
    search?: string,
    type?: string,
    active?: boolean,
    page?: number,
    limit?: number
  }) {
    try {
      await connectDB();
      
      const { search, type, active, page = 1, limit = 10 } = params;
      const query: any = {};
  
      // Text search
      if (search) {
        // First verify if text index exists
        const indexes = await Item.collection.getIndexes();
        const hasTextIndex = Object.values(indexes).some(
          index => index.hasOwnProperty('textScore')
        );
  
        if (!hasTextIndex) {
          // If index doesn't exist, fall back to regex search
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { fullyQualifiedName: { $regex: search, $options: 'i' } }
          ];
        } else {
          // Use text search if index exists
          query.$text = { 
            $search: search,
            $caseSensitive: false
          };
        }
      }
      
      // Add other filters
      if (type) {
        query.type = type;
      }
  
      if (typeof active === 'boolean') {
        query.active = active;
      }
  
      // Execute query
      const items = await Item.find(
        query,
        // Add score field if using text search
        query.$text ? { score: { $meta: "textScore" } } : {}
      )
        .sort(query.$text ? { score: { $meta: "textScore" } } : { 'metadata.lastUpdatedTime': -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        console.log({query, items})
  
      const total = await Item.countDocuments(query);
  
      return {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  
  static async syncInvoices(startDate?: string, endDate?: string) {
    try {
      await connectDB();
      const accessToken = await TokenService.getValidToken();
      
      // Build query with optional date filters
      let query = 'SELECT * FROM Invoice';
      const conditions = [];
      
      if (startDate) conditions.push(`TxnDate >= '${startDate}'`);
      if (endDate) conditions.push(`TxnDate <= '${endDate}'`);
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ' MAXRESULTS 1000';

      const response = await fetch(
        `${QB_CONFIG.baseUrl}/${QB_CONFIG.realmId}/query?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices from QuickBooks');
      }

      const data = await response.json();
      const invoices: Invoice[] = data.QueryResponse.Invoice || [];

      // Bulk upsert to MongoDB
      const operations = invoices.map(invoice => {
        const knownFields = {
          Id: invoice.Id,
            DocNumber: invoice.DocNumber,
            TxnDate: invoice.TxnDate,
            ShipDate: invoice.ShipDate,
            DueDate: invoice.DueDate,
            TotalAmt: invoice.TotalAmt,
            Balance: invoice.Balance,

            // Optional fields - explicitly check and include if they exist
            ...(invoice.domain && { domain: invoice.domain }),
            ...(invoice.PrivateNote && { PrivateNote: invoice.PrivateNote }),
            ...(invoice.CustomerMemo && { 
              CustomerMemo: {
                value: invoice.CustomerMemo.value
              }
            }),
            ...(invoice.BillEmail && { 
              BillEmail: {
                Address: invoice.BillEmail.Address
              }
            }),
            ...(invoice.CurrencyRef && {
              CurrencyRef: {
                value: invoice.CurrencyRef.value,
                name: invoice.CurrencyRef.name
              }
            }),
            
            // Other fields
            CustomField: invoice.CustomField || [],
            CustomerRef: invoice.CustomerRef,
            BillAddr: invoice.BillAddr || {},
            ShipAddr: invoice.ShipAddr || {},
            ShipMethodRef: invoice.ShipMethodRef || null,
            Line: invoice.Line.map(line => {
              const knownLineFields = {
              Id: line.Id,
              Amount: line.Amount,
              Description: line.Description,
              DetailType: line.DetailType,
              ...(line.DetailType === 'SalesItemLineDetail' && { SalesItemLineDetail: line.SalesItemLineDetail }),
              ...(line.DetailType === 'GroupLineDetail' && line.GroupLineDetail && { GroupLineDetail: {
                GroupItemRef: line.GroupLineDetail.GroupItemRef,
                Quantity: line.GroupLineDetail.Quantity,
                ...(line.GroupLineDetail.Line.length > 0 && {Line: line.GroupLineDetail.Line.map(groupLine => ({
                  Id: groupLine.Id,
                  LineNum: groupLine.LineNum,
                  Amount: groupLine.Amount,
                  LinkedTxn: groupLine.LinkedTxn,
                  DetailType: groupLine.DetailType,
                  SalesItemLineDetail: groupLine.SalesItemLineDetail
                }))})
              } }),
              ...(line.DetailType === 'DiscountLineDetail' && { DiscountLineDetail: line.DiscountLineDetail }),
            };
            // Get unknown line fields
            const lineOthers = Object.entries(line).reduce((acc, [key, value]) => {
              if (!(key in knownLineFields)) {
                acc[key] = value;
              }
              return acc;
            }, {} as any);

            return {
              ...knownLineFields,
              Others: lineOthers
            };
            }),
        };

        
      // Get unknown fields
      const others = Object.entries(invoice).reduce((acc, [key, value]) => {
        if (!(key in knownFields)) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
        return {
        updateOne: {
          filter: { Id: invoice.Id },
          update: {
            $set: {
             // Required fields
            ...knownFields,
            Others: others,            
            lastSyncedAt: new Date()
          }
        },
        upsert: true
      }
    }});
    // Add logging to check what's being synced
    console.log('Sample invoice data being synced:', JSON.stringify(invoices[0], null, 2));

    const result = await Invoice.bulkWrite(operations);
    
    return {
      success: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      timestamp: new Date()
    };
    } catch (error) {
      console.error('Invoice sync error:', error);
      throw error;
    }
  }

  static async queryInvoices(params: {
    search?: string,
    startDate?: string,
    endDate?: string,
    customerRef?: string,
    page?: number,
    limit?: number,
    id?: string,
  }) {
    try {
      await connectDB();
      
      const { 
        search, 
        startDate, 
        endDate, 
        customerRef,
        page = 1, 
        limit = 10,
        id
      } = params;

      const query: any = {};

      if (search) {
        query.$or = [
          { DocNumber: { $regex: search, $options: 'i' } },
        ];
      }

      if (startDate) {
        query.TxnDate = { $gte: startDate };
      }

      if (endDate) {
        query.TxnDate = { ...query.TxnDate, $lte: endDate };
      }

      if (customerRef) {
        query['CustomerRef.name'] = { $regex: customerRef, $options: 'i' };
      }

      if (id) {
        query.DocNumber = id;
      }

      console.log({query});

      const invoices = await Invoice.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ TxnDate: -1 });

      const total = await Invoice.countDocuments(query);

      return {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }
}