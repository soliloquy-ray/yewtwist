import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Expense } from '@/app/models/Expense';
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('pageSize') || '10');

    await connectDB();

    // Build query
    const query: any = {};

    if (startDate) {
      query.date = { $gte: startDate };
    }
    console.log(query);
    if (endDate) {
      query.date = { ...query.date, $lte: endDate };
    }
    if (search) {
      query.$or = [
        { 'Id': { $regex: search, $options: 'i' } },
        { 'EntityRef.name': { $regex: search, $options: 'i' } },
        { 'AccountRef.name': { $regex: search, $options: 'i' } },
        { 'Line.Description': { $regex: search, $options: 'i' } }
      ];
    }

    console.log({ query });

    // Execute query with pagination
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ TxnDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Expense.countDocuments(query)
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        pageSize: limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}