/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface LineItem {
  Id: string;
  Amount: number;
  Description?: string;
  DetailType: string;
  SalesItemLineDetail?: {
    ItemRef: {
      value: string;
      name: string;
    };
    Qty: number;
    UnitPrice: number;
  };
  GroupLineDetail?: {
    GroupItemRef: {
      value: string;
      name: string;
    }
    Quantity: number;
    Line: {
      Id: string;
    LineNum: number;
    Amount: number;
    LinkedTxn: any[];
    DetailType: string;
    SalesItemLineDetail: { 
      ItemRef: {
        value: string;
        name: string;
      }
      UnitPrice: number;
      Qty: number;
      TaxCodeRef: Record<string, string>;
    }
  }[];
  }
  DiscountLineDetail?: {
    PercentBased: boolean;
    DiscountPercent: number;
    DiscountAccountRef: {
      value: string;
      name: string;
    }
  }
  Others: {
    [key: string]: any;
  }
}

interface Invoice {
  Id: string;
  DocNumber: string;
  TxnDate: string;
  ShipDate: string;
  DueDate: string;
  TotalAmt: number;
  Balance: number;
  CustomField?: {
    Name: string;
    Type: string;
    StringValue: string;
  }[];
  CustomerRef: {
    value: string;
    name: string;
  };
  BillAddr?: {
    Line1?: string;
    City?: string;
    Country?: string;
    State?: string;
    PostalCode?: string;
    Line2?: string;
    Line3?: string;
    Line4?: string;
  };
  ShipAddr?: {
    Line1?: string;
    City?: string;
    Country?: string;
    State?: string;
    PostalCode?: string;
    Line2?: string;
    Line3?: string;
    Line4?: string;
  }
  Line: LineItem[];
  ShipMethodRef?: {
    name: string;
    value: string;
  }
  domain: string;
  CurrencyRef: {
    value: string;
    name: string;
  }
  PrivateNote: string;
  CustomerMemo: {
    value: string;
  }
  BillEmail: {
    Address: string;
  }
  Others: {
    [key: string]: any;
  }
}

interface Item {
  Id: string;
  Name: string;
  Description?: string;
  Active: boolean;
  FullyQualifiedName: string;
  Taxable?: boolean;
  UnitPrice?: number;
  Type: 'Inventory' | 'NonInventory' | 'Service' | 'Bundle';
  IncomeAccountRef?: {
    value: string;
    name: string;
  };
  ExpenseAccountRef?: {
    value: string;
    name: string;
  };
  AssetAccountRef?: {
    value: string;
    name: string;
  };
  TrackQtyOnHand?: boolean;
  QtyOnHand?: number;
  InvStartDate?: string;
  PurchaseCost?: number;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
}

interface ExpenseLine {
  Id: string;
  Amount: number;
  Description?: string;
  DetailType: string;
  AccountBasedExpenseLineDetail?: {
    AccountRef: {
      value: string;
      name: string;
    };
    BillableStatus?: string;
    TaxCodeRef?: {
      value: string;
    };
    CustomerRef?: {
      value: string;
      name: string;
    };
    ClassRef?: {
      value: string;
      name: string;
    };
  };
  AccountRef?: {
    value: string;
    name: string;
  };
  TaxAmount?: number;
  CustomerRef?: {
    value: string;
    name: string;
  };
}

interface Expense {
  Id: string;
  PaymentType: string;
  TxnDate: string;
  TotalAmt: number;
  PaymentRefNum?: string;
  PrivateNote?: string;
  AccountRef: {
    value: string;
    name: string;
  };
  EntityRef?: {
    value: string;
    name: string;
    type: string;
  };
  ClassRef?: {
    value: string;
    name: string;
  };
  TxnTaxDetail?: {
    TotalTax: number;
  };
  Line: ExpenseLine[];
  CategoryDetails?: {
    description: string;
    amount: number;
  }[];
  PaymentMethodRef?: {
    value: string;
    name: string;
  };
  Balance?: number;
}