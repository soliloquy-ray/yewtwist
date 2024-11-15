import { NextResponse } from 'next/server';
import { Item } from '@/app/models/Item';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    await connectDB();
    
    const query = searchTerm ? {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    } : {};

    const mongoItems = await Item.find(query);

    // Map MongoDB results to QuickBooks format
    const mappedItems = mongoItems.map(item => ({
      Id: item.quickbooksId,
      Name: item.name,
      Description: item.description,
      Active: item.active,
      FullyQualifiedName: item.fullyQualifiedName,
      Taxable: item.taxable,
      UnitPrice: item.unitPrice,
      Type: item.type,
      IncomeAccountRef: item.incomeAccountRef,
      ExpenseAccountRef: item.expenseAccountRef,
      AssetAccountRef: item.assetAccountRef,
      TrackQtyOnHand: item.trackQtyOnHand,
      QtyOnHand: item.qtyOnHand,
      InvStartDate: item.invStartDate,
      PurchaseCost: item.purchaseCost,
      MetaData: {
        CreateTime: item.metadata?.createTime,
        LastUpdatedTime: item.metadata?.lastUpdatedTime
      }
    }));

    // Return in QuickBooks API format
    return NextResponse.json({
      QueryResponse: {
        Item: mappedItems,
        maxResults: mappedItems.length,
        startPosition: 1,
        totalCount: mappedItems.length
      },
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
