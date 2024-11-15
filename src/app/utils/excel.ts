import ExcelJS from 'exceljs';

interface ProcessedInvoice {
  DocNumber: string;
  TxnDate: string;
  CustomerName: string;
  TotalAmt: number;
  Balance: number;
  [key: string]: any; // For dynamic item columns
}

interface ItemQuantityPrice {
  qty: number;
  price: number;
}

export const processInvoicesForExcel = (invoices: Invoice[], items: Item[]) => {
  const itemMap = new Map(items.map(item => [item.Id, item]));
  const processedData: ProcessedInvoice[] = [];

  invoices.forEach(invoice => {
    const processedInvoice: ProcessedInvoice = {
      DocNumber: invoice.DocNumber,
      TxnDate: invoice.TxnDate,
      CustomerName: invoice.CustomerRef.name,
      TotalAmt: invoice.TotalAmt,
      Balance: invoice.Balance,
    };

    // Initialize quantities and prices for each item
    items.forEach(item => {
      processedInvoice[item.Name] = {
        qty: 0,
        price: 0
      };
    });

    // Process line items
    invoice.Line.forEach(lineItem => {
      if (lineItem.DetailType === 'SalesItemLineDetail' && lineItem.SalesItemLineDetail) {
        const itemId = lineItem.SalesItemLineDetail.ItemRef.value;
        const item = itemMap.get(itemId);
        if (item) {
          const existingValue = processedInvoice[item.Name] as ItemQuantityPrice;
          processedInvoice[item.Name] = {
            qty: existingValue.qty + lineItem.SalesItemLineDetail.Qty,
            price: lineItem.SalesItemLineDetail.UnitPrice || lineItem.Amount || 0
          };
        }
      } else if (lineItem.DetailType === 'GroupLineDetail' && lineItem.GroupLineDetail) {
        // Process group items
        lineItem.GroupLineDetail.Line.forEach(groupLine => {
          if (groupLine.SalesItemLineDetail) {
            const subItemId = groupLine.SalesItemLineDetail.ItemRef.value;
            const subItem = itemMap.get(subItemId);
            if (subItem) {
              const existingValue = processedInvoice[subItem.Name] as ItemQuantityPrice;
              processedInvoice[subItem.Name] = {
                qty: existingValue.qty + groupLine.SalesItemLineDetail.Qty,
                price: groupLine.SalesItemLineDetail.UnitPrice || 0
              };
            }
          }
        });
      }
    });

    processedData.push(processedInvoice);
  });

  return processedData;
};

export const downloadExcel = async (data: ProcessedInvoice[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoices');

  // Get base headers
  const baseHeaders = ['DocNumber', 'TxnDate', 'CustomerName', 'TotalAmt', 'Balance'];
  
  // Set up columns
  const columns = baseHeaders.map(header => ({
    header,
    key: header,
    width: 15
  }));

  // Add item columns
  Object.keys(data[0]).forEach(key => {
    if (!baseHeaders.includes(key)) {
      columns.push({
        header: key,
        key,
        width: 20,
      });
    }
  });

  worksheet.columns = columns;

  // Add data with formatted item cells
  const rows = data.map(invoice => {
    const row: any = { ...invoice };
    Object.keys(invoice).forEach(key => {
      if (!baseHeaders.includes(key)) {
        const value = invoice[key] as ItemQuantityPrice;
        row[key] = value.qty > 0 ? 
          `${value.qty} pcs @ $${value.price.toFixed(2)}` : 
          '';
      }
    });
    return row;
  });

  worksheet.addRows(rows);

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };


  // Add data
  // worksheet.addRows(data);

  // Format number columns
  worksheet.columns.forEach(column => {
    if (column.values && column.values[1] && typeof column.values[1] === 'number') {
      column.numFmt = '#,##0.00';
    }
  });

  // Format date columns
  if (worksheet.getColumn('TxnDate')) {
    worksheet.getColumn('TxnDate').numFmt = 'yyyy-mm-dd';
  }

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: baseHeaders.length }
  };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Create blob and download
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
